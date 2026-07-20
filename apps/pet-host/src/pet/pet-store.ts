import {
    createPetStateFromManifest,
    isCodexPetManifest,
    type PetState,
} from '@codex-pets-desktop/pet-domain';
import type {
    AppPetDeleteCommand,
    InstalledPetManifest,
    PetCatalogItem,
    PetManagerPetPreview,
} from '@codex-pets-desktop/pet-shared';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
    catchError,
    concatMap,
    defer,
    defaultIfEmpty,
    filter,
    firstValueFrom,
    from,
    map,
    mergeMap,
    of,
    switchMap,
    take,
    toArray,
} from 'rxjs';
import type { PetAssetRegistry } from './pet-asset-protocol';

const storageDirectoryName = 'pets';
const activePetFileName = '.active-pet.json';
const petManifestFileName = 'pet.json';

interface ActivePetFile {
    activePetId: string;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error;
}

function isReadableStateFileError(error: unknown): boolean {
    return error instanceof SyntaxError;
}

function isRecoverableReadJsonError(error: unknown): boolean {
    return (
        isReadableStateFileError(error) ||
        (isNodeError(error) && error.code === 'ENOENT')
    );
}

function isActivePetFile(value: unknown): value is ActivePetFile {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value['activePetId'] === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export class PetStore {
    private readonly appPetsDirectoryPath: string;
    private readonly codexPetsDirectoryPath: string;
    private readonly compatiblePetsDirectoryPaths: readonly string[];

    constructor(
        userDataPath: string,
        private readonly fallbackPetState: PetState,
        private readonly assetRegistry: PetAssetRegistry,
    ) {
        this.appPetsDirectoryPath = join(userDataPath, storageDirectoryName);
        this.codexPetsDirectoryPath = join(
            homedir(),
            '.codex',
            storageDirectoryName,
        );
        this.compatiblePetsDirectoryPaths = [
            this.codexPetsDirectoryPath,
            this.appPetsDirectoryPath,
        ];
    }

    async getActivePetState(): Promise<PetState> {
        return firstValueFrom(
            from(this.compatiblePetsDirectoryPaths).pipe(
                concatMap((petsDirectoryPath) =>
                    this.readActivePetState(petsDirectoryPath),
                ),
                filter((petState): petState is PetState => petState !== null),
                take(1),
                defaultIfEmpty(null),
                switchMap((petState) => {
                    if (petState !== null) {
                        return of(petState);
                    }

                    return from(this.readFirstInstalledPetState()).pipe(
                        switchMap((firstInstalledPetState) => {
                            if (firstInstalledPetState !== null) {
                                return of(firstInstalledPetState);
                            }

                            return from(
                                this.saveActivePetId(this.fallbackPetState.id),
                            ).pipe(map(() => this.fallbackPetState));
                        }),
                    );
                }),
            ),
        );
    }

    async getActivePetId(): Promise<string | null> {
        return firstValueFrom(
            from(this.compatiblePetsDirectoryPaths).pipe(
                concatMap((petsDirectoryPath) =>
                    this.readOptionalJson(
                        join(petsDirectoryPath, activePetFileName),
                    ),
                ),
                filter(isActivePetFile),
                map((activePetFile) => activePetFile.activePetId),
                take(1),
                defaultIfEmpty(null),
            ),
        );
    }

    async listInstalledPetManifests(): Promise<
        readonly InstalledPetManifest[]
    > {
        return firstValueFrom(
            from(this.compatiblePetsDirectoryPaths).pipe(
                concatMap((petsDirectoryPath) =>
                    from(this.listPetDirectoryNames(petsDirectoryPath)).pipe(
                        mergeMap((petDirectoryNames) =>
                            from(petDirectoryNames),
                        ),
                        map((petDirectoryName) =>
                            join(petsDirectoryPath, petDirectoryName),
                        ),
                    ),
                ),
                mergeMap((petDirectoryPath) =>
                    from(
                        this.readOptionalJson(
                            join(petDirectoryPath, petManifestFileName),
                        ),
                    ).pipe(
                        map((manifest): InstalledPetManifest | null => {
                            if (manifest === null) {
                                return null;
                            }

                            return {
                                installationId:
                                    this.createInstallationId(petDirectoryPath),
                                manifest,
                            };
                        }),
                    ),
                ),
                filter(
                    (
                        installedPetManifest,
                    ): installedPetManifest is InstalledPetManifest =>
                        installedPetManifest !== null,
                ),
                toArray(),
            ),
        );
    }

    async createPetPreviewUrls(
        installedPets: readonly PetCatalogItem[],
    ): Promise<readonly PetManagerPetPreview[]> {
        return firstValueFrom(
            from(installedPets).pipe(
                mergeMap((pet) =>
                    from(
                        this.findPetDirectoryPath(pet.installationId, pet.id),
                    ).pipe(
                        map((petDirectoryPath) =>
                            petDirectoryPath === null
                                ? null
                                : {
                                      petId: pet.id,
                                      spritesheetUrl:
                                          this.assetRegistry.createAssetUrl(
                                              join(
                                                  petDirectoryPath,
                                                  pet.spritesheetPath,
                                              ),
                                          ),
                                  },
                        ),
                    ),
                ),
                filter(
                    (preview): preview is PetManagerPetPreview =>
                        preview !== null,
                ),
                toArray(),
            ),
        );
    }

    getCompatiblePetsDirectoryPaths(): readonly string[] {
        return this.compatiblePetsDirectoryPaths;
    }

    async saveActivePetId(activePetId: string): Promise<void> {
        const activePetFile: ActivePetFile = { activePetId };
        const fileContent = `${JSON.stringify(activePetFile, null, 2)}\n`;

        await firstValueFrom(
            from(this.compatiblePetsDirectoryPaths).pipe(
                concatMap((petsDirectoryPath) =>
                    from(mkdir(petsDirectoryPath, { recursive: true })).pipe(
                        switchMap(() =>
                            from(
                                writeFile(
                                    join(petsDirectoryPath, activePetFileName),
                                    fileContent,
                                    'utf8',
                                ),
                            ),
                        ),
                    ),
                ),
                toArray(),
            ),
        );
    }

    async deletePet(command: AppPetDeleteCommand): Promise<void> {
        const petDirectoryPath = await this.findPetDirectoryPath(
            command.installationId,
            command.petId,
        );

        if (petDirectoryPath === null) {
            return;
        }

        await rm(petDirectoryPath, { recursive: true, force: true });

        const activePetId = await this.getActivePetId();

        if (activePetId === command.petId) {
            await this.saveActivePetId(this.fallbackPetState.id);
        }
    }

    private readActivePetState(
        petsDirectoryPath: string,
    ): Promise<PetState | null> {
        return firstValueFrom(
            from(
                this.readOptionalJson(
                    join(petsDirectoryPath, activePetFileName),
                ),
            ).pipe(
                filter(isActivePetFile),
                switchMap((activePetFile) => {
                    const petDirectoryPath = join(
                        petsDirectoryPath,
                        activePetFile.activePetId,
                    );

                    return from(
                        this.readOptionalJson(
                            join(petDirectoryPath, petManifestFileName),
                        ),
                    ).pipe(
                        filter(isCodexPetManifest),
                        map((manifest) =>
                            createPetStateFromManifest(manifest, {
                                createAssetUrl: (assetPath) =>
                                    this.assetRegistry.createAssetUrl(
                                        join(petDirectoryPath, assetPath),
                                    ),
                            }),
                        ),
                    );
                }),
                take(1),
                defaultIfEmpty(null),
            ),
        );
    }

    private readFirstInstalledPetState(): Promise<PetState | null> {
        return firstValueFrom(
            from(this.compatiblePetsDirectoryPaths).pipe(
                concatMap((petsDirectoryPath) =>
                    from(this.listPetDirectoryNames(petsDirectoryPath)).pipe(
                        mergeMap((petDirectoryNames) =>
                            from(petDirectoryNames),
                        ),
                        concatMap((petDirectoryName) => {
                            const petDirectoryPath = join(
                                petsDirectoryPath,
                                petDirectoryName,
                            );

                            return from(
                                this.readOptionalJson(
                                    join(petDirectoryPath, petManifestFileName),
                                ),
                            ).pipe(
                                filter(isCodexPetManifest),
                                map((manifest) =>
                                    createPetStateFromManifest(manifest, {
                                        createAssetUrl: (assetPath) =>
                                            this.assetRegistry.createAssetUrl(
                                                join(
                                                    petDirectoryPath,
                                                    assetPath,
                                                ),
                                            ),
                                    }),
                                ),
                            );
                        }),
                    ),
                ),
                take(1),
                defaultIfEmpty(null),
            ),
        );
    }

    private async readJson(filePath: string): Promise<unknown> {
        return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
    }

    private async readOptionalJson(filePath: string): Promise<unknown | null> {
        return firstValueFrom(
            from(this.readJson(filePath)).pipe(
                catchError((error: unknown) => {
                    if (isRecoverableReadJsonError(error)) {
                        return of(null);
                    }

                    throw error;
                }),
            ),
        );
    }

    private async listPetDirectoryNames(
        petsDirectoryPath: string,
    ): Promise<readonly string[]> {
        return firstValueFrom(
            from(readdir(petsDirectoryPath, { withFileTypes: true })).pipe(
                map((entries) =>
                    entries
                        .filter((entry) => entry.isDirectory())
                        .map((entry) => entry.name),
                ),
                catchError((error: unknown) => {
                    if (isNodeError(error) && error.code === 'ENOENT') {
                        return of([]);
                    }

                    throw error;
                }),
            ),
        );
    }

    private async findPetDirectoryPath(
        installationId: string,
        petId: string,
    ): Promise<string | null> {
        const exactPath = await this.parseInstallationId(installationId);

        if (exactPath !== null) {
            return exactPath;
        }

        return firstValueFrom(
            from(this.compatiblePetsDirectoryPaths).pipe(
                concatMap((petsDirectoryPath) => {
                    const petDirectoryPath = join(petsDirectoryPath, petId);

                    return from(
                        this.readOptionalJson(
                            join(petDirectoryPath, petManifestFileName),
                        ),
                    ).pipe(
                        filter(
                            (manifest) =>
                                isCodexPetManifest(manifest) &&
                                manifest.id === petId,
                        ),
                        map(() => petDirectoryPath),
                    );
                }),
                take(1),
                defaultIfEmpty(null),
            ),
        );
    }

    private createInstallationId(petDirectoryPath: string): string {
        return encodeURIComponent(petDirectoryPath);
    }

    private parseInstallationId(
        installationId: string,
    ): Promise<string | null> {
        return firstValueFrom(
            defer(() => of(decodeURIComponent(installationId))).pipe(
                catchError(() => of(null)),
            ),
        );
    }
}

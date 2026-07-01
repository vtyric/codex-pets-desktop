import type { CodexPetManifest, PetState } from '@codex-pets-desktop/pet-shared';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createPetAssetUrl } from './pet-asset-protocol';

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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isActivePetFile(value: unknown): value is ActivePetFile {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value['activePetId'] === 'string';
}

function isCodexPetManifest(value: unknown): value is CodexPetManifest {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value['id'] === 'string' &&
        typeof value['displayName'] === 'string' &&
        typeof value['spritesheetPath'] === 'string' &&
        (value['description'] === undefined ||
            typeof value['description'] === 'string') &&
        (value['kind'] === undefined || typeof value['kind'] === 'string')
    );
}

function createPetState(
    manifest: CodexPetManifest,
    petsDirectoryIndex: number,
): PetState | null {
    const spritesheetUrl = createPetAssetUrl(
        petsDirectoryIndex,
        manifest.id,
        manifest.spritesheetPath,
    );

    if (!spritesheetUrl) {
        return null;
    }

    return {
        id: manifest.id,
        name: manifest.displayName,
        mood: 'idle',
        action: 'idle',
        spritesheetUrl,
        manifest,
    };
}

export class PetStore {
    private readonly appPetsDirectoryPath: string;
    private readonly compatiblePetsDirectoryPaths: readonly string[];

    constructor(
        userDataPath: string,
        private readonly fallbackPetState: PetState,
    ) {
        this.appPetsDirectoryPath = join(userDataPath, storageDirectoryName);
        this.compatiblePetsDirectoryPaths = [
            this.appPetsDirectoryPath,
            join(homedir(), '.codex', storageDirectoryName),
        ];
    }

    async getActivePetState(): Promise<PetState> {
        for (
            let petsDirectoryIndex = 0;
            petsDirectoryIndex < this.compatiblePetsDirectoryPaths.length;
            petsDirectoryIndex += 1
        ) {
            const petState = await this.readActivePetState(petsDirectoryIndex);

            if (petState) {
                return petState;
            }
        }

        await this.saveActivePetId(this.fallbackPetState.id);

        return this.fallbackPetState;
    }

    getCompatiblePetsDirectoryPaths(): readonly string[] {
        return this.compatiblePetsDirectoryPaths;
    }

    async saveActivePetId(activePetId: string): Promise<void> {
        const activePetFile: ActivePetFile = { activePetId };
        const fileContent = `${JSON.stringify(activePetFile, null, 2)}\n`;

        await mkdir(this.appPetsDirectoryPath, { recursive: true });
        await writeFile(
            join(this.appPetsDirectoryPath, activePetFileName),
            fileContent,
            'utf8',
        );
    }

    private async readActivePetState(
        petsDirectoryIndex: number,
    ): Promise<PetState | null> {
        const petsDirectoryPath =
            this.compatiblePetsDirectoryPaths[petsDirectoryIndex];

        if (!petsDirectoryPath) {
            return null;
        }

        try {
            const activePetFile = await this.readJson(
                join(petsDirectoryPath, activePetFileName),
            );

            if (!isActivePetFile(activePetFile)) {
                return null;
            }

            const petDirectoryPath = join(
                petsDirectoryPath,
                activePetFile.activePetId,
            );
            const manifest = await this.readJson(
                join(petDirectoryPath, petManifestFileName),
            );

            if (!isCodexPetManifest(manifest)) {
                return null;
            }

            return createPetState(manifest, petsDirectoryIndex);
        } catch (error) {
            if (
                isReadableStateFileError(error) ||
                (isNodeError(error) && error.code === 'ENOENT')
            ) {
                return null;
            }

            throw error;
        }
    }

    private async readJson(filePath: string): Promise<unknown> {
        return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
    }
}

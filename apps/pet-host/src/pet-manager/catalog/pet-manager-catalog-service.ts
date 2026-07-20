import { isCodexPetManifest } from '@codex-pets-desktop/pet-domain';
import type {
    InstalledPetManifest,
    PetCatalogItem,
} from '@codex-pets-desktop/pet-shared';
import { PetStore } from '../../pet/pet-store';

interface PetManagerCatalogServiceDependencies {
    petStore: PetStore;
}

export class PetManagerCatalogService {
    constructor(
        private readonly dependencies: PetManagerCatalogServiceDependencies,
    ) {}

    async listInstalledPets(): Promise<readonly PetCatalogItem[]> {
        const activePetId = await this.dependencies.petStore.getActivePetId();

        const pets = (
            await this.dependencies.petStore.listInstalledPetManifests()
        ).flatMap((installedPetManifest) =>
            this.createCatalogItem(installedPetManifest, activePetId),
        );

        return sortActivePetFirst(dedupePetsById(pets));
    }

    async findInstalledPet(petId: string): Promise<PetCatalogItem | null> {
        return (
            (await this.listInstalledPets()).find((pet) => pet.id === petId) ??
            null
        );
    }

    private createCatalogItem(
        installedPetManifest: InstalledPetManifest,
        activePetId: string | null,
    ): readonly PetCatalogItem[] {
        if (!isCodexPetManifest(installedPetManifest.manifest)) {
            return [];
        }

        const manifest = installedPetManifest.manifest;

        return [
            {
                id: manifest.id,
                installationId: installedPetManifest.installationId,
                name: manifest.displayName,
                description: manifest.description ?? null,
                kind: manifest.kind ?? null,
                spritesheetPath: manifest.spritesheetPath,
                isActive: manifest.id === activePetId,
            },
        ];
    }
}

function dedupePetsById(
    pets: readonly PetCatalogItem[],
): readonly PetCatalogItem[] {
    return [
        ...pets
            .reduce((uniquePets, pet) => {
                const currentPet = uniquePets.get(pet.id);

                if (currentPet === undefined || pet.isActive) {
                    uniquePets.set(pet.id, pet);
                }

                return uniquePets;
            }, new Map<string, PetCatalogItem>())
            .values(),
    ];
}

function sortActivePetFirst(
    pets: readonly PetCatalogItem[],
): readonly PetCatalogItem[] {
    return [...pets].sort((left, right) => {
        if (left.isActive === right.isActive) {
            return left.name.localeCompare(right.name);
        }

        return left.isActive ? -1 : 1;
    });
}

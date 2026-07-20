import { PetStore } from '../../pet/pet-store';
import { PetManagerCatalogService } from '../catalog/pet-manager-catalog-service';

interface PetManagerPetCommandServiceDependencies {
    petManagerCatalogService: PetManagerCatalogService;
    petStore: PetStore;
}

export interface PetDeletionOutcome {
    nextActivePetId: string | null;
    removedActivePet: boolean;
}

export class PetManagerPetCommandService {
    constructor(
        private readonly dependencies: PetManagerPetCommandServiceDependencies,
    ) {}

    async selectPet(petId: string): Promise<boolean> {
        const pet =
            await this.dependencies.petManagerCatalogService.findInstalledPet(
                petId,
            );

        if (pet === null) {
            return false;
        }

        await this.dependencies.petStore.saveActivePetId(pet.id);
        return true;
    }

    async deletePet(petId: string): Promise<PetDeletionOutcome> {
        const pet =
            await this.dependencies.petManagerCatalogService.findInstalledPet(
                petId,
            );

        if (pet === null) {
            return {
                nextActivePetId: null,
                removedActivePet: false,
            };
        }

        await this.dependencies.petStore.deletePet({
            installationId: pet.installationId,
            petId: pet.id,
        });

        if (!pet.isActive) {
            return {
                nextActivePetId: null,
                removedActivePet: false,
            };
        }

        const [nextPet] =
            await this.dependencies.petManagerCatalogService.listInstalledPets();
        const nextActivePetId = nextPet?.id ?? null;

        if (nextActivePetId !== null) {
            await this.dependencies.petStore.saveActivePetId(nextActivePetId);
        }

        return {
            nextActivePetId,
            removedActivePet: true,
        };
    }
}

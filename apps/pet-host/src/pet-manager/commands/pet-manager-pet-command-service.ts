import type { PetManagerState } from '@codex-pets-desktop/pet-shared';
import { PetStore } from '../../pet/pet-store';
import { PetManagerCatalogService } from '../catalog/pet-manager-catalog-service';
import { PetManagerStateBuilderService } from '../state/pet-manager-state-builder-service';

interface PetManagerPetCommandServiceDependencies {
    petManagerCatalogService: PetManagerCatalogService;
    petManagerStateBuilderService: PetManagerStateBuilderService;
    petStore: PetStore;
}

export class PetManagerPetCommandService {
    constructor(
        private readonly dependencies: PetManagerPetCommandServiceDependencies,
    ) {}

    async selectPet(petId: string): Promise<PetManagerState> {
        const pet =
            await this.dependencies.petManagerCatalogService.findInstalledPet(
                petId,
            );

        if (pet !== null) {
            await this.dependencies.petStore.saveActivePetId(pet.id);
        }

        return this.dependencies.petManagerStateBuilderService.createState();
    }

    async deletePet(petId: string): Promise<PetManagerState> {
        const pet =
            await this.dependencies.petManagerCatalogService.findInstalledPet(
                petId,
            );

        if (pet !== null) {
            await this.dependencies.petStore.deletePet({
                installationId: pet.installationId,
                petId: pet.id,
            });
        }

        return this.dependencies.petManagerStateBuilderService.createState();
    }
}

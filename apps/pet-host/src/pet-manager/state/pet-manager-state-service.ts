import type { PetManagerState } from '@codex-pets-desktop/pet-shared';
import { PetWindowController } from '../../window/pet-window-controller';
import { PetManagerAddPetService } from '../commands/pet-manager-add-pet-service';
import { PetManagerPetCommandService } from '../commands/pet-manager-pet-command-service';
import { PetManagerStateBuilderService } from './pet-manager-state-builder-service';

interface PetManagerStateServiceDependencies {
    petManagerAddPetService: PetManagerAddPetService;
    petManagerPetCommandService: PetManagerPetCommandService;
    petManagerStateBuilderService: PetManagerStateBuilderService;
    petWindowController: PetWindowController;
}

export class PetManagerStateService {
    constructor(
        private readonly dependencies: PetManagerStateServiceDependencies,
    ) {}

    async getState(): Promise<PetManagerState> {
        return this.dependencies.petManagerStateBuilderService.createState();
    }

    async addPet(commandText: string): Promise<PetManagerState> {
        const petId =
            await this.dependencies.petManagerAddPetService.addPet(commandText);

        return this.selectAndRenderPet(petId, true);
    }

    async selectPet(petId: string): Promise<PetManagerState> {
        return this.selectAndRenderPet(petId);
    }

    private async selectAndRenderPet(
        petId: string,
        revealPet = false,
    ): Promise<PetManagerState> {
        const petSelected =
            await this.dependencies.petManagerPetCommandService.selectPet(
                petId,
            );

        if (!petSelected) {
            return this.getState();
        }

        this.dependencies.petWindowController.reloadPetWindow();

        if (revealPet) {
            this.dependencies.petWindowController.showPetWindow();
        }

        return this.getState();
    }

    async deletePet(petId: string): Promise<PetManagerState> {
        const outcome =
            await this.dependencies.petManagerPetCommandService.deletePet(
                petId,
            );

        if (outcome.removedActivePet) {
            if (outcome.nextActivePetId === null) {
                this.dependencies.petWindowController.hidePetWindow();
            } else {
                this.dependencies.petWindowController.reloadPetWindow();
            }
        }

        return this.getState();
    }

    async hidePet(): Promise<PetManagerState> {
        this.dependencies.petWindowController.hidePetWindow();
        return this.getState();
    }

    async showPet(): Promise<PetManagerState> {
        this.dependencies.petWindowController.showPetWindow();
        return this.getState();
    }
}

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
        return this.dependencies.petManagerAddPetService.addPet(commandText);
    }

    async selectPet(petId: string): Promise<PetManagerState> {
        const state =
            await this.dependencies.petManagerPetCommandService.selectPet(
                petId,
            );

        this.dependencies.petWindowController.reloadPetWindow();

        return state;
    }

    async deletePet(petId: string): Promise<PetManagerState> {
        return this.dependencies.petManagerPetCommandService.deletePet(petId);
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

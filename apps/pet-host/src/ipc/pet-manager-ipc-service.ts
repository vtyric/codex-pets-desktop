import { ipcMain } from 'electron';
import {
    PET_MANAGER_ADD_PET_CHANNEL,
    PET_MANAGER_DELETE_PET_CHANNEL,
    PET_MANAGER_GET_STATE_CHANNEL,
    PET_MANAGER_HIDE_PET_CHANNEL,
    PET_MANAGER_SELECT_PET_CHANNEL,
    PET_MANAGER_SHOW_PET_CHANNEL,
} from '@codex-pets-desktop/pet-shared';
import { PetManagerStateService } from '../pet-manager/state/pet-manager-state-service';

interface PetManagerIpcServiceDependencies {
    petManagerStateService: PetManagerStateService;
}

export class PetManagerIpcService {
    constructor(
        private readonly dependencies: PetManagerIpcServiceDependencies,
    ) {}

    registerHandlers(): void {
        ipcMain.handle(PET_MANAGER_GET_STATE_CHANNEL, async () =>
            this.dependencies.petManagerStateService.getState(),
        );
        ipcMain.handle(
            PET_MANAGER_ADD_PET_CHANNEL,
            async (_event, commandText: string) =>
                this.dependencies.petManagerStateService.addPet(commandText),
        );
        ipcMain.handle(
            PET_MANAGER_SELECT_PET_CHANNEL,
            async (_event, petId: string) =>
                this.dependencies.petManagerStateService.selectPet(petId),
        );
        ipcMain.handle(
            PET_MANAGER_DELETE_PET_CHANNEL,
            async (_event, petId: string) =>
                this.dependencies.petManagerStateService.deletePet(petId),
        );
        ipcMain.handle(PET_MANAGER_HIDE_PET_CHANNEL, async () =>
            this.dependencies.petManagerStateService.hidePet(),
        );
        ipcMain.handle(PET_MANAGER_SHOW_PET_CHANNEL, async () =>
            this.dependencies.petManagerStateService.showPet(),
        );
    }
}

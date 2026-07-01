import { ipcMain } from 'electron';
import { PET_GET_STATE_CHANNEL, type PetState } from '@codex-pets-desktop/pet-shared';
import { PetStore } from '../pet/pet-store';

interface PetIpcServiceDependencies {
    defaultPetState: PetState;
    petStore: PetStore;
}

export class PetIpcService {
    constructor(private readonly dependencies: PetIpcServiceDependencies) {}

    registerHandlers(): void {
        ipcMain.handle(PET_GET_STATE_CHANNEL, async () => {
            return this.dependencies.petStore.getActivePetState().catch(() => {
                return this.dependencies.defaultPetState;
            });
        });
    }
}

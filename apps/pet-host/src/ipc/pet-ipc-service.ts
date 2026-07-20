import { ipcMain } from 'electron';
import type { PetState } from '@codex-pets-desktop/pet-domain';
import { PET_GET_STATE_CHANNEL } from '@codex-pets-desktop/pet-shared';
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

import { contextBridge, ipcRenderer } from 'electron';
import type { EventEmitter } from 'node:events';
import { fromEvent, map, type Observable } from 'rxjs';
import {
    PET_ACTION_CHANGED_CHANNEL,
    PET_GET_STATE_CHANNEL,
    PET_MANAGER_ADD_PET_CHANNEL,
    PET_MANAGER_DELETE_PET_CHANNEL,
    PET_MANAGER_GET_STATE_CHANNEL,
    PET_MANAGER_HIDE_PET_CHANNEL,
    PET_MANAGER_SELECT_PET_CHANNEL,
    PET_MANAGER_SHOW_PET_CHANNEL,
    type PetActionChangedEvent,
    type PetHostApi,
    type PetManagerApi,
    type PetManagerState,
    type PetState,
} from '@codex-pets-desktop/pet-shared';

const petActionChanges$: Observable<PetActionChangedEvent> = fromEvent<
    readonly [Electron.IpcRendererEvent, unknown]
>(ipcRenderer as EventEmitter, PET_ACTION_CHANGED_CHANNEL).pipe(
    map(([, value]) => value as PetActionChangedEvent),
);

const petHostApi: PetHostApi = {
    async getPetState(): Promise<PetState> {
        return ipcRenderer.invoke(PET_GET_STATE_CHANNEL) as Promise<PetState>;
    },

    onPetActionChanged(
        listener: (event: PetActionChangedEvent) => void,
    ): () => void {
        const subscription = petActionChanges$.pipe().subscribe(listener);

        return () => {
            subscription.unsubscribe();
        };
    },
};

contextBridge.exposeInMainWorld('petHost', petHostApi);

const petManagerApi: PetManagerApi = {
    async getState(): Promise<PetManagerState> {
        return ipcRenderer.invoke(
            PET_MANAGER_GET_STATE_CHANNEL,
        ) as Promise<PetManagerState>;
    },

    async addPet(commandText: string): Promise<PetManagerState> {
        return ipcRenderer.invoke(
            PET_MANAGER_ADD_PET_CHANNEL,
            commandText,
        ) as Promise<PetManagerState>;
    },

    async selectPet(petId: string): Promise<PetManagerState> {
        return ipcRenderer.invoke(
            PET_MANAGER_SELECT_PET_CHANNEL,
            petId,
        ) as Promise<PetManagerState>;
    },

    async deletePet(petId: string): Promise<PetManagerState> {
        return ipcRenderer.invoke(
            PET_MANAGER_DELETE_PET_CHANNEL,
            petId,
        ) as Promise<PetManagerState>;
    },

    async hidePet(): Promise<PetManagerState> {
        return ipcRenderer.invoke(
            PET_MANAGER_HIDE_PET_CHANNEL,
        ) as Promise<PetManagerState>;
    },

    async showPet(): Promise<PetManagerState> {
        return ipcRenderer.invoke(
            PET_MANAGER_SHOW_PET_CHANNEL,
        ) as Promise<PetManagerState>;
    },
};

contextBridge.exposeInMainWorld('petManager', petManagerApi);

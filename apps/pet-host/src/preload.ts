import { contextBridge, ipcRenderer } from 'electron';
import {
    PET_ACTION_CHANGED_CHANNEL,
    PET_GET_STATE_CHANNEL,
    type PetActionChangedEvent,
    type CodexPetManifest,
    type PetAction,
    type PetHostApi,
    type PetState,
} from '@codex-pets-desktop/pet-shared';

const petActions = [
    'idle',
    'running-right',
    'running-left',
    'waving',
    'jumping',
    'failed',
    'waiting',
    'running',
    'review',
] as const satisfies readonly PetAction[];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isPetAction(value: unknown): value is PetAction {
    return (
        typeof value === 'string' &&
        petActions.some((petAction) => petAction === value)
    );
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

function isPetState(value: unknown): value is PetState {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value['id'] === 'string' &&
        typeof value['name'] === 'string' &&
        value['mood'] === 'idle' &&
        isPetAction(value['action']) &&
        (value['spritesheetUrl'] === null ||
            typeof value['spritesheetUrl'] === 'string') &&
        (value['manifest'] === null || isCodexPetManifest(value['manifest']))
    );
}

function isPetActionChangedEvent(
    value: unknown,
): value is PetActionChangedEvent {
    return isRecord(value) && isPetAction(value['action']);
}

const petHostApi: PetHostApi = {
    async getPetState(): Promise<PetState> {
        const state = await ipcRenderer.invoke(PET_GET_STATE_CHANNEL);

        if (!isPetState(state)) {
            throw new Error('Invalid pet state received from host.');
        }

        return state;
    },

    onPetActionChanged(
        listener: (event: PetActionChangedEvent) => void,
    ): () => void {
        const ipcListener = (_event: Electron.IpcRendererEvent, value: unknown) => {
            if (isPetActionChangedEvent(value)) {
                listener(value);
            }
        };

        ipcRenderer.on(PET_ACTION_CHANGED_CHANNEL, ipcListener);

        return () => {
            ipcRenderer.off(PET_ACTION_CHANGED_CHANNEL, ipcListener);
        };
    },
};

contextBridge.exposeInMainWorld('petHost', petHostApi);

export const PET_GET_STATE_CHANNEL = 'pet:get-state';
export const PET_ACTION_CHANGED_CHANNEL = 'pet:action-changed';

export type PetMood = 'idle';

export type PetAction =
    | 'idle'
    | 'running-right'
    | 'running-left'
    | 'waving'
    | 'jumping'
    | 'failed'
    | 'waiting'
    | 'running'
    | 'review';

export interface CodexPetManifest {
    id: string;
    displayName: string;
    description?: string;
    spritesheetPath: string;
    kind?: string;
}

export interface PetState {
    id: string;
    name: string;
    mood: PetMood;
    action: PetAction;
    spritesheetUrl: string | null;
    manifest: CodexPetManifest | null;
}

export interface PetActionChangedEvent {
    action: PetAction;
}

export interface PetWindowSize {
    width: number;
    height: number;
}

export interface PetHostApi {
    getPetState(): Promise<PetState>;
    onPetActionChanged(
        listener: (event: PetActionChangedEvent) => void,
    ): () => void;
}

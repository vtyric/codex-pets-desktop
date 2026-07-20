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

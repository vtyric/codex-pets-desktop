export const PET_GET_STATE_CHANNEL = 'pet:get-state';
export const PET_ACTION_CHANGED_CHANNEL = 'pet:action-changed';
export const PET_MANAGER_ADD_PET_CHANNEL = 'pet-manager:add-pet';
export const PET_MANAGER_GET_STATE_CHANNEL = 'pet-manager:get-state';
export const PET_MANAGER_SELECT_PET_CHANNEL = 'pet-manager:select-pet';
export const PET_MANAGER_DELETE_PET_CHANNEL = 'pet-manager:delete-pet';
export const PET_MANAGER_HIDE_PET_CHANNEL = 'pet-manager:hide-pet';
export const PET_MANAGER_SHOW_PET_CHANNEL = 'pet-manager:show-pet';

export type {
    CodexPetManifest,
    PetAction,
    PetMood,
    PetState,
    PetWindowSize,
} from '@codex-pets-desktop/pet-domain';
export type {
    AppPetDeleteCommand,
    AppPetManagerAction,
    AppPetManagerCommand,
    AppPetManagerItem,
    AppPetManagerListRegion,
    AppPetManagerMenu,
    AppPetManagerMenuRegion,
    AppPetManagerRegion,
    AppPetManagerView,
    AppRunningPetControls,
    AppRunningPetStatus,
    InstalledPetManifest,
    PetCatalogItem,
    PetManagerPetPreview,
    PetManagerState,
} from './pet-manager';

import type { PetAction, PetState } from '@codex-pets-desktop/pet-domain';
import type { PetManagerState } from './pet-manager';

export interface PetActionChangedEvent {
    action: PetAction;
}

export interface PetHostApi {
    getPetState(): Promise<PetState>;
    onPetActionChanged(
        listener: (event: PetActionChangedEvent) => void,
    ): () => void;
}

export interface PetManagerApi {
    getState(): Promise<PetManagerState>;
    addPet(commandText: string): Promise<PetManagerState>;
    selectPet(petId: string): Promise<PetManagerState>;
    deletePet(petId: string): Promise<PetManagerState>;
    hidePet(): Promise<PetManagerState>;
    showPet(): Promise<PetManagerState>;
}

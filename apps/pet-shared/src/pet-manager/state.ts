import type { PetCatalogItem } from './catalog';
import type { AppRunningPetControls, AppPetManagerView } from './view';

export interface PetManagerPetPreview {
    petId: string;
    spritesheetUrl: string;
}

export interface PetManagerState {
    installedPets: readonly PetCatalogItem[];
    petPreviews: readonly PetManagerPetPreview[];
    runningPetControls: AppRunningPetControls;
    view: AppPetManagerView;
}

import type {
    PetManagerApi,
    PetManagerState,
} from '@codex-pets-desktop/pet-shared';

declare global {
    interface Window {
        petManager?: PetManagerApi;
    }
}

const emptyManagerState: PetManagerState = {
    installedPets: [],
    petPreviews: [],
    runningPetControls: {
        status: 'hidden',
        menu: {
            id: 'app-menu',
            items: [],
        },
    },
    view: {
        id: 'pet-manager-main',
        title: 'Pets',
        regions: [
            {
                id: 'app-menu',
                kind: 'menu-bar',
                items: [],
            },
            {
                id: 'pet-list',
                kind: 'list',
                title: 'Installed pets',
                items: [],
            },
        ],
    },
};

export class BrowserPetManagerApi implements PetManagerApi {
    async getState(): Promise<PetManagerState> {
        return emptyManagerState;
    }

    async addPet(): Promise<PetManagerState> {
        return emptyManagerState;
    }

    async selectPet(): Promise<PetManagerState> {
        return emptyManagerState;
    }

    async deletePet(): Promise<PetManagerState> {
        return emptyManagerState;
    }

    async hidePet(): Promise<PetManagerState> {
        return emptyManagerState;
    }

    async showPet(): Promise<PetManagerState> {
        return emptyManagerState;
    }
}

export function getPetManagerApi(): PetManagerApi {
    return window.petManager ?? new BrowserPetManagerApi();
}

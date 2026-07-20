import { Injectable } from '@angular/core';
import type { PetManagerState } from '@codex-pets-desktop/pet-shared';
import { getPetManagerApi } from './pet-manager-host';

@Injectable({
    providedIn: 'root',
})
export class PetManagerHostService {
    private readonly api = getPetManagerApi();

    getState(): Promise<PetManagerState> {
        return this.api.getState();
    }

    addPet(commandText: string): Promise<PetManagerState> {
        return this.api.addPet(commandText);
    }

    selectPet(petId: string): Promise<PetManagerState> {
        return this.api.selectPet(petId);
    }

    deletePet(petId: string): Promise<PetManagerState> {
        return this.api.deletePet(petId);
    }

    hidePet(): Promise<PetManagerState> {
        return this.api.hidePet();
    }

    showPet(): Promise<PetManagerState> {
        return this.api.showPet();
    }
}

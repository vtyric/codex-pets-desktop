import { DesktopPet } from '../runtime/desktop-pet';
import type { PetState } from '../runtime/pet-types';
import {
    createPetStateFromManifest,
    isCodexPetManifest,
    type PetAssetUrlFactory,
} from './pet-manifest';

export class PetCreationFlow {
    constructor(private readonly assetUrlFactory: PetAssetUrlFactory) {}

    createState(manifest: unknown): PetState | null {
        if (!isCodexPetManifest(manifest)) {
            return null;
        }

        return createPetStateFromManifest(manifest, this.assetUrlFactory);
    }

    createPet(manifest: unknown): DesktopPet | null {
        const state = this.createState(manifest);

        return state === null ? null : DesktopPet.fromState(state);
    }
}

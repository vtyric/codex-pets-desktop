import type { PetHostApi } from '@codex-pets-desktop/pet-shared';

declare global {
    interface Window {
        petHost?: PetHostApi;
    }
}

export {};

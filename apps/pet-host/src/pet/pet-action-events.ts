import type { PetAction } from '@codex-pets-desktop/pet-shared';

type PetActionListener = (action: PetAction) => void;

export class PetActionEvents {
    private readonly listeners = new Set<PetActionListener>();

    emit(action: PetAction): void {
        for (const listener of this.listeners) {
            listener(action);
        }
    }

    subscribe(listener: PetActionListener): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }
}

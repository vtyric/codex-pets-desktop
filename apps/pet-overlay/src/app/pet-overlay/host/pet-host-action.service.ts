import { Injectable, OnDestroy, signal } from '@angular/core';
import type { PetAction } from '@codex-pets-desktop/pet-shared';

@Injectable({
    providedIn: 'root',
})
export class PetHostActionService implements OnDestroy {
    readonly action = signal<PetAction>('idle');

    private readonly unsubscribe: (() => void) | null = null;

    constructor() {
        this.unsubscribe =
            window.petHost?.onPetActionChanged((event) => {
                this.action.set(event.action);
            }) ?? null;
    }

    ngOnDestroy(): void {
        this.unsubscribe?.();
    }
}

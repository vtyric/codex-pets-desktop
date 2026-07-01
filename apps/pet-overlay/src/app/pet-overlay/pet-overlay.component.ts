import { Component, OnInit, signal } from '@angular/core';
import type { PetState } from '@codex-pets-desktop/pet-shared';
import { PetWindowComponent } from './window/pet-window.component';

const browserPreviewPetState: PetState = {
    id: 'browser-preview',
    name: 'Preview Pet',
    mood: 'idle',
    action: 'idle',
    spritesheetUrl: null,
    manifest: null,
};

@Component({
    imports: [PetWindowComponent],
    selector: 'app-pet-overlay',
    templateUrl: './pet-overlay.component.html',
})
export class PetOverlayComponent implements OnInit {
    protected readonly petState = signal<PetState | null>(null);

    async ngOnInit(): Promise<void> {
        const petHost = window.petHost;

        if (!petHost) {
            this.petState.set(browserPreviewPetState);
            return;
        }

        try {
            this.petState.set(await petHost.getPetState());
        } catch {
            this.petState.set(browserPreviewPetState);
        }
    }
}

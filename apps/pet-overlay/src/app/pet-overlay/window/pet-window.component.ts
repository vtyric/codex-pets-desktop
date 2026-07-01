import { Component, computed, input } from '@angular/core';
import type { PetState } from '@codex-pets-desktop/pet-shared';
import { DesktopPet } from '../domain/desktop-pet';
import { FallbackPetSpriteComponent } from '../sprite/fallback-pet-sprite/fallback-pet-sprite.component';
import { PetSpriteAtlasComponent } from '../sprite/pet-sprite-atlas/pet-sprite-atlas.component';

@Component({
    imports: [FallbackPetSpriteComponent, PetSpriteAtlasComponent],
    selector: 'app-pet-window',
    templateUrl: './pet-window.component.html',
    styleUrl: './pet-window.component.scss',
})
export class PetWindowComponent {
    readonly petState = input<PetState | null>(null);

    protected readonly pet = computed(() => {
        const petState = this.petState();

        return petState ? DesktopPet.fromState(petState) : null;
    });
}

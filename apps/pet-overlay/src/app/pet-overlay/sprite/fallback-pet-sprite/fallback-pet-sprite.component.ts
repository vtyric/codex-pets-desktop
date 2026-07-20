import { Component, input } from '@angular/core';
import type { PetAction } from '@codex-pets-desktop/pet-domain';

@Component({
    selector: 'app-fallback-pet-sprite',
    templateUrl: './fallback-pet-sprite.component.html',
    styleUrl: './fallback-pet-sprite.component.scss',
})
export class FallbackPetSpriteComponent {
    readonly action = input<PetAction>('idle');
}

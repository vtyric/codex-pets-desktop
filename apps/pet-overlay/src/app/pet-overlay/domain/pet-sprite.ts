import type { PetAction } from '@codex-pets-desktop/pet-shared';
import { PetAnimationPlayer } from './pet-animation-player';
import type { PetAnimationFrame } from './pet-animation-frame';
import { PetSpriteAtlas } from './pet-sprite-atlas';

export class PetSprite {
    private readonly animationPlayer: PetAnimationPlayer;
    private readonly atlas = new PetSpriteAtlas();

    constructor(readonly action: PetAction) {
        this.animationPlayer = new PetAnimationPlayer(action);
    }

    getAnimationFrame(frameIndex: number): PetAnimationFrame {
        return this.animationPlayer.getFrame(frameIndex);
    }

    getBackgroundPosition(frameIndex: number): string {
        return this.atlas.getBackgroundPosition(
            this.getAnimationFrame(frameIndex),
        );
    }
}

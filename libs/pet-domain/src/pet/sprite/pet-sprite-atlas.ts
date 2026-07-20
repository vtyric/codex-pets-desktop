import type { PetAnimationFrame } from '../animation/pet-animation-frame';

const atlasColumnCount = 8;
const atlasRowCount = 9;

export class PetSpriteAtlas {
    getBackgroundPosition(frame: PetAnimationFrame): string {
        const columnPosition =
            (frame.frameIndex / (atlasColumnCount - 1)) * 100;
        const rowPosition = (frame.rowIndex / (atlasRowCount - 1)) * 100;

        return `${columnPosition}% ${rowPosition}%`;
    }
}

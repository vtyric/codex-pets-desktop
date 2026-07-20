import type { PetWindowSize } from './window-types';

const atlasCellWidth = 192;
const atlasCellHeight = 208;
const defaultPetWindowWidth = 113;
const minPetWindowWidth = 80;
const maxPetWindowWidth = 240;

export class PetWindowSizePolicy {
    getDefaultSize(): PetWindowSize {
        return this.createSize(defaultPetWindowWidth);
    }

    getAspectRatio(): number {
        return atlasCellWidth / atlasCellHeight;
    }

    getMinimumSize(): PetWindowSize {
        return this.createSize(minPetWindowWidth);
    }

    getMaximumSize(): PetWindowSize {
        return this.createSize(maxPetWindowWidth);
    }

    clampSize(size: PetWindowSize): PetWindowSize {
        return this.createSize(
            Math.min(
                Math.max(size.width, minPetWindowWidth),
                maxPetWindowWidth,
            ),
        );
    }

    private createSize(width: number): PetWindowSize {
        return {
            width,
            height: Math.ceil((width * atlasCellHeight) / atlasCellWidth),
        };
    }
}

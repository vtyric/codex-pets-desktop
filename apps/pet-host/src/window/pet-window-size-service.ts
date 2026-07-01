import type { PetWindowSize } from '@codex-pets-desktop/pet-shared';

const atlasCellWidth = 192;
const atlasCellHeight = 208;
const defaultPetWindowWidth = 113;
const minPetWindowWidth = 80;
const maxPetWindowWidth = 240;

export class PetWindowSizeService {
    private width = defaultPetWindowWidth;

    getSize(): PetWindowSize {
        return this.createSize(this.width);
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

    updateFromNativeSize(size: PetWindowSize): PetWindowSize {
        this.width = clamp(size.width, minPetWindowWidth, maxPetWindowWidth);

        return this.getSize();
    }

    private createSize(width: number): PetWindowSize {
        return {
            width,
            height: Math.ceil((width * atlasCellHeight) / atlasCellWidth),
        };
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

import {
    PetWindowSizePolicy,
    type PetWindowSize,
} from '@codex-pets-desktop/pet-domain';

export class PetWindowSizeService {
    private readonly sizePolicy = new PetWindowSizePolicy();
    private size = this.sizePolicy.getDefaultSize();

    getSize(): PetWindowSize {
        return this.size;
    }

    getAspectRatio(): number {
        return this.sizePolicy.getAspectRatio();
    }

    getMinimumSize(): PetWindowSize {
        return this.sizePolicy.getMinimumSize();
    }

    getMaximumSize(): PetWindowSize {
        return this.sizePolicy.getMaximumSize();
    }

    updateFromNativeSize(size: PetWindowSize): PetWindowSize {
        this.size = this.sizePolicy.clampSize(size);

        return this.getSize();
    }
}

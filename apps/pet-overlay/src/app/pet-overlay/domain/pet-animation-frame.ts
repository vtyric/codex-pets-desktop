import type { PetAction } from '@codex-pets-desktop/pet-shared';

export interface PetAnimationFrame {
    action: PetAction;
    frameIndex: number;
    rowIndex: number;
    durationMs: number;
}

export interface PetAnimationState {
    frames: number;
    rowIndex: number;
    durationsMs: readonly number[];
}

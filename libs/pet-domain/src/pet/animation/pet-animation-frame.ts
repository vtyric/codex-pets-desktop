import type { PetAction } from '../runtime/pet-types';

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

import type { PetAction } from '../runtime/pet-types';

export interface PetMoveDelta {
    x: number;
    y: number;
}

const moveThresholdPx = 4;

export class PetActionRules {
    getActionForMove(delta: PetMoveDelta): PetAction {
        const absoluteX = Math.abs(delta.x);

        if (absoluteX < moveThresholdPx) {
            return 'idle';
        }

        return delta.x < 0 ? 'running-left' : 'running-right';
    }

    getActionForHover(isHovered: boolean): PetAction {
        return isHovered ? 'jumping' : 'idle';
    }
}

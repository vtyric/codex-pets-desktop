import type { PetAction } from '@codex-pets-desktop/pet-shared';

export interface PetWindowMoveDelta {
    x: number;
    y: number;
}

const moveThresholdPx = 4;

export class PetWindowActionController {
    getActionForMove(delta: PetWindowMoveDelta): PetAction {
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

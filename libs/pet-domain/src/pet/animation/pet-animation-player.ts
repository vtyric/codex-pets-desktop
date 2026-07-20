import type { PetAction } from '../runtime/pet-types';
import type {
    PetAnimationFrame,
    PetAnimationState,
} from './pet-animation-frame';

const actionRepeatCount = 3;
const slowIdleDurationMultiplier = 6;
const idleAction: PetAction = 'idle';

const animationStates: Record<PetAction, PetAnimationState> = {
    idle: {
        frames: 6,
        rowIndex: 0,
        durationsMs: [280, 110, 110, 140, 140, 320],
    },
    jumping: {
        frames: 5,
        rowIndex: 4,
        durationsMs: [140, 140, 140, 140, 280],
    },
    'running-left': {
        frames: 8,
        rowIndex: 2,
        durationsMs: [120, 120, 120, 120, 120, 120, 120, 220],
    },
    'running-right': {
        frames: 8,
        rowIndex: 1,
        durationsMs: [120, 120, 120, 120, 120, 120, 120, 220],
    },
    running: {
        frames: 6,
        rowIndex: 7,
        durationsMs: [120, 120, 120, 120, 120, 220],
    },
    waving: {
        frames: 4,
        rowIndex: 3,
        durationsMs: [140, 140, 140, 280],
    },
    waiting: {
        frames: 6,
        rowIndex: 6,
        durationsMs: [150, 150, 150, 150, 150, 260],
    },
    review: {
        frames: 6,
        rowIndex: 8,
        durationsMs: [150, 150, 150, 150, 150, 280],
    },
    failed: {
        frames: 8,
        rowIndex: 5,
        durationsMs: [140, 140, 140, 140, 140, 140, 140, 240],
    },
};

export class PetAnimationPlayer {
    constructor(private readonly action: PetAction) {}

    getFrame(frameIndex: number): PetAnimationFrame {
        const playbackFrame = this.getPlaybackFrame(frameIndex);
        const state = animationStates[playbackFrame.action];
        const durationMs = state.durationsMs[playbackFrame.frameIndex];

        return {
            action: playbackFrame.action,
            frameIndex: playbackFrame.frameIndex,
            rowIndex: state.rowIndex,
            durationMs: playbackFrame.slowIdle
                ? durationMs * slowIdleDurationMultiplier
                : durationMs,
        };
    }

    private getPlaybackFrame(frameIndex: number): {
        action: PetAction;
        frameIndex: number;
        slowIdle: boolean;
    } {
        if (this.action === idleAction) {
            return {
                action: idleAction,
                frameIndex: frameIndex % animationStates.idle.frames,
                slowIdle: true,
            };
        }

        const actionState = animationStates[this.action];
        const actionFrameBudget = actionState.frames * actionRepeatCount;

        if (frameIndex < actionFrameBudget) {
            return {
                action: this.action,
                frameIndex: frameIndex % actionState.frames,
                slowIdle: false,
            };
        }

        return {
            action: idleAction,
            frameIndex:
                (frameIndex - actionFrameBudget) % animationStates.idle.frames,
            slowIdle: true,
        };
    }
}

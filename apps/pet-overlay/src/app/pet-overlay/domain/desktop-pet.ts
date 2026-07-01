import type { PetAction, PetState } from '@codex-pets-desktop/pet-shared';
import type { PetAnimationFrame } from './pet-animation-frame';
import { PetSprite } from './pet-sprite';

export class DesktopPet {
    readonly id: string;
    readonly name: string;
    readonly action: PetAction;
    readonly spritesheetUrl: string | null;
    readonly sprite: PetSprite;

    private constructor(
        private readonly state: PetState,
        actionOverride?: PetAction,
    ) {
        this.id = state.id;
        this.name = state.name;
        this.action = actionOverride ?? state.action;
        this.spritesheetUrl = state.spritesheetUrl;
        this.sprite = new PetSprite(this.action);
    }

    static fromState(state: PetState): DesktopPet {
        return new DesktopPet(state);
    }

    withAction(action: PetAction): DesktopPet {
        return new DesktopPet(this.state, action);
    }

    hasAtlas(): boolean {
        return Boolean(this.spritesheetUrl);
    }

    getAnimationFrame(frameIndex: number): PetAnimationFrame {
        return this.sprite.getAnimationFrame(frameIndex);
    }

    getBackgroundPosition(frameIndex: number): string {
        return this.sprite.getBackgroundPosition(frameIndex);
    }
}

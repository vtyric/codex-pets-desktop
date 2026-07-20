import {
    PetActionRules,
    type PetAction,
    type PetMoveDelta,
} from '@codex-pets-desktop/pet-domain';

export class PetWindowActionController {
    private readonly actionRules = new PetActionRules();

    getActionForMove(delta: PetMoveDelta): PetAction {
        return this.actionRules.getActionForMove(delta);
    }

    getActionForHover(isHovered: boolean): PetAction {
        return this.actionRules.getActionForHover(isHovered);
    }
}

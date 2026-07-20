import { Injectable } from '@angular/core';
import type {
    AppPetManagerAction,
    AppPetManagerItem,
} from '@codex-pets-desktop/pet-shared';
import type { MenuItem } from 'primeng/api';

@Injectable()
export class PetManagerActionMenuService {
    createMenuItems(
        item: AppPetManagerItem,
        runAction: (
            action: AppPetManagerAction,
            item: AppPetManagerItem,
        ) => Promise<void>,
    ): MenuItem[] {
        return item.menu.items.map((action) => ({
            label: this.labelForAction(action),
            icon: this.iconForAction(action),
            command: () => {
                void runAction(action, item);
            },
        }));
    }

    private iconForAction(action: AppPetManagerAction): string {
        switch (action.command.kind) {
            case 'select-pet':
                return 'pi pi-check';
            case 'delete-pet':
                return 'pi pi-trash';
            case 'hide-running-pet':
                return 'pi pi-eye-slash';
            case 'show-running-pet':
                return 'pi pi-eye';
        }
    }

    private labelForAction(action: AppPetManagerAction): string {
        switch (action.command.kind) {
            case 'select-pet':
                return $localize`:@@petManagerSelectPetAction:Select`;
            case 'delete-pet':
                return $localize`:@@petManagerDeleteAction:Delete`;
            case 'hide-running-pet':
                return $localize`:@@petManagerHidePetAction:Hide pet`;
            case 'show-running-pet':
                return $localize`:@@petManagerShowPetAction:Show pet`;
        }
    }
}

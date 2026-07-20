import { PET_ACTION_CHANGED_CHANNEL } from '@codex-pets-desktop/pet-shared';
import type { Subscription } from 'rxjs';
import { PetActionEvents } from '../pet/pet-action-events';
import { PetWindowController } from '../window/pet-window-controller';

interface PetActionIpcBridgeDependencies {
    petActionEvents: PetActionEvents;
    petWindowController: PetWindowController;
}

export class PetActionIpcBridge {
    private subscription: Subscription | null = null;

    constructor(
        private readonly dependencies: PetActionIpcBridgeDependencies,
    ) {}

    start(): void {
        if (this.subscription) {
            return;
        }

        this.subscription = this.dependencies.petActionEvents.actions$
            .pipe()
            .subscribe((action) => {
                const petWindow =
                    this.dependencies.petWindowController.getWindow();

                if (!petWindow || petWindow.isDestroyed()) {
                    return;
                }

                petWindow.webContents.send(PET_ACTION_CHANGED_CHANNEL, {
                    action,
                });
            });
    }

    stop(): void {
        this.subscription?.unsubscribe();
        this.subscription = null;
    }
}

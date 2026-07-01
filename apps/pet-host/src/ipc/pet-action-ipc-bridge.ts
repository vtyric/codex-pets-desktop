import { PET_ACTION_CHANGED_CHANNEL } from '@codex-pets-desktop/pet-shared';
import { PetActionEvents } from '../pet/pet-action-events';
import { PetWindowController } from '../window/pet-window-controller';

interface PetActionIpcBridgeDependencies {
    petActionEvents: PetActionEvents;
    petWindowController: PetWindowController;
}

export class PetActionIpcBridge {
    private unsubscribe: (() => void) | null = null;

    constructor(private readonly dependencies: PetActionIpcBridgeDependencies) {}

    start(): void {
        if (this.unsubscribe) {
            return;
        }

        this.unsubscribe = this.dependencies.petActionEvents.subscribe((action) => {
            const petWindow = this.dependencies.petWindowController.getWindow();

            if (!petWindow || petWindow.isDestroyed()) {
                return;
            }

            petWindow.webContents.send(PET_ACTION_CHANGED_CHANNEL, { action });
        });
    }

    stop(): void {
        this.unsubscribe?.();
        this.unsubscribe = null;
    }
}

import { app } from 'electron';
import { petHostPlatforms } from '../platform/pet-host-platform.constants';

export class PetLoginItemService {
    enableOpenAtLogin(): void {
        if (process.platform !== petHostPlatforms.macOS || !app.isPackaged) {
            return;
        }

        app.setLoginItemSettings({
            openAtLogin: true,
            openAsHidden: false,
        });
    }
}

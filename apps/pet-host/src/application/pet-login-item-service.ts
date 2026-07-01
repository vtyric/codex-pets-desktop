import { app } from 'electron';

export class PetLoginItemService {
    enableOpenAtLogin(): void {
        if (process.platform !== 'darwin' || !app.isPackaged) {
            return;
        }

        app.setLoginItemSettings({
            openAtLogin: true,
            openAsHidden: false,
        });
    }
}

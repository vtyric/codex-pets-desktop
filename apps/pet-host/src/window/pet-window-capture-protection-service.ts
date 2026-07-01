import type { BrowserWindow } from 'electron';

export class PetWindowCaptureProtectionService {
    apply(window: BrowserWindow): void {
        if (process.platform !== 'darwin') {
            return;
        }

        window.setContentProtection(true);
    }
}

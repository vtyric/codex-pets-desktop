import type { BrowserWindow } from 'electron';

export class PetWindowCaptureProtectionService {
    apply(window: BrowserWindow): void {
        window.setContentProtection(true);
    }
}

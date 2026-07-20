import type { BrowserWindow } from 'electron';
import { petHostPlatforms } from '../platform/pet-host-platform.constants';

export class PetWindowCaptureProtectionService {
    apply(window: BrowserWindow): void {
        if (process.platform !== petHostPlatforms.macOS) {
            return;
        }

        window.setContentProtection(true);
    }
}

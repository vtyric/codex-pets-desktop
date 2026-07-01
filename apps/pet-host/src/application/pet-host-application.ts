import { app, BrowserWindow, screen } from 'electron';
import { PetActionIpcBridge } from '../ipc/pet-action-ipc-bridge';
import { PetIpcService } from '../ipc/pet-ipc-service';
import { PetAssetProtocolService } from '../pet/pet-asset-protocol';
import { PetStore } from '../pet/pet-store';
import { PetLoginItemService } from './pet-login-item-service';
import { PetWindowController } from '../window/pet-window-controller';

interface PetHostApplicationDependencies {
    overlayDevServerUrl: string | undefined;
    overlayIndexPath: string;
    petActionIpcBridge: PetActionIpcBridge;
    petAssetProtocolService: PetAssetProtocolService;
    petIpcService: PetIpcService;
    petLoginItemService: PetLoginItemService;
    petStore: PetStore;
    petWindowController: PetWindowController;
}

export class PetHostApplication {
    constructor(private readonly dependencies: PetHostApplicationDependencies) {}

    start(): void {
        this.dependencies.petAssetProtocolService.registerScheme();

        app.whenReady()
            .then(() => {
                this.startReadyApplication();
            })
            .catch((error: unknown) => {
                console.error(error);
                app.quit();
            });

        app.on('window-all-closed', () => {
            this.dependencies.petActionIpcBridge.stop();
            this.dependencies.petWindowController.stopDisplayTracking();

            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }

    private startReadyApplication(): void {
        this.dependencies.petAssetProtocolService.handle(
            this.dependencies.petStore.getCompatiblePetsDirectoryPaths(),
        );
        this.dependencies.petIpcService.registerHandlers();
        this.dependencies.petLoginItemService.enableOpenAtLogin();
        this.dependencies.petActionIpcBridge.start();
        this.createPetWindow();
        this.dependencies.petWindowController.startDisplayTracking();

        screen.on('display-added', this.keepPetWindowInVisibleWorkArea);
        screen.on('display-removed', this.keepPetWindowInVisibleWorkArea);
        screen.on('display-metrics-changed', this.keepPetWindowInVisibleWorkArea);

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createPetWindow();
            }
        });
    }

    private readonly keepPetWindowInVisibleWorkArea = (): void => {
        this.dependencies.petWindowController.keepInVisibleWorkArea();
    };

    private createPetWindow(): void {
        const petWindow = this.dependencies.petWindowController.createPetWindow();

        if (this.dependencies.overlayDevServerUrl) {
            void petWindow
                .loadURL(this.dependencies.overlayDevServerUrl)
                .catch(this.handlePetWindowLoadFailure);
            petWindow.webContents.openDevTools({ mode: 'detach' });
            return;
        }

        void petWindow
            .loadFile(this.dependencies.overlayIndexPath)
            .catch(this.handlePetWindowLoadFailure);
    }

    private readonly handlePetWindowLoadFailure = (error: unknown): void => {
        console.error('Failed to load pet overlay renderer.', error);
    };
}

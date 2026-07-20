import { app, screen } from 'electron';
import type { EventEmitter } from 'node:events';
import { fromEvent, merge, Subscription, take } from 'rxjs';
import { PetActionIpcBridge } from '../ipc/pet-action-ipc-bridge';
import { PetIpcService } from '../ipc/pet-ipc-service';
import { PetManagerIpcService } from '../ipc/pet-manager-ipc-service';
import { PetAssetProtocolService } from '../pet/pet-asset-protocol';
import { PetStore } from '../pet/pet-store';
import { PetLoginItemService } from './pet-login-item-service';
import { PetManagerWindowController } from '../window/pet-manager-window-controller';
import { PetWindowController } from '../window/pet-window-controller';
import {
    electronAppEvents,
    electronDevToolsModes,
    electronScreenEvents,
    petHostApplicationMessages,
} from './pet-host-application.constants';
import { petHostPlatforms } from '../platform/pet-host-platform.constants';

interface PetHostApplicationDependencies {
    overlayDevServerUrl: string | undefined;
    overlayIndexPath: string;
    petActionIpcBridge: PetActionIpcBridge;
    petAssetProtocolService: PetAssetProtocolService;
    petIpcService: PetIpcService;
    petLoginItemService: PetLoginItemService;
    petManagerIpcService: PetManagerIpcService;
    petManagerWindowController: PetManagerWindowController;
    petStore: PetStore;
    petWindowController: PetWindowController;
}

export class PetHostApplication {
    private readonly electronEventSubscription = new Subscription();

    constructor(
        private readonly dependencies: PetHostApplicationDependencies,
    ) {}

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

        this.electronEventSubscription.add(
            fromEvent(app as EventEmitter, electronAppEvents.beforeQuit)
                .pipe(take(1))
                .subscribe(() => {
                    this.dependencies.petManagerWindowController.prepareForAppQuit();
                }),
        );
        this.electronEventSubscription.add(
            fromEvent(app as EventEmitter, electronAppEvents.windowAllClosed)
                .pipe()
                .subscribe(() => {
                    this.dependencies.petActionIpcBridge.stop();
                    this.dependencies.petWindowController.stopDisplayTracking();

                    if (process.platform !== petHostPlatforms.macOS) {
                        app.quit();
                    }
                }),
        );
    }

    private startReadyApplication(): void {
        this.dependencies.petAssetProtocolService.handle();
        this.dependencies.petIpcService.registerHandlers();
        this.dependencies.petManagerIpcService.registerHandlers();
        this.dependencies.petLoginItemService.enableOpenAtLogin();
        this.dependencies.petActionIpcBridge.start();
        this.createPetWindow();
        this.dependencies.petManagerWindowController.openManagerWindow();
        this.dependencies.petWindowController.startDisplayTracking();

        this.electronEventSubscription.add(
            merge(
                fromEvent(
                    screen as EventEmitter,
                    electronScreenEvents.displayAdded,
                ),
                fromEvent(
                    screen as EventEmitter,
                    electronScreenEvents.displayRemoved,
                ),
                fromEvent(
                    screen as EventEmitter,
                    electronScreenEvents.displayMetricsChanged,
                ),
            )
                .pipe()
                .subscribe(() => {
                    this.keepPetWindowInVisibleWorkArea();
                }),
        );

        this.electronEventSubscription.add(
            fromEvent(app as EventEmitter, electronAppEvents.activate)
                .pipe()
                .subscribe(() => {
                    const petWindow =
                        this.dependencies.petWindowController.getWindow();

                    if (petWindow === null || petWindow.isDestroyed()) {
                        this.createPetWindow();
                    }

                    this.dependencies.petManagerWindowController.openManagerWindow();
                }),
        );
    }

    private readonly keepPetWindowInVisibleWorkArea = (): void => {
        this.dependencies.petWindowController.keepInVisibleWorkArea();
    };

    private createPetWindow(): void {
        const petWindow =
            this.dependencies.petWindowController.createPetWindow();

        if (this.dependencies.overlayDevServerUrl) {
            void petWindow
                .loadURL(this.dependencies.overlayDevServerUrl)
                .catch(this.handlePetWindowLoadFailure);
            petWindow.webContents.openDevTools({
                mode: electronDevToolsModes.detach,
            });
            return;
        }

        void petWindow
            .loadFile(this.dependencies.overlayIndexPath)
            .catch(this.handlePetWindowLoadFailure);
    }

    private readonly handlePetWindowLoadFailure = (error: unknown): void => {
        console.error(
            petHostApplicationMessages.overlayRendererLoadFailed,
            error,
        );
    };
}

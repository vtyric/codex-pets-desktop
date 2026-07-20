import { BrowserWindow } from 'electron';
import type { EventEmitter } from 'node:events';
import { fromEvent, Subscription, take } from 'rxjs';
import { petHostPlatforms } from '../platform/pet-host-platform.constants';
import {
    petManagerWindowDevToolsMode,
    petManagerWindowEvents,
    petManagerWindowMessages,
    petManagerWindowOptions,
} from './pet-manager-window.constants';

interface PetManagerWindowControllerDependencies {
    managerDevServerUrl: string | undefined;
    managerIndexPath: string;
    preloadPath: string;
}

export class PetManagerWindowController {
    private managerWindow: BrowserWindow | null = null;
    private nativeWindowSubscription: Subscription | null = null;
    private isAppQuitting = false;
    private shouldShowManager = true;

    constructor(
        private readonly dependencies: PetManagerWindowControllerDependencies,
    ) {}

    openManagerWindow(): BrowserWindow {
        const currentWindow = this.managerWindow;
        this.shouldShowManager = true;

        if (currentWindow !== null && !currentWindow.isDestroyed()) {
            if (currentWindow.isMinimized()) {
                currentWindow.restore();
            }
            currentWindow.show();
            currentWindow.focus();
            return currentWindow;
        }

        this.managerWindow = new BrowserWindow({
            ...petManagerWindowOptions,
            show: false,
            webPreferences: {
                preload: this.dependencies.preloadPath,
                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        this.subscribeToNativeWindowEvents(this.managerWindow);
        this.loadManagerRenderer(this.managerWindow);

        return this.managerWindow;
    }

    prepareForAppQuit(): void {
        this.isAppQuitting = true;
    }

    private subscribeToNativeWindowEvents(managerWindow: BrowserWindow): void {
        this.nativeWindowSubscription?.unsubscribe();
        this.nativeWindowSubscription = new Subscription();

        const eventSource = managerWindow as EventEmitter;

        this.nativeWindowSubscription.add(
            fromEvent(eventSource, petManagerWindowEvents.readyToShow)
                .pipe(take(1))
                .subscribe(() => {
                    if (
                        this.managerWindow === managerWindow &&
                        this.shouldShowManager
                    ) {
                        managerWindow.show();
                        managerWindow.focus();
                    }
                }),
        );
        this.nativeWindowSubscription.add(
            fromEvent<Electron.Event>(
                eventSource,
                petManagerWindowEvents.close,
            ).subscribe((event) => {
                if (this.isAppQuitting) {
                    return;
                }

                event.preventDefault();
                this.resetAndHideManagerWindow(managerWindow);
            }),
        );
        this.nativeWindowSubscription.add(
            fromEvent(eventSource, petManagerWindowEvents.closed)
                .pipe(take(1))
                .subscribe(() => {
                    if (this.managerWindow === managerWindow) {
                        this.managerWindow = null;
                    }
                    this.nativeWindowSubscription?.unsubscribe();
                    this.nativeWindowSubscription = null;
                }),
        );
    }

    private resetAndHideManagerWindow(managerWindow: BrowserWindow): void {
        this.shouldShowManager = false;

        if (process.platform === petHostPlatforms.macOS) {
            managerWindow.hide();
        } else {
            managerWindow.minimize();
        }

        managerWindow.webContents.reloadIgnoringCache();
    }

    private loadManagerRenderer(managerWindow: BrowserWindow): void {
        if (this.dependencies.managerDevServerUrl) {
            void managerWindow
                .loadURL(this.dependencies.managerDevServerUrl)
                .catch(this.handleManagerWindowLoadFailure);
            managerWindow.webContents.openDevTools({
                mode: petManagerWindowDevToolsMode,
            });
            return;
        }

        void managerWindow
            .loadFile(this.dependencies.managerIndexPath)
            .catch(this.handleManagerWindowLoadFailure);
    }

    private readonly handleManagerWindowLoadFailure = (
        error: unknown,
    ): void => {
        console.error(petManagerWindowMessages.rendererLoadFailed, error);
    };
}

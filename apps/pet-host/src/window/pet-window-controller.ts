import { BrowserWindow, screen, type Display, type Rectangle } from 'electron';
import type { PetAction } from '@codex-pets-desktop/pet-domain';
import type { EventEmitter } from 'node:events';
import {
    fromEvent,
    interval,
    Subject,
    Subscription,
    take,
    takeUntil,
    timer,
} from 'rxjs';
import { PetActionEvents } from '../pet/pet-action-events';
import { PetWindowActionController } from './pet-window-action-controller';
import { PetWindowCaptureProtectionService } from './pet-window-capture-protection-service';
import { PetWindowSizeService } from './pet-window-size-service';

const petWindowScreenMargin = 60;
const hoverTrackingIntervalMs = 100;
const actionResetDelayMs = 180;

interface PetWindowControllerOptions {
    actionController: PetWindowActionController;
    actionEvents: PetActionEvents;
    captureProtection: PetWindowCaptureProtectionService;
    preloadPath: string;
    sizeService: PetWindowSizeService;
}

export class PetWindowController {
    private petWindow: BrowserWindow | null = null;
    private actionResetSubscription: Subscription | null = null;
    private hoverTrackingSubscription: Subscription | null = null;
    private nativeWindowSubscription: Subscription | null = null;
    private readonly hoverTrackingStopped$ = new Subject<void>();
    private windowClosed$ = new Subject<void>();
    private lastWindowPosition: { x: number; y: number } | null = null;
    private suppressMoveAction = false;
    private isMovementActionActive = false;
    private isHovered = false;
    private shouldShowPet = true;
    private currentAction: PetAction = 'idle';

    constructor(private readonly options: PetWindowControllerOptions) {}

    createPetWindow(): BrowserWindow {
        const targetDisplay = this.getUserDisplay();
        const initialBounds = this.getPetBoundsForDisplay(targetDisplay);
        this.lastWindowPosition = {
            x: initialBounds.x,
            y: initialBounds.y,
        };

        this.petWindow = new BrowserWindow({
            ...initialBounds,
            type: 'panel',
            frame: false,
            transparent: true,
            resizable: true,
            thickFrame: true,
            movable: true,
            focusable: false,
            alwaysOnTop: true,
            hasShadow: false,
            skipTaskbar: true,
            fullscreenable: false,
            show: false,
            webPreferences: {
                preload: this.options.preloadPath,
                contextIsolation: true,
                nodeIntegration: false,
                backgroundThrottling: false,
            },
        });
        this.windowClosed$ = new Subject<void>();

        this.options.captureProtection.apply(this.petWindow);
        this.applyNativeResizePolicy();
        this.applyOverlayWindowPolicy();
        this.subscribeToNativeWindowEvents(this.petWindow);

        return this.petWindow;
    }

    getWindow(): BrowserWindow | null {
        return this.petWindow;
    }

    isPetVisible(): boolean {
        return this.shouldShowPet && (this.petWindow?.isVisible() ?? false);
    }

    hidePetWindow(): void {
        this.shouldShowPet = false;
        this.petWindow?.hide();
    }

    showPetWindow(): void {
        this.shouldShowPet = true;
        this.petWindow?.showInactive();
    }

    reloadPetWindow(): void {
        this.petWindow?.webContents.reloadIgnoringCache();
    }

    startDisplayTracking(): void {
        this.startHoverTracking();
    }

    stopDisplayTracking(): void {
        this.stopHoverTracking();
    }

    keepInVisibleWorkArea(): void {
        if (!this.petWindow) {
            return;
        }

        const bounds = this.petWindow.getBounds();
        const display = screen.getDisplayMatching(bounds);
        const workArea = display.workArea;
        const nextX = clamp(
            bounds.x,
            workArea.x,
            workArea.x + workArea.width - bounds.width,
        );
        const nextY = clamp(
            bounds.y,
            workArea.y,
            workArea.y + workArea.height - bounds.height,
        );

        if (bounds.x !== nextX || bounds.y !== nextY) {
            this.petWindow.setPosition(nextX, nextY, false);
        }
    }

    private applyOverlayWindowPolicy(): void {
        if (!this.petWindow) {
            return;
        }

        this.petWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        this.petWindow.setVisibleOnAllWorkspaces(true, {
            skipTransformProcessType: true,
            visibleOnFullScreen: true,
        });
    }

    private applyNativeResizePolicy(): void {
        if (!this.petWindow) {
            return;
        }

        const minimumSize = this.options.sizeService.getMinimumSize();
        const maximumSize = this.options.sizeService.getMaximumSize();

        this.petWindow.setMinimumSize(minimumSize.width, minimumSize.height);
        this.petWindow.setMaximumSize(maximumSize.width, maximumSize.height);
        this.petWindow.setAspectRatio(
            this.options.sizeService.getAspectRatio(),
        );
    }

    private handleWindowResize(): void {
        if (!this.petWindow) {
            return;
        }

        this.suppressMoveAction = true;
        const bounds = this.petWindow.getBounds();
        const size = this.options.sizeService.updateFromNativeSize({
            width: bounds.width,
            height: bounds.height,
        });

        if (bounds.width !== size.width || bounds.height !== size.height) {
            this.petWindow.setBounds({
                ...bounds,
                width: size.width,
                height: size.height,
            });
        }

        this.keepInVisibleWorkArea();
        const nextBounds = this.petWindow.getBounds();
        this.lastWindowPosition = {
            x: nextBounds.x,
            y: nextBounds.y,
        };
        timer(0)
            .pipe(takeUntil(this.windowClosed$))
            .subscribe(() => {
                this.suppressMoveAction = false;
            });
    }

    private getPetBoundsForDisplay(display: Display): Rectangle {
        const workArea = display.workArea;
        const size = this.options.sizeService.getSize();

        return {
            width: size.width,
            height: size.height,
            x: workArea.x + workArea.width - size.width - petWindowScreenMargin,
            y:
                workArea.y +
                workArea.height -
                size.height -
                petWindowScreenMargin,
        };
    }

    private getUserDisplay(): Display {
        return screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    }

    private handleWindowMove(): void {
        if (!this.petWindow) {
            return;
        }

        const [x, y] = this.petWindow.getPosition();
        const previousPosition = this.lastWindowPosition;
        this.lastWindowPosition = { x, y };

        if (!previousPosition || this.suppressMoveAction) {
            return;
        }

        const action = this.options.actionController.getActionForMove({
            x: x - previousPosition.x,
            y: y - previousPosition.y,
        });

        if (action === 'idle') {
            this.emitHoverAction();
            return;
        }

        this.isMovementActionActive = true;
        this.emitAction(action);
        this.scheduleMovementActionReset();
    }

    private emitAction(action: PetAction): void {
        if (this.currentAction === action) {
            return;
        }

        this.currentAction = action;
        this.options.actionEvents.emit(action);
    }

    private scheduleMovementActionReset(): void {
        this.clearActionResetSubscription();
        this.actionResetSubscription = timer(actionResetDelayMs)
            .pipe(takeUntil(this.windowClosed$))
            .subscribe(() => {
                this.actionResetSubscription = null;
                this.isMovementActionActive = false;
                this.emitHoverAction();
            });
    }

    private clearActionResetSubscription(): void {
        if (!this.actionResetSubscription) {
            return;
        }

        this.actionResetSubscription.unsubscribe();
        this.actionResetSubscription = null;
    }

    private startHoverTracking(): void {
        if (this.hoverTrackingSubscription) {
            return;
        }

        this.hoverTrackingSubscription = interval(hoverTrackingIntervalMs)
            .pipe(
                takeUntil(this.hoverTrackingStopped$),
                takeUntil(this.windowClosed$),
            )
            .subscribe(() => {
                this.updateHoverAction();
            });
        timer(0)
            .pipe(
                takeUntil(this.hoverTrackingStopped$),
                takeUntil(this.windowClosed$),
            )
            .subscribe(() => {
                this.updateHoverAction();
            });
    }

    private stopHoverTracking(): void {
        if (!this.hoverTrackingSubscription) {
            return;
        }

        this.hoverTrackingStopped$.next();
        this.hoverTrackingSubscription.unsubscribe();
        this.hoverTrackingSubscription = null;
    }

    private updateHoverAction(): void {
        if (!this.petWindow) {
            return;
        }

        const nextIsHovered = this.isCursorInsideWindow();

        if (this.isHovered === nextIsHovered) {
            return;
        }

        this.isHovered = nextIsHovered;

        if (!this.isMovementActionActive) {
            this.emitHoverAction();
        }
    }

    private emitHoverAction(): void {
        this.emitAction(
            this.options.actionController.getActionForHover(this.isHovered),
        );
    }

    private isCursorInsideWindow(): boolean {
        if (!this.petWindow) {
            return false;
        }

        const cursor = screen.getCursorScreenPoint();
        const bounds = this.petWindow.getBounds();

        return (
            cursor.x >= bounds.x &&
            cursor.x <= bounds.x + bounds.width &&
            cursor.y >= bounds.y &&
            cursor.y <= bounds.y + bounds.height
        );
    }

    private subscribeToNativeWindowEvents(petWindow: BrowserWindow): void {
        this.nativeWindowSubscription?.unsubscribe();
        this.nativeWindowSubscription = new Subscription();

        const eventSource = petWindow as EventEmitter;

        this.nativeWindowSubscription.add(
            fromEvent(eventSource, 'ready-to-show')
                .pipe(take(1), takeUntil(this.windowClosed$))
                .subscribe(() => {
                    if (!this.petWindow) {
                        return;
                    }

                    this.options.captureProtection.apply(this.petWindow);
                    this.applyNativeResizePolicy();
                    this.applyOverlayWindowPolicy();
                    if (this.shouldShowPet) {
                        this.petWindow.showInactive();
                    }
                }),
        );
        this.nativeWindowSubscription.add(
            fromEvent(eventSource, 'closed')
                .pipe(take(1))
                .subscribe(() => {
                    this.windowClosed$.next();
                    this.windowClosed$.complete();
                    this.petWindow = null;
                    this.lastWindowPosition = null;
                    this.clearActionResetSubscription();
                    this.stopHoverTracking();
                    this.nativeWindowSubscription?.unsubscribe();
                    this.nativeWindowSubscription = null;
                }),
        );
        this.nativeWindowSubscription.add(
            fromEvent(eventSource, 'move')
                .pipe(takeUntil(this.windowClosed$))
                .subscribe(() => {
                    this.handleWindowMove();
                }),
        );
        this.nativeWindowSubscription.add(
            fromEvent(eventSource, 'resize')
                .pipe(takeUntil(this.windowClosed$))
                .subscribe(() => {
                    this.handleWindowResize();
                }),
        );
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

import { Injectable, computed, effect, inject, signal } from '@angular/core';
import type { PetAction } from '@codex-pets-desktop/pet-shared';
import { DesktopPet } from '../../domain/desktop-pet';
import { PetHostActionService } from '../../host/pet-host-action.service';

@Injectable()
export class PetSpriteAtlasViewService {
    private readonly hostActionService = inject(PetHostActionService);
    private readonly pet = signal<DesktopPet | null>(null);
    private readonly frameIndex = signal(0);
    private animationTimeoutId: number | null = null;
    private currentAction: PetAction | null = null;

    private readonly renderPet = computed(() => {
        const pet = this.pet();

        return pet ? pet.withAction(this.hostActionService.action()) : null;
    });
    private readonly animationFrame = computed(() =>
        this.renderPet()?.getAnimationFrame(this.frameIndex()) ?? null,
    );

    readonly action = computed(() => this.animationFrame()?.action ?? 'idle');
    readonly backgroundImage = computed(() => {
        const spritesheetUrl = this.pet()?.spritesheetUrl;

        return spritesheetUrl ? `url("${spritesheetUrl}")` : '';
    });
    readonly backgroundPosition = computed(() =>
        this.renderPet()?.getBackgroundPosition(this.frameIndex()) ?? '0% 0%',
    );

    constructor() {
        effect(() => {
            this.applyActionTransition(this.hostActionService.action());
        });
    }

    setPet(pet: DesktopPet): void {
        this.pet.set(pet);
    }

    start(): void {
        if (this.animationTimeoutId !== null) {
            return;
        }

        this.scheduleNextFrame();
    }

    stop(): void {
        if (this.animationTimeoutId === null) {
            return;
        }

        window.clearTimeout(this.animationTimeoutId);
        this.animationTimeoutId = null;
    }

    private scheduleNextFrame(): void {
        this.animationTimeoutId = window.setTimeout(() => {
            this.advanceFrame();
            this.animationTimeoutId = null;
            this.scheduleNextFrame();
        }, this.getCurrentFrameDurationMs());
    }

    private applyActionTransition(action: PetAction): void {
        if (this.currentAction === action) {
            return;
        }

        this.currentAction = action;
        this.frameIndex.set(0);
        this.restartTimer();
    }

    private restartTimer(): void {
        if (this.animationTimeoutId === null) {
            return;
        }

        window.clearTimeout(this.animationTimeoutId);
        this.animationTimeoutId = null;
        this.scheduleNextFrame();
    }

    private getCurrentFrameDurationMs(): number {
        return this.animationFrame()?.durationMs ?? 1680;
    }

    private advanceFrame(): void {
        this.frameIndex.update((frameIndex) => frameIndex + 1);
    }

}

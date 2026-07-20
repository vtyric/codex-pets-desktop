import { Injectable, OnDestroy, signal } from '@angular/core';
import type { PetAction } from '@codex-pets-desktop/pet-domain';
import type { PetActionChangedEvent } from '@codex-pets-desktop/pet-shared';
import { Observable, Subject, takeUntil } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PetHostActionService implements OnDestroy {
    readonly action = signal<PetAction>('idle');

    private readonly destroy$ = new Subject<void>();

    constructor() {
        this.createPetActionChanges()
            .pipe(takeUntil(this.destroy$))
            .subscribe((event) => {
                this.action.set(event.action);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createPetActionChanges(): Observable<PetActionChangedEvent> {
        return new Observable<PetActionChangedEvent>((subscriber) => {
            const unsubscribe = window.petHost?.onPetActionChanged((event) => {
                subscriber.next(event);
            });

            return () => {
                unsubscribe?.();
            };
        });
    }
}

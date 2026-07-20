import { Injectable, OnDestroy, signal } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

export type PetManagerThemeMode = 'light' | 'dark';

export interface PetManagerThemeOption {
    readonly icon: string;
    readonly label: string;
    readonly mode: PetManagerThemeMode;
}

export const petManagerThemeOptions: PetManagerThemeOption[] = [
    {
        icon: 'pi pi-sun',
        label: 'Light',
        mode: 'light',
    },
    {
        icon: 'pi pi-moon',
        label: 'Dark',
        mode: 'dark',
    },
];

@Injectable()
export class PetManagerThemeService implements OnDestroy {
    readonly options = petManagerThemeOptions;

    private readonly systemThemeQuery = window.matchMedia(
        '(prefers-color-scheme: dark)',
    );
    private readonly systemThemeSubscription = new Subscription();
    private readonly userSelectedMode = signal(false);

    readonly mode = signal<PetManagerThemeMode>(this.getSystemMode());

    constructor() {
        this.applyMode(this.mode());
        this.systemThemeSubscription.add(
            fromEvent<MediaQueryListEvent>(
                this.systemThemeQuery,
                'change',
            ).subscribe(() => {
                if (!this.userSelectedMode()) {
                    const mode = this.getSystemMode();
                    this.mode.set(mode);
                    this.applyMode(mode);
                }
            }),
        );
    }

    ngOnDestroy(): void {
        this.systemThemeSubscription.unsubscribe();
    }

    setMode(mode: PetManagerThemeMode): void {
        this.userSelectedMode.set(true);
        this.mode.set(mode);
        this.applyMode(mode);
    }

    private applyMode(mode: PetManagerThemeMode): void {
        const root = document.documentElement;

        root.classList.toggle('app-light', mode === 'light');
        root.classList.toggle('app-dark', mode === 'dark');
    }

    private getSystemMode(): PetManagerThemeMode {
        return this.systemThemeQuery.matches ? 'dark' : 'light';
    }
}

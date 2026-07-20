import { computed, Injectable, inject, signal } from '@angular/core';
import type {
    AppPetManagerAction,
    AppPetManagerItem,
    AppPetManagerListRegion,
    PetManagerState,
} from '@codex-pets-desktop/pet-shared';
import type { MenuItem } from 'primeng/api';
import { firstValueFrom, map, timer } from 'rxjs';
import { PetManagerHostService } from '../host/pet-manager-host.service';
import { PetManagerLanguageService } from '../i18n/pet-manager-language.service';
import type { PetManagerLanguageCode } from '../i18n/pet-manager-language.types';
import {
    PetManagerThemeService,
    type PetManagerThemeMode,
} from '../theme/pet-manager-theme.service';
import { PetManagerActionMenuService } from './pet-manager-action-menu.service';

const overlayTransitionDelayMs = 0;

@Injectable()
export class PetManagerControllerService {
    private readonly host = inject(PetManagerHostService);
    private readonly actionMenu = inject(PetManagerActionMenuService);
    private readonly language = inject(PetManagerLanguageService);
    private readonly theme = inject(PetManagerThemeService);

    readonly state = signal<PetManagerState | null>(null);
    readonly petForDelete = signal<AppPetManagerItem | null>(null);
    readonly addPetCommand = signal('');
    readonly addPetError = signal<string | null>(null);
    readonly isAddingPet = signal(false);
    readonly searchQuery = signal('');
    readonly languageCode = this.language.code;
    readonly languageOptions = this.language.options;
    readonly themeMode = this.theme.mode;
    readonly themeOptions = this.theme.options;
    readonly installedPetsCount = computed(
        () => this.state()?.installedPets?.length ?? 0,
    );

    readonly listRegion = computed<AppPetManagerListRegion | null>(() => {
        const state = this.state();
        const listRegion = state?.view.regions.find(
            (region) => region.kind === 'list',
        );

        return listRegion?.kind === 'list' ? listRegion : null;
    });

    readonly appActions = computed<readonly AppPetManagerAction[]>(() => {
        const state = this.state();
        const menuRegion = state?.view.regions.find(
            (region) => region.kind === 'menu-bar',
        );

        return menuRegion?.kind === 'menu-bar' ? menuRegion.items : [];
    });

    readonly petMenuItems = computed<ReadonlyMap<string, MenuItem[]>>(() => {
        const listRegion = this.listRegion();

        if (listRegion === null) {
            return new Map<string, MenuItem[]>();
        }

        return new Map(
            listRegion.items.map((item) => [
                item.petId,
                this.createMenuItemsFor(item),
            ]),
        );
    });

    readonly filteredListItems = computed<readonly AppPetManagerItem[]>(() => {
        const listRegion = this.listRegion();

        if (listRegion === null) {
            return [];
        }

        const query = this.searchQuery().trim().toLowerCase();

        if (query.length === 0) {
            return listRegion.items;
        }

        return listRegion.items.filter((item) =>
            [item.title, item.subtitle ?? '', item.petId]
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    });

    async reload(): Promise<void> {
        this.state.set(await this.host.getState());
    }

    async addPet(): Promise<void> {
        const command = this.addPetCommand().trim().toLowerCase();

        if (command.length === 0 || this.isAddingPet()) {
            return;
        }

        this.isAddingPet.set(true);
        this.addPetError.set(null);

        try {
            this.state.set(await this.host.addPet(command));
            this.addPetCommand.set('');
        } catch (error) {
            this.addPetError.set(createAddPetErrorMessage(error));
        } finally {
            this.isAddingPet.set(false);
        }
    }

    menuItemsFor(item: AppPetManagerItem): MenuItem[] {
        return this.petMenuItems().get(item.petId) ?? [];
    }

    private createMenuItemsFor(item: AppPetManagerItem): MenuItem[] {
        return this.actionMenu.createMenuItems(item, (action, menuItem) =>
            this.runAction(action, menuItem),
        );
    }

    previewUrlFor(petId: string): string | null {
        return (
            this.state()?.petPreviews.find((preview) => preview.petId === petId)
                ?.spritesheetUrl ?? null
        );
    }

    async selectPet(item: AppPetManagerItem): Promise<void> {
        const selectAction = item.menu.items.find(
            (action) => action.command.kind === 'select-pet',
        );

        if (selectAction === undefined) {
            return;
        }

        await this.runAction(selectAction, item);
    }

    async runAction(
        action: AppPetManagerAction,
        item?: AppPetManagerItem,
    ): Promise<void> {
        switch (action.command.kind) {
            case 'select-pet':
                this.state.set(await this.host.selectPet(action.command.petId));
                return;
            case 'delete-pet':
                await waitForOverlayTransition();
                this.petForDelete.set(item ?? null);
                return;
            case 'hide-running-pet':
                this.state.set(await this.host.hidePet());
                return;
            case 'show-running-pet':
                this.state.set(await this.host.showPet());
                return;
        }
    }

    async confirmDelete(): Promise<void> {
        const pet = this.petForDelete();

        if (pet === null) {
            return;
        }

        this.state.set(await this.host.deletePet(pet.petId));
    }

    closeDeletePrompt(): void {
        this.petForDelete.set(null);
    }

    updateSearchQuery(value: string): void {
        this.searchQuery.set(value);
    }

    updateAddPetCommand(value: string): void {
        this.addPetCommand.set(value);
        this.addPetError.set(null);
    }

    updateThemeMode(value: PetManagerThemeMode): void {
        this.theme.setMode(value);
    }

    updateLanguage(value: PetManagerLanguageCode): void {
        this.language.setLanguage(value);
    }
}

function waitForOverlayTransition(): Promise<void> {
    return firstValueFrom(
        timer(overlayTransitionDelayMs).pipe(map(() => undefined)),
    );
}

function createAddPetErrorMessage(error: unknown): string {
    if (
        error instanceof Error &&
        error.message === 'pet-manager.invalid-add-pet-command'
    ) {
        return $localize`:@@petManagerInvalidAddPetCommand:Enter a pet id or a command like npx codex-pets add eris.`;
    }

    return error instanceof Error
        ? error.message
        : $localize`:@@petManagerAddPetFallbackError:Could not add pet.`;
}

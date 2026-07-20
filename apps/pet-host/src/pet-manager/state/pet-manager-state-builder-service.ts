import type {
    PetCatalogItem,
    PetManagerState,
} from '@codex-pets-desktop/pet-shared';
import { PetStore } from '../../pet/pet-store';
import { PetWindowController } from '../../window/pet-window-controller';
import { PetManagerCatalogService } from '../catalog/pet-manager-catalog-service';
import { PetManagerViewService } from '../view/pet-manager-view-service';

interface PetManagerStateBuilderServiceDependencies {
    petManagerCatalogService: PetManagerCatalogService;
    petManagerViewService: PetManagerViewService;
    petStore: PetStore;
    petWindowController: PetWindowController;
}

export class PetManagerStateBuilderService {
    constructor(
        private readonly dependencies: PetManagerStateBuilderServiceDependencies,
    ) {}

    async createState(): Promise<PetManagerState> {
        const installedPets =
            await this.dependencies.petManagerCatalogService.listInstalledPets();

        return this.createStateFromInstalledPets(installedPets);
    }

    private async createStateFromInstalledPets(
        installedPets: readonly PetCatalogItem[],
    ): Promise<PetManagerState> {
        const runningPetControls =
            this.dependencies.petManagerViewService.createRunningPetControls(
                this.dependencies.petWindowController.isPetVisible(),
            );

        return {
            installedPets,
            petPreviews:
                await this.dependencies.petStore.createPetPreviewUrls(
                    installedPets,
                ),
            runningPetControls,
            view: this.dependencies.petManagerViewService.createManagerView(
                installedPets,
                runningPetControls,
            ),
        };
    }
}

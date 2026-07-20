import type {
    AppPetManagerAction,
    AppPetManagerItem,
    AppPetManagerView,
    AppRunningPetControls,
    PetCatalogItem,
} from '@codex-pets-desktop/pet-shared';
import {
    petManagerCommandKinds,
    petManagerViewIds,
    petManagerViewLabels,
    petManagerViewRegionKinds,
    runningPetStatuses,
} from './pet-manager-view.constants';

export class PetManagerViewService {
    createManagerView(
        installedPets: readonly PetCatalogItem[],
        runningPetControls: AppRunningPetControls,
    ): AppPetManagerView {
        return {
            id: petManagerViewIds.main,
            title: petManagerViewLabels.pets,
            regions: [
                {
                    id: runningPetControls.menu.id,
                    kind: petManagerViewRegionKinds.menuBar,
                    items: runningPetControls.menu.items,
                },
                {
                    id: petManagerViewIds.petList,
                    kind: petManagerViewRegionKinds.list,
                    title: petManagerViewLabels.installedPets,
                    items: installedPets.map((pet) =>
                        this.createManagerItem(pet),
                    ),
                },
            ],
        };
    }

    createRunningPetControls(isVisible: boolean): AppRunningPetControls {
        return {
            status: isVisible
                ? runningPetStatuses.visible
                : runningPetStatuses.hidden,
            menu: {
                id: petManagerViewIds.appMenu,
                items: [
                    isVisible
                        ? {
                              id: petManagerViewIds.hideRunningPet,
                              label: petManagerViewLabels.hidePet,
                              command: {
                                  kind: petManagerCommandKinds.hideRunningPet,
                              },
                          }
                        : {
                              id: petManagerViewIds.showRunningPet,
                              label: petManagerViewLabels.showPet,
                              command: {
                                  kind: petManagerCommandKinds.showRunningPet,
                              },
                          },
                ],
            },
        };
    }

    private createManagerItem(pet: PetCatalogItem): AppPetManagerItem {
        return {
            petId: pet.id,
            title: pet.name,
            subtitle: pet.description,
            badge: pet.isActive ? petManagerViewLabels.active : null,
            menu: {
                id: petManagerViewIds.petActions,
                label: petManagerViewLabels.actions,
                items: this.createPetActions(pet),
            },
        };
    }

    private createPetActions(
        pet: PetCatalogItem,
    ): readonly AppPetManagerAction[] {
        const selectAction: AppPetManagerAction = {
            id: petManagerViewIds.selectPet,
            label: petManagerViewLabels.select,
            command: {
                kind: petManagerCommandKinds.selectPet,
                petId: pet.id,
            },
        };
        const deleteAction: AppPetManagerAction = {
            id: petManagerViewIds.deletePet,
            label: petManagerViewLabels.delete,
            command: {
                kind: petManagerCommandKinds.deletePet,
                petId: pet.id,
            },
        };

        return pet.isActive ? [deleteAction] : [selectAction, deleteAction];
    }
}

import {
    InjectionMode,
    asClass,
    asFunction,
    asValue,
    createContainer,
    type AwilixContainer,
} from 'awilix';
import { app } from 'electron';
import type { PetState } from '@codex-pets-desktop/pet-domain';
import { join } from 'node:path';
import { PetHostApplication } from '../application/pet-host-application';
import { PetLoginItemService } from '../application/pet-login-item-service';
import { PetActionIpcBridge } from '../ipc/pet-action-ipc-bridge';
import { PetIpcService } from '../ipc/pet-ipc-service';
import { PetManagerIpcService } from '../ipc/pet-manager-ipc-service';
import { PetActionEvents } from '../pet/pet-action-events';
import { PetAssetProtocolService } from '../pet/pet-asset-protocol';
import { PetStore } from '../pet/pet-store';
import { PetManagerCatalogService } from '../pet-manager/catalog/pet-manager-catalog-service';
import { PetManagerAddPetService } from '../pet-manager/commands/pet-manager-add-pet-service';
import { PetManagerPetCommandService } from '../pet-manager/commands/pet-manager-pet-command-service';
import { PetManagerStateBuilderService } from '../pet-manager/state/pet-manager-state-builder-service';
import { PetManagerStateService } from '../pet-manager/state/pet-manager-state-service';
import { PetManagerViewService } from '../pet-manager/view/pet-manager-view-service';
import { PetManagerWindowController } from '../window/pet-manager-window-controller';
import { PetWindowActionController } from '../window/pet-window-action-controller';
import { PetWindowCaptureProtectionService } from '../window/pet-window-capture-protection-service';
import { PetWindowController } from '../window/pet-window-controller';
import { PetWindowSizeService } from '../window/pet-window-size-service';
import {
    defaultPetState,
    petHostBuildPaths,
    petHostEnvironmentVariables,
    petHostSystemPaths,
} from './pet-host-container.constants';

interface PetHostCradle {
    defaultPetState: PetState;
    managerDevServerUrl: string | undefined;
    managerIndexPath: string;
    overlayDevServerUrl: string | undefined;
    overlayIndexPath: string;
    petActionEvents: PetActionEvents;
    petActionIpcBridge: PetActionIpcBridge;
    petAssetProtocolService: PetAssetProtocolService;
    petHostApplication: PetHostApplication;
    petIpcService: PetIpcService;
    petLoginItemService: PetLoginItemService;
    petManagerAddPetService: PetManagerAddPetService;
    petManagerCatalogService: PetManagerCatalogService;
    petManagerIpcService: PetManagerIpcService;
    petManagerPetCommandService: PetManagerPetCommandService;
    petManagerStateBuilderService: PetManagerStateBuilderService;
    petManagerStateService: PetManagerStateService;
    petManagerViewService: PetManagerViewService;
    petManagerWindowController: PetManagerWindowController;
    petStore: PetStore;
    petWindowActionController: PetWindowActionController;
    petWindowCaptureProtectionService: PetWindowCaptureProtectionService;
    petWindowController: PetWindowController;
    petWindowSizeService: PetWindowSizeService;
    preloadPath: string;
    userDataPath: string;
}

export function createPetHostContainer(): AwilixContainer<PetHostCradle> {
    const container = createContainer<PetHostCradle>({
        injectionMode: InjectionMode.PROXY,
    });

    container.register({
        defaultPetState: asValue(defaultPetState),
        managerDevServerUrl: asValue(
            process.env[petHostEnvironmentVariables.managerDevServerUrl],
        ),
        managerIndexPath: asValue(
            join(__dirname, petHostBuildPaths.managerIndex),
        ),
        overlayDevServerUrl: asValue(
            process.env[petHostEnvironmentVariables.overlayDevServerUrl],
        ),
        overlayIndexPath: asValue(
            join(__dirname, petHostBuildPaths.overlayIndex),
        ),
        petActionEvents: asClass(PetActionEvents).singleton(),
        petActionIpcBridge: asClass(PetActionIpcBridge).singleton(),
        petAssetProtocolService: asClass(PetAssetProtocolService).singleton(),
        petHostApplication: asClass(PetHostApplication).singleton(),
        petIpcService: asClass(PetIpcService).singleton(),
        petLoginItemService: asClass(PetLoginItemService).singleton(),
        petManagerAddPetService: asClass(PetManagerAddPetService).singleton(),
        petManagerCatalogService: asClass(PetManagerCatalogService).singleton(),
        petManagerIpcService: asClass(PetManagerIpcService).singleton(),
        petManagerPetCommandService: asClass(
            PetManagerPetCommandService,
        ).singleton(),
        petManagerStateBuilderService: asClass(
            PetManagerStateBuilderService,
        ).singleton(),
        petManagerStateService: asClass(PetManagerStateService).singleton(),
        petManagerViewService: asClass(PetManagerViewService).singleton(),
        petManagerWindowController: asClass(
            PetManagerWindowController,
        ).singleton(),
        petStore: asFunction(
            ({ defaultPetState, petAssetProtocolService, userDataPath }) =>
                new PetStore(
                    userDataPath,
                    defaultPetState,
                    petAssetProtocolService,
                ),
        ).singleton(),
        petWindowActionController: asClass(
            PetWindowActionController,
        ).singleton(),
        petWindowCaptureProtectionService: asClass(
            PetWindowCaptureProtectionService,
        ).singleton(),
        petWindowController: asFunction(
            ({
                petActionEvents,
                petWindowActionController,
                petWindowCaptureProtectionService,
                petWindowSizeService,
                preloadPath,
            }) =>
                new PetWindowController({
                    actionController: petWindowActionController,
                    actionEvents: petActionEvents,
                    captureProtection: petWindowCaptureProtectionService,
                    preloadPath,
                    sizeService: petWindowSizeService,
                }),
        ).singleton(),
        petWindowSizeService: asClass(PetWindowSizeService).singleton(),
        preloadPath: asValue(join(__dirname, petHostBuildPaths.preload)),
        userDataPath: asValue(app.getPath(petHostSystemPaths.userData)),
    });

    return container;
}

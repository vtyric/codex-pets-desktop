import {
    InjectionMode,
    asClass,
    asFunction,
    asValue,
    createContainer,
    type AwilixContainer,
} from 'awilix';
import { app } from 'electron';
import type { PetState } from '@codex-pets-desktop/pet-shared';
import { join } from 'node:path';
import { PetHostApplication } from '../application/pet-host-application';
import { PetLoginItemService } from '../application/pet-login-item-service';
import { PetActionIpcBridge } from '../ipc/pet-action-ipc-bridge';
import { PetIpcService } from '../ipc/pet-ipc-service';
import { PetActionEvents } from '../pet/pet-action-events';
import { PetAssetProtocolService } from '../pet/pet-asset-protocol';
import { PetStore } from '../pet/pet-store';
import { PetWindowActionController } from '../window/pet-window-action-controller';
import { PetWindowCaptureProtectionService } from '../window/pet-window-capture-protection-service';
import { PetWindowController } from '../window/pet-window-controller';
import { PetWindowSizeService } from '../window/pet-window-size-service';

interface PetHostCradle {
    defaultPetState: PetState;
    overlayDevServerUrl: string | undefined;
    overlayIndexPath: string;
    petActionEvents: PetActionEvents;
    petActionIpcBridge: PetActionIpcBridge;
    petAssetProtocolService: PetAssetProtocolService;
    petHostApplication: PetHostApplication;
    petIpcService: PetIpcService;
    petLoginItemService: PetLoginItemService;
    petStore: PetStore;
    petWindowActionController: PetWindowActionController;
    petWindowCaptureProtectionService: PetWindowCaptureProtectionService;
    petWindowController: PetWindowController;
    petWindowSizeService: PetWindowSizeService;
    preloadPath: string;
    userDataPath: string;
}

const defaultPetState: PetState = {
    id: 'default',
    name: 'Default Pet',
    mood: 'idle',
    action: 'idle',
    spritesheetUrl: null,
    manifest: null,
};

export function createPetHostContainer(): AwilixContainer<PetHostCradle> {
    const container = createContainer<PetHostCradle>({
        injectionMode: InjectionMode.PROXY,
    });

    container.register({
        defaultPetState: asValue(defaultPetState),
        overlayDevServerUrl: asValue(process.env.PET_OVERLAY_DEV_SERVER_URL),
        overlayIndexPath: asValue(
            join(__dirname, '../pet-overlay/browser/index.html'),
        ),
        petActionEvents: asClass(PetActionEvents).singleton(),
        petActionIpcBridge: asClass(PetActionIpcBridge).singleton(),
        petAssetProtocolService: asClass(PetAssetProtocolService).singleton(),
        petHostApplication: asClass(PetHostApplication).singleton(),
        petIpcService: asClass(PetIpcService).singleton(),
        petLoginItemService: asClass(PetLoginItemService).singleton(),
        petStore: asFunction(
            ({ defaultPetState, userDataPath }) =>
                new PetStore(userDataPath, defaultPetState),
        ).singleton(),
        petWindowActionController: asClass(PetWindowActionController).singleton(),
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
        preloadPath: asValue(join(__dirname, 'preload.js')),
        userDataPath: asValue(app.getPath('userData')),
    });

    return container;
}

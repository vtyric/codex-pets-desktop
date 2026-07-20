import type { PetState } from '@codex-pets-desktop/pet-domain';

export const petHostEnvironmentVariables = {
    managerDevServerUrl: 'PET_MANAGER_DEV_SERVER_URL',
    overlayDevServerUrl: 'PET_OVERLAY_DEV_SERVER_URL',
} as const;

export const petHostBuildPaths = {
    managerIndex: '../pet-manager/browser/index.html',
    overlayIndex: '../pet-overlay/browser/index.html',
    preload: 'preload.js',
} as const;

export const petHostSystemPaths = {
    userData: 'userData',
} as const;

export const defaultPetState: PetState = {
    id: 'default',
    name: 'Default Pet',
    mood: 'idle',
    action: 'idle',
    spritesheetUrl: null,
    manifest: null,
};

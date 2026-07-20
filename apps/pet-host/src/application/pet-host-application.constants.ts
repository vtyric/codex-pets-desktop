export const electronAppEvents = {
    activate: 'activate',
    beforeQuit: 'before-quit',
    windowAllClosed: 'window-all-closed',
} as const;

export const electronScreenEvents = {
    displayAdded: 'display-added',
    displayMetricsChanged: 'display-metrics-changed',
    displayRemoved: 'display-removed',
} as const;

export const electronDevToolsModes = {
    detach: 'detach',
} as const;

export const petHostApplicationMessages = {
    overlayRendererLoadFailed: 'Failed to load pet overlay renderer.',
} as const;

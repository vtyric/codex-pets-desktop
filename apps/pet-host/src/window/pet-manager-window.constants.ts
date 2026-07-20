export const petManagerWindowOptions = {
    height: 700,
    minHeight: 520,
    minWidth: 760,
    title: 'Codex Pets',
    width: 980,
} as const;

export const petManagerWindowEvents = {
    close: 'close',
    closed: 'closed',
    readyToShow: 'ready-to-show',
} as const;

export const petManagerWindowMessages = {
    rendererLoadFailed: 'Failed to load pet manager renderer.',
} as const;

export const petManagerWindowDevToolsMode = 'detach' as const;

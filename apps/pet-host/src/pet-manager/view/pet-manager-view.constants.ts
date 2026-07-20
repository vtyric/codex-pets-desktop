export const petManagerViewIds = {
    appMenu: 'app-menu',
    hideRunningPet: 'hide-running-pet',
    main: 'pet-manager-main',
    petActions: 'pet-actions',
    petList: 'pet-list',
    selectPet: 'select-pet',
    showRunningPet: 'show-running-pet',
    deletePet: 'delete-pet',
} as const;

export const petManagerViewLabels = {
    actions: 'Actions',
    active: 'Active',
    delete: 'Delete',
    hidePet: 'Hide pet',
    installedPets: 'Installed pets',
    pets: 'Pets',
    select: 'Select',
    showPet: 'Show pet',
} as const;

export const petManagerViewRegionKinds = {
    list: 'list',
    menuBar: 'menu-bar',
} as const;

export const runningPetStatuses = {
    hidden: 'hidden',
    visible: 'visible',
} as const;

export const petManagerCommandKinds = {
    deletePet: 'delete-pet',
    hideRunningPet: 'hide-running-pet',
    selectPet: 'select-pet',
    showRunningPet: 'show-running-pet',
} as const;

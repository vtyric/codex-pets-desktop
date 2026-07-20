import type { AppPetManagerAction } from './view-actions';

export type AppRunningPetStatus = 'visible' | 'hidden';

export interface AppRunningPetControls {
    status: AppRunningPetStatus;
    menu: AppPetManagerMenu;
}

export interface AppPetManagerMenu {
    id: string;
    label?: string;
    items: readonly AppPetManagerAction[];
}

export interface AppPetManagerItem {
    petId: string;
    title: string;
    subtitle: string | null;
    badge: string | null;
    menu: AppPetManagerMenu;
}

export interface AppPetManagerMenuRegion {
    id: string;
    kind: 'menu-bar';
    items: readonly AppPetManagerAction[];
}

export interface AppPetManagerListRegion {
    id: string;
    kind: 'list';
    title: string;
    items: readonly AppPetManagerItem[];
}

export type AppPetManagerRegion =
    | AppPetManagerMenuRegion
    | AppPetManagerListRegion;

export interface AppPetManagerView {
    id: string;
    title: string;
    regions: readonly AppPetManagerRegion[];
}

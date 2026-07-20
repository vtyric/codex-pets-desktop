export interface InstalledPetManifest {
    installationId: string;
    manifest: unknown;
}

export interface PetCatalogItem {
    id: string;
    installationId: string;
    name: string;
    description: string | null;
    kind: string | null;
    spritesheetPath: string;
    isActive: boolean;
}

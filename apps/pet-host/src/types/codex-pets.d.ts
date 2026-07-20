declare module 'codex-pets/src/installer.js' {
    interface AddPetOptions {
        petId: string;
        apiBase?: string;
        codexDirectory?: string;
        fetchImpl?: typeof fetch;
    }

    interface InstalledPet {
        id: string;
        displayName: string;
        installPath: string;
    }

    export function addPet(options: AddPetOptions): Promise<InstalledPet>;
}

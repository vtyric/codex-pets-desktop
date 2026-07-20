import { addPet as installCodexPet } from 'codex-pets/src/installer.js';
import { PetManagerCatalogService } from '../catalog/pet-manager-catalog-service';

const fullAddCommandPrefix = ['npx', 'codex-pets', 'add'] as const;
const fullAddCommandWithYesPrefix = [
    'npx',
    '--yes',
    'codex-pets',
    'add',
] as const;
const petIdentifierPattern = /^@?[a-zA-Z0-9._/-]+$/;
const invalidAddPetCommandErrorCode = 'pet-manager.invalid-add-pet-command';

interface PetManagerAddPetServiceDependencies {
    petManagerCatalogService: PetManagerCatalogService;
}

export class PetManagerAddPetService {
    private readonly pendingInstallations = new Map<string, Promise<string>>();

    constructor(
        private readonly dependencies: PetManagerAddPetServiceDependencies,
    ) {}

    async addPet(commandText: string): Promise<string> {
        const petId = parsePetId(commandText);

        if (petId === null) {
            throw new Error(invalidAddPetCommandErrorCode);
        }

        const installedPet =
            await this.dependencies.petManagerCatalogService.findInstalledPet(
                petId,
            );

        if (installedPet !== null) {
            return installedPet.id;
        }

        const pendingInstallation = this.pendingInstallations.get(petId);

        if (pendingInstallation !== undefined) {
            return pendingInstallation;
        }

        const installation = this.installPet(petId);
        this.pendingInstallations.set(petId, installation);

        try {
            return await installation;
        } finally {
            this.pendingInstallations.delete(petId);
        }
    }

    private async installPet(petId: string): Promise<string> {
        return (await installCodexPet({ petId })).id;
    }
}

function parsePetId(commandText: string): string | null {
    const parts = commandText.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return null;
    }

    const petId = readPetId(parts);

    return petId !== null && petIdentifierPattern.test(petId) ? petId : null;
}

function readPetId(parts: readonly string[]): string | null {
    if (
        startsWithParts(parts, fullAddCommandWithYesPrefix) &&
        parts.length === fullAddCommandWithYesPrefix.length + 1
    ) {
        return parts[fullAddCommandWithYesPrefix.length];
    }

    if (
        startsWithParts(parts, fullAddCommandPrefix) &&
        parts.length === fullAddCommandPrefix.length + 1
    ) {
        return parts[fullAddCommandPrefix.length];
    }

    return parts.length === 1 ? parts[0] : null;
}

function startsWithParts(
    parts: readonly string[],
    prefix: readonly string[],
): boolean {
    return prefix.every((part, index) => parts[index] === part);
}

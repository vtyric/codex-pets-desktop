import type { PetManagerState } from '@codex-pets-desktop/pet-shared';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PetManagerCatalogService } from '../catalog/pet-manager-catalog-service';
import { PetManagerStateBuilderService } from '../state/pet-manager-state-builder-service';

const execFileAsync = promisify(execFile);
const addPetExecutable = 'npx';
const addPetArgs = ['--yes', 'codex-pets', 'add'] as const;
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
    petManagerStateBuilderService: PetManagerStateBuilderService;
}

export class PetManagerAddPetService {
    private readonly pendingPetIds = new Set<string>();

    constructor(
        private readonly dependencies: PetManagerAddPetServiceDependencies,
    ) {}

    async addPet(commandText: string): Promise<PetManagerState> {
        const petId = parsePetId(commandText);

        if (petId === null) {
            throw new Error(invalidAddPetCommandErrorCode);
        }

        if (
            this.pendingPetIds.has(petId) ||
            (await this.dependencies.petManagerCatalogService.findInstalledPet(
                petId,
            )) !== null
        ) {
            return this.dependencies.petManagerStateBuilderService.createState();
        }

        this.pendingPetIds.add(petId);

        try {
            await execFileAsync(addPetExecutable, [...addPetArgs, petId]);
        } finally {
            this.pendingPetIds.delete(petId);
        }

        return this.dependencies.petManagerStateBuilderService.createState();
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

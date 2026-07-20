import type { CodexPetManifest, PetState } from '../runtime/pet-types';

export interface PetAssetUrlFactory {
    createAssetUrl(assetPath: string): string;
}

const requiredStringManifestFields = [
    'id',
    'displayName',
    'spritesheetPath',
] as const satisfies readonly (keyof CodexPetManifest)[];
const optionalStringManifestFields = [
    'description',
    'kind',
] as const satisfies readonly (keyof CodexPetManifest)[];

export function isCodexPetManifest(value: unknown): value is CodexPetManifest {
    if (!isRecord(value)) {
        return false;
    }

    return (
        requiredStringManifestFields.every((field) =>
            isStringField(value, field),
        ) &&
        optionalStringManifestFields.every((field) =>
            isOptionalStringField(value, field),
        )
    );
}

export function createPetStateFromManifest(
    manifest: CodexPetManifest,
    assetUrlFactory: PetAssetUrlFactory,
): PetState {
    return {
        id: manifest.id,
        name: manifest.displayName,
        mood: 'idle',
        action: 'idle',
        spritesheetUrl: assetUrlFactory.createAssetUrl(
            manifest.spritesheetPath,
        ),
        manifest,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isStringField(
    value: Record<string, unknown>,
    field: keyof CodexPetManifest,
): boolean {
    return typeof value[field] === 'string';
}

function isOptionalStringField(
    value: Record<string, unknown>,
    field: keyof CodexPetManifest,
): boolean {
    return value[field] === undefined || isStringField(value, field);
}

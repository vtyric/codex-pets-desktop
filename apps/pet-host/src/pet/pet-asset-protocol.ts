import { net, protocol } from 'electron';
import { access } from 'node:fs/promises';
import { isAbsolute, normalize, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const petAssetProtocol = 'pet';
const petAssetHost = 'asset';

export function createPetAssetUrl(
    petsDirectoryIndex: number,
    petId: string,
    assetPath: string,
): string | null {
    if (!isSafeRelativePath(petId) || !isSafeRelativePath(assetPath)) {
        return null;
    }

    const assetUrl = new URL(`${petAssetProtocol}://${petAssetHost}`);
    assetUrl.pathname = [
        encodeURIComponent(String(petsDirectoryIndex)),
        encodeURIComponent(petId),
        ...assetPath.split('/').map((pathPart) => encodeURIComponent(pathPart)),
    ].join('/');

    return assetUrl.toString();
}

export class PetAssetProtocolService {
    registerScheme(): void {
        protocol.registerSchemesAsPrivileged([
            {
                scheme: petAssetProtocol,
                privileges: {
                    secure: true,
                    standard: true,
                    supportFetchAPI: true,
                },
            },
        ]);
    }

    handle(petsDirectoryPaths: readonly string[]): void {
        protocol.handle(petAssetProtocol, async (request) => {
            const assetFilePath = await resolvePetAssetPath(
                request.url,
                petsDirectoryPaths,
            );

            if (!assetFilePath) {
                return new Response(null, { status: 404 });
            }

            return net.fetch(pathToFileURL(assetFilePath).toString());
        });
    }
}

async function resolvePetAssetPath(
    requestUrl: string,
    petsDirectoryPaths: readonly string[],
): Promise<string | null> {
    const url = new URL(requestUrl);

    if (url.hostname !== petAssetHost) {
        return null;
    }

    const pathParts = url.pathname
        .split('/')
        .filter(Boolean)
        .map((pathPart) => decodeURIComponent(pathPart));

    if (pathParts.length < 3) {
        return null;
    }

    const [petsDirectoryIndexValue, petId, ...assetPathParts] = pathParts;
    const petsDirectoryIndex = Number(petsDirectoryIndexValue);
    const petsDirectoryPath = petsDirectoryPaths[petsDirectoryIndex];

    if (
        !Number.isInteger(petsDirectoryIndex) ||
        !petsDirectoryPath ||
        !isSafeRelativePath(petId)
    ) {
        return null;
    }

    const assetPath = assetPathParts.join('/');

    if (!isSafeRelativePath(assetPath)) {
        return null;
    }

    const petDirectoryPath = resolve(petsDirectoryPath, petId);
    const assetFilePath = resolve(petDirectoryPath, assetPath);

    if (!isPathInside(assetFilePath, petDirectoryPath)) {
        return null;
    }

    try {
        await access(assetFilePath);
    } catch {
        return null;
    }

    return assetFilePath;
}

function isSafeRelativePath(value: string): boolean {
    const normalizedPath = normalize(value);

    return (
        value.length > 0 &&
        !isAbsolute(value) &&
        normalizedPath !== '..' &&
        !normalizedPath.startsWith(`..${sep}`)
    );
}

function isPathInside(childPath: string, parentPath: string): boolean {
    const relativePath = relative(parentPath, childPath);

    return (
        relativePath.length === 0 ||
        (!relativePath.startsWith('..') && !isAbsolute(relativePath))
    );
}

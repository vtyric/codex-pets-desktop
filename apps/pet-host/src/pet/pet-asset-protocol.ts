import { net, protocol } from 'electron';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const petAssetProtocol = 'pet';
const petAssetHost = 'asset';

export interface PetAssetRegistry {
    createAssetUrl(filePath: string): string;
}

export class PetAssetProtocolService implements PetAssetRegistry {
    private readonly assetFileUrls = new Map<string, string>();

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

    createAssetUrl(filePath: string): string {
        const assetId = randomUUID();
        const assetUrl = new URL(`${petAssetProtocol}://${petAssetHost}`);

        this.assetFileUrls.set(assetId, pathToFileURL(filePath).toString());
        assetUrl.searchParams.set('id', assetId);

        return assetUrl.toString();
    }

    handle(): void {
        protocol.handle(petAssetProtocol, async (request) => {
            const assetFileUrl = this.getAssetFileUrl(request.url);

            if (!assetFileUrl) {
                return new Response(null, { status: 404 });
            }

            try {
                return await net.fetch(assetFileUrl);
            } catch {
                return new Response(null, { status: 404 });
            }
        });
    }

    private getAssetFileUrl(requestUrl: string): string | null {
        const url = new URL(requestUrl);

        if (url.hostname !== petAssetHost) {
            return null;
        }

        const assetId = url.searchParams.get('id');

        return assetId ? (this.assetFileUrls.get(assetId) ?? null) : null;
    }
}

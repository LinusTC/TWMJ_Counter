import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { DetectedTile } from "@/components/call_deck_classifier/call_deck_classifier";

export type OptimizedImage = {
    uri: string;
    width: number;
    height: number;
    base64?: string | null;
};

export const optimizeImage = async (
    uri: string,
    options?: {
        maxWidth?: number;
        compression?: number;
    }
): Promise<OptimizedImage> => {
    const { maxWidth = 1280, compression = 0.55 } = options || {};

    const result = await manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        {
            compress: compression,
            format: SaveFormat.JPEG,
            base64: true,
        }
    );

    return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        base64: result.base64,
    };
};

export const sortTilesByPosition = (tiles: DetectedTile[]): DetectedTile[] => {
    const sorted = [...tiles].sort((tileA, tileB) => {
        const tileA_Y = tileA.bbox.y1;
        const tileB_Y = tileB.bbox.y1;

        // Check if tiles are on different rows (Y difference > 20 pixels)
        const verticalDistance = Math.abs(tileA_Y - tileB_Y);
        const areOnDifferentRows = verticalDistance > 20;

        if (areOnDifferentRows) {
            // Sort by vertical position: higher tiles first
            return tileA_Y - tileB_Y;
        } else {
            const tileA_X = tileA.bbox.x1;
            const tileB_X = tileB.bbox.x1;
            return tileA_X - tileB_X;
        }
    });

    return sorted;
};
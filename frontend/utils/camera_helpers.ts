import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

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

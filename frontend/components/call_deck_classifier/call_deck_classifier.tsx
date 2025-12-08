import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import twmj_api from "@/utils/api_helper";

export type DetectedTile = {
    tile: string;
    confidence: number;
    bbox: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
};

export const helloWorld = async () => {
    try {
        const response = await twmj_api.get("/");
        Alert.alert("API Response", response.data);
        console.log("Backend response:", response.data);
    } catch (error) {
        console.error("Error calling backend:", error);
        Alert.alert("Error", "Failed to connect to backend");
    }
};

export const classifyImage = async (
    base64Image: string
): Promise<DetectedTile[] | undefined> => {
    try {
        const formData = new FormData();
        formData.append("image", {
            uri: `data:image/jpeg;base64,${base64Image}`,
            type: "image/jpeg",
            name: "photo.jpg",
        } as any);

        const response = await twmj_api.post("/classify-hand", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const classifiedDecks = response.data?.classified_decks ?? [];
        const detections = classifiedDecks[0]?.detections ?? [];

        const tiles: DetectedTile[] = detections.map((det: any) => ({
            tile: det.tile,
            confidence: Number(det.confidence) || 0,
            bbox: {
                x1: Number(det.bbox?.x1) || 0,
                y1: Number(det.bbox?.y1) || 0,
                x2: Number(det.bbox?.x2) || 0,
                y2: Number(det.bbox?.y2) || 0,
            },
        }));

        console.log("Detected tiles:", tiles);
        return tiles;
    } catch (error) {
        console.error("Error calling backend:", error);
        Alert.alert("Error", "Failed to classify image");
    }
};

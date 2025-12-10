import { useEffect, useState, useRef } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Text,
    Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import GradientBackground from "@/components/GradientBackground";
import {
    classifyImage,
    DetectedTile,
} from "@/components/call_deck_classifier/call_deck_classifier";
import { optimizeImage, OptimizedImage } from "@/utils/camera_helpers";
import { BaseCounter } from "@/components/deck_counter/base_counter";
import { TileCount, base_results } from "@/types/counter";
import { getDefaultScoringTemplate, saveGameHistory } from "@/utils/database";
import CameraViewComponent from "@/components/camera_helpers/CameraView";
import DetectedTiles from "@/components/camera_helpers/DetectedTiles";
import GameParameters from "@/components/camera_helpers/GameParameters";
import Results from "@/components/camera_helpers/Results";

export default function Camera() {
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [detectedTiles, setDetectedTiles] = useState<DetectedTile[]>([]);
    const [countingResults, setCountingResults] = useState<base_results | null>(
        null
    );
    const [winnerSeat, setWinnerSeat] = useState<number>(1);
    const [currentWind, setCurrentWind] = useState<string>("east");
    const [winningTile, setWinningTile] = useState<string>("");
    const [myselfMo, setMyselfMo] = useState<boolean>(false);
    const [doorClear, setDoorClear] = useState<boolean>(false);
    const [eatZhuang, setEatZhuang] = useState<boolean>(false);
    const [isZhuang, setIsZhuang] = useState<boolean>(false);
    const [lumZhuang, setlumZhuang] = useState<number>(0);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    const hasPermission = permission?.granted;
    const hasDetections = detectedTiles.length > 0;
    const hasCapturedFrame = Boolean(capturedImage);
    const shouldShowReset = hasCapturedFrame || hasDetections;

    // Convert DetectedTile[] to TileCount
    const convertToTileCount = (tiles: DetectedTile[]): TileCount => {
        const tileCount: TileCount = {};
        tiles.forEach((tile) => {
            tileCount[tile.tile] = (tileCount[tile.tile] || 0) + 1;
        });
        return tileCount;
    };

    // Count tiles using BaseCounter when detectedTiles changes
    useEffect(() => {
        if (detectedTiles.length > 0) {
            try {
                const tileCount = convertToTileCount(detectedTiles);
                const defaultTemplate = getDefaultScoringTemplate();

                if (!defaultTemplate) {
                    console.error("No default template found");
                    return;
                }

                const counter = new BaseCounter(
                    tileCount,
                    winnerSeat,
                    currentWind,
                    winningTile,
                    myselfMo,
                    doorClear,
                    isZhuang,
                    eatZhuang,
                    lumZhuang,
                    defaultTemplate.id
                );

                const results = counter.base_count();
                setCountingResults(results);
            } catch (error) {
                console.error("Error counting tiles:", error);
            }
        } else {
            setCountingResults(null);
        }
    }, [
        detectedTiles,
        winnerSeat,
        currentWind,
        winningTile,
        myselfMo,
        doorClear,
        isZhuang,
        eatZhuang,
        lumZhuang,
    ]);

    const captureAndSendImage = async () => {
        if (!cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
                base64: false,
                skipProcessing: true,
            });
            if (!photo?.uri) return;

            let optimized: OptimizedImage = await optimizeImage(photo.uri);
            setCapturedImage(optimized.uri ?? photo.uri);

            const base64ToSend = optimized.base64 ?? photo.base64;
            if (base64ToSend) {
                const tiles = await classifyImage(base64ToSend);
                if (tiles) {
                    setDetectedTiles(tiles);
                }
            }
        } catch (error) {
            console.error("Error capturing image:", error);
        }
    };

    const importAndSendImage = async () => {
        try {
            const permissionResponse =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResponse.granted) {
                Alert.alert(
                    "Permission needed",
                    "Media library access is required to import an image."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                base64: false,
                quality: 1,
            });

            if (!result.canceled && result.assets?.length) {
                const asset = result.assets[0];
                if (!asset.uri) {
                    return;
                }

                let optimized: OptimizedImage = await optimizeImage(asset.uri);
                setCapturedImage(optimized.uri ?? asset.uri);

                const base64ToSend = optimized.base64 ?? asset.base64;
                if (base64ToSend) {
                    const tiles = await classifyImage(base64ToSend);
                    if (tiles) {
                        setDetectedTiles(tiles);
                    }
                }
            }
        } catch (error) {
            console.error("Error importing image:", error);
            Alert.alert(
                "Import failed",
                "Could not import the selected image."
            );
        }
    };

    function saveGameToDB() {
        if (!countingResults || detectedTiles.length === 0) {
            Alert.alert(
                "No Game Data",
                "Please capture tiles and get results before saving."
            );
            return;
        }

        const defaultTemplate = getDefaultScoringTemplate();
        if (!defaultTemplate) {
            Alert.alert("Error", "No default template found.");
            return;
        }

        Alert.prompt("Save Game", "Enter a name for this game:", (gameName) => {
            if (gameName && gameName.trim()) {
                const tileCount = convertToTileCount(detectedTiles);

                saveGameHistory(
                    gameName.trim(),
                    capturedImage,
                    tileCount,
                    winnerSeat,
                    currentWind,
                    winningTile,
                    myselfMo,
                    doorClear,
                    defaultTemplate.id,
                    countingResults
                );
                Alert.alert("Success", "Game saved to history!");
            }
        });
    }

    const resetCamera = () => {
        setCapturedImage(null);
        setDetectedTiles([]);
        setCountingResults(null);
    };

    return (
        <GradientBackground>
            <View style={styles.container}>
                <CameraViewComponent
                    hasPermission={hasPermission}
                    capturedImage={capturedImage}
                    cameraRef={cameraRef}
                    onRequestPermission={requestPermission}
                />
                <View style={styles.actionRow}>
                    <Pressable
                        style={[styles.actionButton, styles.importButton]}
                        onPress={
                            shouldShowReset ? resetCamera : importAndSendImage
                        }
                    >
                        <Text style={styles.importButtonText}>
                            {shouldShowReset ? "Re-import" : "Import"}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, styles.captureButton]}
                        onPress={
                            shouldShowReset ? resetCamera : captureAndSendImage
                        }
                    >
                        <Text style={styles.actionButtonText}>
                            {shouldShowReset ? "Retake" : "Capture"}
                        </Text>
                    </Pressable>
                </View>
                <ScrollView
                    style={styles.detailsScrollView}
                    contentContainerStyle={styles.detailsScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <DetectedTiles
                        detectedTiles={detectedTiles}
                        onEdit={() => {}}
                    />

                    <GameParameters
                        winnerSeat={winnerSeat}
                        currentWind={currentWind}
                        winningTile={winningTile}
                        myselfMo={myselfMo}
                        doorClear={doorClear}
                        isZhuang={isZhuang}
                        eatZhuang={eatZhuang}
                        lumZhuang={lumZhuang}
                        onWinnerSeatChange={setWinnerSeat}
                        onCurrentWindChange={setCurrentWind}
                        onWinningTileChange={setWinningTile}
                        onMyselfMoChange={setMyselfMo}
                        onDoorClearChange={setDoorClear}
                        onIsZhuangChange={setIsZhuang}
                        onEatZhuangChange={setEatZhuang}
                        onLumZhuangChange={setlumZhuang}
                    />

                    <Results countingResults={countingResults} />
                    {capturedImage &&
                        detectedTiles.length > 0 &&
                        countingResults && (
                            <Pressable
                                style={styles.saveButton}
                                onPress={saveGameToDB}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </Pressable>
                        )}
                </ScrollView>
            </View>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 16,
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    captureButton: {
        backgroundColor: "#166b60",
    },
    importButton: {
        borderWidth: 2,
        borderColor: "#166b60",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    importButtonText: {
        color: "#166b60",
        fontSize: 16,
        fontWeight: "600",
    },
    detailsScrollView: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: 16,
    },
    detailsScrollContent: {
        paddingBottom: 100,
        gap: 24,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#166b60",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

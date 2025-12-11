import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { DetectedTile } from "@/components/call_deck_classifier/call_deck_classifier";
import { tileImageMap } from "@/constants/tile_images";
import { sortTilesByPosition } from "@/utils/camera_helpers";

interface DetectedTilesProps {
    detectedTiles: DetectedTile[];
    onEdit: () => void;
}

export default function DetectedTiles({
    detectedTiles,
    onEdit,
}: DetectedTilesProps) {
    const sortedTiles = sortTilesByPosition(detectedTiles);

    return (
        <View style={styles.detectionsSection}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Detected Tiles</Text>
                <Pressable style={styles.manualEditButton} onPress={onEdit}>
                    <Ionicons name="pencil" size={18} color="#166b60" />
                    <Text style={styles.manualEditText}>Edit</Text>
                </Pressable>
            </View>
            {detectedTiles.length > 0 ? (
                <View style={styles.tileList}>
                    {sortedTiles.map((tile, index) => {
                        const tileKey = tile.tile;
                        const tileSource = tileImageMap[tileKey] ?? null;

                        return (
                            <View
                                key={`${tileKey}-${index}`}
                                style={styles.tileSlot}
                            >
                                {tileSource ? (
                                    <Image
                                        source={tileSource}
                                        style={styles.tileImage}
                                    />
                                ) : (
                                    <View style={styles.placeholderTile}>
                                        <Text
                                            style={styles.placeholderTileText}
                                        >
                                            {tileKey}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            ) : (
                <Text style={styles.placeholderText}>
                    Tile detections will appear here once the camera identifies
                    them.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    detectionsSection: {
        gap: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.08)",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    manualEditButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: "#fff",
        borderWidth: 1.5,
        borderColor: "#166b60",
    },
    manualEditText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#166b60",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0a3d34",
    },
    tileList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "flex-start",
    },
    tileSlot: {
        width: 45,
        height: 67.5,
        alignItems: "center",
        justifyContent: "center",
    },
    tileImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        backgroundColor: "transparent",
    },
    placeholderTile: {
        width: "100%",
        height: "100%",
        borderWidth: 1,
        borderColor: "rgba(10,61,52,0.2)",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f6fbfa",
        paddingHorizontal: 4,
    },
    placeholderTileText: {
        fontSize: 10,
        color: "#0a3d34",
        textAlign: "center",
    },
    placeholderText: {
        fontSize: 14,
        color: "#456761",
        lineHeight: 20,
    },
});

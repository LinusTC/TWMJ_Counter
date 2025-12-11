import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DetectedTile } from "@/components/call_deck_classifier/call_deck_classifier";
import { ALL_TILES } from "@/constants/dictionary";

type TileImageMap = Record<string, ImageSourcePropType | null>;

// Map tile keys to their image assets
const tileImageMap: TileImageMap = {
    // Manzu (萬子) - Characters
    m1: require("../../assets/tiles/m1.png"),
    m2: require("../../assets/tiles/m2.png"),
    m3: require("../../assets/tiles/m3.png"),
    m4: require("../../assets/tiles/m4.png"),
    m5: require("../../assets/tiles/m5.png"),
    m6: require("../../assets/tiles/m6.png"),
    m7: require("../../assets/tiles/m7.png"),
    m8: require("../../assets/tiles/m8.png"),
    m9: require("../../assets/tiles/m9.png"),
    // Tongzi (筒子) - Dots
    t1: require("../../assets/tiles/t1.png"),
    t2: require("../../assets/tiles/t2.png"),
    t3: require("../../assets/tiles/t3.png"),
    t4: require("../../assets/tiles/t4.png"),
    t5: require("../../assets/tiles/t5.png"),
    t6: require("../../assets/tiles/t6.png"),
    t7: require("../../assets/tiles/t7.png"),
    t8: require("../../assets/tiles/t8.png"),
    t9: require("../../assets/tiles/t9.png"),
    // Suozi (索子) - Bamboo
    s1: require("../../assets/tiles/s1.png"),
    s2: require("../../assets/tiles/s2.png"),
    s3: require("../../assets/tiles/s3.png"),
    s4: require("../../assets/tiles/s4.png"),
    s5: require("../../assets/tiles/s5.png"),
    s6: require("../../assets/tiles/s6.png"),
    s7: require("../../assets/tiles/s7.png"),
    s8: require("../../assets/tiles/s8.png"),
    s9: require("../../assets/tiles/s9.png"),
    // Winds
    east: require("../../assets/tiles/east.png"),
    south: require("../../assets/tiles/south.png"),
    west: require("../../assets/tiles/west.png"),
    north: require("../../assets/tiles/north.png"),
    // Dragons
    zhong: require("../../assets/tiles/zhong.png"),
    fa: require("../../assets/tiles/fa.png"),
    bak: require("../../assets/tiles/bak.png"),
    // Flowers
    f1: require("../../assets/tiles/f1.png"),
    f2: require("../../assets/tiles/f2.png"),
    f3: require("../../assets/tiles/f3.png"),
    f4: require("../../assets/tiles/f4.png"),
    ff1: require("../../assets/tiles/ff1.png"),
    ff2: require("../../assets/tiles/ff2.png"),
    ff3: require("../../assets/tiles/ff3.png"),
    ff4: require("../../assets/tiles/ff4.png"),
};

const sortTilesByPosition = (tiles: DetectedTile[]): DetectedTile[] => {
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
        width: "155%",
        height: "155%",
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

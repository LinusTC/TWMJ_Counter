import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DetectedTile } from "@/components/call_deck_classifier/call_deck_classifier";

interface DetectedTilesProps {
    detectedTiles: DetectedTile[];
    onEdit: () => void;
}

export default function DetectedTiles({
    detectedTiles,
    onEdit,
}: DetectedTilesProps) {
    return (
        <View style={styles.detectionsSection}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Detected Tiles</Text>
                <Pressable style={styles.editButton} onPress={onEdit}>
                    <Ionicons name="pencil" size={20} color="#166b60" />
                </Pressable>
            </View>
            {detectedTiles.length > 0 ? (
                <View style={styles.tileList}>
                    {detectedTiles.map((tile, index) => (
                        <View
                            key={`${tile.tile}-${index}`}
                            style={styles.tileItem}
                        >
                            <Text style={styles.tileText}>{tile.tile}</Text>
                        </View>
                    ))}
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
    editButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#166b60",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0a3d34",
    },
    tileList: {
        gap: 6,
    },
    tileItem: {
        gap: 2,
    },
    tileText: {
        fontSize: 15,
        color: "#0a3d34",
    },
    placeholderText: {
        fontSize: 14,
        color: "#456761",
        lineHeight: 20,
    },
});

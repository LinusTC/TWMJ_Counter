import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { DISPLAY_TILE_SIZE, tileImageMap } from "@/constants/tile_images";

interface SelectWinningTileModalProp {
    visible: boolean;
    onClose: () => void;
    detectedTiles: string[];
    selectedWinningTile: string;
    onSelect: (tile: string) => void;
}

export default function SelectWinningTileModal({
    visible,
    onClose,
    detectedTiles,
    selectedWinningTile,
    onSelect,
}: SelectWinningTileModalProp) {
    // Get unique tiles from detected tiles
    const uniqueTiles = Array.from(new Set(detectedTiles));

    const handleSelectTile = (tileKey: string) => {
        onSelect(tileKey);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Winning Tile</Text>
                        <Text style={styles.subtitle}>
                            Tap on the tile you won with
                        </Text>
                    </View>

                    {/* Tiles Section */}
                    <ScrollView
                        style={styles.tilesScrollView}
                        contentContainerStyle={styles.tilesContainer}
                    >
                        {uniqueTiles.length > 0 ? (
                            <View style={styles.tileList}>
                                {uniqueTiles.map((tileKey) => {
                                    const tileSource = tileImageMap[tileKey];
                                    if (!tileSource) return null;
                                    const isSelected =
                                        tileKey === selectedWinningTile;
                                    return (
                                        <Pressable
                                            key={tileKey}
                                            style={[
                                                styles.tileSlot,
                                                isSelected &&
                                                    styles.selectedTileSlot,
                                            ]}
                                            onPress={() =>
                                                handleSelectTile(tileKey)
                                            }
                                        >
                                            <Image
                                                source={tileSource}
                                                style={styles.tileImage}
                                            />
                                            {isSelected && (
                                                <View
                                                    style={styles.selectedBadge}
                                                    pointerEvents="none"
                                                >
                                                    <Text
                                                        style={
                                                            styles.selectedBadgeText
                                                        }
                                                    >
                                                        ✓
                                                    </Text>
                                                </View>
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>
                                No tiles detected
                            </Text>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionsRow}>
                        <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(10, 32, 27, 0.85)",
        padding: 20,
        justifyContent: "center",
    },
    card: {
        backgroundColor: "#fdfbf7",
        borderRadius: 28,
        padding: 24,
        maxHeight: "70%",
        gap: 12,
    },
    header: {
        gap: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#114137",
    },
    subtitle: {
        fontSize: 14,
        color: "#5a716b",
        marginBottom: 4,
    },
    tilesScrollView: {
        maxHeight: 400,
        borderRadius: 14,
        backgroundColor: "#f6fbfa",
        padding: 12,
    },
    tilesContainer: {
        flexGrow: 1,
    },
    tileList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
    },
    tileSlot: {
        width: 60,
        height: 90,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedTileSlot: {
        borderColor: "#166b60",
        backgroundColor: "#e6f4f1",
    },
    tileImage: {
        width: DISPLAY_TILE_SIZE,
        height: DISPLAY_TILE_SIZE,
        resizeMode: "contain",
    },
    selectedBadge: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "#166b60",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fdfbf7",
    },
    selectedBadgeText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    emptyText: {
        fontSize: 14,
        color: "#5a716b",
        fontStyle: "italic",
        textAlign: "center",
        paddingVertical: 40,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#166b60",
    },
    cancelText: {
        color: "#166b60",
        fontSize: 16,
        fontWeight: "600",
    },
});

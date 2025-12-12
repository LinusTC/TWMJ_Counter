import React, { useState, useEffect } from "react";
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
import {
    M_DICT,
    T_DICT,
    S_DICT,
    WIND_DICT,
    ZFB_DICT,
    FLOWER_DICT,
} from "@/constants/dictionary";

interface EditDetectedTilesModalProp {
    visible: boolean;
    onClose: () => void;
    detectedTiles: string[];
    onSave: (tiles: string[]) => void;
}

export default function EditDetectedTilesModal({
    visible,
    onClose,
    detectedTiles,
    onSave,
}: EditDetectedTilesModalProp) {
    const [tiles, setTiles] = useState<string[]>(detectedTiles);

    // Reset tiles when modal becomes visible
    useEffect(() => {
        if (visible) {
            setTiles(detectedTiles);
        }
    }, [visible, detectedTiles]);

    // Handle adding a tile from dictionary
    const handleAddTile = (tileKey: string) => {
        setTiles([...tiles, tileKey]);
    };

    // Handle removing a tile from detected tiles
    const handleRemoveTile = (index: number) => {
        const newTiles = tiles.filter((_, i) => i !== index);
        setTiles(newTiles);
    };

    // Handle save
    const handleSave = () => {
        onSave(tiles);
        onClose();
    };

    // Handle cancel
    const handleCancel = () => {
        setTiles(detectedTiles); // Reset to original
        onClose();
    };

    // Organize tiles by category
    const tileCategories = [
        {
            title: "Flowers (花)",
            tiles: Object.keys(FLOWER_DICT),
        },
        {
            title: "Characters (萬)",
            tiles: Object.keys(M_DICT),
        },
        {
            title: "Dots (筒)",
            tiles: Object.keys(T_DICT),
        },
        {
            title: "Bamboo (索)",
            tiles: Object.keys(S_DICT),
        },
        {
            title: "Winds (風)",
            tiles: Array.from(WIND_DICT),
        },
        {
            title: "Dragons (箭)",
            tiles: Array.from(ZFB_DICT),
        },
    ];

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
                        <Text style={styles.title}>Edit Detected Tiles</Text>
                        <Text style={styles.subtitle}>
                            Tap tiles below to add them or remove from the
                            detected list
                        </Text>
                    </View>

                    {/* Detected Tiles Section - Row by row like DetectedTiles.tsx */}
                    <View style={styles.detectedSection}>
                        <Text style={styles.sectionTitle}>
                            Detected Tiles ({tiles.length})
                        </Text>
                        <ScrollView
                            style={styles.detectedTilesScrollView}
                            contentContainerStyle={
                                styles.detectedTilesContainer
                            }
                        >
                            {tiles.length > 0 ? (
                                <View style={styles.tileList}>
                                    {tiles.map((tileKey, index) => {
                                        const tileSource =
                                            tileImageMap[tileKey];
                                        if (!tileSource) return null;
                                        return (
                                            <Pressable
                                                key={`${tileKey}-${index}`}
                                                style={styles.tileSlot}
                                                onPress={() =>
                                                    handleRemoveTile(index)
                                                }
                                            >
                                                <Image
                                                    source={tileSource}
                                                    style={styles.tileImage}
                                                />
                                                <View
                                                    style={styles.removeButton}
                                                    pointerEvents="none"
                                                >
                                                    <Text
                                                        style={
                                                            styles.removeButtonText
                                                        }
                                                    >
                                                        ×
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text style={styles.emptyText}>
                                    Tap tiles below to add them
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Dictionary Section */}
                    <Text style={styles.sectionTitle}>Tile Dictionary</Text>
                    <ScrollView style={styles.dictionarySection}>
                        {tileCategories.map((category, categoryIndex) => (
                            <View
                                key={categoryIndex}
                                style={styles.categoryContainer}
                            >
                                <Text style={styles.categoryTitle}>
                                    {category.title}
                                </Text>
                                <View style={styles.tilesGrid}>
                                    {category.tiles.map((tileKey) => {
                                        const tileSource =
                                            tileImageMap[tileKey];
                                        if (!tileSource) return null;
                                        return (
                                            <Pressable
                                                key={tileKey}
                                                onPress={() =>
                                                    handleAddTile(tileKey)
                                                }
                                                style={
                                                    styles.dictionaryTileSlot
                                                }
                                            >
                                                <Image
                                                    source={tileSource}
                                                    style={
                                                        styles.dictionaryTileImage
                                                    }
                                                />
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionsRow}>
                        <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.actionButton, styles.submitButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.submitText}>Save</Text>
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
        maxHeight: "85%",
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
    detectedSection: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0a3d34",
    },
    detectedTilesScrollView: {
        maxHeight: 150,
        borderRadius: 14,
        backgroundColor: "#f6fbfa",
        padding: 10,
    },
    detectedTilesContainer: {
        flexGrow: 1,
    },
    tileList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "flex-start",
    },
    tileSlot: {
        width: 42,
        height: 63,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    tileImage: {
        width: DISPLAY_TILE_SIZE,
        height: DISPLAY_TILE_SIZE,
        resizeMode: "contain",
    },
    removeButton: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#b0413e",
        borderRadius: 12,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fdfbf7",
    },
    removeButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        lineHeight: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#5a716b",
        fontStyle: "italic",
        textAlign: "center",
        paddingVertical: 20,
    },
    dictionarySection: {
        maxHeight: 280,
        borderRadius: 14,
        backgroundColor: "#f6fbfa",
        padding: 12,
    },
    categoryContainer: {
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4c5c58",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    tilesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    dictionaryTileSlot: {
        width: 40,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    dictionaryTileImage: {
        width: DISPLAY_TILE_SIZE,
        height: DISPLAY_TILE_SIZE,
        resizeMode: "contain",
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
    submitButton: {
        backgroundColor: "#166b60",
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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

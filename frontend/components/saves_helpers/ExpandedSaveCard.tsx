import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { GameHistory } from "@/utils/database";
import { WIND_LABELS, SEAT_DICT } from "@/constants/dictionary";
import { DISPLAY_TILE_SIZE, tileImageMap } from "@/constants/tile_images";

interface ExpandedHistoryCardProps {
    game: GameHistory;
    onDelete: (game: GameHistory) => void;
}

export default function ExpandedHistoryCard({
    game,
    onDelete,
}: ExpandedHistoryCardProps) {
    return (
        <View style={styles.expandedContent}>
            {game.image_uri && (
                <Image
                    source={{
                        uri: game.image_uri,
                    }}
                    style={styles.gameImage}
                    resizeMode="contain"
                />
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detected Tiles</Text>
                {game.tiles_array && game.tiles_array.length > 0 ? (
                    <View style={styles.tileImageGrid}>
                        {game.tiles_array.map((tileKey, index) => {
                            const tileSource = tileImageMap[tileKey];
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
                                                style={
                                                    styles.placeholderTileText
                                                }
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
                    <View style={styles.tileMapList}>
                        {Object.entries(game.detected_tiles).map(
                            ([tile, count]) => (
                                <Text key={tile} style={styles.tileText}>
                                    {tile}: {count}
                                </Text>
                            )
                        )}
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Game Parameters</Text>
                <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Seat:</Text>
                    <Text style={styles.paramValue}>
                        {game.winner_seat} (
                        {WIND_LABELS[SEAT_DICT[game.winner_seat]]})
                    </Text>
                </View>
                <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Wind:</Text>
                    <Text style={styles.paramValue}>
                        {WIND_LABELS[game.current_wind]}
                    </Text>
                </View>
                <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Winning Tile:</Text>
                    {game.winning_tile && tileImageMap[game.winning_tile] ? (
                        <View style={styles.winningTileContainer}>
                            <Image
                                source={tileImageMap[game.winning_tile]}
                                style={styles.winningTileImage}
                            />
                        </View>
                    ) : (
                        <Text style={styles.paramValue}>
                            {game.winning_tile || "N/A"}
                        </Text>
                    )}
                </View>
                <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Self-Draw:</Text>
                    <Text style={styles.paramValue}>
                        {game.myself_mo ? "Yes" : "No"}
                    </Text>
                </View>
                <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Door Clear:</Text>
                    <Text style={styles.paramValue}>
                        {game.door_clear ? "Yes" : "No"}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Results</Text>

                <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Total Points:</Text>
                    <Text style={styles.resultValue}>
                        {game.results.calculated_points}
                    </Text>
                </View>
                {game.results.log && (
                    <View style={styles.logsContainer}>
                        <Text style={styles.logsTitle}>Scoring Details:</Text>
                        {Array.isArray(game.results.log) ? (
                            game.results.log.map((logEntry, index) => (
                                <Text key={index} style={styles.logEntry}>
                                    • {logEntry}
                                </Text>
                            ))
                        ) : (
                            <Text style={styles.logEntry}>
                                • {game.results.log}
                            </Text>
                        )}
                    </View>
                )}

                <View style={styles.totalValueContainer}>
                    <Text style={styles.totalValueLabel}>Total Value:</Text>
                    <View style={styles.totalValueWrapper}>
                        <Text style={styles.formulaBreakdown}>
                            ({game.results.calculated_points} ×{" "}
                            {game.results.multiplier}) +{" "}
                            {game.results.base_value} ={" "}
                        </Text>
                        <Text style={styles.totalValue}>
                            {game.results.value}
                        </Text>
                    </View>
                </View>
            </View>

            <Pressable
                style={styles.deleteButton}
                onPress={() => onDelete(game)}
            >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete Game</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 16,
    },
    gameImage: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#166b60",
        marginBottom: 4,
    },
    tileImageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tileSlot: {
        width: 45,
        height: 67.5,
        alignItems: "center",
        justifyContent: "center",
    },
    tileImage: {
        width: DISPLAY_TILE_SIZE,
        height: DISPLAY_TILE_SIZE,
        resizeMode: "cover",
        backgroundColor: "transparent",
    },
    placeholderTile: {
        width: DISPLAY_TILE_SIZE,
        height: DISPLAY_TILE_SIZE,
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
    tileMapList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tileText: {
        fontSize: 16,
        color: "#333",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    paramRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    paramLabel: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    paramValue: {
        fontSize: 16,
        color: "#333",
    },
    winningTileContainer: {
        width: 40,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    winningTileImage: {
        width: DISPLAY_TILE_SIZE,
        height: DISPLAY_TILE_SIZE,
        resizeMode: "contain",
    },
    resultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#f0f8f7",
        borderRadius: 8,
    },
    resultLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0a3d34",
    },
    resultValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#166b60",
    },
    logsContainer: {
        gap: 8,
        marginTop: 8,
    },
    logsTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0a3d34",
    },
    totalValueContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#0d5a4f",
        borderRadius: 12,
    },
    totalValueLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 8,
        letterSpacing: 1,
    },
    totalValueWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
    },
    formulaBreakdown: {
        fontSize: 16,
        fontWeight: "400",
        color: "#a8d5cc",
    },
    totalValue: {
        fontSize: 26,
        fontWeight: "900",
        color: "#ffffff",
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    logEntry: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#d32f2f",
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
        marginTop: 8,
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

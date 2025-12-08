import { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "@/components/GradientBackground";
import {
    getAllGameHistory,
    GameHistory,
    deleteGameHistory,
} from "@/utils/database";
import { WIND_LABELS, SEAT_DICT } from "@/constants/dictionary";

export default function History() {
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

    const loadHistory = useCallback(() => {
        const data = getAllGameHistory();
        setGameHistory(data);
    }, []);

    useFocusEffect(loadHistory);

    function formatDate(dateString: string) {
        const parsed = new Date(dateString);
        if (Number.isNaN(parsed.getTime())) {
            return dateString;
        }
        return parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function toggleExpand(gameId: number, event: any) {
        event.stopPropagation();
        setExpandedGameId(expandedGameId === gameId ? null : gameId);
    }

    function handleDelete(game: GameHistory, event: any) {
        event.stopPropagation();

        Alert.alert(
            "Delete Game",
            `Are you sure you want to delete "${
                game.name || "Untitled Game"
            }"?`,
            [
                { text: "Cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteGameHistory(game.id);
                        setExpandedGameId(null);
                        loadHistory();
                    },
                },
            ]
        );
    }

    return (
        <GradientBackground>
            <View style={styles.container}>
                <Text style={styles.pageTitle}>History</Text>
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {gameHistory.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No game history yet. Play some games to see them
                            here.
                        </Text>
                    ) : (
                        gameHistory.map((game) => {
                            const isExpanded = expandedGameId === game.id;
                            return (
                                <View key={game.id} style={styles.historyCard}>
                                    <Pressable
                                        style={styles.cardHeader}
                                        onPress={(e) =>
                                            toggleExpand(game.id, e)
                                        }
                                    >
                                        <View style={styles.cardLeft}>
                                            <Text style={styles.gameName}>
                                                {game.name || "Untitled Game"}
                                            </Text>
                                            <Text style={styles.gameDate}>
                                                {formatDate(game.created_at)}
                                            </Text>
                                        </View>
                                        <View style={styles.cardRight}>
                                            <Text style={styles.pointsValue}>
                                                {game.results.value}
                                            </Text>
                                            <Text style={styles.pointsLabel}>
                                                pts
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={(e) =>
                                                toggleExpand(game.id, e)
                                            }
                                            hitSlop={12}
                                            style={styles.expandButton}
                                        >
                                            <Ionicons
                                                name={
                                                    isExpanded
                                                        ? "chevron-up"
                                                        : "chevron-down"
                                                }
                                                size={20}
                                                color="#166b60"
                                            />
                                        </Pressable>
                                    </Pressable>

                                    {isExpanded && (
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
                                                <Text
                                                    style={styles.sectionTitle}
                                                >
                                                    Detected Tiles
                                                </Text>
                                                <View style={styles.tilesGrid}>
                                                    {Object.entries(
                                                        game.detected_tiles
                                                    ).map(([tile, count]) => (
                                                        <Text
                                                            key={tile}
                                                            style={
                                                                styles.tileText
                                                            }
                                                        >
                                                            {tile}: {count}
                                                        </Text>
                                                    ))}
                                                </View>
                                            </View>

                                            <View style={styles.section}>
                                                <Text
                                                    style={styles.sectionTitle}
                                                >
                                                    Game Parameters
                                                </Text>
                                                <View style={styles.paramRow}>
                                                    <Text
                                                        style={
                                                            styles.paramLabel
                                                        }
                                                    >
                                                        Seat:
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.paramValue
                                                        }
                                                    >
                                                        {game.winner_seat} (
                                                        {
                                                            WIND_LABELS[
                                                                SEAT_DICT[
                                                                    game
                                                                        .winner_seat
                                                                ]
                                                            ]
                                                        }
                                                        )
                                                    </Text>
                                                </View>
                                                <View style={styles.paramRow}>
                                                    <Text
                                                        style={
                                                            styles.paramLabel
                                                        }
                                                    >
                                                        Wind:
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.paramValue
                                                        }
                                                    >
                                                        {
                                                            WIND_LABELS[
                                                                game
                                                                    .current_wind
                                                            ]
                                                        }
                                                    </Text>
                                                </View>
                                                <View style={styles.paramRow}>
                                                    <Text
                                                        style={
                                                            styles.paramLabel
                                                        }
                                                    >
                                                        Winning Tile:
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.paramValue
                                                        }
                                                    >
                                                        {game.winning_tile ||
                                                            "N/A"}
                                                    </Text>
                                                </View>
                                                <View style={styles.paramRow}>
                                                    <Text
                                                        style={
                                                            styles.paramLabel
                                                        }
                                                    >
                                                        Self-Draw:
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.paramValue
                                                        }
                                                    >
                                                        {game.myself_mo
                                                            ? "Yes"
                                                            : "No"}
                                                    </Text>
                                                </View>
                                                <View style={styles.paramRow}>
                                                    <Text
                                                        style={
                                                            styles.paramLabel
                                                        }
                                                    >
                                                        Door Clear:
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.paramValue
                                                        }
                                                    >
                                                        {game.door_clear
                                                            ? "Yes"
                                                            : "No"}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.section}>
                                                <Text
                                                    style={styles.sectionTitle}
                                                >
                                                    Results
                                                </Text>
                                                <Text
                                                    style={styles.totalPoints}
                                                >
                                                    Total: {game.results.value}{" "}
                                                    points
                                                </Text>
                                                {game.results.log.map(
                                                    (logEntry, index) => (
                                                        <Text
                                                            key={index}
                                                            style={
                                                                styles.logEntry
                                                            }
                                                        >
                                                            • {logEntry}
                                                        </Text>
                                                    )
                                                )}
                                            </View>

                                            <Pressable
                                                style={styles.deleteButton}
                                                onPress={(e) =>
                                                    handleDelete(game, e)
                                                }
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={18}
                                                    color="#fff"
                                                />
                                                <Text
                                                    style={
                                                        styles.deleteButtonText
                                                    }
                                                >
                                                    Delete Game
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            );
                        })
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
        paddingBottom: 80,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#166b60",
        marginBottom: 20,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        fontSize: 20,
        color: "#666",
        textAlign: "center",
        marginTop: 40,
    },
    historyCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    cardLeft: {
        flex: 1,
    },
    gameName: {
        fontSize: 24,
        fontWeight: "600",
        color: "#166b60",
        marginBottom: 4,
    },
    gameDate: {
        fontSize: 14,
        color: "#666",
    },
    cardRight: {
        alignItems: "flex-end",
        marginRight: 8,
    },
    pointsValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#166b60",
    },
    pointsLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    expandButton: {
        padding: 4,
    },
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
    tilesGrid: {
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
    totalPoints: {
        fontSize: 20,
        fontWeight: "600",
        color: "#166b60",
        marginBottom: 8,
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

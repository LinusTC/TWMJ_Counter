import { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "@/components/GradientBackground";
import {
    getAllGameHistory,
    GameHistory,
    deleteGameHistory,
    updateGameHistoryName,
} from "@/utils/database";
import ExpandedHistoryCard from "@/components/history_helpers/ExpandedHistoryCard";

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

    function handleEdit(gameId: number, currentName: string, event: any) {
        event.stopPropagation();

        Alert.prompt(
            "Edit Game Name",
            "Enter a new name for this game:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: (newName?: string) => {
                        if (newName && newName.trim()) {
                            updateGameHistoryName(gameId, newName.trim());
                            loadHistory();
                        }
                    },
                },
            ],
            "plain-text",
            currentName
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
                                            <View style={styles.header}>
                                                <Text style={styles.gameName}>
                                                    {game.name ||
                                                        "Untitled Game"}
                                                </Text>
                                                <Pressable
                                                    style={styles.editButton}
                                                    onPress={(e) =>
                                                        handleEdit(
                                                            game.id,
                                                            game.name || "",
                                                            e
                                                        )
                                                    }
                                                >
                                                    <Ionicons
                                                        name="pencil"
                                                        size={20}
                                                        color="#166b60"
                                                    />
                                                </Pressable>
                                            </View>
                                            <Text style={styles.gameDate}>
                                                {formatDate(game.created_at)}
                                            </Text>
                                        </View>
                                        <View style={styles.cardRight}>
                                            <Text style={styles.pointsValue}>
                                                {game.results.calculated_points}
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
                                        <ExpandedHistoryCard
                                            game={game}
                                            onDelete={(g) =>
                                                handleDelete(g, {
                                                    stopPropagation: () => {},
                                                } as any)
                                            }
                                        />
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
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    editButton: {
        padding: 4,
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
});

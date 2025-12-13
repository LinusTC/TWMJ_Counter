import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Alert,
    ScrollView,
} from "react-native";
import GradientBackground from "@/components/GradientBackground";
import { useEffect, useState, useCallback } from "react";
import { getLanguage, SupportedLanguage } from "@/language_constants";
import { getSetting } from "@/utils/database";
import {
    createActiveGame,
    getAllActiveGames,
    deleteActiveGame,
    ActiveGame,
} from "@/utils/firebase_helper";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function Play() {
    const [language, setLanguage] = useState<SupportedLanguage>("en");
    const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
    const translations = getLanguage(language);

    useEffect(() => {
        const savedLanguage = getSetting("language", "en") as SupportedLanguage;
        setLanguage(savedLanguage);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadActiveGames();
        }, [])
    );

    async function loadActiveGames() {
        try {
            const games = await getAllActiveGames();
            setActiveGames(games);
        } catch (error) {
            console.error("Error loading games:", error);
            Alert.alert("Error", "Failed to load games");
        }
    }

    async function handleCreateGame() {
        if (activeGames.length >= 2) {
            Alert.alert(
                "Limit Reached",
                "You can only have 2 active games at a time. Please complete or delete an existing game first."
            );
            return;
        }

        Alert.prompt("New Game", "Enter game name:", async (gameName) => {
            if (gameName && gameName.trim()) {
                try {
                    await createActiveGame(gameName.trim());
                    await loadActiveGames();
                    router.push("/play/in-game");
                } catch (error) {
                    console.error("Error creating game:", error);
                    Alert.alert("Error", "Failed to create game");
                }
            }
        });
    }

    async function handleDeleteGame(gameId: string, gameName: string) {
        Alert.alert(
            "Delete Game",
            `Are you sure you want to delete "${gameName}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteActiveGame(gameId);
                            await loadActiveGames();
                        } catch (error) {
                            console.error("Error deleting game:", error);
                            Alert.alert("Error", "Failed to delete game");
                        }
                    },
                },
            ]
        );
    }

    function openGame(game: ActiveGame) {
        router.push({
            pathname: "/play/in-game",
            params: {
                game: JSON.stringify(game),
            },
        });
    }

    return (
        <GradientBackground>
            <View style={styles.container}>
                <Text style={styles.pageTitle}>{translations.tabs_play}</Text>
                <Pressable style={styles.createCard} onPress={handleCreateGame}>
                    <View style={styles.createIcon}>
                        <Ionicons name="add" size={24} color="#166b60" />
                    </View>
                    <View style={styles.createCardTextContainer}>
                        <Text style={styles.createCardTitle}>Create Game</Text>
                    </View>
                </Pressable>

                <ScrollView
                    style={styles.gamesScrollView}
                    contentContainerStyle={styles.gamesScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeGames.map((game) => (
                        <View key={game.id} style={styles.gameCard}>
                            <Pressable
                                style={styles.gameCardContent}
                                onPress={() => openGame(game)}
                            >
                                <View style={styles.gameIcon}>
                                    <Ionicons
                                        name="game-controller"
                                        size={24}
                                        color="#166b60"
                                    />
                                </View>
                                <View style={styles.gameInfo}>
                                    <Text style={styles.gameName}>
                                        {game.name}
                                    </Text>
                                    <Text style={styles.gameDate}>
                                        {game.createdAt
                                            ? new Date(
                                                  game.createdAt
                                              ).toLocaleDateString()
                                            : "Just now"}
                                    </Text>
                                </View>
                            </Pressable>
                            <Pressable
                                style={styles.deleteButton}
                                onPress={() =>
                                    handleDeleteGame(game.id, game.name)
                                }
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={20}
                                    color="#dc2626"
                                />
                            </Pressable>
                        </View>
                    ))}
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
    createCard: {
        width: "100%",
        borderRadius: 14,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#166b60",
        backgroundColor: "rgba(22, 107, 96, 0.08)",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 20,
    },
    createIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#166b60",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    createCardTextContainer: {
        flex: 1,
    },
    createCardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#166b60",
    },
    gamesScrollView: {
        flex: 1,
    },
    gamesScrollContent: {
        gap: 12,
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
    gameCard: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gameCardContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    gameIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(22, 107, 96, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    gameInfo: {
        flex: 1,
    },
    gameName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0a3d34",
        marginBottom: 4,
    },
    gameDate: {
        fontSize: 13,
        color: "#666",
    },
    deleteButton: {
        padding: 8,
    },
});

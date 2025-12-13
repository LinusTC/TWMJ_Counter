import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "@/components/GradientBackground";
import { ActiveGame } from "@/utils/firebase_helper";

export default function InGame() {
    const params = useLocalSearchParams<{ game: string }>();
    const game: ActiveGame = params.game ? JSON.parse(params.game) : null;

    function openGameSettings() {
        router.push({
            pathname: "/play/game_settings",
            params: {
                game: JSON.stringify(game),
            },
        });
    }

    return (
        <GradientBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={32} color="#166b60" />
                    </Pressable>
                    <Text style={styles.pageTitle}>
                        {game?.name || "Game Lobby"}
                    </Text>
                    <Pressable
                        style={styles.settingsButton}
                        onPress={openGameSettings}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={32}
                            color="#166b60"
                        />
                    </Pressable>
                </View>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#166b60",
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});

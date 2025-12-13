import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "@/components/GradientBackground";
import { ActiveGame } from "@/utils/firebase_helper";

export default function InGameSettings() {
    const params = useLocalSearchParams<{ game: string }>();
    const game: ActiveGame = params.game ? JSON.parse(params.game) : null;

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
                    <Text style={styles.pageTitle}>Game Settings</Text>
                </View>
                <Text style={styles.pageTitle}>
                    {game?.name || "Game Lobby"}
                </Text>
                <Pressable style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>End Game and save to local</Text>
                </Pressable>
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
        justifyContent: "center",
        marginBottom: 20,
        position: "relative",
    },
    backButton: {
        position: "absolute",
        left: 0,
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
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#166b60",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

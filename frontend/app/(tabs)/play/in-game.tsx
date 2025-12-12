import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "@/components/GradientBackground";

export default function InGame() {
    return (
        <GradientBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#166b60" />
                    </Pressable>
                    <Text style={styles.pageTitle}>Game Lobby</Text>
                    <View style={styles.placeholder} />
                </View>

                <Text style={styles.placeholder}>
                    In-game screen placeholder
                </Text>
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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        alignItems: "center",
        justifyContent: "center",
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#166b60",
    },
    placeholder: {
        width: 40,
    },
});

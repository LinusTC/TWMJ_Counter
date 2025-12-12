import { View, Text, StyleSheet, Pressable } from "react-native";
import GradientBackground from "@/components/GradientBackground";
import { useEffect, useState } from "react";
import { getLanguage, SupportedLanguage } from "@/language_constants";
import { getSetting } from "@/utils/database";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Play() {
    const [language, setLanguage] = useState<SupportedLanguage>("en");
    const translations = getLanguage(language);

    useEffect(() => {
        const savedLanguage = getSetting("language", "en") as SupportedLanguage;
        setLanguage(savedLanguage);
    }, []);

    return (
        <GradientBackground>
            <View style={styles.container}>
                <Text style={styles.pageTitle}>{translations.tabs_play}</Text>
                <Pressable
                    style={styles.createCard}
                    onPress={() => router.push("/play/in-game")}
                >
                    <View style={styles.createIcon}>
                        <Ionicons name="add" size={24} color="#166b60" />
                    </View>
                    <View style={styles.createCardTextContainer}>
                        <Text style={styles.createCardTitle}>Create Game</Text>
                    </View>
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
});

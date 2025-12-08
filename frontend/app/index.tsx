import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { getSetting, saveSetting } from "@/utils/database";
import GradientBackground from "@/components/GradientBackground";
import { getLanguage, SupportedLanguage } from "@/language_constants";

export default function Index() {
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [name, setName] = useState("");
    const [language, setLanguage] = useState<SupportedLanguage>("en");

    useEffect(() => {
        const savedLanguage = getSetting("language", "en");
        setLanguage(savedLanguage);

        const savedName = getSetting("name", "SET A NAME");
        if (savedName === "SET A NAME") {
            setShowNamePrompt(true);
        }
    }, []);

    const translations = getLanguage(language);

    function handleNameSave() {
        if (name.trim()) {
            saveSetting("name", name.trim());
            setShowNamePrompt(false);
        }
    }

    if (showNamePrompt) {
        return (
            <GradientBackground>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.container}>
                        <View style={styles.promptBox}>
                            <Text style={styles.title}>
                                {translations.welcomeTitle}
                            </Text>
                            <Text style={styles.subtitle}>
                                {translations.welcomeSubtitle}
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                onSubmitEditing={handleNameSave}
                            />

                            <Pressable
                                style={[
                                    styles.button,
                                    !name.trim() && styles.buttonDisabled,
                                ]}
                                onPress={handleNameSave}
                                disabled={!name.trim()}
                            >
                                <Text style={styles.buttonText}>
                                    {translations.continueButton}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </GradientBackground>
        );
    } else {
        return <Redirect href="/(tabs)/play" />;
    }
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    promptBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 30,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#166b60",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
    },
    input: {
        width: "100%",
        borderWidth: 2,
        borderColor: "#166b60",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#166b60",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

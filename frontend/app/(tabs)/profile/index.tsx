import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    Image,
} from "react-native";
import GradientBackground from "@/components/GradientBackground";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getSetting, saveSetting, resetDatabase } from "@/utils/database";
import { getLanguage, SupportedLanguage } from "@/language_constants";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {
    const [name, setName] = useState("default");
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [language, setLanguage] = useState<SupportedLanguage>("en");
    const [isEditingName, setIsEditingName] = useState(false);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const translations = getLanguage(language);

    useEffect(() => {
        // Load settings from database
        const savedName = getSetting("name");
        const savedTheme = getSetting("theme", "light") as "light" | "dark";
        const savedLanguage = getSetting("language", "en") as SupportedLanguage;
        const savedProfilePic = getSetting("profilePic", "");

        setName(savedName);
        setTheme(savedTheme);
        setLanguage(savedLanguage);
        setProfilePic(savedProfilePic);
    }, []);

    function handleNameSave() {
        saveSetting("name", name);
        setIsEditingName(false);
    }

    function handleThemeChange(newTheme: "light" | "dark") {
        setTheme(newTheme);
        saveSetting("theme", newTheme);
    }

    function handleLanguageChange(newLanguage: SupportedLanguage) {
        setLanguage(newLanguage);
        saveSetting("language", newLanguage);
    }

    function handleProfilePicPress() {
        const options = profilePic
            ? ["Upload New Photo", "Delete Photo", "Cancel"]
            : ["Upload Photo", "Cancel"];
        const cancelButtonIndex = options.length - 1;
        const destructiveButtonIndex = profilePic ? 1 : undefined;

        Alert.alert("Profile Picture", "Choose an option", [
            {
                text: options[0],
                onPress: handleUploadPhoto,
            },
            ...(profilePic
                ? [
                      {
                          text: options[1],
                          onPress: handleDeletePhoto,
                          style: "destructive" as const,
                      },
                  ]
                : []),
            {
                text: options[cancelButtonIndex],
                style: "cancel" as const,
            },
        ]);
    }

    async function handleUploadPhoto() {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please grant camera roll permissions to upload a profile picture."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0]) {
            const imageUri = result.assets[0].uri;
            setProfilePic(imageUri);
            saveSetting("profilePic", imageUri);
        }
    }

    function handleDeletePhoto() {
        setProfilePic(null);
        saveSetting("profilePic", "");
    }

    function handleResetDatabase() {
        Alert.alert(
            translations.resetConfirmTitle,
            translations.resetConfirmMessage,
            [
                {
                    text: translations.cancelButton,
                    style: "cancel",
                },
                {
                    text: translations.confirmResetButton,
                    style: "destructive",
                    onPress: () => {
                        resetDatabase();
                        // Reload settings
                        setName(getSetting("name"));
                        setTheme(
                            getSetting("theme", "light") as "light" | "dark"
                        );
                        setLanguage(
                            getSetting("language", "en") as SupportedLanguage
                        );
                        setProfilePic(null);
                        Alert.alert(
                            translations.resetSuccessTitle,
                            translations.resetSuccessMessage
                        );
                    },
                },
            ]
        );
    }

    return (
        <GradientBackground>
            <ScrollView style={styles.container}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.profileIconContainer}
                        onPress={handleProfilePicPress}
                    >
                        {profilePic ? (
                            <Image
                                source={{ uri: profilePic }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <Ionicons
                                name="person-circle"
                                size={100}
                                color="#166b60"
                            />
                        )}
                    </Pressable>

                    {isEditingName ? (
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            onBlur={handleNameSave}
                            autoFocus
                            autoCapitalize="words"
                        />
                    ) : (
                        <Text style={styles.userName}>{name}</Text>
                    )}

                    <Pressable
                        style={styles.editButton}
                        onPress={() => setIsEditingName(true)}
                    >
                        <Ionicons name="pencil" size={20} color="#166b60" />
                    </Pressable>
                </View>

                {/* Settings Section */}
                <View style={styles.settingsContainer}>
                    <Text style={styles.sectionTitle}>
                        {translations.profileSettingsTitle}
                    </Text>

                    {/* Theme Setting */}
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>
                            {translations.themeLabel}
                        </Text>
                        <View style={styles.optionsRow}>
                            <Pressable
                                style={[
                                    styles.optionButton,
                                    theme === "light" &&
                                        styles.optionButtonActive,
                                ]}
                                onPress={() => handleThemeChange("light")}
                            >
                                <Ionicons
                                    name="sunny"
                                    size={20}
                                    color={
                                        theme === "light" ? "#fff" : "#166b60"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.optionText,
                                        theme === "light" &&
                                            styles.optionTextActive,
                                    ]}
                                >
                                    {translations.lightOption}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.optionButton,
                                    theme === "dark" &&
                                        styles.optionButtonActive,
                                ]}
                                onPress={() => handleThemeChange("dark")}
                            >
                                <Ionicons
                                    name="moon"
                                    size={20}
                                    color={
                                        theme === "dark" ? "#fff" : "#166b60"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.optionText,
                                        theme === "dark" &&
                                            styles.optionTextActive,
                                    ]}
                                >
                                    {translations.darkOption}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Language Setting */}
                    <View style={styles.settingItem}>
                        <Text style={styles.settingLabel}>
                            {translations.languageLabel}
                        </Text>
                        <View style={styles.optionsRow}>
                            <Pressable
                                style={[
                                    styles.optionButton,
                                    language === "en" &&
                                        styles.optionButtonActive,
                                ]}
                                onPress={() => handleLanguageChange("en")}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        language === "en" &&
                                            styles.optionTextActive,
                                    ]}
                                >
                                    {translations.englishOption}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.optionButton,
                                    language === "zh" &&
                                        styles.optionButtonActive,
                                ]}
                                onPress={() => handleLanguageChange("zh")}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        language === "zh" &&
                                            styles.optionTextActive,
                                    ]}
                                >
                                    {translations.chineseOption}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Reset Database Button */}
                    <View style={styles.settingItem}>
                        <Pressable
                            style={styles.resetButton}
                            onPress={handleResetDatabase}
                        >
                            <Ionicons name="trash" size={20} color="#fff" />
                            <Text style={styles.resetButtonText}>
                                {translations.resetButton}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 30,
        paddingHorizontal: 20,
        gap: 15,
    },
    profileIconContainer: {
        flexShrink: 0,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#166b60",
    },
    userName: {
        flex: 1,
        fontSize: 24,
        fontWeight: "bold",
        color: "#166b60",
    },
    nameInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: "bold",
        color: "#166b60",
        borderBottomWidth: 2,
        borderBottomColor: "#166b60",
        paddingVertical: 5,
    },
    editButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#166b60",
    },
    settingsContainer: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#166b60",
        marginBottom: 15,
    },
    settingItem: {
        marginBottom: 30,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 10,
    },
    optionsRow: {
        flexDirection: "row",
        gap: 10,
    },
    optionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#166b60",
    },
    optionButtonActive: {
        backgroundColor: "#166b60",
    },
    optionText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#166b60",
    },
    optionTextActive: {
        color: "#fff",
    },
    resetButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: "#d32f2f",
        marginTop: 10,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});

import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { initDb } from "@/utils/database";

const tab_icon_size = 26;

export default function RootLayout() {
    // Initialize database on app start
    useEffect(() => {
        try {
            initDb();
            console.log("Database initialized");
        } catch (error) {
            console.error("Failed to initialize database:", error);
        }
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}

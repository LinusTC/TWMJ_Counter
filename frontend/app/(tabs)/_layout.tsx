import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const tab_icon_size = 26;

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    position: "absolute",
                    backgroundColor: "#166b60",
                    borderRadius: 25,
                    marginHorizontal: 20,
                    marginBottom: 30,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                },
                tabBarActiveTintColor: "#ffffff",
                tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="play/index"
                options={{
                    title: "Play",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="play-circle"
                            size={tab_icon_size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="templates/index"
                options={{
                    title: "Templates",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="albums"
                            size={tab_icon_size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="camera/index"
                options={{
                    title: "Camera",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="camera"
                            size={tab_icon_size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="saves/index"
                options={{
                    title: "Saves",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="bookmark"
                            size={tab_icon_size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile/index"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="person-circle"
                            size={tab_icon_size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

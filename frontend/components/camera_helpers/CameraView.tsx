import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { CameraView as ExpoCamera } from "expo-camera";
import { RefObject } from "react";

interface CameraViewComponentProps {
    hasPermission: boolean | undefined;
    capturedImage: string | null;
    cameraRef: RefObject<ExpoCamera | null>;
    onRequestPermission: () => void;
}

export default function CameraViewComponent({
    hasPermission,
    capturedImage,
    cameraRef,
    onRequestPermission,
}: CameraViewComponentProps) {
    return (
        <View style={styles.cameraWrapper}>
            {hasPermission ? (
                capturedImage ? (
                    <Image
                        source={{ uri: capturedImage }}
                        style={StyleSheet.absoluteFill}
                    />
                ) : (
                    <ExpoCamera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing="back"
                    />
                )
            ) : (
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        Camera access is required to capture tiles.
                    </Text>
                    <Pressable
                        style={styles.permissionButton}
                        onPress={onRequestPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            Grant Access
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cameraWrapper: {
        flex: 0.5,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#000",
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    permissionText: {
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
        marginBottom: 12,
    },
    permissionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#166b60",
    },
    permissionButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
});

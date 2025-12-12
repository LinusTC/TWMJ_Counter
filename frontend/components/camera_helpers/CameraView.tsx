import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView as ExpoCamera } from "expo-camera";
import { RefObject, useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

interface CameraViewComponentProps {
    hasPermission: boolean | undefined;
    capturedImage: string | null;
    cameraRef: RefObject<ExpoCamera | null>;
    onRequestPermission: () => void;
    imageRotation?: number;
    onRotate?: () => void;
}

export default function CameraViewComponent({
    hasPermission,
    capturedImage,
    cameraRef,
    onRequestPermission,
    imageRotation = 0,
    onRotate,
}: CameraViewComponentProps) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const panStartX = useSharedValue(0);
    const panStartY = useSharedValue(0);

    useEffect(() => {
        scale.value = 1;
        savedScale.value = 1;
        translationX.value = 0;
        translationY.value = 0;
    }, [capturedImage, scale, savedScale, translationX, translationY]);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            const nextScale = Math.min(
                Math.max(savedScale.value * event.scale, 1),
                4
            );
            scale.value = nextScale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value <= 1) {
                translationX.value = withTiming(0);
                translationY.value = withTiming(0);
            }
        });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            panStartX.value = translationX.value;
            panStartY.value = translationY.value;
        })
        .onUpdate((event) => {
            if (scale.value <= 1) {
                translationX.value = 0;
                translationY.value = 0;
                return;
            }
            translationX.value = panStartX.value + event.translationX;
            translationY.value = panStartY.value + event.translationY;
        })
        .onEnd(() => {
            if (scale.value <= 1.01) {
                translationX.value = withTiming(0);
                translationY.value = withTiming(0);
            }
        });

    const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(
        () => ({
            transform: [
                { translateX: translationX.value },
                { translateY: translationY.value },
                { scale: scale.value },
                { rotate: `${imageRotation}deg` },
            ],
        }),
        [imageRotation]
    );
    return (
        <View style={styles.cameraWrapper}>
            {hasPermission ? (
                capturedImage ? (
                    <>
                        <GestureDetector gesture={combinedGesture}>
                            <Animated.Image
                                source={{ uri: capturedImage }}
                                style={[StyleSheet.absoluteFill, animatedStyle]}
                                resizeMode="contain"
                            />
                        </GestureDetector>
                        {capturedImage && onRotate && (
                            <Pressable
                                style={styles.rotateButton}
                                onPress={onRotate}
                            >
                                <Text style={styles.rotateButtonText}>↻</Text>
                            </Pressable>
                        )}
                    </>
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
    rotateButton: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(22, 107, 96, 0.9)",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    rotateButtonText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "600",
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

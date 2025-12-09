import { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ActivityIndicator,
} from "react-native";
import {
    CameraView,
    useCameraPermissions,
    BarcodeScanningResult,
} from "expo-camera";
import { fetchRemoteTemplate } from "@/utils/api_helper";
import { TemplateTransferRecord } from "@/types/api";

interface TemplateImportModalProps {
    visible: boolean;
    onClose: () => void;
    onTemplateFetched: (record: TemplateTransferRecord) => Promise<void> | void;
}

function extractUuid(value: string) {
    if (!value) {
        return "";
    }
    const trimmed = value.trim();
    const uuidMatch = trimmed.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    );
    if (uuidMatch) {
        return uuidMatch[0];
    }
    const lastPathSegment = trimmed.split("/").filter(Boolean).pop();
    return lastPathSegment ?? trimmed;
}

export default function TemplateImportModal({
    visible,
    onClose,
    onTemplateFetched,
}: TemplateImportModalProps) {
    const [enteredCode, setEnteredCode] = useState("");
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    useEffect(() => {
        if (!visible) {
            setEnteredCode("");
            setStatusMessage(null);
            setIsLoading(false);
        }
    }, [visible]);

    async function handleFetch(rawCode: string) {
        const uuid = extractUuid(rawCode);
        if (!uuid) {
            setStatusMessage("Enter a valid code or scan a QR.");
            return;
        }

        setStatusMessage(null);
        setIsLoading(true);
        try {
            const { data } = await fetchRemoteTemplate(uuid);
            await onTemplateFetched(data);
            setStatusMessage("Template imported successfully!");
            setEnteredCode("");
            setTimeout(onClose, 600);
        } catch (error: any) {
            const detail =
                error?.response?.data?.detail ?? "Could not retrieve template.";
            setStatusMessage(detail);
        } finally {
            setIsLoading(false);
        }
    }

    function handleBarCodeScanned(result: BarcodeScanningResult) {
        if (result?.data && !isLoading) {
            handleFetch(result.data);
        }
    }

    const permissionStatus =
        permission?.canAskAgain === false && !permission?.granted;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Import Template</Text>
                    <Text style={styles.subtitle}>
                        Scan a QR or paste a link/code shared from another
                        player.
                    </Text>

                    <Text style={styles.inputLabel}>Paste link or code</Text>
                    <TextInput
                        value={enteredCode}
                        onChangeText={setEnteredCode}
                        placeholder="https://... or UUID"
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {statusMessage && (
                        <Text style={styles.statusMessage}>
                            {statusMessage}
                        </Text>
                    )}

                    <View style={styles.actionsRow}>
                        <Pressable
                            style={[styles.actionButton, styles.submitButton]}
                            onPress={() => handleFetch(enteredCode)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>Import</Text>
                            )}
                        </Pressable>
                        <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>Close</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.scannerLabel}>Or scan a QR code</Text>

                    {permission?.granted ? (
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                            onBarcodeScanned={handleBarCodeScanned}
                        />
                    ) : (
                        <View style={styles.permissionBanner}>
                            <Text style={styles.permissionText}>
                                {permissionStatus
                                    ? "Camera access denied. Enable it in settings to scan QR codes."
                                    : "Grant camera access to scan QR codes."}
                            </Text>
                            {!permissionStatus && (
                                <Pressable
                                    style={styles.permissionButton}
                                    onPress={requestPermission}
                                >
                                    <Text style={styles.permissionButtonText}>
                                        Allow Camera
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(10, 32, 27, 0.85)",
        padding: 20,
        justifyContent: "center",
    },
    card: {
        backgroundColor: "#fdfbf7",
        borderRadius: 28,
        padding: 24,
        gap: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#114137",
    },
    subtitle: {
        fontSize: 14,
        color: "#5a716b",
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 13,
        color: "#4c5c58",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: "rgba(17, 65, 55, 0.2)",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: "#10372d",
    },
    statusMessage: {
        fontSize: 13,
        color: "#b0413e",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    submitButton: {
        backgroundColor: "#166b60",
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#166b60",
    },
    cancelText: {
        color: "#166b60",
        fontSize: 16,
        fontWeight: "600",
    },
    scannerLabel: {
        fontSize: 13,
        color: "#4c5c58",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 10,
    },
    camera: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 20,
        overflow: "hidden",
    },
    permissionBanner: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: "rgba(176, 65, 62, 0.08)",
        gap: 10,
    },
    permissionText: {
        color: "#7a2d2b",
    },
    permissionButton: {
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "#166b60",
    },
    permissionButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
});

import { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, StyleSheet, Pressable, Share } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface TemplateExportModalProps {
    visible: boolean;
    templateName: string;
    link: string;
    uuid: string;
    expiresAt: string;
    onClose: () => void;
}

function formatTimeLeft(targetDate: Date | null) {
    if (!targetDate) {
        return "--";
    }
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) {
        return "Expired";
    }
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

export default function TemplateExportModal({
    visible,
    templateName,
    link,
    uuid,
    expiresAt,
    onClose,
}: TemplateExportModalProps) {
    const expirationDate = useMemo(() => {
        try {
            return new Date(expiresAt);
        } catch (error) {
            return null;
        }
    }, [expiresAt]);

    const [timeLeft, setTimeLeft] = useState(formatTimeLeft(expirationDate));

    useEffect(() => {
        if (!visible) {
            return;
        }
        setTimeLeft(formatTimeLeft(expirationDate));
        const timer = setInterval(() => {
            setTimeLeft(formatTimeLeft(expirationDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [visible, expirationDate]);

    async function handleShare() {
        try {
            await Share.share({
                message: `${templateName} template link: ${link}`,
            });
        } catch (error) {
            // Swallow share cancellations silently
        }
    }

    if (!visible) {
        return null;
    }

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Share Template</Text>
                    <Text style={styles.templateName}>{templateName}</Text>
                    <Text style={styles.timerLabel}>
                        {timeLeft === "Expired"
                            ? "Link expired — export again to refresh"
                            : `QR expires in ${timeLeft}`}
                    </Text>
                    <View style={styles.qrWrapper}>
                        <QRCode value={link} size={220} />
                    </View>
                    <View style={styles.detailsPanel}>
                        <Text style={styles.detailLabel}>UUID</Text>
                        <Text style={styles.detailValue} selectable>
                            {uuid}
                        </Text>
                        <Text style={[styles.detailLabel, styles.linkLabel]}>
                            Import Link
                        </Text>
                        <Text style={styles.linkValue} selectable>
                            {link}
                        </Text>
                    </View>
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={styles.secondaryButton}
                            onPress={handleShare}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Share Link
                            </Text>
                        </Pressable>
                        <Pressable
                            style={styles.primaryButton}
                            onPress={onClose}
                        >
                            <Text style={styles.primaryButtonText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(3, 17, 13, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#fbf9f4",
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 24,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f3b2c",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    templateName: {
        fontSize: 28,
        fontWeight: "800",
        color: "#103f33",
        marginBottom: 6,
    },
    timerLabel: {
        fontSize: 14,
        color: "#48635b",
        marginBottom: 18,
    },
    qrWrapper: {
        alignSelf: "center",
        padding: 16,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(16, 107, 96, 0.1)",
        marginBottom: 18,
    },
    detailsPanel: {
        backgroundColor: "rgba(19, 82, 70, 0.06)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 18,
    },
    detailLabel: {
        fontSize: 12,
        color: "#48635b",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f3b2c",
        marginBottom: 8,
    },
    linkLabel: {
        marginTop: 6,
    },
    linkValue: {
        fontSize: 14,
        color: "#1c6b60",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#166b60",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#166b60",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    secondaryButtonText: {
        color: "#166b60",
        fontSize: 16,
        fontWeight: "600",
    },
});

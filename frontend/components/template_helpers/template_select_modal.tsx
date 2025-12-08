import { ScoringTemplate } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import {
    Modal,
    View,
    Pressable,
    Text,
    ScrollView,
    StyleSheet,
} from "react-native";

export type TemplateSelection = "blank" | "game-default" | number;

interface TemplateSelectorModalProps {
    visible: boolean;
    templates: ScoringTemplate[];
    onSelect: (selected_template: TemplateSelection) => void;
    onClose: () => void;
}

export default function TemplateSelectorModal({
    visible,
    templates,
    onSelect,
    onClose,
}: TemplateSelectorModalProps) {
    function handleSelect(selected_template: TemplateSelection) {
        onSelect(selected_template);
    }

    const showGameDefault = templates.length === 0;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.selectorModal}>
                    <Text style={styles.selectorTitle}>Copy from Template</Text>
                    <Text style={styles.selectorSubtitle}>
                        Select a template to copy, or start blank
                    </Text>

                    <ScrollView style={styles.selectorList}>
                        <Pressable
                            style={[styles.selectorOption, styles.blankOption]}
                            onPress={() => handleSelect("blank")}
                        >
                            <Ionicons
                                name="document-outline"
                                size={24}
                                color="#166b60"
                            />
                            <Text style={styles.selectorOptionText}>
                                Blank Template (All values = 1)
                            </Text>
                            <View style={styles.blankBadge}>
                                <Text style={styles.blankBadgeText}>Fresh</Text>
                            </View>
                        </Pressable>

                        {showGameDefault && (
                            <Pressable
                                style={[
                                    styles.selectorOption,
                                    styles.gameDefaultOption,
                                ]}
                                onPress={() => handleSelect("game-default")}
                            >
                                <Ionicons
                                    name="sparkles-outline"
                                    size={24}
                                    color="#f39c12"
                                />
                                <Text style={styles.selectorOptionText}>
                                    Game Default
                                </Text>
                                <View style={styles.gameDefaultBadge}>
                                    <Text style={styles.gameDefaultBadgeText}>
                                        Classic
                                    </Text>
                                </View>
                            </Pressable>
                        )}

                        {templates.map((template) => (
                            <Pressable
                                key={template.id}
                                style={styles.selectorOption}
                                onPress={() => handleSelect(template.id)}
                            >
                                <Ionicons
                                    name="copy-outline"
                                    size={24}
                                    color="#166b60"
                                />
                                <Text style={styles.selectorOptionText}>
                                    {template.name}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    <Pressable
                        style={styles.selectorCancelButton}
                        onPress={onClose}
                    >
                        <Text style={styles.selectorCancelText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    selectorModal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "100%",
        maxWidth: 400,
        maxHeight: "70%",
    },
    selectorTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#166b60",
        marginBottom: 8,
    },
    selectorSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    selectorList: {
        maxHeight: 300,
    },
    selectorOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        backgroundColor: "rgba(22, 107, 96, 0.08)",
        borderRadius: 12,
        marginBottom: 10,
    },
    blankOption: {
        borderWidth: 2,
        borderColor: "#166b60",
        backgroundColor: "#ffffff",
        shadowColor: "#166b60",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    selectorOptionText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#0a3d34",
        flex: 1,
    },
    gameDefaultOption: {
        borderWidth: 2,
        borderColor: "#f39c12",
        backgroundColor: "#fff9ea",
    },
    blankBadge: {
        backgroundColor: "#166b60",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    blankBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    gameDefaultBadge: {
        backgroundColor: "#f39c12",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    gameDefaultBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    selectorCancelButton: {
        marginTop: 16,
        padding: 14,
        backgroundColor: "#f0f0f0",
        borderRadius: 12,
        alignItems: "center",
    },
    selectorCancelText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
});

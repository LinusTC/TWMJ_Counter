import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "@/components/GradientBackground";
import TemplateModal from "@/components/template_helpers/template_modal";
import TemplateSelectorModal, {
    TemplateSelection,
} from "@/components/template_helpers/template_select_modal";
import {
    getAllScoringTemplates,
    getSetting,
    updateScoringTemplate,
    deleteScoringTemplate,
    setDefaultScoringTemplate,
    saveScoringTemplate,
} from "@/utils/database";
import { ScoringTemplate } from "@/types/database";
import { getLanguage, SupportedLanguage } from "@/language_constants";
import { defaultValues } from "@/constants/value_constants";

export default function Templates() {
    const [templates, setTemplates] = useState<ScoringTemplate[]>([]);
    const [language, setLanguage] = useState<SupportedLanguage>("en");
    const [selectedTemplate, setSelectedTemplate] =
        useState<ScoringTemplate | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(
        null
    );
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const translations = getLanguage(language);

    function loadTemplates() {
        const data = getAllScoringTemplates();
        setTemplates(data);
        if (data.length === 1 && !data[0].is_default) {
            setDefaultScoringTemplate(data[0].id);
            const updatedData = getAllScoringTemplates();
            setTemplates(updatedData);
        }
    }

    useEffect(() => {
        const savedLanguage = getSetting("language", "en") as SupportedLanguage;
        setLanguage(savedLanguage);
        loadTemplates();
    }, []);

    function createTemplate() {
        setShowTemplateSelector(true);
    }

    function handleTemplateSelect(selection: TemplateSelection) {
        setShowTemplateSelector(false);

        Alert.prompt(
            "New Template",
            "Enter template name:",
            (templateName) => {
                if (!templateName || !templateName.trim()) {
                    return;
                }

                let new_rules: Record<string, number>;
                let new_enabled_rules: Record<string, boolean>;

                if (selection === "blank") {
                    const valueConstants =
                        require("@/constants/value_constants").valueConstants;
                    new_rules = valueConstants.reduce(
                        (acc: Record<string, number>, constant: any) => {
                            acc[constant.key] = 1;
                            return acc;
                        },
                        {}
                    );
                    new_enabled_rules = valueConstants.reduce(
                        (acc: Record<string, boolean>, constant: any) => {
                            acc[constant.key] = true;
                            return acc;
                        },
                        {}
                    );
                } else if (selection === "game-default") {
                    new_rules = {
                        ...(defaultValues as Record<string, number>),
                    };
                    new_enabled_rules = Object.keys(new_rules).reduce(
                        (acc, key) => {
                            acc[key] = true;
                            return acc;
                        },
                        {} as Record<string, boolean>
                    );
                } else {
                    // Copy from selected template
                    const sourceTemplate = templates.find(
                        (t) => t.id === selection
                    );
                    if (!sourceTemplate) return;
                    new_rules = { ...sourceTemplate.rules };
                    new_enabled_rules = { ...sourceTemplate.rules_enabled };
                }

                // Save new template and open it in modal
                saveScoringTemplate(
                    templateName.trim(),
                    new_rules,
                    new_enabled_rules,
                    false
                );
                loadTemplates();

                // Open the newly created template in modal
                setTimeout(() => {
                    const updatedTemplates = getAllScoringTemplates();
                    const newTemplate = updatedTemplates.find(
                        (t) => t.name === templateName.trim()
                    );
                    if (newTemplate) {
                        setIsCreatingNew(true);
                        setSelectedTemplate(newTemplate);
                        setIsModalVisible(true);
                    }
                }, 100);
            },
            "plain-text"
        );
    }

    function openTemplateModal(template: ScoringTemplate) {
        setSelectedTemplate(template);
        setIsModalVisible(true);
    }

    function closeTemplateModal() {
        setIsModalVisible(false);
        setSelectedTemplate(null);
        setIsCreatingNew(false);
    }

    function handleSaveTemplate(
        name: string,
        rules: Record<string, number>,
        enabled: Record<string, boolean>
    ) {
        if (!selectedTemplate) {
            return;
        }
        updateScoringTemplate(selectedTemplate.id, name, rules, enabled);
        loadTemplates();
        setIsModalVisible(false);
        setIsCreatingNew(false);
    }

    function formatDate(dateString: string) {
        const parsed = new Date(dateString);
        if (Number.isNaN(parsed.getTime())) {
            return dateString;
        }
        return parsed.toLocaleDateString();
    }

    function toggleExpand(templateId: number, event: any) {
        event.stopPropagation();
        setExpandedTemplateId(
            expandedTemplateId === templateId ? null : templateId
        );
    }

    function handleDelete(template: ScoringTemplate, event: any) {
        //Button sits on open template, so stop propagation stop sit from opening template
        event.stopPropagation();

        Alert.alert(
            "Delete Template",
            `Are you sure you want to delete "${template.name}"?`,
            [
                { text: "Cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteScoringTemplate(template.id);
                        setExpandedTemplateId(null);
                        loadTemplates();
                    },
                },
            ]
        );
    }

    function handleRename(template: ScoringTemplate, event: any) {
        //Button sits on open template, so stop propagation stop sit from opening template
        event.stopPropagation();

        Alert.prompt(
            "Rename Template",
            "Enter new name:",
            (newName) => {
                if (newName && newName.trim()) {
                    updateScoringTemplate(
                        template.id,
                        newName.trim(),
                        template.rules,
                        template.rules_enabled
                    );
                    loadTemplates();
                }
            },
            "plain-text",
            template.name
        );
    }

    function handleSetDefault(template: ScoringTemplate, event: any) {
        //Button sits on open template, so stop propagation stop sit from opening template
        event.stopPropagation();

        setDefaultScoringTemplate(template.id);
        setExpandedTemplateId(null);
        loadTemplates();
    }

    const orderedTemplates = useMemo(() => {
        return [...templates].sort((a, b) => {
            if (a.is_default === b.is_default) {
                return 0;
            }
            return a.is_default ? -1 : 1;
        });
    }, [templates]);

    return (
        <GradientBackground>
            <View style={styles.container}>
                <Text style={styles.pageTitle}>
                    {translations.tabs_templates}
                </Text>
                <Pressable style={styles.createCard} onPress={createTemplate}>
                    <View style={styles.createIcon}>
                        <Ionicons name="add" size={24} color="#166b60" />
                    </View>
                    <View style={styles.createCardTextContainer}>
                        <Text style={styles.createCardTitle}>
                            Create Template
                        </Text>
                    </View>
                </Pressable>
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {templates.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No templates yet. Tap "Create Template" to get
                            started.
                        </Text>
                    ) : (
                        orderedTemplates.map((template) => {
                            const isExpanded =
                                expandedTemplateId === template.id;
                            return (
                                <Pressable
                                    key={template.id}
                                    style={[
                                        styles.templateCard,
                                        template.is_default &&
                                            styles.defaultCard,
                                    ]}
                                    onPress={() => openTemplateModal(template)}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardHeaderLeft}>
                                            <Text style={styles.templateName}>
                                                {template.name}
                                            </Text>
                                            <Text style={styles.templateDate}>
                                                {formatDate(
                                                    template.created_at
                                                )}
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={(e) =>
                                                toggleExpand(template.id, e)
                                            }
                                            hitSlop={12}
                                            style={styles.editButton}
                                        >
                                            <Ionicons
                                                name={
                                                    isExpanded
                                                        ? "chevron-up"
                                                        : "ellipsis-horizontal"
                                                }
                                                size={20}
                                                color="#166b60"
                                            />
                                        </Pressable>
                                    </View>
                                    {template.is_default && (
                                        <Text style={styles.defaultBadge}>
                                            Default
                                        </Text>
                                    )}
                                    {isExpanded && (
                                        <View style={styles.actionButtons}>
                                            <Pressable
                                                style={styles.actionButton}
                                                onPress={(e) =>
                                                    handleRename(template, e)
                                                }
                                            >
                                                <Ionicons
                                                    name="pencil"
                                                    size={18}
                                                    color="#166b60"
                                                />
                                                <Text
                                                    style={
                                                        styles.actionButtonText
                                                    }
                                                >
                                                    Rename
                                                </Text>
                                            </Pressable>
                                            <Pressable
                                                style={styles.actionButton}
                                                onPress={(e) =>
                                                    handleSetDefault(
                                                        template,
                                                        e
                                                    )
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.actionButtonText
                                                    }
                                                >
                                                    Set Default
                                                </Text>
                                            </Pressable>
                                            <Pressable
                                                style={[
                                                    styles.actionButton,
                                                    styles.deleteActionButton,
                                                ]}
                                                onPress={(e) =>
                                                    handleDelete(template, e)
                                                }
                                            >
                                                <Ionicons
                                                    name="trash"
                                                    size={18}
                                                    color="#d9534f"
                                                />
                                                <Text
                                                    style={[
                                                        styles.actionButtonText,
                                                        styles.deleteActionText,
                                                    ]}
                                                >
                                                    Delete
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })
                    )}
                </ScrollView>
            </View>

            <TemplateSelectorModal
                visible={showTemplateSelector}
                templates={templates}
                onSelect={handleTemplateSelect}
                onClose={() => setShowTemplateSelector(false)}
            />

            <TemplateModal
                visible={isModalVisible}
                template={selectedTemplate}
                onClose={closeTemplateModal}
                onSave={handleSaveTemplate}
            />
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
    createCardSubtitle: {
        fontSize: 14,
        color: "#456761",
        marginTop: 4,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 140,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: "#444",
    },
    templateCard: {
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    defaultCard: {
        borderWidth: 2,
        borderColor: "#166b60",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flex: 1,
        gap: 4,
    },
    templateName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0a3d34",
    },
    templateDate: {
        fontSize: 14,
        color: "#666",
    },
    editButton: {
        padding: 4,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.08)",
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "rgba(22, 107, 96, 0.1)",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    deleteActionButton: {
        backgroundColor: "rgba(217, 83, 79, 0.1)",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#166b60",
    },
    deleteActionText: {
        color: "#d9534f",
    },
    defaultBadge: {
        alignSelf: "flex-start",
        fontSize: 12,
        fontWeight: "600",
        color: "#166b60",
        backgroundColor: "rgba(22, 107, 96, 0.15)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        textTransform: "uppercase",
    },
});

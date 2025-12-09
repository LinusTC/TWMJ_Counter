import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "@/components/GradientBackground";
import TemplateModal from "@/components/template_helpers/template_modal";
import TemplateSelectorModal, {
    TemplateSelection,
} from "@/components/template_helpers/template_select_modal";
import TemplateExportModal from "@/components/template_helpers/template_export_modal";
import TemplateImportModal from "@/components/template_helpers/template_import_modal";
import {
    getAllScoringTemplates,
    getSetting,
    updateScoringTemplate,
    deleteScoringTemplate,
    setDefaultScoringTemplate,
    saveScoringTemplate,
} from "@/utils/database";
import {
    API_BASE_URL,
    exportTemplate as exportTemplateRequest,
} from "@/utils/api_helper";
import { TemplateTransferRecord } from "@/types/api";
import { ScoringTemplate } from "@/types/database";
import { getLanguage, SupportedLanguage } from "@/language_constants";
import { defaultValues } from "@/constants/value_constants";
import { get_uuid } from "@/utils/uuid_helper";

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
    const [exportContext, setExportContext] = useState<{
        uuid: string;
        link: string;
        expires_at: string;
        templateName: string;
    } | null>(null);
    const [exportingTemplateId, setExportingTemplateId] = useState<
        number | null
    >(null);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
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

    function deleteTemplate(template: ScoringTemplate, event: any) {
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

    function renameTemplate(template: ScoringTemplate, event: any) {
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

    function templateNameExists(name: string) {
        const normalized = name.trim().toLowerCase();
        return templates.some(
            (template) => template.name.trim().toLowerCase() === normalized
        );
    }

    function normalizeEnabledFlags(
        rules: Record<string, number>,
        enabled?: Record<string, boolean>
    ) {
        if (enabled && Object.keys(enabled).length > 0) {
            return enabled;
        }
        return Object.keys(rules).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {} as Record<string, boolean>);
    }

    async function handleExportTemplate(template: ScoringTemplate, event: any) {
        event.stopPropagation();
        if (exportingTemplateId === template.id) {
            return;
        }
        const uuidValue = String(get_uuid());
        setExportingTemplateId(template.id);
        try {
            const response = await exportTemplateRequest({
                uuid: uuidValue,
                name: template.name,
                rules: template.rules,
                rules_enabled: template.rules_enabled,
            });
            const data = response.data;
            const link = `${API_BASE_URL}/templates/import/${data.uuid}`;
            setExportContext({
                uuid: data.uuid,
                link,
                expires_at: data.expires_at,
                templateName: template.name,
            });
            setExpandedTemplateId(null);
        } catch (error: any) {
            const detail =
                error?.response?.data?.detail ??
                "Failed to export template. Please try again.";
            Alert.alert("Export failed", detail);
        } finally {
            setExportingTemplateId(null);
        }
    }

    async function handleTemplateImported(record: TemplateTransferRecord) {
        const templateData = record.template;
        const normalizedEnabled = normalizeEnabledFlags(
            templateData.rules,
            templateData.rules_enabled
        );
        const baseName = templateData.name.trim() || "Imported Template";

        function persistTemplate(templateName: string) {
            saveScoringTemplate(
                templateName,
                templateData.rules,
                normalizedEnabled,
                false
            );
            loadTemplates();
            Alert.alert("Template imported", `Saved as "${templateName}"`);
        }

        function promptForRename(defaultName: string) {
            Alert.prompt(
                "Name already exists",
                "Another template already uses this name. Enter a different name to continue.",
                (newName) => {
                    const sanitized = newName?.trim();
                    if (!sanitized) {
                        Alert.alert(
                            "Name required",
                            "Please enter a template name.",
                            [
                                {
                                    text: "Retry",
                                    onPress: () => promptForRename(defaultName),
                                },
                                { text: "Cancel" },
                            ]
                        );
                        return;
                    }

                    if (templateNameExists(sanitized)) {
                        Alert.alert(
                            "Name already exists",
                            "Choose a different template name.",
                            [
                                {
                                    text: "Retry",
                                    onPress: () => promptForRename(sanitized),
                                },
                                { text: "Cancel" },
                            ]
                        );
                        return;
                    }

                    persistTemplate(sanitized);
                },
                "plain-text",
                defaultName
            );
        }

        if (templateNameExists(baseName)) {
            promptForRename(`${baseName} (copy)`);
        } else {
            persistTemplate(baseName);
        }
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
                <Pressable
                    style={styles.importCard}
                    onPress={() => setIsImportModalVisible(true)}
                >
                    <View style={styles.importIcon}>
                        <Ionicons
                            name="download-outline"
                            size={22}
                            color="#fff"
                        />
                    </View>
                    <View style={styles.importTextBlock}>
                        <Text style={styles.importTitle}>Import Template</Text>
                        <Text style={styles.importSubtitle}>
                            Scan a QR or paste a code to copy shared rules.
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
                                            <View style={styles.header}>
                                                <Text
                                                    style={styles.templateName}
                                                >
                                                    {template.name}
                                                </Text>
                                                <Pressable
                                                    style={styles.editButton}
                                                    onPress={(e) =>
                                                        renameTemplate(
                                                            template,
                                                            e
                                                        )
                                                    }
                                                >
                                                    <Ionicons
                                                        name="pencil"
                                                        size={20}
                                                        color="#166b60"
                                                    />
                                                </Pressable>
                                            </View>
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
                                                    styles.exportActionButton,
                                                ]}
                                                onPress={(e) =>
                                                    handleExportTemplate(
                                                        template,
                                                        e
                                                    )
                                                }
                                                disabled={
                                                    exportingTemplateId ===
                                                    template.id
                                                }
                                            >
                                                {exportingTemplateId ===
                                                template.id ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#166b60"
                                                    />
                                                ) : (
                                                    <Text
                                                        style={
                                                            styles.actionButtonText
                                                        }
                                                    >
                                                        Export
                                                    </Text>
                                                )}
                                            </Pressable>
                                            <Pressable
                                                style={[
                                                    styles.actionButton,
                                                    styles.deleteActionButton,
                                                ]}
                                                onPress={(e) =>
                                                    deleteTemplate(template, e)
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

            <TemplateImportModal
                visible={isImportModalVisible}
                onClose={() => setIsImportModalVisible(false)}
                onTemplateFetched={handleTemplateImported}
            />

            <TemplateExportModal
                visible={!!exportContext}
                templateName={exportContext?.templateName ?? ""}
                uuid={exportContext?.uuid ?? ""}
                link={exportContext?.link ?? ""}
                expiresAt={
                    exportContext?.expires_at ?? new Date().toISOString()
                }
                onClose={() => setExportContext(null)}
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
    importCard: {
        width: "100%",
        borderRadius: 14,
        backgroundColor: "#0f3f33",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 18,
        shadowColor: "#0a1c18",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    importIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    importTextBlock: {
        flex: 1,
        gap: 4,
        flexShrink: 1,
    },
    importTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#f2fbf8",
    },
    importSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.88)",
        flexWrap: "wrap",
        lineHeight: 18,
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
    header: {
        flexDirection: "row",
        alignItems: "center",
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
    exportActionButton: {
        backgroundColor: "rgba(1, 158, 255, 0.12)",
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

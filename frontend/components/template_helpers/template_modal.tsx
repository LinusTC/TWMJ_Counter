import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScoringTemplate } from "@/types/database";
import { valueConstants } from "@/constants/value_constants";

interface TemplateModalProps {
    visible: boolean;
    template: ScoringTemplate | null;
    onClose: () => void;
    onSave: (
        name: string,
        rules: Record<string, number>,
        enabled: Record<string, boolean>
    ) => void;
}

export default function TemplateModal({
    visible,
    template,
    onClose,
    onSave,
}: TemplateModalProps) {
    const isVisible = visible && !!template;
    const baseConstants = useMemo(
        () =>
            valueConstants.filter(
                (c) => c.key === "base_value" || c.key === "multiplier_value"
            ),
        []
    );
    const sortedConstants = useMemo(
        () =>
            [...valueConstants]
                .filter(
                    (c) =>
                        c.key !== "base_value" && c.key !== "multiplier_value"
                )
                .sort((a, b) => a.label.localeCompare(b.label)),
        []
    );

    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [enabledValues, setEnabledValues] = useState<Record<string, boolean>>(
        {}
    );
    const [templateName, setTemplateName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredConstants = useMemo(
        () =>
            sortedConstants.filter((c) =>
                c.label.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [sortedConstants, searchQuery]
    );

    useEffect(() => {
        if (!template) {
            setFormValues({});
            setEnabledValues({});
            setTemplateName("");
            setSearchQuery("");
            return;
        }
        setTemplateName(template.name);
        const initial_values = valueConstants.reduce((results, constant) => {
            const templateValue = template.rules?.[constant.key];
            results[constant.key as string] = String(
                templateValue ?? constant.defaultValue
            );
            return results;
        }, {} as Record<string, string>);

        const initial_enables = valueConstants.reduce((results, constant) => {
            const key = constant.key as string;
            results[key] = template.rules_enabled?.[constant.key] ?? true;
            return results;
        }, {} as Record<string, boolean>);

        setFormValues(initial_values);
        setEnabledValues(initial_enables);
    }, [template]);

    function handleValueChange(key: string, value: string) {
        const normalized = value.replace(/[^0-9.-]/g, "");
        setFormValues((prev) => ({
            ...prev,
            [key]: normalized,
        }));
    }

    function handleToggleEnabled(key: string, value: boolean) {
        setEnabledValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function handleSave() {
        if (!template) {
            return;
        }
        const normalized = Object.entries(formValues).reduce(
            (results, [key, value]) => {
                const parsed = Number(value);
                results[key] = Number.isNaN(parsed) ? 0 : parsed;
                return results;
            },
            {} as Record<string, number>
        );
        onSave(templateName.trim() || template.name, normalized, enabledValues);
    }

    function handleSyncNewValues() {
        if (!template) {
            return;
        }

        // Find keys in valueConstants that are missing from current template
        const missingKeys = valueConstants.filter(
            (constant) => !(constant.key in formValues)
        );

        if (missingKeys.length === 0) {
            alert("Template is already up to date with all available values.");
            return;
        }

        // Add missing keys with their default values
        const newFormValues = { ...formValues };
        const newEnabledValues = { ...enabledValues };

        missingKeys.forEach((constant) => {
            newFormValues[constant.key] = String(constant.defaultValue);
            newEnabledValues[constant.key] = true;
        });

        setFormValues(newFormValues);
        setEnabledValues(newEnabledValues);

        alert(
            `Added ${missingKeys.length} new value(s) to template. Don't forget to save!`
        );
    }

    if (!isVisible) {
        return null;
    }

    return (
        <Modal
            visible
            animationType="none"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <Text style={styles.modalTitle}>{templateName}</Text>
                    <Pressable onPress={onClose} hitSlop={8}>
                        <Ionicons name="close" size={28} color="#1f1f1f" />
                    </Pressable>
                </View>
                <ScrollView
                    style={styles.modalList}
                    contentContainerStyle={styles.modalListContent}
                    showsVerticalScrollIndicator={false}
                >
                    {baseConstants.map((constant) => {
                        const key = constant.key as string;
                        const value = formValues[key] ?? "";
                        return (
                            <View key={constant.key} style={styles.valueRow}>
                                <Text style={styles.valueLabel}>
                                    {constant.label}
                                </Text>
                                <TextInput
                                    style={styles.valueInput}
                                    keyboardType="numeric"
                                    value={value}
                                    onChangeText={(text) =>
                                        handleValueChange(key, text)
                                    }
                                    placeholder="0"
                                />
                            </View>
                        );
                    })}
                    {baseConstants.length > 0 && (
                        <View style={styles.divider} />
                    )}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search rules..."
                            placeholderTextColor="#999"
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery("")}>
                                <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color="#999"
                                />
                            </Pressable>
                        )}
                    </View>
                    {filteredConstants.map((constant) => {
                        const key = constant.key as string;
                        const value = formValues[key] ?? "";
                        const enabled = enabledValues[key] ?? true;
                        return (
                            <View key={constant.key} style={styles.valueRow}>
                                <View style={styles.valueLeft}>
                                    <Switch
                                        value={enabled}
                                        onValueChange={(val) =>
                                            handleToggleEnabled(key, val)
                                        }
                                        trackColor={{ true: "#019eff" }}
                                        ios_backgroundColor="#d1d5db"
                                    />
                                    <Text
                                        style={[
                                            styles.valueLabel,
                                            !enabled && styles.disabledLabel,
                                        ]}
                                    >
                                        {constant.label}
                                    </Text>
                                </View>
                                <TextInput
                                    style={[
                                        styles.valueInput,
                                        !enabled && styles.disabledInput,
                                    ]}
                                    keyboardType="numeric"
                                    value={value}
                                    onChangeText={(text) =>
                                        handleValueChange(key, text)
                                    }
                                    placeholder="0"
                                    editable={enabled}
                                />
                            </View>
                        );
                    })}
                </ScrollView>
                <View style={styles.buttonRow}>
                    <Pressable
                        style={styles.syncButton}
                        onPress={handleSyncNewValues}
                    >
                        <Ionicons name="sync" size={18} color="#166b60" />
                        <Text style={styles.syncButtonText}>
                            Get latest rules
                        </Text>
                    </Pressable>
                    <Pressable style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 8,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#166b60",
    },
    titleInput: {
        fontSize: 28,
        fontWeight: "700",
        color: "#166b60",
        borderBottomWidth: 2,
        borderBottomColor: "#166b60",
        paddingBottom: 2,
        flex: 1,
    },
    editNameButton: {
        padding: 4,
    },
    deleteButton: {
        padding: 4,
    },
    modalList: {
        flex: 1,
    },
    modalListContent: {
        paddingBottom: 40,
    },
    valueRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.08)",
    },
    valueLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    valueLabel: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        textTransform: "capitalize",
    },
    disabledLabel: {
        color: "#aaa",
    },
    valueInput: {
        width: 80,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        fontSize: 16,
        fontWeight: "600",
        color: "#166b60",
        textAlign: "right",
        marginLeft: 16,
    },
    disabledInput: {
        backgroundColor: "#f5f5f5",
        color: "#aaa",
    },
    divider: {
        height: 1,
        backgroundColor: "#166b60",
        marginVertical: 16,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#1f1f1f",
    },
    buttonRow: {
        marginTop: 12,
        flexDirection: "row",
        gap: 12,
    },
    syncButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#166b60",
        borderRadius: 12,
        paddingVertical: 16,
    },
    syncButtonText: {
        color: "#166b60",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#166b60",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

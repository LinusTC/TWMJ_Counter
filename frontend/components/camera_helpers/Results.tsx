import { View, Text, StyleSheet } from "react-native";
import { base_results } from "@/types/counter";

interface ResultsProps {
    countingResults: base_results | null;
}

export default function Results({ countingResults }: ResultsProps) {
    return (
        <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Results</Text>
            {countingResults ? (
                <View style={styles.resultsContent}>
                    <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Total Value:</Text>
                        <Text style={styles.resultValue}>
                            <Text style={styles.formulaBreakdown}>
                                ({countingResults.calculated_points} ×{" "}
                                {countingResults.multiplier}) +{" "}
                                {countingResults.base_value} ={" "}
                            </Text>
                            {countingResults.value}
                        </Text>
                    </View>
                    <Text style={styles.formulaText}>
                        (Base Points × Multiplier) + Base Value
                    </Text>
                    {countingResults.log && countingResults.log.length > 0 && (
                        <View style={styles.logsContainer}>
                            <Text style={styles.logsTitle}>
                                Scoring Details:
                            </Text>
                            {Array.isArray(countingResults.log) ? (
                                countingResults.log.map((log, index) => (
                                    <Text key={index} style={styles.logText}>
                                        • {log}
                                    </Text>
                                ))
                            ) : (
                                <Text style={styles.logText}>
                                    • {countingResults.log}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            ) : (
                <Text style={styles.placeholderText}>
                    Results will appear here after tiles are detected and
                    counted.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    resultsSection: {
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.08)",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0a3d34",
    },
    placeholderText: {
        fontSize: 14,
        color: "#456761",
        lineHeight: 20,
    },
    resultsContent: {
        gap: 16,
    },
    resultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#f0f8f7",
        borderRadius: 8,
    },
    resultLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0a3d34",
    },
    resultValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#166b60",
    },
    formulaBreakdown: {
        fontSize: 14,
        fontWeight: "400",
        color: "#6b8580",
    },
    formulaText: {
        fontSize: 13,
        color: "#6b8580",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: -8,
    },
    logsContainer: {
        gap: 8,
    },
    logsTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0a3d34",
        marginBottom: 4,
    },
    logText: {
        fontSize: 14,
        color: "#3f5a54",
        lineHeight: 20,
    },
});

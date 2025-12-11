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
                        <Text style={styles.resultLabel}>Total Score:</Text>
                        <Text style={styles.resultValue}>
                            {countingResults.calculated_points}
                        </Text>
                    </View>
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
                    <View style={styles.totalValueContainer}>
                        <Text style={styles.totalValueLabel}>Total Value:</Text>
                        <View style={styles.totalValueWrapper}>
                            <Text style={styles.formulaBreakdown}>
                                ({countingResults.calculated_points} ×{" "}
                                {countingResults.multiplier}) +{" "}
                                {countingResults.base_value} ={" "}
                            </Text>
                            <Text style={styles.totalValue}>
                                {countingResults.value}
                            </Text>
                        </View>
                    </View>
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
        fontSize: 20,
        fontWeight: "600",
        color: "#0a3d34",
    },
    resultValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#166b60",
    },
    totalValueContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#0d5a4f",
        borderRadius: 12,
    },
    totalValueLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 8,
        letterSpacing: 1,
    },
    totalValueWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
    },
    totalValue: {
        fontSize: 26,
        fontWeight: "900",
        color: "#ffffff",
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    formulaBreakdown: {
        fontSize: 16,
        fontWeight: "400",
        color: "#a8d5cc",
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

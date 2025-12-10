import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    Switch,
} from "react-native";
import { WIND_DICT, SEAT_DICT, WIND_LABELS } from "@/constants/dictionary";

interface GameParametersProps {
    winnerSeat: number;
    currentWind: string;
    winningTile: string;
    myselfMo: boolean;
    doorClear: boolean;
    isZhuang: boolean;
    eatZhuang: boolean;
    lumZhuang: number;
    onWinnerSeatChange: (seat: number) => void;
    onCurrentWindChange: (wind: string) => void;
    onWinningTileChange: (tile: string) => void;
    onMyselfMoChange: (value: boolean) => void;
    onDoorClearChange: (value: boolean) => void;
    onIsZhuangChange: (value: boolean) => void;
    onEatZhuangChange: (value: boolean) => void;
    onLumZhuangChange: (value: number) => void;
}

export default function GameParameters({
    winnerSeat,
    currentWind,
    winningTile,
    myselfMo,
    doorClear,
    isZhuang,
    eatZhuang,
    lumZhuang,
    onWinnerSeatChange,
    onCurrentWindChange,
    onWinningTileChange,
    onMyselfMoChange,
    onDoorClearChange,
    onIsZhuangChange,
    onEatZhuangChange,
    onLumZhuangChange,
}: GameParametersProps) {
    return (
        <View style={styles.parametersSection}>
            <Text style={styles.sectionTitle}>Game Parameters</Text>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Winner Seat:</Text>
                <View style={styles.pickerRow}>
                    {Object.keys(SEAT_DICT).map((seatKey) => {
                        const seat = Number(seatKey);
                        return (
                            <Pressable
                                key={seat}
                                style={[
                                    styles.pickerButton,
                                    winnerSeat === seat &&
                                        styles.pickerButtonActive,
                                ]}
                                onPress={() => onWinnerSeatChange(seat)}
                            >
                                <Text
                                    style={[
                                        styles.pickerButtonText,
                                        winnerSeat === seat &&
                                            styles.pickerButtonTextActive,
                                    ]}
                                >
                                    {seat}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Current Wind:</Text>
                <View style={styles.pickerRow}>
                    {Array.from(WIND_DICT).map((wind) => (
                        <Pressable
                            key={wind}
                            style={[
                                styles.pickerButton,
                                currentWind === wind &&
                                    styles.pickerButtonActive,
                            ]}
                            onPress={() => onCurrentWindChange(wind)}
                        >
                            <Text
                                style={[
                                    styles.pickerButtonText,
                                    currentWind === wind &&
                                        styles.pickerButtonTextActive,
                                ]}
                            >
                                {WIND_LABELS[wind]}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Winning Tile:</Text>
                <TextInput
                    style={styles.tileInput}
                    value={winningTile}
                    onChangeText={onWinningTileChange}
                    placeholder="Enter tile"
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Self Draw (自摸):</Text>
                <Switch
                    value={myselfMo}
                    onValueChange={onMyselfMoChange}
                    trackColor={{ true: "#166b60", false: "#d1d5db" }}
                    ios_backgroundColor="#d1d5db"
                />
            </View>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Door Clear (門清):</Text>
                <Switch
                    value={doorClear}
                    onValueChange={onDoorClearChange}
                    trackColor={{ true: "#166b60", false: "#d1d5db" }}
                    ios_backgroundColor="#d1d5db"
                />
            </View>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Is Dealer (莊家):</Text>
                <Switch
                    value={isZhuang}
                    onValueChange={(value) => {
                        onIsZhuangChange(value);
                        if (value) onEatZhuangChange(false);
                    }}
                    trackColor={{ true: "#166b60", false: "#d1d5db" }}
                    ios_backgroundColor="#d1d5db"
                />
            </View>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Eat Dealer (吃莊):</Text>
                <Switch
                    value={eatZhuang}
                    onValueChange={(value) => {
                        onEatZhuangChange(value);
                        if (value) onIsZhuangChange(false);
                    }}
                    trackColor={{ true: "#166b60", false: "#d1d5db" }}
                    ios_backgroundColor="#d1d5db"
                />
            </View>

            <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>
                    Consecutive Dealer (連莊):
                </Text>
                <View style={styles.numberWheelContainer}>
                    <Pressable
                        style={styles.numberButton}
                        onPress={() =>
                            onLumZhuangChange(Math.max(0, lumZhuang - 1))
                        }
                    >
                        <Text style={styles.numberButtonText}>−</Text>
                    </Pressable>
                    <Text style={styles.numberDisplay}>{lumZhuang}</Text>
                    <Pressable
                        style={styles.numberButton}
                        onPress={() => onLumZhuangChange(lumZhuang + 1)}
                    >
                        <Text style={styles.numberButtonText}>+</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    parametersSection: {
        gap: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.08)",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0a3d34",
    },
    paramRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    paramLabel: {
        fontSize: 15,
        fontWeight: "500",
        color: "#0a3d34",
        flex: 1,
    },
    pickerRow: {
        flexDirection: "row",
        gap: 8,
    },
    pickerButton: {
        width: 45,
        height: 45,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#166b60",
        backgroundColor: "#fff",
    },
    pickerButtonActive: {
        backgroundColor: "#166b60",
    },
    pickerButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#166b60",
    },
    pickerButtonTextActive: {
        color: "#fff",
    },
    tileInput: {
        flex: 1,
        maxWidth: 150,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 2,
        borderColor: "#166b60",
        borderRadius: 8,
        fontSize: 15,
        fontWeight: "500",
        color: "#0a3d34",
    },
    numberWheelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    numberButton: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 6,
        backgroundColor: "#166b60",
    },
    numberButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    numberDisplay: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0a3d34",
        minWidth: 30,
        textAlign: "center",
    },
});

import { ValidatedDeck, CounterResult } from "@/types/counter";
import { ZFB_DICT, WIND_DICT, MST_DICT } from "@/constants/dictionary";

export function c_step_step_high(
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    let total_value = 0;
    const log: string[] = [];
    const sequences: Record<number, string[]> = {};

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];

            if (
                tiles.length === 3 &&
                !ZFB_DICT.has(tiles[0]) &&
                !WIND_DICT.has(tiles[0])
            ) {
                const first_tile = MST_DICT[tiles[0]];
                const second_tile = MST_DICT[tiles[1]];
                const third_tile = MST_DICT[tiles[2]];

                if (
                    first_tile + 1 === second_tile &&
                    first_tile + 2 === third_tile
                ) {
                    const suit = tiles[0][0];

                    if (!sequences[first_tile]) {
                        sequences[first_tile] = [];
                    }
                    sequences[first_tile].push(suit);
                }
            }
        }
    }

    for (const start_num_str of Object.keys(sequences)) {
        const start_num = Number(start_num_str);
        if (sequences[start_num + 1] && sequences[start_num + 2]) {
            const suits_1 = sequences[start_num];
            const suits_2 = sequences[start_num + 1];
            const suits_3 = sequences[start_num + 2];

            // Check for same suit pattern
            if (template_enabled_values.same_bu_bu_gao_value) {
                for (let i = 0; i < suits_1.length; i++) {
                    const suit = suits_1[i];
                    if (suits_2.includes(suit) && suits_3.includes(suit)) {
                        const value = template_values.same_bu_bu_gao_value || 0;
                        total_value += value;
                        log.push(`清步步高${suit} +${value}`);
                        suits_1.splice(i, 1);
                        suits_2.splice(suits_2.indexOf(suit), 1);
                        suits_3.splice(suits_3.indexOf(suit), 1);
                        break;
                    }
                }
            }

            // Check for mixed suit pattern
            if (
                suits_1.length > 0 &&
                suits_2.length > 0 &&
                suits_3.length > 0 &&
                template_enabled_values.mixed_bu_bu_gao_value
            ) {
                const set1 = new Set(suits_1);
                const set2 = new Set(suits_2);
                const set3 = new Set(suits_3);

                const common_suits = new Set(
                    [...set1].filter((x) => set2.has(x) && set3.has(x))
                );
                const all_suits = new Set([...set1, ...set2, ...set3]);

                if (common_suits.size === 0 && all_suits.size === 3) {
                    const value = template_values.mixed_bu_bu_gao_value || 0;
                    total_value += value;
                    log.push(`混步步高 +${value}`);
                }
            }
        }
    }

    return {
        value: total_value,
        log: log.length > 0 ? log : null,
        counted: total_value > 0,
    };
}

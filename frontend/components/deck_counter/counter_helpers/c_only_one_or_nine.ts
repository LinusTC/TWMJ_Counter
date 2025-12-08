import { ValidatedDeck, CounterResult } from "@/types/counter";
import { ZFB_DICT, WIND_DICT } from "@/constants/dictionary";

export function c_only_one_or_nine(
    curr_validated_tiles: ValidatedDeck,
    has_fan: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    const number_set = new Set<string>();

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            for (const tile of tiles) {
                if (ZFB_DICT.has(tile) || WIND_DICT.has(tile)) {
                    continue;
                }
                number_set.add(tile[1]);
            }
        }
    }

    for (const num of number_set) {
        if (num !== "1" && num !== "9") {
            return {
                value: 0,
                log: null,
            };
        }
    }

    const value_key = has_fan
        ? "one_nine_with_fan_value"
        : "only_one_nine_value";
    if (!template_enabled_values[value_key]) {
        return { value: 0, log: null };
    }

    const value = template_values[value_key] || 0;
    const log = has_fan
        ? `全么/腰九 有番子 +${value}`
        : `全么/腰九 無番子 +${value}`;

    return {
        value,
        log,
    };
}

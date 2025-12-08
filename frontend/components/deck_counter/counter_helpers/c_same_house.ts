import { ValidatedDeck, CounterResult } from "@/types/counter";
import { ZFB_DICT, WIND_DICT } from "@/constants/dictionary";

export function c_same_house(
    curr_validated_tiles: ValidatedDeck,
    has_fan: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    const house_set = new Set<string>();

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            for (const tile of tiles) {
                if (ZFB_DICT.has(tile) || WIND_DICT.has(tile)) {
                    continue;
                }
                house_set.add(tile[0]);
            }
        }
    }

    if (house_set.size > 1) {
        return {
            value: 0,
            log: null,
        };
    }

    const value_key = has_fan
        ? "same_house_with_fan_value"
        : "all_same_house_value";
    if (!template_enabled_values[value_key]) {
        return { value: 0, log: null };
    }

    const value = template_values[value_key] || 0;
    const log = has_fan ? `混一色 +${value}` : `清一色 +${value}`;

    return {
        value,
        log,
    };
}

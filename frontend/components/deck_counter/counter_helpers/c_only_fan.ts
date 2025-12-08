import { ValidatedDeck, CounterResult } from "@/types/counter";
import { ZFB_DICT, WIND_DICT } from "@/constants/dictionary";

export function c_only_fan(
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (!template_enabled_values.only_fan_value) {
        return { value: 0, log: null };
    }

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tile_group = Array.isArray(item) ? item : [item];
            for (const tile of tile_group) {
                if (!ZFB_DICT.has(tile) && !WIND_DICT.has(tile)) {
                    return {
                        value: 0,
                        log: null,
                    };
                }
            }
        }
    }

    const only_fan_value = template_values.only_fan_value || 0;
    return {
        value: only_fan_value,
        log: `全番子 +${only_fan_value}`,
    };
}

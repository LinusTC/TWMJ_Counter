import { ValidatedDeck, CounterResult } from "@/types/counter";
import {
    MST_DICT,
    ZFB_DICT,
    WIND_DICT,
    THIRTEEN_WAIST_HU,
    FLOWER_HU,
} from "@/constants/dictionary";

export function c_break_waist(
    curr_validated_tiles: ValidatedDeck,
    has_fan: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    const hu_type = curr_validated_tiles.hu_type;
    if (hu_type === THIRTEEN_WAIST_HU || hu_type === FLOWER_HU || has_fan) {
        return {
            value: 0,
            log: null,
            counted: false,
        };
    }

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            for (const tile of tiles) {
                if (
                    MST_DICT[tile] === 1 ||
                    MST_DICT[tile] === 9 ||
                    ZFB_DICT.has(tile) ||
                    WIND_DICT.has(tile)
                ) {
                    return {
                        value: 0,
                        log: null,
                        counted: false,
                    };
                }
            }
        }
    }

    if (!template_enabled_values.break_waist_value) {
        return { value: 0, log: null, counted: false };
    }

    const break_waist_value = template_values.break_waist_value || 0;
    return {
        value: break_waist_value,
        log: `斷腰/么 +${break_waist_value}`,
        counted: true,
    };
}

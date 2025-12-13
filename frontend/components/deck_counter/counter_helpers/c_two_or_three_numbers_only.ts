import { ValidatedDeck, CounterResult } from "@/types/counter";
import { ZFB_DICT, WIND_DICT } from "@/constants/dictionary";

export function c_two_or_three_numbers_only(
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

    if (
        number_set.size === 3 &&
        has_fan &&
        template_enabled_values.three_numbers_fan_value
    ) {
        const value = template_values.three_numbers_fan_value || 0;
        return {
            value,
            log: `三数 有番子 +${value}`,
            counted: true,
        };
    }

    if (
        number_set.size === 3 &&
        !has_fan &&
        template_enabled_values.three_numbers_no_fan_value
    ) {
        const value = template_values.three_numbers_no_fan_value || 0;
        return {
            value,
            log: `三数 無番子 +${value}`,
            counted: true,
        };
    }

    if (
        number_set.size === 2 &&
        has_fan &&
        template_enabled_values.two_numbers_fan_value
    ) {
        const value = template_values.two_numbers_fan_value || 0;
        return {
            value,
            log: `兩数 有番子 +${value}`,
            counted: true,
        };
    }

    if (
        number_set.size === 2 &&
        !has_fan &&
        template_enabled_values.two_numbers_no_fan_value
    ) {
        const value = template_values.two_numbers_no_fan_value || 0;
        return {
            value,
            log: `兩数 無番子 +${value}`,
            counted: true,
        };
    }

    return { value: 0, log: null, counted: false };
}

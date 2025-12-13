import { ValidatedDeck, CounterResult } from "@/types/counter";
import { THIRTEEN_WAIST_HU } from "@/constants/dictionary";

export function c_13waist(
    curr_validated_tiles: ValidatedDeck,
    door_clear: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (
        curr_validated_tiles.hu_type === THIRTEEN_WAIST_HU &&
        door_clear &&
        template_enabled_values.thirteen_waist_value
    ) {
        const thirteen_waist_value = template_values.thirteen_waist_value || 0;
        return {
            value: thirteen_waist_value,
            log: `13么/腰 +${thirteen_waist_value}`,
            counted: true,
        };
    }

    return {
        value: 0,
        log: null,
        counted: false,
    };
}

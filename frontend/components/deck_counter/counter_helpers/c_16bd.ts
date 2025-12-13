import { ValidatedDeck, CounterResult } from "@/types/counter";
import { SIXTEEN_BD_HU } from "@/constants/dictionary";

export function c_16bd(
    curr_validated_tiles: ValidatedDeck,
    door_clear: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (
        curr_validated_tiles.hu_type === SIXTEEN_BD_HU &&
        door_clear &&
        template_enabled_values.sixteenbd_value
    ) {
        const sixteenbd_value = template_values.sixteenbd_value || 0;
        return {
            value: sixteenbd_value,
            log: `16不搭 ${sixteenbd_value}`,
            counted: true,
        };
    }
    return { value: 0, log: null, counted: false };
}

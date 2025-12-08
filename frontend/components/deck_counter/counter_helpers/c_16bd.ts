import { ValidatedDeck, CounterResult } from "@/types/counter";
import { sixteen_bd_hu } from "@/constants/dictionary";

export function c_16bd(
    curr_validated_tiles: ValidatedDeck,
    door_clear: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (
        curr_validated_tiles.hu_type === sixteen_bd_hu &&
        door_clear &&
        template_enabled_values.sixteenbd_value
    ) {
        const sixteenbd_value = template_values.sixteenbd_value || 0;
        return {
            value: sixteenbd_value,
            log: `16不搭 ${sixteenbd_value}`,
        };
    }
    return { value: 0, log: null };
}

import { ValidatedDeck, CounterResult } from "@/types/counter";
import { LIGU_HU } from "@/constants/dictionary";

export function c_ligu(
    curr_validated_tiles: ValidatedDeck,
    door_clear: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (
        curr_validated_tiles.hu_type === LIGU_HU &&
        door_clear &&
        template_enabled_values.li_gu_value
    ) {
        const li_gu_value = template_values.li_gu_value || 0;
        return {
            value: li_gu_value,
            log: `Ligu +${li_gu_value}`,
            counted: true,
        };
    }

    return {
        value: 0,
        log: null,
        counted: false,
    };
}

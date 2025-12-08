import { ValidatedDeck, CounterResult } from "@/types/counter";
import { checkIsSpecialHu } from "@/utils/mj_helpers";

export function c_door_clear_zimo(
    myself_mo: boolean,
    door_clear: boolean,
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>,
): CounterResult {
    const is_special_hu = checkIsSpecialHu(curr_validated_tiles);

    if (myself_mo && door_clear && !is_special_hu && template_enabled_values.door_clear_zimo_value) {
        return {
            value: template_values.door_clear_zimo_value,
            log: `門清自摸 +${template_values.door_clear_zimo_value}`,
        };
    }

    if (myself_mo && template_enabled_values.myself_mo_value) {
        return {
            value: template_values.myself_mo_value,
            log: `自摸 +${template_values.myself_mo_value}`,
        };
    }

    if (door_clear && !is_special_hu && template_enabled_values.door_clear_value) {
        return {
            value: template_values.door_clear_value,
            log: `門清 +${template_values.door_clear_value}`,
        };
    }

    return {
        value: 0,
        log: null,
    };
}

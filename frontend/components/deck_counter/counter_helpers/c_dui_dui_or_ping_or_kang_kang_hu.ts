import { KANG_KANG_HU, DUI_DUI_HU, PING_HU, FLOWER_HU } from "@/constants/dictionary";
import { ValidatedDeck, DuiDuiResult } from "@/types/counter";
import { checkIsSpecialHu } from "@/utils/mj_helpers";

export function c_dui_dui_or_ping_or_kang_kang_hu(
    curr_validated_tiles: ValidatedDeck,
    myself_mo: boolean,
    door_clear: boolean,
    has_flower: boolean,
    has_fan: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): DuiDuiResult {
    let type_of_hu:
        | typeof KANG_KANG_HU
        | typeof DUI_DUI_HU
        | typeof PING_HU
        | null = null;
    const is_special_hu = checkIsSpecialHu(curr_validated_tiles) || curr_validated_tiles.hu_type == FLOWER_HU;

    // Skip duidui/pinghu counting for special hu types
    if (is_special_hu) {
        return {
            value: 0,
            log: null,
            type_of_hu,
            counted: false,
        };
    }

    let number_of_pongs = 0;
    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            if (tiles.length > 2) {
                const tracker = new Set<string>();
                for (const tile of tiles) {
                    tracker.add(tile);
                }

                if (tracker.size === 1) {
                    number_of_pongs += 1;
                }
            }
        }
    }

    if (
        number_of_pongs === 5 &&
        myself_mo &&
        door_clear &&
        template_enabled_values.five_dark_pong_zimo_value
    ) {
        const five_dark_pong_zimo_value =
            template_values.five_dark_pong_zimo_value || 0;
        return {
            value: five_dark_pong_zimo_value,
            log: `坎坎胡 +${five_dark_pong_zimo_value}`,
            type_of_hu: KANG_KANG_HU,
            counted: true,
        };
    }

    if (
        number_of_pongs === 5 &&
        (!myself_mo || !door_clear) &&
        template_enabled_values.dui_dui_hu_value
    ) {
        const dui_dui_hu_value = template_values.dui_dui_hu_value || 0;
        return {
            value: dui_dui_hu_value,
            log: `對對胡 +${dui_dui_hu_value}`,
            type_of_hu: DUI_DUI_HU,
            counted: true,
        };
    }

    if (number_of_pongs === 0 && template_enabled_values.ping_hu_value) {
        // If no flower and no fan, let c_no_zifa handle it with no_zifa_ping_hu_value
        if (!has_flower && !has_fan) {
            return {
                value: 0,
                log: null,
                type_of_hu: PING_HU,
                counted: false,
            };
        }

        // Regular ping hu with flowers/fans
        const ping_hu_value = template_values.ping_hu_value || 0;
        return {
            value: ping_hu_value,
            log: `平胡 +${ping_hu_value}`,
            type_of_hu: PING_HU,
            counted: true,
        };
    }

    return {
        value: 0,
        log: null,
        type_of_hu,
        counted: false,
    };
}

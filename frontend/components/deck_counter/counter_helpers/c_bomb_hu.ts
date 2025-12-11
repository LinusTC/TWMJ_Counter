import { BombHuResult, ValidatedDeck } from "@/types/counter";
import { c_special_hu } from "./c_special_hu";

export function c_bomb_hu(
    valid: boolean,
    possibleDecks: ValidatedDeck[],
    door_clear: boolean,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): BombHuResult {
    const explode_hu_value = template_values.explode_hu_value || 0;

    if (!template_enabled_values.explode_hu_value) {
        return {
            value: 0,
            log: null,
            is_bomb_hu: false,
        };
    }

    // Check if any valid deck is a special hu type that requires door clear
    let requires_door_clear = false;
    for (let i = 0; i < possibleDecks.length; i++) {
        if (c_special_hu(possibleDecks[i])) {
            requires_door_clear = true;
            break;
        }
    }

    // If it's a special hu type but door clear is false, it's a bomb hu
    if (requires_door_clear && !door_clear) {
        return {
            value: explode_hu_value * 3,
            log: `炸胡（特殊胡型必須門清）， 每家賠${explode_hu_value}`,
            is_bomb_hu: true,
        };
    }

    if (!valid) {
        return {
            value: explode_hu_value * 3,
            log: `炸胡， 每家賠${explode_hu_value}`,
            is_bomb_hu: true,
        };
    }

    return {
        value: 0,
        log: null,
        is_bomb_hu: false,
    };
}

import { BombHuResult } from "@/types/counter";

export function c_bomb_hu(
    valid: boolean,
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

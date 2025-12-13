import { CounterResult } from "@/types/counter";
import { PING_HU } from "@/constants/dictionary";

export function c_no_zifa(
    has_flower: boolean,
    has_fan: boolean,
    type_of_hu: string | null,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    const flower_value = template_values.flower_value || 0;
    const wind_value = template_values.wind_value || 0;

    // Both flower and fan exist - no bonus
    if (has_flower && has_fan) {
        return { value: 0, log: null, counted: false };
    }

    // No flower, no fan - highest bonus (ping hu or regular)
    if (!has_flower && !has_fan) {
        if (
            type_of_hu === PING_HU &&
            template_enabled_values.no_zifa_ping_hu_value
        ) {
            const value = template_values.no_zifa_ping_hu_value || 0;
            return {
                value,
                log: `無字花大平胡 +${value}`,
                counted: true,
            };
        }

        if (template_enabled_values.no_zifa_value) {
            const value = template_values.no_zifa_value || 0;
            return {
                value,
                log: `無字無花 +${value}`,
                counted: true,
            };
        }
    }

    // Only no flower (has fan)
    if (!has_flower && has_fan && template_enabled_values.flower_value) {
        return {
            value: flower_value,
            log: `無花 +${flower_value}`,
            counted: true,
        };
    }

    // Only no fan (has flower)
    if (has_flower && !has_fan && template_enabled_values.wind_value) {
        return {
            value: wind_value,
            log: `無字 +${wind_value}`,
            counted: true,
        };
    }

    return { value: 0, log: null, counted: false };
}

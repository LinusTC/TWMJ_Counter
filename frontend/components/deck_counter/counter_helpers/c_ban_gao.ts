import { ValidatedDeck, CounterResult } from "@/types/counter";

export function c_ban_gao(
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    let total_value = 0;
    const log: string[] = [];
    const tested_sets: Record<string, number> = {};

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            if (tiles.length === 3) {
                const hashed = [...tiles].sort().join(",");
                tested_sets[hashed] = (tested_sets[hashed] || 0) + 1;
            }
        }
    }

    for (const count of Object.values(tested_sets)) {
        if (count === 2 && template_enabled_values.ban_gao_value) {
            const value = template_values.ban_gao_value || 0;
            total_value += value;
            log.push(`般高 +${value}`);
        } else if (count === 3 && template_enabled_values.two_ban_gao_value) {
            const value = template_values.two_ban_gao_value || 0;
            total_value += value;
            log.push(`兩般高 +${value}`);
        } else if (count === 4 && template_enabled_values.three_ban_gao_value) {
            const value = template_values.three_ban_gao_value || 0;
            total_value += value;
            log.push(`三般高 +${value}`);
        }
    }

    return {
        value: total_value,
        log: log.length > 0 ? log : null,
    };
}

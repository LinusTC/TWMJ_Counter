import { ValidatedDeck, CounterResult } from "@/types/counter";
import {
    ZFB_DICT,
    WIND_DICT,
    MST_DICT,
    TSM_NAME,
} from "@/constants/dictionary";

export function c_lao_shao(
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (!template_enabled_values.lao_shao_value) {
        return { value: 0, log: null };
    }

    const lao_shao_value = template_values.lao_shao_value || 0;
    let value = 0;
    const log: string[] = [];
    const suits: Record<string, number[][]> = {
        [TSM_NAME[0]]: [],
        [TSM_NAME[1]]: [],
        [TSM_NAME[2]]: [],
    };

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            const numbers: number[] = [];
            let suit: string | null = null;

            for (const tile of tiles) {
                if (!ZFB_DICT.has(tile) && !WIND_DICT.has(tile)) {
                    suit = tile[0];
                    numbers.push(MST_DICT[tile]);
                }
            }

            if (numbers.length >= 3 && suit) {
                suits[suit].push(numbers.sort((a, b) => a - b));
            }
        }
    }

    // Check each suit for lao shao patterns
    for (const [suit, tile_group] of Object.entries(suits)) {
        const has_123 = tile_group.some(
            (group) =>
                group.length === 3 &&
                group[0] === 1 &&
                group[1] === 2 &&
                group[2] === 3
        );
        const has_789 = tile_group.some(
            (group) =>
                group.length === 3 &&
                group[0] === 7 &&
                group[1] === 8 &&
                group[2] === 9
        );
        const has_111 = tile_group.some(
            (group) =>
                group.length === 3 &&
                group[0] === 1 &&
                group[1] === 1 &&
                group[2] === 1
        );
        const has_999 = tile_group.some(
            (group) =>
                group.length === 3 &&
                group[0] === 9 &&
                group[1] === 9 &&
                group[2] === 9
        );

        if (has_123 && has_789) {
            value += lao_shao_value;
            log.push(`老少${suit} +${lao_shao_value}`);
        }
        if (has_111 && has_999) {
            value += lao_shao_value;
            log.push(`老少${suit} +${lao_shao_value}`);
        }
    }

    return {
        value,
        log: log.length > 0 ? log : null,
    };
}

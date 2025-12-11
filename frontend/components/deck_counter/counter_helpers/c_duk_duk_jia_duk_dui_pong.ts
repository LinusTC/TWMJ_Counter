import { ValidatedDeck, CounterResult } from "@/types/counter";
import { checkIsSpecialHu, findTilesThatCompleteSet } from "@/utils/mj_helpers";
import { SHANG_DICT, EYES_DICT, PONG_DICT } from "@/constants/dictionary";

export function c_duk_duk_jia_duk_dui_pong(
    winning_tile: string | null,
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (!winning_tile) {
        return { value: 0, log: null };
    }

    const groups_with_winning_tile: Map<string, string[]> = new Map();

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            if (tiles.includes(winning_tile)) {
                const remaining_tiles = [...tiles];
                const index = remaining_tiles.indexOf(winning_tile);
                remaining_tiles.splice(index, 1);
                groups_with_winning_tile.set(
                    JSON.stringify(tiles),
                    remaining_tiles
                );
            }
        }
    }

    const possible_tiles_list = Array.from(
        groups_with_winning_tile.values()
    ).map((incomplete_group) => findTilesThatCompleteSet(incomplete_group));

    if (groups_with_winning_tile.size === 1) {
        const group_array = Array.from(groups_with_winning_tile.keys())[0];
        const original_tiles = JSON.parse(group_array);

        // If the tile group only has 1 tile, it's duk duk
        if (
            original_tiles.length === 1 &&
            template_enabled_values.real_solo_value
        ) {
            const real_solo_value = template_values.real_solo_value || 0;
            return {
                value: real_solo_value,
                log: `獨獨 +${real_solo_value}`,
            };
        }

        const possible_tiles = possible_tiles_list[0];
        if (
            possible_tiles &&
            possible_tiles.tiles &&
            possible_tiles.complete_type &&
            possible_tiles.tiles.length === 1 &&
            (possible_tiles.complete_type === SHANG_DICT ||
                possible_tiles.complete_type === EYES_DICT) &&
            template_enabled_values.real_solo_value
        ) {
            const real_solo_value = template_values.real_solo_value || 0;
            return {
                value: real_solo_value,
                log: `獨獨 +${real_solo_value}`,
            };
        }
    }

    if (groups_with_winning_tile.size > 1) {
        for (const item of possible_tiles_list) {
            if (!item || !item.tiles || !item.complete_type) {
                continue;
            }
            if (
                (item.complete_type === SHANG_DICT ||
                    item.complete_type === EYES_DICT) &&
                item.tiles.length === 1 &&
                template_enabled_values.fake_solo_value
            ) {
                const fake_solo_value = template_values.fake_solo_value || 0;
                return {
                    value: fake_solo_value,
                    log: `假獨 +${fake_solo_value}`,
                };
            }
        }
    }

    if (template_enabled_values.double_pong_value) {
        for (const item of possible_tiles_list) {
            if (!item || !item.complete_type) {
                continue;
            }
            if (item.complete_type === PONG_DICT) {
                const double_pong_value =
                    template_values.double_pong_value || 0;
                return {
                    value: double_pong_value,
                    log: `對碰 +${double_pong_value}`,
                };
            }
        }
    }

    return { value: 0, log: null };
}

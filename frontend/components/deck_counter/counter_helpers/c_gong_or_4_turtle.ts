import { TileCount, ValidatedDeck, CounterResult } from "@/types/counter";
import { checkIsSpecialHu } from "@/utils/mj_helpers";
import { thirteen_waist_hu, JOKER_DICT } from "@/constants/dictionary";

export function c_gong_or_4_turtle(
    curr_validated_tiles: ValidatedDeck,
    winner_tiles: TileCount,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    // Thirteen waist can technically have 4 turtle
    const is_special_hu = checkIsSpecialHu(curr_validated_tiles);
    if (is_special_hu && curr_validated_tiles.hu_type !== thirteen_waist_hu) {
        return { value: 0, log: null };
    }

    let total_value = 0;
    const log: string[] = [];
    const gong_tiles = new Set<string>();

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tile_group = Array.isArray(item) ? item : [item];
            if (tile_group.length === 4 && template_enabled_values.gong_value) {
                const gong_value = template_values.gong_value || 0;
                total_value += gong_value;
                log.push(`槓${tile_group[0]} +${gong_value}`);
                gong_tiles.add(tile_group[0]);
            }
        }
    }

    if (template_enabled_values.light_four_turtle_value) {
        for (const tile in winner_tiles) {
            const count = winner_tiles[tile];
            if (count === 4 && !gong_tiles.has(tile) && tile !== JOKER_DICT) {
                const light_four_turtle_value =
                    template_values.light_four_turtle_value || 0;
                total_value += light_four_turtle_value;
                log.push(`明四歸${tile} +${light_four_turtle_value}`);
            }
        }
    }

    return {
        value: total_value,
        log: log.length > 0 ? log : null,
    };
}

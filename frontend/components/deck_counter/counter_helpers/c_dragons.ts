import { ValidatedDeck, DragonResult } from "@/types/counter";
import { ZFB_DICT, WIND_DICT, MST_DICT } from "@/constants/dictionary";

export function c_dragons(
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): DragonResult {
    const number_counter: boolean[] = Array(9).fill(false);
    const suit_counter: (Set<string> | null)[] = Array(9).fill(null);
    const valid_tiles = [
        new Set([1, 2, 3]),
        new Set([4, 5, 6]),
        new Set([7, 8, 9]),
    ];

    if (curr_validated_tiles.tiles) {
        for (const item of curr_validated_tiles.tiles) {
            const tiles = Array.isArray(item) ? item : [item];
            if (
                tiles.length === 3 &&
                !ZFB_DICT.has(tiles[0]) &&
                !WIND_DICT.has(tiles[0])
            ) {
                const numbers = new Set<number>();
                const suit = tiles[0][0];

                for (const tile of tiles) {
                    const tile_number = MST_DICT[tile];
                    numbers.add(tile_number);
                }

                // Check if numbers match any valid tile set
                const isValidTile = valid_tiles.some(
                    (validSet) =>
                        validSet.size === numbers.size &&
                        [...validSet].every((num) => numbers.has(num))
                );

                if (isValidTile) {
                    for (const number of numbers) {
                        number_counter[number - 1] = true;
                        if (suit_counter[number - 1] === null) {
                            suit_counter[number - 1] = new Set([suit]);
                        } else {
                            suit_counter[number - 1]!.add(suit);
                        }
                    }
                }
            }
        }
    }

    if (number_counter.every((val) => val === true)) {
        let same_house_dragon = false;
        let pureDragonSuit: string | null = null;

        if (suit_counter[0]) {
            for (const suit of suit_counter[0]) {
                let suit_in_all = true;
                for (let i = 1; i < suit_counter.length; i++) {
                    if (!suit_counter[i] || !suit_counter[i]!.has(suit)) {
                        suit_in_all = false;
                        break;
                    }
                }
                if (suit_in_all) {
                    same_house_dragon = true;
                    pureDragonSuit = suit;
                    break;
                }
            }
        }

        if (
            same_house_dragon &&
            template_enabled_values.light_same_dragon_value
        ) {
            const light_same_dragon_value =
                template_values.light_same_dragon_value || 0;
            return {
                value: light_same_dragon_value,
                log: `明清龍 +${light_same_dragon_value}`,
                counted: true,
                pureDragonSuit,
            };
        }

        if (template_enabled_values.light_mixed_dragon_value) {
            const light_mixed_dragon_value =
                template_values.light_mixed_dragon_value || 0;
            return {
                value: light_mixed_dragon_value,
                log: `明混龍 +${light_mixed_dragon_value}`,
                counted: true,
                pureDragonSuit: null, // Mixed dragon, no single suit
            };
        }
    }

    return {
        value: 0,
        log: null,
        counted: false,
        pureDragonSuit: null,
    };
}

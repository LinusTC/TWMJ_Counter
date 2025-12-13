import {
    FLOWER_DICT,
    JOKER_DICT,
    SIXTEEN_BD_HU,
    THIRTEEN_WAIST_HU,
    LIGU_HU,
    FLOWER_HU,
    MST_DICT,
    EYES_DICT,
    SHANG_DICT,
    PONG_DICT,
} from "../constants/dictionary";
import { TileCount, ValidatedDeck, CompleteSetInfo } from "../types/counter";

export function removeFlowers(tiles: TileCount): TileCount {
    const noFlowerTiles = { ...tiles };

    for (const key in noFlowerTiles) {
        if (key in FLOWER_DICT) {
            delete noFlowerTiles[key];
        }
    }

    return noFlowerTiles;
}

export function cleanTiles(tiles: TileCount): TileCount {
    const cleaned: TileCount = {};

    for (const key in tiles) {
        if (tiles[key] > 0) {
            cleaned[key] = tiles[key];
        }
    }

    return cleaned;
}

export function checkIsSpecialHu(validatedDeck: ValidatedDeck): boolean {
    const huType = validatedDeck.hu_type;
    return (
        huType === SIXTEEN_BD_HU ||
        huType === THIRTEEN_WAIST_HU ||
        huType === LIGU_HU ||
        huType === FLOWER_HU
    );
}

export function removeAndCountJokers(
    noFlowerTiles: TileCount
): [number, TileCount] {
    const noJokerTiles = { ...noFlowerTiles };

    if (JOKER_DICT in noJokerTiles) {
        const jokerCount = noJokerTiles[JOKER_DICT];
        delete noJokerTiles[JOKER_DICT];
        return [jokerCount, noJokerTiles];
    }

    return [0, noJokerTiles];
}

export function findTilesThatCompleteSet(
    incompleteSet: string[]
): CompleteSetInfo {
    if (incompleteSet.length > 2) {
        return {};
    }

    // Eyes
    if (incompleteSet.length === 1) {
        return {
            complete_type: EYES_DICT,
            tiles: [incompleteSet[0]],
        };
    }

    // Pong
    if (incompleteSet[0] === incompleteSet[1]) {
        return {
            complete_type: PONG_DICT,
            tiles: [incompleteSet[0]],
        };
    }

    // Shang (sequence)
    if (incompleteSet[0] !== incompleteSet[1]) {
        const suit = incompleteSet[0][0];
        const sorted = [...incompleteSet].sort(
            (a, b) => MST_DICT[a] - MST_DICT[b]
        );
        const num1 = MST_DICT[sorted[0]];
        const num2 = MST_DICT[sorted[1]];

        const possible: string[] = [];

        if (num1 + 1 === num2) {
            if (num1 - 1 > 0) {
                possible.push("${suit}${num1 - 1}");
            }
            if (num2 + 1 < 10) {
                possible.push("${suit}${num2 + 1}");
            }
            return { complete_type: SHANG_DICT, tiles: possible };
        } else {
            return { complete_type: SHANG_DICT, tiles: ["${suit}${num1 + 1}"] };
        }
    }

    return {};
}

import {
    FLOWER_DICT,
    WIND_DICT,
    ZFB_DICT,
    M_DICT,
    S_DICT,
    T_DICT,
    TSM_NAME,
    flower_hu,
    ligu_hu,
    sixteen_bd_hu,
    thirteen_waist_hu,
    standard_hu,
} from "../../constants/dictionary";
import { removeFlowers, cleanTiles } from "../../utils/mj_helpers";
import { TileCount, ValidatedDeck } from "../../types/counter";

export class DeckValidator {
    private winnerTiles: TileCount;
    private winnerTilesNoFlower: TileCount;
    public possibleDecks: ValidatedDeck[];

    constructor(winnerTiles: TileCount) {
        this.winnerTiles = cleanTiles(winnerTiles);
        this.winnerTilesNoFlower = cleanTiles(removeFlowers(winnerTiles));
        this.possibleDecks = [];
    }

    fullCheck(): boolean {
        // Check flower hu
        const flowerResults = this.flowerHuCheck(this.winnerTiles);
        if (flowerResults) {
            this.possibleDecks.push(flowerResults);
        }

        // Check there are 17 or more tiles
        if (this.cardCount(this.winnerTilesNoFlower) < 17 && !flowerResults) {
            return false;
        }

        // Check 16bd
        const sixteenBdResults = this.sixteenBdCheck(this.winnerTilesNoFlower);
        if (sixteenBdResults) {
            this.possibleDecks.push(sixteenBdResults);
        }

        // Check 13 waist
        const thirteenResults = this.thirteenWaistCheck(
            this.winnerTilesNoFlower
        );
        if (thirteenResults) {
            this.possibleDecks.push(thirteenResults);
        }

        // Check Ligu
        const liguResults = this.liguCheck(this.winnerTilesNoFlower);
        if (liguResults) {
            this.possibleDecks.push(liguResults);
        }

        // Check Standard (can have multiple iterations)
        const standardResults = this.standardCheck(this.winnerTilesNoFlower);
        if (standardResults.length > 0) {
            this.possibleDecks.push(...standardResults);
        }

        return this.possibleDecks.length > 0;
    }

    private cardCount(tiles: TileCount): number {
        let count = 0;
        for (const key in tiles) {
            count += tiles[key];
        }
        return count;
    }

    private flowerHuCheck(tiles: TileCount): ValidatedDeck | null {
        const flowers: string[] = [];

        for (const key in tiles) {
            if (key in FLOWER_DICT) {
                flowers.push(key);
            }
        }

        if (flowers.length >= 7) {
            return { hu_type: flower_hu, flowers };
        }

        return null;
    }

    private liguCheck(tiles: TileCount): ValidatedDeck | null {
        if (this.cardCount(tiles) !== 17) return null;

        const results: ValidatedDeck = {
            hu_type: ligu_hu,
            tiles: [],
            eyes: null,
        };
        let pairs = 0;
        let triplets = 0;

        for (const key in tiles) {
            const value = tiles[key];

            // 1 pair
            if (value === 2) {
                pairs++;
                results.tiles!.push([key, key]);
            }
            // 2 pairs of the same card
            else if (value === 4) {
                pairs += 2;
                results.tiles!.push([key, key]);
                results.tiles!.push([key, key]);
            }
            // 1 triplet in winning deck
            else if (value === 3) {
                triplets++;
                results.tiles!.push([key, key, key]);
            }
        }

        return pairs === 7 && triplets === 1 ? results : null;
    }

    private sixteenBdCheck(tiles: TileCount): ValidatedDeck | null {
        for (const key of WIND_DICT) {
            if (!(key in tiles)) {
                return null;
            }
        }

        for (const key of ZFB_DICT) {
            if (!(key in tiles)) {
                return null;
            }
        }

        const sixteenBdHelper = (
            dictionary: Record<string, number>
        ): boolean => {
            let temp = 0;
            const present = new Array(10).fill(false);

            for (const key in tiles) {
                if (key in dictionary) {
                    present[dictionary[key]] = true;
                    temp++;
                }
            }

            if (temp < 3) {
                return false;
            }

            for (let i = 1; i <= 9; i++) {
                if (present[i]) {
                    if (
                        (i + 1 <= 9 && present[i + 1]) ||
                        (i + 2 <= 9 && present[i + 2])
                    ) {
                        return false;
                    }
                }
            }

            return true;
        };

        if (!sixteenBdHelper(M_DICT)) return null;
        if (!sixteenBdHelper(S_DICT)) return null;
        if (!sixteenBdHelper(T_DICT)) return null;

        // Find pair of eyes
        const eyes = Object.keys(tiles).filter((key) => tiles[key] === 2);
        if (eyes.length !== 1) return null;

        const allTiles: string[] = [];
        for (const key in tiles) {
            for (let i = 0; i < tiles[key]; i++) {
                allTiles.push(key);
            }
        }

        return { hu_type: sixteen_bd_hu, eyes: eyes[0], tiles: allTiles };
    }

    private thirteenWaistCheck(tiles: TileCount): ValidatedDeck | null {
        const tilesToRemove: string[] = [];

        // Check it has all wind and zfb
        for (const key of WIND_DICT) {
            tilesToRemove.push(key);
            if (!(key in tiles)) {
                return null;
            }
        }

        for (const key of ZFB_DICT) {
            tilesToRemove.push(key);
            if (!(key in tiles)) {
                return null;
            }
        }

        const thirteenHelper = (prefix: string, tiles: TileCount): boolean => {
            tilesToRemove.push("${prefix}1");
            tilesToRemove.push("${prefix}9");
            return "${prefix}1" in tiles && "${prefix}9" in tiles;
        };

        if (!thirteenHelper(TSM_NAME[0], tiles)) return null;
        if (!thirteenHelper(TSM_NAME[1], tiles)) return null;
        if (!thirteenHelper(TSM_NAME[2], tiles)) return null;

        const possibleEyes: Array<[string, TileCount]> = [];

        for (const key in tiles) {
            if (tiles[key] >= 2) {
                const temp = { ...tiles };
                temp[key] -= 2;
                const cleaned = cleanTiles(temp);
                possibleEyes.push([key, cleaned]);
            }
        }

        for (const [eye, remainingTiles] of possibleEyes) {
            const tempRemaining = { ...remainingTiles };

            for (const key of tilesToRemove) {
                if (key in tempRemaining && key !== eye) {
                    tempRemaining[key] -= 1;
                }
            }
            const cleaned = cleanTiles(tempRemaining);

            const allSolutions: string[][] = [];
            this.topDownDfs(cleaned, [], allSolutions);

            if (allSolutions.length > 0) {
                const tilesList: Array<string | string[]> = [[eye, eye]];
                tilesList.push(...allSolutions[0]);
                for (const tile of tilesToRemove) {
                    tilesList.push([tile]);
                }
                return {
                    hu_type: thirteen_waist_hu,
                    eyes: eye,
                    tiles: tilesList,
                };
            }
        }

        return null;
    }

    private standardCheck(tiles: TileCount): ValidatedDeck[] {
        // Find all possible eyes
        const possibleEyes: Array<[string, TileCount]> = [];

        for (const key in tiles) {
            if (tiles[key] >= 2) {
                const temp = { ...tiles };
                temp[key] -= 2;
                const cleaned = cleanTiles(temp);
                possibleEyes.push([key, cleaned]);
            }
        }

        const results: ValidatedDeck[] = [];
        const seenDecks = new Set<string>();

        for (const [eye, remainingTiles] of possibleEyes) {
            const allSolutions: Array<Array<string | string[]>> = [];
            this.topDownDfs(remainingTiles, [], allSolutions);

            for (const solution of allSolutions) {
                const completeSets = [[eye, eye], ...solution];
                if (completeSets.length === 6) {
                    const sortedSets = completeSets
                        .map((s) => (Array.isArray(s) ? [...s].sort() : [s]))
                        .sort((a, b) =>
                            JSON.stringify(a).localeCompare(JSON.stringify(b))
                        );
                    const deckKey = JSON.stringify(sortedSets);
                    if (!seenDecks.has(deckKey)) {
                        seenDecks.add(deckKey);
                        results.push({
                            hu_type: standard_hu,
                            eyes: eye,
                            tiles: completeSets,
                        });
                    }
                }
            }
        }

        return results;
    }

    private topDownDfs(
        tiles: TileCount,
        currentSets: Array<string | string[]>,
        allSolutions: Array<Array<string | string[]>>
    ): void {
        if (Object.keys(tiles).length === 0) {
            // Found a complete solution
            allSolutions.push([...currentSets]);
            return;
        }

        // Get the smallest tile from the tiles
        const temp = Object.keys(tiles).sort()[0];

        // 1. Try Gong (4 of a kind)
        if (this.testPong(tiles, temp) && tiles[temp] > 3) {
            const nextTiles = { ...tiles };
            nextTiles[temp] -= 4;
            const cleaned = cleanTiles(nextTiles);

            currentSets.push([temp, temp, temp, temp]);
            this.topDownDfs(cleaned, currentSets, allSolutions);
            currentSets.pop(); // Backtrack
        }

        // 2. Try Pong (3 of a kind)
        if (this.testPong(tiles, temp)) {
            const nextTiles = { ...tiles };
            nextTiles[temp] -= 3;
            const cleaned = cleanTiles(nextTiles);

            currentSets.push([temp, temp, temp]);
            this.topDownDfs(cleaned, currentSets, allSolutions);
            currentSets.pop(); // Backtrack
        }

        // 3. Try Shang (sequence)
        if (this.testShang(tiles, temp)) {
            let nextTiles = { ...tiles };
            const suit = temp[0];
            const rank = parseInt(temp[1]);

            nextTiles[temp] -= 1;
            nextTiles = cleanTiles(nextTiles);

            const tilePlus1 = `${suit}${rank + 1}`;
            nextTiles[tilePlus1] -= 1;
            nextTiles = cleanTiles(nextTiles);

            const tilePlus2 = `${suit}${rank + 2}`;
            nextTiles[tilePlus2] -= 1;
            nextTiles = cleanTiles(nextTiles);

            currentSets.push([temp, tilePlus1, tilePlus2]);
            this.topDownDfs(nextTiles, currentSets, allSolutions);
            currentSets.pop(); // Backtrack
        }
    }

    private testPong(tiles: TileCount, currTile: string): boolean {
        return tiles[currTile] >= 3;
    }

    private testShang(tiles: TileCount, currTile: string): boolean {
        if (
            !(currTile in M_DICT) &&
            !(currTile in S_DICT) &&
            !(currTile in T_DICT)
        ) {
            return false;
        }

        const suit = currTile[0];
        const number = parseInt(currTile[1]);
        if (number > 7) {
            return false;
        }

        const tilePlus1 = `${suit}${number + 1}`;
        const tilePlus2 = `${suit}${number + 2}`;

        return (
            currTile in tiles &&
            tilePlus1 in tiles &&
            tilePlus2 in tiles &&
            tiles[currTile] >= 1 &&
            tiles[tilePlus1] >= 1 &&
            tiles[tilePlus2] >= 1
        );
    }

    getValidatedDecks(): ValidatedDeck[] {
        return this.possibleDecks;
    }
}

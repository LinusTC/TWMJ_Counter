import { TileCount, ValidatedDeck, FanResult } from "@/types/counter";
import { WIND_DICT, ZFB_DICT, SEAT_DICT } from "@/constants/dictionary";

export class FanCounter {
    private winner_seat: number;
    private base_winner_tiles: TileCount;
    private curr_wind: string;
    private logs: string[];
    private template_values: Record<string, number>;
    private template_enabled_values: Record<string, boolean>;

    constructor(
        winner_seat: number,
        winner_tiles: TileCount,
        curr_wind: string,
        template_values: Record<string, number>,
        template_enabled_values: Record<string, boolean>
    ) {
        this.winner_seat = winner_seat;
        this.base_winner_tiles = winner_tiles ? { ...winner_tiles } : {};
        this.curr_wind = curr_wind;
        this.template_values = template_values;
        this.template_enabled_values = template_enabled_values;
        this.logs = [];
    }

    countWindAndZfbValue(
        validated_deck?: ValidatedDeck
    ): [number, boolean, boolean, boolean] {
        this.logs = []; // Reset logs for each count
        const tile_counts = this._buildTileCounts(validated_deck);

        const [windValue, has_wind, counted_pos] =
            this.countWindValue(tile_counts);
        const [zfbValue, has_zfb] = this.countZfbValue(tile_counts);

        const total_fan_value = windValue + zfbValue;
        return [total_fan_value, has_wind, has_zfb, counted_pos];
    }

    private countWindValue(tiles: TileCount): [number, boolean, boolean] {
        let value = 0;
        let has_wind = false;
        let small_wind = 0;
        let big_wind = 0;
        const wind_logs: string[] = [];
        let counted_pos = false;

        const wind_value = this.template_values.wind_value || 0;

        // Counts wind
        for (const key in tiles) {
            const count = tiles[key];
            if (!WIND_DICT.has(key)) {
                continue;
            } else {
                has_wind = true;

                if (count >= 2) {
                    small_wind += 1;
                }

                if (count >= 3) {
                    big_wind += 1;
                    if (this.template_enabled_values.wind_value) {
                        value += wind_value;
                        wind_logs.push(`${key} +${wind_value}`);
                    }
                }
            }
        }

        // Checks small/big wind
        if (
            small_wind === 3 &&
            this.template_enabled_values.small_3_wind_value
        ) {
            value = this.template_values.small_3_wind_value || 0;
            wind_logs.length = 0;
            wind_logs.push(`小三風 +${value}`);
        }

        if (big_wind === 3 && this.template_enabled_values.big_3_wind_value) {
            value = this.template_values.big_3_wind_value || 0;
            wind_logs.length = 0;
            wind_logs.push(`大三風 +${value}`);
        }

        if (
            small_wind === 4 &&
            this.template_enabled_values.small_4_wind_value
        ) {
            value = this.template_values.small_4_wind_value || 0;
            wind_logs.length = 0;
            wind_logs.push(`小四喜 +${value}`);
        }

        if (big_wind === 4 && this.template_enabled_values.big_4_wind_value) {
            value = this.template_values.big_4_wind_value || 0;
            wind_logs.length = 0;
            wind_logs.push(`大四喜 +${value}`);
        }

        // Counts curr wind
        if (
            this.curr_wind in tiles &&
            tiles[this.curr_wind] >= 3 &&
            this.template_enabled_values.wind_wind_value
        ) {
            const wind_wind_value = this.template_values.wind_wind_value || 0;
            value += wind_wind_value;
            wind_logs.push(`正${this.curr_wind}圈 +${wind_wind_value}`);
        }

        // Counts seat position
        const seat_tile = SEAT_DICT[this.winner_seat];
        if (
            seat_tile in tiles &&
            tiles[seat_tile] >= 3 &&
            this.template_enabled_values.wind_seat_value
        ) {
            const wind_seat_value = this.template_values.wind_seat_value || 0;
            value += wind_seat_value;
            counted_pos = true;
            wind_logs.push(
                `正${SEAT_DICT[this.winner_seat]}位 +${wind_seat_value}`
            );
        }

        this.logs.push(...wind_logs);

        return [value, has_wind, counted_pos];
    }

    private countZfbValue(tiles: TileCount): [number, boolean] {
        let value = 0;
        let has_zfb = false;
        let small_3 = 0;
        let big_3 = 0;
        const zfb_logs: string[] = [];

        const zfb_value = this.template_values.zfb_value || 0;

        for (const key in tiles) {
            const count = tiles[key];
            if (!ZFB_DICT.has(key)) {
                continue;
            } else {
                has_zfb = true;
                if (count > 1) {
                    small_3 += 1;
                    if (count > 2 && this.template_enabled_values.zfb_value) {
                        value += zfb_value;
                        zfb_logs.push(`${key} +${zfb_value}`);
                        big_3 += 1;
                    }
                }
            }
        }

        if (small_3 === 3 && this.template_enabled_values.small_3_zfb_value) {
            value = this.template_values.small_3_zfb_value || 0;
            zfb_logs.length = 0;
            zfb_logs.push(`小三元 +${value}`);
        }

        if (big_3 === 3 && this.template_enabled_values.big_3_zfb_value) {
            value = this.template_values.big_3_zfb_value || 0;
            zfb_logs.length = 0;
            zfb_logs.push(`大三元 +${value}`);
        }

        this.logs.push(...zfb_logs);

        return [value, has_zfb];
    }

    getLogs(): string[] {
        return this.logs;
    }

    private _buildTileCounts(validated_deck?: ValidatedDeck): TileCount {
        if (validated_deck && validated_deck.tiles) {
            const counts: TileCount = {};
            for (const tile_group of validated_deck.tiles) {
                const tiles = Array.isArray(tile_group)
                    ? tile_group
                    : [tile_group];
                for (const tile of tiles) {
                    counts[tile] = (counts[tile] || 0) + 1;
                }
            }
            return counts;
        }

        return { ...this.base_winner_tiles };
    }
}

export function c_fan(
    winner_seat: number,
    winner_tiles: TileCount,
    curr_wind: string,
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): FanResult {
    const fanCounter = new FanCounter(
        winner_seat,
        winner_tiles,
        curr_wind,
        template_values,
        template_enabled_values
    );
    const [total_fan_value, has_wind, has_zfb, counted_pos] =
        fanCounter.countWindAndZfbValue(curr_validated_tiles);
    const has_fan = has_wind || has_zfb;

    if (!has_wind && !has_zfb) {
        return {
            value: 0,
            log: null,
            hasFan: has_fan,
            countedPos: counted_pos,
            counted: false,
        };
    }

    const value = total_fan_value;
    const log = fanCounter.getLogs();
    return {
        value,
        log,
        hasFan: has_fan,
        countedPos: counted_pos,
        counted: value > 0,
    };
}

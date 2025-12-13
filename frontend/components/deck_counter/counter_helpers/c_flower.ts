import { TileCount, ValidatedDeck, FlowerResult } from "@/types/counter";
import { FLOWER_DICT, FLOWER_HU } from "@/constants/dictionary";

export class FlowerCounter {
    private winner_seat: number;
    private winner_tiles: TileCount;
    private logs: string[];
    private template_values: Record<string, number>;
    private template_enabled_values: Record<string, boolean>;

    constructor(
        winner_seat: number,
        winner_tiles: TileCount,
        template_values: Record<string, number>,
        template_enabled_values: Record<string, boolean>
    ) {
        this.winner_seat = winner_seat;
        this.winner_tiles = winner_tiles;
        this.template_values = template_values;
        this.template_enabled_values = template_enabled_values;
        this.logs = [];
    }

    countFlowerValue(): [number, boolean, boolean] {
        this.logs = []; // Reset logs for each count
        let value = 0;
        let has_flower = false;
        let counted_pos = false;

        const flower_value = this.template_values.flower_value || 0;
        const flower_seat_value = this.template_values.flower_seat_value || 0;

        for (const key in this.winner_tiles) {
            if (!(key in FLOWER_DICT)) {
                continue;
            } else {
                has_flower = true;
                if (this.template_enabled_values.flower_value) {
                    value += flower_value;
                    this.logs.push(`花${key} +${flower_value}`);
                }

                if (
                    FLOWER_DICT[key] === this.winner_seat &&
                    this.template_enabled_values.flower_seat_value
                ) {
                    value += flower_seat_value;
                    counted_pos = true;
                    this.logs.push(`花位${key} +${flower_seat_value}`);
                }
            }
        }

        if (value === 0 && this.template_enabled_values.flower_value)
            value += flower_value;

        return [value, has_flower, counted_pos];
    }

    getLogs(): string[] {
        return this.logs;
    }
}

export function c_flower(
    winner_seat: number,
    winner_tiles: TileCount,
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): FlowerResult {
    const flowerCounter = new FlowerCounter(
        winner_seat,
        winner_tiles,
        template_values,
        template_enabled_values
    );
    const [flowerValue, has_flower, counted_pos] =
        flowerCounter.countFlowerValue();
    const has_flower_hu = curr_validated_tiles.hu_type === FLOWER_HU;

    if (!has_flower) {
        return {
            value: 0,
            log: null,
            hasFlowerHu: has_flower_hu,
            hasFlower: has_flower,
            countedPos: counted_pos,
            counted: false,
        };
    }

    if (has_flower_hu) {
        const value_key =
            curr_validated_tiles.flowers?.length === 7
                ? "seven_flower_value"
                : "eight_flower_value";
        if (!template_enabled_values[value_key]) {
            return {
                value: 0,
                log: null,
                hasFlowerHu: has_flower_hu,
                hasFlower: has_flower,
                countedPos: counted_pos,
                counted: true,
            };
        }
        const value = template_values[value_key] || 0;
        return {
            value,
            log: `花胡 +${value}`,
            hasFlowerHu: has_flower_hu,
            hasFlower: has_flower,
            countedPos: counted_pos,
            counted: true,
        };
    }

    if (has_flower) {
        return {
            value: flowerValue,
            log: flowerCounter.getLogs(),
            hasFlowerHu: has_flower_hu,
            hasFlower: has_flower,
            countedPos: counted_pos,
            counted: true,
        };
    }

    return {
        value: 0,
        log: null,
        hasFlowerHu: false,
        hasFlower: false,
        countedPos: false,
        counted: false,
    };
}

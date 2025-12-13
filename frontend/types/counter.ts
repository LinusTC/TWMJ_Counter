import { KANG_KANG_HU, DUI_DUI_HU, PING_HU } from "@/constants/dictionary";

// Type definitions for Taiwanese Mahjong counter
export type TileCount = Record<string, number>;

export interface CounterResult {
    value: number;
    log: string | string[] | null;
    counted: boolean;
}

export interface FlowerResult extends CounterResult {
    hasFlowerHu: boolean;
    hasFlower: boolean;
    countedPos: boolean;
}

export interface FanResult extends CounterResult {
    hasFan: boolean;
    countedPos: boolean;
}

export interface DuiDuiResult extends CounterResult {
    type_of_hu: typeof KANG_KANG_HU | typeof DUI_DUI_HU | typeof PING_HU | null;
}

export interface DragonResult extends CounterResult {
    pureDragonSuit: string | null; // Which suit the pure dragon is in, null for mixed or no dragon
}

export interface ValidatedDeck {
    hu_type?: string;
    eyes?: string | null;
    tiles?: Array<string | string[]>;
    flowers?: string[];
}

export interface base_results {
    value: number;
    log: string | string[] | null;
    winning_deck: TileCount | null;
    winning_deck_organized: ValidatedDeck | null;
    calculated_points?: number;
    multiplier?: number;
    base_value?: number;
}

export interface CounterState {
    winner_tiles: TileCount;
    winner_seat: string;
    current_wind: string;
    winning_tile: string | null;
    myself_mo: boolean;
    door_clear: boolean;
    base_value: number;
    multiplier: number;
    valid: boolean;
    curr_validated_tiles: ValidatedDeck;
}

export interface CompleteSetInfo {
    complete_type?: string;
    tiles?: string[];
}
export interface ValueConstant {
    key: string;
    label: string;
    defaultValue: number;
    defaultEnabled?: boolean;
}

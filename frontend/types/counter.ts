// Type definitions for Taiwanese Mahjong counter
export type TileCount = Record<string, number>;

export interface CounterResult {
    value: number;
    log: string | string[] | null;
}

export interface BombHuResult extends CounterResult {
    is_bomb_hu: boolean;
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
    type_of_hu: "kang_kang_hu" | "dui_dui_hu" | "ping_hu" | null;
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

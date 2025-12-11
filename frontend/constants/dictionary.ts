// Taiwanese Mahjong tile dictionaries and constants

export const TSM_NAME = ["m", "t", "s"] as const;

// Generate tile dictionaries
export const M_DICT: Record<string, number> = {};
export const T_DICT: Record<string, number> = {};
export const S_DICT: Record<string, number> = {};

for (let i = 1; i <= 9; i++) {
    M_DICT[`${TSM_NAME[0]}${i}`] = i;
    T_DICT[`${TSM_NAME[1]}${i}`] = i;
    S_DICT[`${TSM_NAME[2]}${i}`] = i;
}

export const WIND_DICT = new Set(["east", "south", "west", "north"]);

export const WIND_LABELS: Record<string, string> = {
    east: "東",
    south: "南",
    west: "西",
    north: "北",
};

export const ZFB_DICT = new Set(["zhong", "fa", "bai"]);

export const FLOWER_DICT: Record<string, number> = {
    f1: 1,
    f2: 2,
    f3: 3,
    f4: 4,
    ff1: 1,
    ff2: 2,
    ff3: 3,
    ff4: 4,
};

export const SEAT_DICT: Record<number, string> = {
    1: "east",
    2: "south",
    3: "west",
    4: "north",
};

export const JOKER_DICT = "joker";

// Combined MST dictionary
export const MST_DICT = { ...M_DICT, ...T_DICT, ...S_DICT };

// All tiles list
export const ALL_TILES_NO_FLOWER = [
    ...Object.keys(M_DICT),
    ...Object.keys(T_DICT),
    ...Object.keys(S_DICT),
    ...Array.from(WIND_DICT),
    ...Array.from(ZFB_DICT),
];

export const ALL_TILES = [
    ...Array.from(ALL_TILES_NO_FLOWER),
    ...Object.keys(FLOWER_DICT)
]

// Set types
export const EYES_DICT = "eyes";
export const SHANG_DICT = "shang";
export const PONG_DICT = "pong";
export const GONG_DICT = "gong";

// Types of Hu
export const flower_hu = "花胡";
export const ligu_hu = "Ligu";
export const sixteen_bd_hu = "16不搭";
export const thirteen_waist_hu = "十三么/腰";
export const standard_hu = "普通胡";

import { ImageSourcePropType } from "react-native";

type TileImageMap = Record<string, ImageSourcePropType | null>;

// Map tile keys to their image assets
export const tileImageMap: TileImageMap = {
    // Manzu (萬子) - Characters
    m1: require("@/assets/tiles/m1.png"),
    m2: require("@/assets/tiles/m2.png"),
    m3: require("@/assets/tiles/m3.png"),
    m4: require("@/assets/tiles/m4.png"),
    m5: require("@/assets/tiles/m5.png"),
    m6: require("@/assets/tiles/m6.png"),
    m7: require("@/assets/tiles/m7.png"),
    m8: require("@/assets/tiles/m8.png"),
    m9: require("@/assets/tiles/m9.png"),
    // Tongzi (筒子) - Dots
    t1: require("@/assets/tiles/t1.png"),
    t2: require("@/assets/tiles/t2.png"),
    t3: require("@/assets/tiles/t3.png"),
    t4: require("@/assets/tiles/t4.png"),
    t5: require("@/assets/tiles/t5.png"),
    t6: require("@/assets/tiles/t6.png"),
    t7: require("@/assets/tiles/t7.png"),
    t8: require("@/assets/tiles/t8.png"),
    t9: require("@/assets/tiles/t9.png"),
    // Suozi (索子) - Bamboo
    s1: require("@/assets/tiles/s1.png"),
    s2: require("@/assets/tiles/s2.png"),
    s3: require("@/assets/tiles/s3.png"),
    s4: require("@/assets/tiles/s4.png"),
    s5: require("@/assets/tiles/s5.png"),
    s6: require("@/assets/tiles/s6.png"),
    s7: require("@/assets/tiles/s7.png"),
    s8: require("@/assets/tiles/s8.png"),
    s9: require("@/assets/tiles/s9.png"),
    // Winds
    east: require("@/assets/tiles/east.png"),
    south: require("@/assets/tiles/south.png"),
    west: require("@/assets/tiles/west.png"),
    north: require("@/assets/tiles/north.png"),
    // Dragons
    zhong: require("@/assets/tiles/zhong.png"),
    fa: require("@/assets/tiles/fa.png"),
    bak: require("@/assets/tiles/bak.png"),
    // Flowers
    f1: require("@/assets/tiles/f1.png"),
    f2: require("@/assets/tiles/f2.png"),
    f3: require("@/assets/tiles/f3.png"),
    f4: require("@/assets/tiles/f4.png"),
    ff1: require("@/assets/tiles/ff1.png"),
    ff2: require("@/assets/tiles/ff2.png"),
    ff3: require("@/assets/tiles/ff3.png"),
    ff4: require("@/assets/tiles/ff4.png"),
};

export const DISPLAY_TILE_SIZE = "155%"

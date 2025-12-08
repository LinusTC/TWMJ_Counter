import { ValidatedDeck, CounterResult } from "@/types/counter";
import { WIND_DICT, ZFB_DICT, MST_DICT } from "@/constants/dictionary";

export function c_general_eyes(
    curr_validated_tiles: ValidatedDeck,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    if (
        curr_validated_tiles.eyes &&
        !WIND_DICT.has(curr_validated_tiles.eyes) &&
        !ZFB_DICT.has(curr_validated_tiles.eyes) &&
        template_enabled_values.general_eye_value
    ) {
        const eye_tile = MST_DICT[curr_validated_tiles.eyes];

        if (eye_tile === 2 || eye_tile === 5 || eye_tile === 8) {
            const general_eye_value = template_values.general_eye_value || 0;
            return {
                value: general_eye_value,
                log: `將眼 +${general_eye_value}`,
            };
        }
    }
    return { value: 0, log: null };
}

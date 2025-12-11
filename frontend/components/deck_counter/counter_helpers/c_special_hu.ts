import { ValidatedDeck } from "@/types/counter";
import {
    sixteen_bd_hu,
    thirteen_waist_hu,
    ligu_hu,
} from "@/constants/dictionary";

export function c_special_hu(curr_validated_tiles: ValidatedDeck): boolean {
    const hu_type = curr_validated_tiles.hu_type;
    if (
        hu_type === sixteen_bd_hu ||
        hu_type === thirteen_waist_hu ||
        hu_type === ligu_hu
    ) {
        return true;
    }

    return false;
}

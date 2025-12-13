import { base_results, TileCount, ValidatedDeck } from "@/types/counter";
import { DeckValidator } from "../deck_validator/deck_validator";
import { c_bomb_hu } from "./counter_helpers/c_bomb_hu";
import { c_door_clear_zimo } from "./counter_helpers/c_door_clear_zimo";
import { c_flower } from "./counter_helpers/c_flower";
import { c_fan } from "./counter_helpers/c_fan";
import { defaultValues } from "@/constants/value_constants";
import { c_16bd } from "./counter_helpers/c_16bd";
import { c_13waist } from "./counter_helpers/c_13waist";
import { c_ligu } from "./counter_helpers/c_ligu";
import { c_duk_duk_jia_duk_dui_pong } from "./counter_helpers/c_duk_duk_jia_duk_dui_pong";
import { c_general_eyes } from "./counter_helpers/c_general_eyes";
import { c_gong_or_4_turtle } from "./counter_helpers/c_gong_or_4_turtle";
import { c_two_or_three_numbers_only } from "./counter_helpers/c_two_or_three_numbers_only";
import { c_only_fan } from "./counter_helpers/c_only_fan";
import { c_only_one_or_nine } from "./counter_helpers/c_only_one_or_nine";
import { c_break_waist } from "./counter_helpers/c_break_wast";
import { c_same_house } from "./counter_helpers/c_same_house";
import { c_less_door } from "./counter_helpers/c_less_door";
import { c_5_doors } from "./counter_helpers/c_5_doors";
import { c_lao_shao } from "./counter_helpers/c_lao_shao";
import { c_ban_gao } from "./counter_helpers/c_ban_gao";
import { c_step_step_high } from "./counter_helpers/c_step_step_high";
import { c_sister } from "./counter_helpers/c_sister";
import { c_sister_pong } from "./counter_helpers/c_sister_pong";
import { c_dui_dui_or_ping_or_kang_kang_hu } from "./counter_helpers/c_dui_dui_or_ping_or_kang_kang_hu";
import { c_dragons } from "./counter_helpers/c_dragons";
import { getTemplateById } from "@/utils/database";
import { c_zhuang } from "./counter_helpers/c_zhuang";
import { c_no_zifa } from "./counter_helpers/c_no_zifa";

export class BaseCounter {
    private winner_tiles: TileCount;
    private winner_seat: number;
    private current_wind: string;
    private winning_tile: string;
    private myself_mo: boolean;
    private door_clear: boolean;
    private is_zhuang: boolean;
    private eat_zhuang: boolean;
    private lum_zhuang: number;
    private deck_validator: DeckValidator;
    private valid: boolean;
    private total_number_of_valid_decks: number;
    private curr_validated_tiles: ValidatedDeck;
    private template_used_id: number;
    public final_value: number;
    public logs: string[];

    constructor(
        winner_tiles: TileCount,
        winner_seat: number,
        current_wind: string,
        winning_tile: string,
        myself_mo: boolean,
        doorclear: boolean,
        is_zhuang: boolean,
        eat_zhuang: boolean,
        lum_zhuang: number,
        template_used_id: number
    ) {
        this.winner_tiles = winner_tiles;
        this.winner_seat = winner_seat;
        this.current_wind = current_wind;
        this.winning_tile = winning_tile;
        this.myself_mo = myself_mo;
        this.door_clear = doorclear;
        this.is_zhuang = is_zhuang;
        this.eat_zhuang = eat_zhuang;
        this.lum_zhuang = lum_zhuang;
        this.template_used_id = template_used_id;
        this.deck_validator = new DeckValidator(this.winner_tiles);
        this.valid = this.deck_validator.fullCheck();
        this.total_number_of_valid_decks =
            this.deck_validator.possibleDecks.length;
        this.curr_validated_tiles =
            this.total_number_of_valid_decks > 0
                ? this.deck_validator.possibleDecks[0]
                : {};
        this.final_value = 0;
        this.logs = [];
    }

    base_count(): base_results {
        const template = getTemplateById(this.template_used_id);
        if (!template) {
            throw new Error(
                `Template with id ${this.template_used_id} not found`
            );
        }
        const template_values: Record<string, number> = template.rules;
        const template_enabled_values: Record<string, boolean> =
            template.rules_enabled;
        const base_value: number = template_values.base_value;
        const multiplier: number = template_values.multiplier_value;

        let max_value: number = 0;
        let max_logs: string[] = [];
        let winning_deck: TileCount | null = null;
        let winning_deck_organized: ValidatedDeck | null = null;
        let max_calculated_points: number = 0;

        let counted_5_doors = false;
        let counted_13_waist = false;

        const add_to_log = (
            curr_logs: string | string[] | null,
            temp_logs: string[]
        ) => {
            if (curr_logs) {
                if (Array.isArray(curr_logs)) {
                    temp_logs.push(...curr_logs);
                } else {
                    temp_logs.push(curr_logs);
                }
            }
        };

        // Check bomb
        const bomb_result = c_bomb_hu(
            this.valid,
            this.deck_validator.possibleDecks,
            this.door_clear,
            template_values,
            template_enabled_values
        );
        if (bomb_result.counted) {
            this.final_value = bomb_result.value;
            add_to_log(bomb_result.log, this.logs);
            return {
                value: this.final_value,
                log: this.logs,
                winning_deck: null,
                winning_deck_organized: null,
            };
        }

        // Loop through all valid decks
        for (let i = 0; i < this.total_number_of_valid_decks; i++) {
            let temp_value: number = 0;
            let temp_logs: string[] = [];
            this.curr_validated_tiles = this.deck_validator.possibleDecks[i];

            // Initialize counter tracking variables
            let counted_door_clear_zimo = false;
            let counted_zhuang = false;
            let counted_flower = false;
            let counted_fan = false;
            let counted_16bd = false;
            let counted_13waist = false;
            let counted_ligu = false;
            let counted_duk_duk = false;
            let counted_general_eyes = false;
            let counted_gong = false;
            let counted_two_or_three_numbers = false;
            let counted_only_fan = false;
            let counted_only_one_nine = false;
            let counted_break_waist = false;
            let counted_same_house = false;
            let counted_less_door = false;
            let counted_5_doors = false;
            let counted_lao_shao = false;
            let counted_ban_gao = false;
            let counted_bu_bu_gao = false;
            let counted_sister = false;
            let counted_sister_pong = false;
            let counted_dui_dui = false;
            let counted_dragons = false;
            let counted_no_zifa = false;

            //Check zimo and door clear
            const door_clear_zimo_result = c_door_clear_zimo(
                this.myself_mo,
                this.door_clear,
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += door_clear_zimo_result.value;
            add_to_log(door_clear_zimo_result.log, temp_logs);
            counted_door_clear_zimo = door_clear_zimo_result.counted;

            //Check Zhuang Jia
            const zhuang_result = c_zhuang(
                this.is_zhuang,
                this.eat_zhuang,
                this.lum_zhuang,
                template_values,
                template_enabled_values
            );
            temp_value += zhuang_result.value;
            add_to_log(zhuang_result.log, temp_logs);
            counted_zhuang = zhuang_result.counted;

            //Check flower
            const flower_result = c_flower(
                this.winner_seat,
                this.winner_tiles,
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += flower_result.value;
            add_to_log(flower_result.log, temp_logs);
            counted_flower = flower_result.counted;
            const has_flower = flower_result.hasFlower;
            const counted_flower_pos = flower_result.countedPos;

            if (flower_result.hasFlowerHu) {
                if (temp_value > max_value) {
                    max_value = temp_value;
                    max_logs = temp_logs;
                    winning_deck = this.winner_tiles;
                    winning_deck_organized = this.curr_validated_tiles;
                }
                continue;
            }

            //Check fan
            const fan_result = c_fan(
                this.winner_seat,
                this.winner_tiles,
                this.current_wind,
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += fan_result.value;
            add_to_log(fan_result.log, temp_logs);
            counted_fan = fan_result.counted;
            const has_fan = fan_result.hasFan;
            const counted_fan_pos = fan_result.countedPos;

            console.log(has_fan, has_flower);
            //ping hu or dui dui hu
            const dui_dui_results = c_dui_dui_or_ping_or_kang_kang_hu(
                this.curr_validated_tiles,
                this.myself_mo,
                this.door_clear,
                has_flower,
                has_fan,
                template_values,
                template_enabled_values
            );
            temp_value += dui_dui_results.value;
            add_to_log(dui_dui_results.log, temp_logs);
            counted_dui_dui = dui_dui_results.counted;

            //No fan and no flower
            const no_zifa_results = c_no_zifa(
                has_flower,
                has_fan,
                dui_dui_results.type_of_hu,
                template_values,
                template_enabled_values
            );
            temp_value += no_zifa_results.value;
            add_to_log(no_zifa_results.log, temp_logs);
            counted_no_zifa = no_zifa_results.counted;

            //Correct fan and flower seat
            if (counted_flower_pos && counted_fan_pos) {
                temp_value += defaultValues.flower_wind_seat_value_add_on_value;
                add_to_log(
                    `正花正位再加 ${defaultValues.flower_wind_seat_value_add_on_value}`,
                    temp_logs
                );
            }

            //16bd
            const sixteenbd_results = c_16bd(
                this.curr_validated_tiles,
                this.door_clear,
                template_values,
                template_enabled_values
            );
            temp_value += sixteenbd_results.value;
            add_to_log(sixteenbd_results.log, temp_logs);
            counted_16bd = sixteenbd_results.counted;

            //13 waist
            const thirteen_waist_results = c_13waist(
                this.curr_validated_tiles,
                this.door_clear,
                template_values,
                template_enabled_values
            );
            temp_value += thirteen_waist_results.value;
            add_to_log(thirteen_waist_results.log, temp_logs);
            counted_13waist = thirteen_waist_results.counted;

            //Ligu
            const ligu_results = c_ligu(
                this.curr_validated_tiles,
                this.door_clear,
                template_values,
                template_enabled_values
            );
            temp_value += ligu_results.value;
            add_to_log(ligu_results.log, temp_logs);
            counted_ligu = ligu_results.counted;

            //duk duk, jia duk
            const duk_duk_results = c_duk_duk_jia_duk_dui_pong(
                this.winning_tile,
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += duk_duk_results.value;
            add_to_log(duk_duk_results.log, temp_logs);
            counted_duk_duk = duk_duk_results.counted;

            //general eyes
            const general_eyes_results = c_general_eyes(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += general_eyes_results.value;
            add_to_log(general_eyes_results.log, temp_logs);
            counted_general_eyes = general_eyes_results.counted;

            //gong
            const gong_results = c_gong_or_4_turtle(
                this.curr_validated_tiles,
                this.winner_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += gong_results.value;
            add_to_log(gong_results.log, temp_logs);
            counted_gong = gong_results.counted;

            //2 or 3 numbers only
            const two_or_three_numbers_results = c_two_or_three_numbers_only(
                this.curr_validated_tiles,
                has_fan,
                template_values,
                template_enabled_values
            );
            temp_value += two_or_three_numbers_results.value;
            add_to_log(two_or_three_numbers_results.log, temp_logs);
            counted_two_or_three_numbers = two_or_three_numbers_results.counted;

            //Only fan tiles
            const only_fan_results = c_only_fan(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += only_fan_results.value;
            add_to_log(only_fan_results.log, temp_logs);
            counted_only_fan = only_fan_results.counted;

            //Only 1 9 tiles
            const only_one_nine_results = c_only_one_or_nine(
                this.curr_validated_tiles,
                has_fan,
                template_values,
                template_enabled_values
            );
            temp_value += only_one_nine_results.value;
            add_to_log(only_one_nine_results.log, temp_logs);
            counted_only_one_nine = only_one_nine_results.counted;

            //Break waist
            const break_waist_results = c_break_waist(
                this.curr_validated_tiles,
                has_fan,
                template_values,
                template_enabled_values
            );
            temp_value += break_waist_results.value;
            add_to_log(break_waist_results.log, temp_logs);
            counted_break_waist = break_waist_results.counted;

            //Test same house
            const same_house_results = c_same_house(
                this.curr_validated_tiles,
                has_fan,
                template_values,
                template_enabled_values
            );
            temp_value += same_house_results.value;
            add_to_log(same_house_results.log, temp_logs);
            counted_same_house = same_house_results.counted;

            //2 house
            const less_door_results = c_less_door(
                this.curr_validated_tiles,
                has_fan,
                template_values,
                template_enabled_values
            );
            temp_value += less_door_results.value;
            add_to_log(less_door_results.log, temp_logs);
            counted_less_door = less_door_results.counted;

            //5 house
            const five_doors_results = c_5_doors(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += five_doors_results.value;
            add_to_log(five_doors_results.log, temp_logs);
            counted_5_doors = five_doors_results.counted;

            //dragons
            const dragons_results = c_dragons(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += dragons_results.value;
            add_to_log(dragons_results.log, temp_logs);
            counted_dragons = dragons_results.counted;

            //Test lao shao
            const lao_shao_results = c_lao_shao(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values,
                dragons_results.pureDragonSuit
            );
            temp_value += lao_shao_results.value;
            add_to_log(lao_shao_results.log, temp_logs);
            counted_lao_shao = lao_shao_results.counted;

            //Test ban gao
            const ban_gao_results = c_ban_gao(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += ban_gao_results.value;
            add_to_log(ban_gao_results.log, temp_logs);
            counted_ban_gao = ban_gao_results.counted;

            //Test bubu gao
            const bu_bu_gao_results = c_step_step_high(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += bu_bu_gao_results.value;
            add_to_log(bu_bu_gao_results.log, temp_logs);
            counted_bu_bu_gao = bu_bu_gao_results.counted;

            //Test sister
            const sister_results = c_sister(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += sister_results.value;
            add_to_log(sister_results.log, temp_logs);
            counted_sister = sister_results.counted;

            //Test sister pong
            const sister_pong_results = c_sister_pong(
                this.curr_validated_tiles,
                template_values,
                template_enabled_values
            );
            temp_value += sister_pong_results.value;
            add_to_log(sister_pong_results.log, temp_logs);
            counted_sister_pong = sister_pong_results.counted;

            //TALLY UP THE RESULTS
            const calculated_points = temp_value;
            temp_value *= multiplier;
            temp_value += base_value;

            if (temp_value > max_value) {
                max_value = temp_value;
                max_logs = temp_logs;
                max_calculated_points = calculated_points;
                winning_deck = this.winner_tiles;
                winning_deck_organized = this.curr_validated_tiles;
            }
        }

        this.final_value = max_value;
        this.logs = max_logs;

        return {
            value: this.final_value,
            log: this.logs,
            winning_deck: winning_deck,
            winning_deck_organized: winning_deck_organized,
            calculated_points: max_calculated_points,
            multiplier: multiplier,
            base_value: base_value,
        };
    }
}

import { ValidatedDeck, CounterResult } from "@/types/counter";

export function c_zhuang(
    is_zhuang: boolean,
    eat_zhuang: boolean,
    lum_zhuang: number,
    template_values: Record<string, number>,
    template_enabled_values: Record<string, boolean>
): CounterResult {
    let temp_value: number = 0;
    let temp_logs: string[] = [];

    if (is_zhuang) {
        if (template_enabled_values.zhuang_value) {
            temp_value += template_values.zhuang_value;
            temp_logs.push(`莊家 +${template_values.zhuang_value}`);
        }
        if (template_enabled_values.multiple_zhuang_value && lum_zhuang > 0) {
            const lum_zhuang_total =
                lum_zhuang * template_values.multiple_zhuang_value;
            temp_value += lum_zhuang_total;
            temp_logs.push(`連莊 ${lum_zhuang}x +${lum_zhuang_total}`);
        }
    }
    if (eat_zhuang) {
        if (template_enabled_values.zhuang_value) {
            temp_value += template_values.zhuang_value;
            temp_logs.push(`食莊家 +${template_values.zhuang_value}`);
        }
        if (template_enabled_values.multiple_zhuang_value && lum_zhuang > 0) {
            const lum_zhuang_total =
                lum_zhuang * template_values.multiple_zhuang_value;
            temp_value += lum_zhuang_total;
            temp_logs.push(`連莊 ${lum_zhuang}x +${lum_zhuang_total}`);
        }
    }
    return { value: temp_value, log: temp_logs, counted: temp_value > 0 };
}

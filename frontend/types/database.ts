import { SupportedLanguage } from "@/language_constants";
import { ValueConstant } from "./counter";

export interface UserSettings {
    name: string;
    theme?: "light" | "dark" | "auto";
    language?: SupportedLanguage;
    profilePic?: string;
}

export interface ScoringTemplate {
    id: number;
    name: string;
    rules: Record<ValueConstant['key'], number>;
    rules_enabled: Record<ValueConstant['key'], boolean>;
    is_default: boolean;
    created_at: string;
}

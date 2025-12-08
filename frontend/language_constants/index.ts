import en from "./en";
import zh from "./zh";

export type SupportedLanguage = "en" | "zh";

const translations = {
    en,
    zh,
};

export function getLanguage(language: SupportedLanguage){
    return translations[language];
}

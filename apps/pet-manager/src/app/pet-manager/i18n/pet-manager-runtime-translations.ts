import { loadTranslations } from '@angular/localize';
import {
    petManagerDefaultLanguage,
    petManagerLanguageStorageKey,
} from './pet-manager-language.constants';
import type { PetManagerLanguageCode } from './pet-manager-language.types';
import enTranslations from './translations/en.json';
import ruTranslations from './translations/ru.json';

type PetManagerTranslationKey = keyof typeof enTranslations;
type PetManagerTranslations = Record<PetManagerTranslationKey, string>;

const translationsByLanguage: Record<
    PetManagerLanguageCode,
    PetManagerTranslations
> = {
    en: enTranslations,
    ru: ruTranslations,
};

export function setupPetManagerTranslations(): void {
    const language = readSelectedLanguage();
    document.documentElement.lang = language;
    loadTranslations(translationsByLanguage[language]);
}

function readSelectedLanguage(): PetManagerLanguageCode {
    const storedValue = localStorage.getItem(petManagerLanguageStorageKey);

    return isSupportedLanguage(storedValue)
        ? storedValue
        : petManagerDefaultLanguage;
}

function isSupportedLanguage(
    value: string | null,
): value is PetManagerLanguageCode {
    return (
        value !== null &&
        Object.prototype.hasOwnProperty.call(translationsByLanguage, value)
    );
}

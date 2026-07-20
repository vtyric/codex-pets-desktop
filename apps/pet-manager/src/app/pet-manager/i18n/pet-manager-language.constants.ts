import type {
    PetManagerLanguageCode,
    PetManagerLanguageOption,
} from './pet-manager-language.types';

export const petManagerLanguageStorageKey = 'codex-pets.manager.language';

export const petManagerDefaultLanguage: PetManagerLanguageCode = 'en';

export const petManagerLanguageOptions: PetManagerLanguageOption[] = [
    {
        code: 'en',
        icon: 'EN',
        label: 'English',
    },
    {
        code: 'ru',
        icon: 'RU',
        label: 'Русский',
    },
];

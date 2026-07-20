export type PetManagerLanguageCode = 'en' | 'ru';

export interface PetManagerLanguageOption {
    readonly code: PetManagerLanguageCode;
    readonly icon: string;
    readonly label: string;
}

import { Injectable, signal } from '@angular/core';
import {
    petManagerDefaultLanguage,
    petManagerLanguageOptions,
    petManagerLanguageStorageKey,
} from './pet-manager-language.constants';
import type { PetManagerLanguageCode } from './pet-manager-language.types';

@Injectable()
export class PetManagerLanguageService {
    readonly options = petManagerLanguageOptions;
    readonly code = signal<PetManagerLanguageCode>(this.readStoredLanguage());

    constructor() {
        this.applyLanguage(this.code());
    }

    setLanguage(code: PetManagerLanguageCode): void {
        if (this.code() === code) {
            return;
        }

        this.code.set(code);
        localStorage.setItem(petManagerLanguageStorageKey, code);
        this.applyLanguage(code);
        window.location.reload();
    }

    private readStoredLanguage(): PetManagerLanguageCode {
        const storedValue = localStorage.getItem(petManagerLanguageStorageKey);

        return isPetManagerLanguageCode(storedValue)
            ? storedValue
            : petManagerDefaultLanguage;
    }

    private applyLanguage(code: PetManagerLanguageCode): void {
        document.documentElement.lang = code;
    }
}

function isPetManagerLanguageCode(
    value: string | null,
): value is PetManagerLanguageCode {
    return petManagerLanguageOptions.some((option) => option.code === value);
}

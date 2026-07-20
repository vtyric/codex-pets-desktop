import { bootstrapApplication } from '@angular/platform-browser';
import { setupPetManagerTranslations } from './app/pet-manager/i18n/pet-manager-runtime-translations';

setupPetManagerTranslations();

void Promise.all([import('./app/app'), import('./app/app.config')])
    .then(([{ App }, { appConfig }]) => bootstrapApplication(App, appConfig))
    .catch((error) => console.error(error));

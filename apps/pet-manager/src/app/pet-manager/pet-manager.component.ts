import { Component, ViewEncapsulation, inject } from '@angular/core';
import { DeletePromptDialogComponent } from './delete-prompt/delete-prompt-dialog.component';
import { PetManagerShellComponent } from './shell/pet-manager-shell.component';
import { PetManagerActionMenuService } from './state/pet-manager-action-menu.service';
import { PetManagerControllerService } from './state/pet-manager-controller.service';
import { PetManagerThemeService } from './theme/pet-manager-theme.service';
import { PetManagerLanguageService } from './i18n/pet-manager-language.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    imports: [DeletePromptDialogComponent, PetManagerShellComponent],
    providers: [
        PetManagerActionMenuService,
        PetManagerControllerService,
        PetManagerLanguageService,
        PetManagerThemeService,
    ],
    selector: 'app-pet-manager',
    styleUrl: './pet-manager.component.scss',
    templateUrl: './pet-manager.component.html',
})
export class PetManagerComponent {
    private readonly manager = inject(PetManagerControllerService);

    constructor() {
        void this.manager.reload();
    }
}

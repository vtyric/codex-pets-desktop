import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { PetManagerControllerService } from '../state/pet-manager-controller.service';

@Component({
    imports: [ButtonModule, CommonModule, DialogModule],
    selector: 'app-delete-prompt-dialog',
    templateUrl: './delete-prompt-dialog.component.html',
})
export class DeletePromptDialogComponent {
    readonly manager = inject(PetManagerControllerService);

    confirmDelete(dialog: Dialog, event: Event): void {
        void this.manager.confirmDelete();
        dialog.close(event);
    }
}

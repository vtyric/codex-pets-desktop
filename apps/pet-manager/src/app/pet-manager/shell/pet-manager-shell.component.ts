import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { PetManagerControllerService } from '../state/pet-manager-controller.service';

@Component({
    imports: [
        ButtonModule,
        CardModule,
        CommonModule,
        FormsModule,
        InputTextModule,
        MenuModule,
        SelectModule,
        TagModule,
        ToolbarModule,
    ],
    selector: 'app-pet-manager-shell',
    templateUrl: './pet-manager-shell.component.html',
})
export class PetManagerShellComponent {
    readonly manager = inject(PetManagerControllerService);
}

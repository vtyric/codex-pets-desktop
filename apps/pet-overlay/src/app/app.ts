import { Component } from '@angular/core';
import { PetOverlayComponent } from './pet-overlay/pet-overlay.component';

@Component({
    imports: [PetOverlayComponent],
    selector: 'app-root',
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {}

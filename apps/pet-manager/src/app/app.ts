import { Component } from '@angular/core';
import { PetManagerComponent } from './pet-manager/pet-manager.component';

@Component({
    imports: [PetManagerComponent],
    selector: 'app-root',
    template: '<app-pet-manager />',
})
export class App {}

import {
    Component,
    OnDestroy,
    OnInit,
    inject,
    input,
} from '@angular/core';
import { DesktopPet } from '../../domain/desktop-pet';
import { PetResizeHandleComponent } from '../resize/pet-resize-handle.component';
import { PetSpriteAtlasViewService } from './pet-sprite-atlas-view.service';

@Component({
    imports: [PetResizeHandleComponent],
    providers: [PetSpriteAtlasViewService],
    selector: 'app-pet-sprite-atlas',
    templateUrl: './pet-sprite-atlas.component.html',
    styleUrl: './pet-sprite-atlas.component.scss',
})
export class PetSpriteAtlasComponent implements OnInit, OnDestroy {
    readonly pet = input.required<DesktopPet>();

    protected readonly view = inject(PetSpriteAtlasViewService);

    ngOnInit(): void {
        this.view.setPet(this.pet());
        this.view.start();
    }

    ngOnDestroy(): void {
        this.view.stop();
    }
}

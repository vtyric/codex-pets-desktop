import type { PetAction } from '@codex-pets-desktop/pet-domain';
import { Subject, type Observable } from 'rxjs';

export class PetActionEvents extends Subject<PetAction> {
    readonly actions$: Observable<PetAction> = this.asObservable();

    emit(action: PetAction): void {
        this.next(action);
    }
}

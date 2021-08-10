import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StesComponentInteractionService {
    public detailsHeaderSubject: Subject<string> = new Subject();
    public navigateAwayAbbrechen: Subject<boolean> = new Subject<boolean>();
    public navigateAwayStep: Subject<boolean> = new Subject<boolean>();
    public dataLengthHeaderSubject: Subject<number> = new Subject();

    updateDetailsHeader(stesId: string) {
        this.detailsHeaderSubject.next(stesId);
    }

    updateDataLengthHeaderSubject(dataLength: number) {
        this.dataLengthHeaderSubject.next(dataLength);
    }

    resetDataLengthHeaderSubject() {
        this.dataLengthHeaderSubject.next(undefined);
    }
}

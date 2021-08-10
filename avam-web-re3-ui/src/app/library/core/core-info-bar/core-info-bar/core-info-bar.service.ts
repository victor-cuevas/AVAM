import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoreInfoBarService {
    private maskInformation$ = new BehaviorSubject<any>([]);

    constructor() {}

    dispatchInformation(data) {
        this.maskInformation$.next(data);
    }

    pullInformation() {
        return this.maskInformation$;
    }

    toggle(show: boolean) {
        document.querySelectorAll('avam-stes-info-bar')[0]['style'].display = show ? 'block' : 'none';
    }
}

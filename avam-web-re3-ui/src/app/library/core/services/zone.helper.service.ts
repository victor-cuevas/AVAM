import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import CoreUtils from '../utils/core.utils';

@Injectable()
export class ZoneHelperService {
    onEvent: Subject<any> = new Subject();
    constructor(private ngZone: NgZone) {}

    runOutsideAngular(fncb) {
        if (CoreUtils.isFunction(fncb)) {
            this.ngZone.runOutsideAngular(() => {
                fncb();
            });
        }
    }

    run(fncb) {
        if (CoreUtils.isFunction(fncb)) {
            this.ngZone.run(() => {
                fncb();
            });
        }
    }
}

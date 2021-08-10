import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// @Deprecated: please use MessageBus
@Injectable()
export class UnternehmenDataService {
    private subject = new Subject<any>();

    sendData(unternehmen: any) {
        this.subject.next(unternehmen);
    }

    clearData() {
        this.subject.next();
    }

    getData(): Observable<any> {
        return this.subject.asObservable();
    }
}

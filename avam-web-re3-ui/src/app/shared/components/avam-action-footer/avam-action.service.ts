import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AvamActionService {
    private subject = new Subject<any>();

    sendCollapsed(collapsed: boolean) {
        this.subject.next(collapsed);
    }

    getCollapsed(): Observable<any> {
        return this.subject.asObservable();
    }
}

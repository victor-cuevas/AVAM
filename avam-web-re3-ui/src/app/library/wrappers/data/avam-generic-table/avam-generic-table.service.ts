import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
//
@Injectable()
export class AvamGenericTableService {
    private data = new BehaviorSubject<any>(false);
    private sortSource = new BehaviorSubject<any>(false);
    private resizeSource = new Subject<any>();
    private selectedSource = new Subject<any>();
    private stateSource = new BehaviorSubject<any>(false);

    resizeSource$ = this.resizeSource.asObservable();
    sortSource$ = this.sortSource.asObservable();
    data$ = this.data.asObservable();
    selectedSource$ = this.selectedSource.asObservable();
    stateSource$ = this.stateSource.asObservable();

    constructor() {}

    onStateSource(data) {
        this.stateSource.next(data);
    }

    onSelectedSource(data) {
        this.selectedSource.next(data);
    }

    onDataChange(data) {
        this.data.next(data);
    }

    onSortChange(data: boolean) {
        this.sortSource.next(data);
    }

    onResizeSource(data) {
        this.resizeSource.next(data);
    }
}

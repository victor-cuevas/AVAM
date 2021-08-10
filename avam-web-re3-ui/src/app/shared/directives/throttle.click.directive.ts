import {
    Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit,
    Output
} from '@angular/core';
import { throttleTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Directive({
    selector: '[throttleClick]'
})
export class ThrottleClickDirective implements OnInit, OnDestroy {
    @Input()
    throttleTime = 1000;

    @Output()
    throttleClick = new EventEmitter();

    private clicks = new Subject();
    private subscription: Subscription;

    constructor() { }

    ngOnInit() {
        this.subscription = this.clicks.pipe(
            throttleTime(this.throttleTime)
        ).subscribe(e => this.throttleClick.emit(e));
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    @HostListener('click', ['$event'])
    clickEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this.clicks.next(event);
    }
}

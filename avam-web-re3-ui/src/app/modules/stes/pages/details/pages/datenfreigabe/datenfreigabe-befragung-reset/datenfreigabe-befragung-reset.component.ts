import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-datenfreigabe-befragung-reset',
    templateUrl: './datenfreigabe-befragung-reset.component.html',
    styleUrls: ['./datenfreigabe-befragung-reset.component.scss']
})
export class DatenfreigabeBefragungResetComponent implements OnInit {
    @Output() reset: EventEmitter<boolean> = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    resetBefragung(reset: boolean) {
        this.reset.emit(reset);
    }
}

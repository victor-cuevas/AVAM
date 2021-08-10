import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-result-count',
    templateUrl: './result-count.component.html',
    styleUrls: ['./result-count.component.scss']
})
export class ResultCountComponent {
    @Input() set dataLength(resultsCount: number) {
        this.allResults = resultsCount;
    }

    @Input() isInfoleiste = false;
    @Input() isJobMeldung = false;
    resultsCount: string;
    allResults: number;

    constructor() {}
}

import { Component, Input } from '@angular/core';

@Component({
    selector: 'avam-unternehmen-suchen-page',
    templateUrl: './unternehmen-suchen-page.component.html',
    styleUrls: []
})
export class UnternehmenSuchenPageComponent {
    @Input() stateKey: string;
}

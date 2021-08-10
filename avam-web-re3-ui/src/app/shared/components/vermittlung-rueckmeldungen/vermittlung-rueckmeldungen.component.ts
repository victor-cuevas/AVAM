import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'avam-vermittlung-rueckmeldungen',
    templateUrl: './vermittlung-rueckmeldungen.component.html'
})
export class VermittlungRueckmeldungenComponent {
    @Input() formGroup: FormGroup;
    @Input() vermittlungsergebnisLabels = [];
}

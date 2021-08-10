import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';

@Component({
    selector: 'avam-vermittlung-data-panel',
    templateUrl: './vermittlung-data-panel.component.html',
    styleUrls: ['./vermittlung-data-panel.component.scss']
})
export class VermittlungDataPanelComponent {
    @ViewChildren('radioBtns') radioBtns: QueryList<ElementRef>;

    @Input() formGroup: FormGroup;
    @Input() vermittlungsartId: number;
    @Input() radioButtonOptions = [];
    @Input() vermittlungsartLabels = [];
    @Input() zuweisungStatusLabels = [];
    @Input() calendarDisabled: boolean;

    @Output() radioValueCodeChanged = new EventEmitter<number>();
    @Output() radioWithDateSelected = new EventEmitter<number>();

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    checkedRadioButton(index: number): boolean {
        this.radioValueCodeChanged.emit(index);
        return this.vermittlungsartId === this.radioButtonOptions[index].codeId;
    }

    isRadioWithDateSelected(index: number): void {
        this.radioWithDateSelected.emit(index);
    }
}

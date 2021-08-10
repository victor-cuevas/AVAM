import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'avam-beschaeftigungsgrad-range-select',
    templateUrl: './beschaeftigungsgrad-range-select.component.html',
    styleUrls: ['./beschaeftigungsgrad-range-select.component.scss']
})
export class BeschaeftigungsgradRangeSelectComponent implements OnInit {
    @Input() placeholderFrom: string;
    @Input() placeholderTo: string;
    @Input() inputClass: string;
    @Input() parentForm: FormGroup;
    @Input() controlNameFrom: any;
    @Input() controlNameTo: any;
    @Input() isDisabled: boolean;
    @Input() readOnly = false;
    @Input() id: string;
    @Input() hideEmptyOptionTo: boolean;
    @Input() hideEmptyOptionFrom: boolean;
    @Input() optionsStart = 0;
    @Input() optionsEnd = 100;
    @Input() optionsStep = 5;

    @Output() onChangeFrom: EventEmitter<any> = new EventEmitter();
    @Output() onChangeТо: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    optionsFrom = [];
    optionsTo = [];
    selectLabel = 'common.label.prozentzeichen';
    valueFrom: string;
    valueTo: string;
    tooltipFrom: string;
    tooltipTo: string;

    constructor(private translate: TranslateService, private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        this.generateOptions();
    }

    changeFrom(value: string) {
        this.valueFrom = value;
        this.tooltipFrom = this.valueFrom ? this.translate.instant('stes.matching.tooltip.matchingBeschaeftigungsgradVon') : '';
        if (+this.valueFrom > +this.valueTo) {
            this.parentForm.get(this.controlNameTo).setValue(this.valueFrom);
        }
        this.optionsTo = this.optionsFrom.filter(option => option.value >= this.valueFrom);
        this.onChangeFrom.emit(value);
    }

    changeTo(value: string) {
        this.valueTo = value;
        this.tooltipTo = this.valueTo ? this.translate.instant('stes.matching.tooltip.matchingBeschaeftigungsgradBis') : '';
        this.onChangeТо.emit(value);
    }

    getReadOnlyValue() {
        return [this.valueFrom, this.valueTo].join(' - ');
    }

    generateOptions() {
        const range = this.generateNumbers(this.optionsStart, this.optionsEnd, this.optionsStep);
        this.optionsFrom = range.map(el => {
            return {
                value: el,
                codeId: el,
                labelFr: el,
                labelIt: el,
                labelDe: el,
                code: el
            };
        });
        this.optionsTo = this.optionsFrom.slice();
    }

    generateNumbers(start: number, end: number, step: number) {
        return Array.from({ length: (end - start + step) / step }, (v, k) => k * step + start);
    }
}

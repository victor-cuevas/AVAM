import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { DateRangeReactiveFormsService } from './date-range-reactive-forms.service';
import { DateRangeHandlerService } from './date-range-handler.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-date-range-form',
    templateUrl: './date-range-form.component.html',
    providers: [DateRangeHandlerService, DateRangeReactiveFormsService]
})
export class DateRangeFormComponent implements OnChanges, OnInit {
    @Input('data') data = null;
    @Input('label') label = 'amm.massnahmen.label.gueltig';
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Output() onDataRefresh: EventEmitter<any> = new EventEmitter();
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    public formGroup: FormGroup;

    constructor(private handler: DateRangeHandlerService, private form: DateRangeReactiveFormsService, private obliqueHelper: ObliqueHelperService) {
        this.formGroup = form.searchForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            if (this.data && this.data.state) {
                this.formGroup.reset(this.mapToForm(this.data.state));
            }
        }
    }

    mapToDTO() {
        return this.handler.mapToDTO();
    }

    mapToForm(data) {
        return this.handler.mapToForm(data);
    }

    isValid() {
        return this.formGroup.valid;
    }

    refresh() {
        this.onDataRefresh.emit();
    }
}

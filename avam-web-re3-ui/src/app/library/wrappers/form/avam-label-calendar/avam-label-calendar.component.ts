import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { deLocale, itLocale, frLocale } from 'ngx-bootstrap/locale';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { WrappersBaseComponent } from '../../wrappers-base';
defineLocale('de', deLocale);
defineLocale('fr', frLocale);
defineLocale('it', itLocale);

@Component({
    selector: 'avam-label-calendar',
    templateUrl: './avam-label-calendar.component.html',
    styleUrls: ['./avam-label-calendar.component.scss']
})
export class AvamLabelCalendarComponent extends WrappersBaseComponent implements OnInit {
    @Input() calendarLabel: string;

    @Input() inputClass: string;

    @Input() inputPlaceholder: string;

    @Input() id: string;

    @Input() bsConfig = { dateInputFormat: 'DD.MM.YYYY' };

    @Input() coreReadOnly = false;

    @Input() isFocused: boolean;

    @Input() tooltip: string;

    @Input() customClassReadonly: string;

    @Output() dateChange: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    private inputValue = '';

    constructor(private controlContainer: ControlContainer, private formUtils: FormUtilsService, private obliqueHelper: ObliqueHelperService, private cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        if (!this.id) {
            throw new Error('You need to specify id for this component!');
        }
        if (this.controlContainer) {
            if (!this.controlName) {
                throw new Error('Missing FormControlName directive from host element of the component');
            }
        } else {
            throw new Error('Cant find parent FormGroup directive');
        }
    }

    onValueChange(value) {
        this.inputValue = this.formUtils.formatDateNgx(value, 'DD.MM.YYYY');
        this.dateChange.emit(value);
    }
}

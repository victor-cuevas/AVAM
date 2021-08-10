import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { AvamLabelCalendarComponent } from '@app/library/wrappers/form/avam-label-calendar/avam-label-calendar.component';
import { DateValidator } from '@shared/validators/date-validator';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'app-stes-termin-angaben-form',
    templateUrl: './termin-angaben-form.component.html',
    providers: [ObliqueHelperService]
})
export class TerminAngabenFormComponent implements OnInit {
    angabenForm: FormGroup;
    artDropDownOptions: any[] = [];
    statusDropDownOptions: any[] = [];

    @Input() initArtValue = null;
    @Input() initStatusValue = null;
    @ViewChild('calendarComponent') calendarComponent: AvamLabelCalendarComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    constructor(private formBuilder: FormBuilder, private formUtils: FormUtilsService, private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.angabenForm = this.formBuilder.group(
            {
                datum: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                zeitVon: [null, [Validators.required, DateValidator.val250, DateValidator.val251]],
                zeitBis: [null, [Validators.required, DateValidator.val250, DateValidator.val251]],
                ort: [null, Validators.required],
                art: this.initArtValue,
                betreff: null,
                status: this.initStatusValue
            },
            { validators: [DateValidator.val006, DateValidator.dateBiggerThanTodayWarning('datum', 'val067')] }
        );
    }

    resetForm() {
        this.angabenForm.reset();
    }

    get controls() {
        return this.angabenForm.controls;
    }

    get datum() {
        return this.controls.datum.value;
    }

    set datum(_datum: any) {
        this.controls.datum.setValue(this.formUtils.parseDate(_datum));
    }

    get zeitVon() {
        return this.controls.zeitVon.value;
    }

    set zeitVon(_zeitVon: string) {
        this.controls.zeitVon.setValue(_zeitVon);
    }

    get zeitBis() {
        return this.controls.zeitBis.value;
    }

    set zeitBis(_zeitBis: string) {
        this.controls.zeitBis.setValue(_zeitBis);
    }

    get ort() {
        return this.controls.ort.value;
    }

    set ort(_ort: string) {
        this.controls.ort.setValue(_ort);
    }

    get art() {
        return this.controls.art.value;
    }

    set art(_art: number) {
        this.controls.art.setValue(Number(_art));
    }

    get betreff() {
        return this.controls.betreff.value;
    }

    set betreff(_betreff: string) {
        this.controls.betreff.setValue(_betreff);
    }

    get status() {
        return this.controls.status.value;
    }

    set status(_status: number) {
        this.controls.status.setValue(Number(_status));
    }
}

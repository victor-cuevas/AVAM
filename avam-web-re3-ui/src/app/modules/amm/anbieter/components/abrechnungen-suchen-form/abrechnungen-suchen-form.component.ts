import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { AbrechnungenSuchenHandlerService } from './abrechnungen-suchen-handler.service';
import { AbrechnungenSuchenReactiveFormService } from './abrechnungen-suchen-reactive-form.service';
import { FormGroup, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-abrechnungen-suchen-form',
    templateUrl: './abrechnungen-suchen-form.component.html',
    styleUrls: ['./abrechnungen-suchen-form.component.scss'],
    providers: [AbrechnungenSuchenHandlerService, AbrechnungenSuchenReactiveFormService]
})
export class AbrechnungenSuchenFormComponent implements OnInit, OnChanges {
    @Input() statusOptions: CodeDTO[];
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public formGroup: FormGroup;

    disableInputs: boolean;
    statusDropdownLabels = [];

    constructor(
        private handler: AbrechnungenSuchenHandlerService,
        private reactiveForm: AbrechnungenSuchenReactiveFormService,
        private obliqueHelper: ObliqueHelperService,
        private fehlermeldungenService: FehlermeldungenService,
        private infopanelService: AmmInfopanelService,
        private facade: FacadeService
    ) {
        this.formGroup = reactiveForm.abrechnungSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.statusOptions.currentValue) {
            this.statusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.statusOptions);
        }
    }

    reset() {
        this.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.formGroup.reset();
        this.toggleEnabledInputs({ target: { value: this.formGroup.controls.abrechnungNr.value } });
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const abrechnungNrValue = event.target ? event.target.value : event;
        this.disableInputs = abrechnungNrValue ? true : false;
    }

    onDateChange(event, formControl: string) {
        const control = this.formGroup.controls[formControl];
        if (event) {
            control.setValidators([Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            control.updateValueAndValidity();
        } else {
            control.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            control.updateValueAndValidity();
        }
    }

    mapToForm(values) {
        this.formGroup.reset(this.handler.mapToForm(values));
    }

    mapToDTO() {
        return this.handler.mapToDTO();
    }
}

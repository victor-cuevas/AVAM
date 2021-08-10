import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { AbrechnungswertSuchenHandlerService } from './abrechnungswert-suchen-handler.service';
import { AbrechnungswertSuchenReactiveFormService } from './abrechnungswert-suchen-reactive-form.service';
import { FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AbrechnungswertSuchenParamDTO } from '@app/shared/models/dtos-generated/abrechnungswertSuchenParamDTO';
import { DateValidator } from '@app/shared/validators/date-validator';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { AmmAlleKeinerCodeEnum } from '@app/shared/enums/domain-code/amm-alle-keiner-code.enum';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-abrechnungswert-suchen-form',
    templateUrl: './abrechnungswert-suchen-form.component.html',
    styleUrls: ['./abrechnungswert-suchen-form.component.scss'],
    providers: [AbrechnungswertSuchenHandlerService, AbrechnungswertSuchenReactiveFormService]
})
export class AbrechnungswertSuchenFormComponent implements OnInit, OnChanges {
    @Input() abrechnungswertData = null;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public formGroup: FormGroup;
    statusDropdownLabels = [];
    abrechnungswerteDropdownLabels = [];
    nurAktuelleDropdownLabels = [];
    disableFields = false;
    keinerCode = AmmAlleKeinerCodeEnum.KEINER;
    neinCode = JaNeinCodeEnum.NEIN;

    constructor(
        private handler: AbrechnungswertSuchenHandlerService,
        private reactiveForm: AbrechnungswertSuchenReactiveFormService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService
    ) {
        this.formGroup = reactiveForm.abrechnungswertSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.abrechnungswertData.currentValue) {
            this.statusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.abrechnungswertData.abrechnungswertParam.enabledStati);
            this.abrechnungswerteDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.abrechnungswertData.abrechnungswerteOptions);
            this.nurAktuelleDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.abrechnungswertData.nurAktuelleOptions);
            if (this.abrechnungswertData.state) {
                this.formGroup.reset(this.handler.mapToForm(this.abrechnungswertData.state));
            } else {
                this.formGroup.reset(this.handler.mapDefaultValues());
            }
        }
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const value = event.target ? event.target.value : event;
        this.disableFields = value ? true : false;
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

    mapToDTO(): AbrechnungswertSuchenParamDTO {
        return this.handler.mapToDTO(this.abrechnungswertData.abrechnungswertParam);
    }

    mapFields(): AbrechnungswertSuchenParamDTO {
        const controls = this.formGroup.controls;
        const fields = {
            ...this.handler.mapToDTO(this.abrechnungswertData.abrechnungswertParam),
            sucheAlleAbrechnungswerte: controls.sucheAlleAbrechnungswerte.value === AmmAlleKeinerCodeEnum.ALLE ? 'true' : 'false',
            sucheNurAktuelleAbrechnungswerte: controls.sucheNurAktuelleAbrechnungswerte.value === JaNeinCodeEnum.JA ? 'true' : 'false'
        };

        return fields;
    }

    reset() {
        this.formGroup.reset(this.handler.mapDefaultValues());
        this.toggleEnabledInputs({ target: { value: this.formGroup.controls.abrechnungswertNr.value } });
        this.toggleEnabledInputs({ target: { value: this.formGroup.controls.profilNr.value } });
    }
}

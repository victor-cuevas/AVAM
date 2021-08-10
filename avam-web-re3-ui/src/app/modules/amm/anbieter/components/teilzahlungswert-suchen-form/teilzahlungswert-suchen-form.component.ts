import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { TeilzahlungswertSuchenHandlerService } from './teilzahlungswert-suchen-handler.service';
import { TeilzahlungswertSuchenReactiveFormService } from './teilzahlungswert-suchen-reactive-form.service';
import { ZahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/zahlungenSuchenParameterDTO';
import { AmmAlleKeinerCodeEnum } from '@app/shared/enums/domain-code/amm-alle-keiner-code.enum';

@Component({
    selector: 'avam-teilzahlungswert-suchen-form',
    templateUrl: './teilzahlungswert-suchen-form.component.html',
    styleUrls: ['./teilzahlungswert-suchen-form.component.scss'],
    providers: [TeilzahlungswertSuchenHandlerService, TeilzahlungswertSuchenReactiveFormService]
})
export class TeilzahlungswertSuchenFormComponent implements OnInit, OnChanges {
    @Input() teilzahlungswertData = null;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    statusDropdownLabels = [];
    teilzahlungswerteDropdownLabels = [];
    nurAktuelleDropdownLabels = [];

    disableFields = false;

    keinerCode = AmmAlleKeinerCodeEnum.KEINER;
    neinCode = JaNeinCodeEnum.NEIN;

    constructor(
        private handler: TeilzahlungswertSuchenHandlerService,
        private reactiveForm: TeilzahlungswertSuchenReactiveFormService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService
    ) {
        this.formGroup = reactiveForm.teilzahlungswertSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.teilzahlungswertData.currentValue) {
            this.statusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.teilzahlungswertData.statusOptions);
            this.teilzahlungswerteDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.teilzahlungswertData.teilzahlungswerteOptions);
            this.nurAktuelleDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.teilzahlungswertData.nurAktuelleOptions);
            if (this.teilzahlungswertData.state) {
                this.formGroup.reset(this.handler.mapToForm(this.teilzahlungswertData.state));
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

    mapToDTO(): ZahlungenSuchenParameterDTO {
        return this.handler.mapToDTO();
    }

    reset() {
        this.formGroup.reset(this.handler.mapDefaultValues());
        this.toggleEnabledInputs({ target: { value: this.formGroup.controls.teilzahlungswertNr.value } });
        this.toggleEnabledInputs({ target: { value: this.formGroup.controls.profilNr.value } });
    }

    mapFields(): ZahlungenSuchenParameterDTO {
        const controls = this.formGroup.controls;
        const fields = {
            ...this.handler.mapToDTO(),
            sucheAlleTeilzahlungswerte: controls.sucheAlleTeilzahlungswerte.value === AmmAlleKeinerCodeEnum.ALLE,
            sucheNurAktuelleTeilzahlungswerte: controls.sucheNurAktuelleTeilzahlungswerte.value === JaNeinCodeEnum.JA
        };

        return fields;
    }
}

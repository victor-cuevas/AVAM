import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AbrechnungswertGrunddatenReactiveFormsService } from './abrechnungswert-grunddaten-reactive-forms.service';
import { AbrechnungswertGrunddatenHandlerService } from './abrechnungswert-grunddaten-handler.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { FacadeService } from '@app/shared/services/facade.service';
import { AbrechnungswertDTO } from '@app/shared/models/dtos-generated/abrechnungswertDTO';
import { Subject } from 'rxjs';
import { AbrechnungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungswertBearbeitenParameterDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';

@Component({
    selector: 'avam-abrechnungswert-grunddaten-form',
    templateUrl: './abrechnungswert-grunddaten-form.component.html',
    styleUrls: ['./abrechnungswert-grunddaten-form.component.scss'],
    providers: [AbrechnungswertGrunddatenHandlerService, AbrechnungswertGrunddatenReactiveFormsService]
})
export class AbrechnungswertGrunddatenFormComponent implements OnInit, OnChanges {
    @Input() formData = null;
    @Output() abrechnungswertSelected: EventEmitter<number> = new EventEmitter();
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    public formGroup: FormGroup;
    benutzerType = BenutzerAutosuggestType.BENUTZER_ALLE;

    abrechnungswert: AbrechnungswertDTO = null;
    yesNoDropdownLabels = [];

    fields: Subject<any[]> = new Subject();
    fieldsEnum = AbrechnungswertBearbeitenParameterDTO.EnabledFieldsEnum;

    constructor(
        private handler: AbrechnungswertGrunddatenHandlerService,
        private reactiveForms: AbrechnungswertGrunddatenReactiveFormsService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService,
        private ammHelper: AmmHelper
    ) {
        this.formGroup = this.reactiveForms.grunddatenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.formData.currentValue) {
            this.abrechnungswert = this.formData.abrechnungswertParam.abrechnungswert;
            this.fields.next(this.formData.abrechnungswertParam.enabledFields);
            this.yesNoDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.formData.yesNoOptions);
            this.mapToForm();
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.mapToForm();
            });
        }
    }

    mapToForm() {
        this.formGroup.reset(this.handler.mapToForm(this.formData.abrechnungswertParam));
        if (this.abrechnungswert.abrechnungswertId === 0) {
            this.appendCurrentUser();
        }
    }

    mapToDTO(): AbrechnungswertDTO {
        return this.handler.mapToDTO(this.abrechnungswert);
    }

    appendCurrentUser() {
        this.formGroup.controls.pruefungDurch.setValue(this.ammHelper.getCurrentUserForAutosuggestDto());
    }

    vorgaengerNachvolgerSelected(abrechnungswertId: number) {
        this.abrechnungswertSelected.emit(abrechnungswertId);
    }

    handleAbrechnungClear(event) {
        if (event && event.target && event.target.value === '') {
            this.formGroup.patchValue(this.handler.mapToFormAbrechnung(null));
        }
    }

    abrechnungZuordnen(abrechnung: AbrechnungDTO) {
        this.formGroup.patchValue(this.handler.mapToFormAbrechnung(abrechnung));
        this.formGroup.markAsDirty();
    }
}

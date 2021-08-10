import { Component, OnInit, ViewChild, SimpleChanges, OnChanges, Input } from '@angular/core';
import { AnbieterAbrechnungHandlerService } from './anbieter-abrechnung-handler.service';
import { AnbieterAbrechnungReactiveFormsService } from './anbieter-abrechnung-reactive-forms.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AbrechnungBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungBearbeitenParameterDTO';
import { AbrechnungDTO } from '@app/shared/models/dtos-generated/abrechnungDTO';
import { Subject } from 'rxjs';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-anbieter-abrechnung-form',
    templateUrl: './anbieter-abrechnung-form.component.html',
    styleUrls: ['./anbieter-abrechnung-form.component.scss'],
    providers: [AnbieterAbrechnungHandlerService, AnbieterAbrechnungReactiveFormsService]
})
export class AnbieterAbrechnungFormComponent implements OnInit, OnChanges {
    @Input() abrechnungParam: AbrechnungBearbeitenParameterDTO;

    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;

    public formGroup: FormGroup;
    benutzerType = BenutzerAutosuggestType.BENUTZER;
    bearbeiterSuchenTokens = {};
    freigeberSuchenTokens = {};

    statusDropdownLabels = [];

    fields: Subject<any[]> = new Subject();
    fieldsEnum = AbrechnungBearbeitenParameterDTO.EnabledFieldsEnum;

    constructor(
        private handler: AnbieterAbrechnungHandlerService,
        private reactiveForms: AnbieterAbrechnungReactiveFormsService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService,
        private ammHelper: AmmHelper
    ) {
        this.formGroup = reactiveForms.abrechnungForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.abrechnungParam.currentValue) {
            this.fields.next(this.abrechnungParam.enabledFields);
            this.statusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.abrechnungParam.enabledStati);
            this.formGroup.reset(this.handler.mapToForm(this.abrechnungParam));
            this.setBenutzerTokens(this.abrechnungParam.abrechnung);
            if (!this.formGroup.controls.bearbeitungDurch.value) {
                this.appendCurrentUser();
            }
        }
    }

    setBenutzerTokens(abrechnungDto?: AbrechnungDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = abrechnungDto ? (abrechnungDto.ownerId ? abrechnungDto.ownerId : currentUser.benutzerstelleId) : currentUser.benutzerstelleId;

        if (currentUser) {
            this.bearbeiterSuchenTokens = {
                berechtigung: Permissions.AMM_ZAHLUNG_ABRECHNUNG_KOPF_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId,
                benutzerstelleId
            };

            this.freigeberSuchenTokens = {
                berechtigung: Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN,
                myBenutzerstelleId: benutzerstelleId,
                benutzerstelleId
            };
        }
    }

    reset(isChanged = false, callback?) {
        if (this.formGroup.dirty || isChanged) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.abrechnungParam));
                if (!this.formGroup.controls.bearbeitungDurch.value) {
                    this.appendCurrentUser();
                }
                callback();
            });
        }
    }

    appendCurrentUser() {
        this.formGroup.controls.bearbeitungDurch.setValue(this.ammHelper.getCurrentUserForAutosuggestDto());
    }

    mapToDTO(): AbrechnungBearbeitenParameterDTO {
        return this.handler.mapToDTO(this.abrechnungParam);
    }
}

import { Permissions } from '@shared/enums/permissions.enum';
import { TeilzahlungBearbeitenParameterDTO } from '@dtos/teilzahlungBearbeitenParameterDTO';
import { TeilzahlungFormModeService } from './teilzahlung-form-mode.service';
import { FacadeService } from '@shared/services/facade.service';
import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { FormGroupDirective, FormGroup } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { TeilzahlungFormHandlerService } from './teilzahlung-handler.service';
import { TeilzahlungReactiveFormsService } from './teilzahlung-reactive-forms.service';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DropdownOption } from '@app/shared/services/forms/form-utils.service';
import { ActivatedRoute } from '@angular/router';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { Subscription, Subject } from 'rxjs';
import { AbrechnungBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/abrechnungBearbeitenParameterDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

export interface TeilzahlungData {
    tzParamDto: TeilzahlungBearbeitenParameterDTO;
    hasTableDataChanged?: boolean;
}
@Component({
    selector: 'avam-teilzahlung-form',
    templateUrl: './teilzahlung-form.component.html',
    providers: [TeilzahlungFormHandlerService, TeilzahlungReactiveFormsService, TeilzahlungFormModeService, ObliqueHelperService]
})
export class TeilzahlungFormComponent implements OnInit, OnChanges {
    @Input('data') teilzahlungData: TeilzahlungData;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('bearbeitungDurch') bearbeitungDurch: AvamPersonalberaterAutosuggestComponent;

    formGroup: FormGroup;
    benutzerType = BenutzerAutosuggestType.BENUTZER;
    bearbeitungDurchSuchenTokens = {};
    freigabeDurchSuchenTokens = {};
    statusDropdownOptions: DropdownOption[] = [];
    tzParamDto: TeilzahlungBearbeitenParameterDTO;
    currentFormMode: FormModeEnum;
    modeSubscription: Subscription;
    fields: Subject<any[]> = new Subject();
    fieldsEnum = AbrechnungBearbeitenParameterDTO.EnabledFieldsEnum;

    constructor(
        private facade: FacadeService,
        private handler: TeilzahlungFormHandlerService,
        private formMode: TeilzahlungFormModeService,
        private reactiveForms: TeilzahlungReactiveFormsService,
        private obliqueHelperService: ObliqueHelperService,
        private route: ActivatedRoute,
        private ammHelper: AmmHelper
    ) {
        this.formGroup = this.reactiveForms.tzform;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.teilzahlungData.currentValue && this.teilzahlungData.tzParamDto) {
            this.tzParamDto = this.teilzahlungData.tzParamDto;
            this.fields.next(this.tzParamDto.enabledFields);
            this.statusDropdownOptions = this.facade.formUtilsService.mapDropdown(this.tzParamDto.enabledStati);
            this.formGroup.reset(this.handler.mapToForm(this.tzParamDto));

            if (this.currentFormMode === FormModeEnum.CREATE) {
                this.formGroup.controls.bearbeitungDurch.setValue(this.ammHelper.getCurrentUserForAutosuggestDto());
            }

            // If a record was added or removed from the Teilzahlungswerte table, the form should be marked manually as dirty
            if (this.teilzahlungData.hasTableDataChanged) {
                this.formGroup.markAsDirty();
            }
        }
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;

        this.route.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });

        this.initializeBenutzerTokens();
    }

    initializeBenutzerTokens() {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = currentUser.benutzerstelleId;

        if (currentUser) {
            this.bearbeitungDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_ZAHLUNG_ABRECHNUNG_KOPF_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId
            };

            this.freigabeDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN,
                myBenutzerstelleId: benutzerstelleId
            };
        }
    }

    reset(isChanged = false, callback?) {
        if (this.formGroup.dirty || isChanged) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.tzParamDto));

                if (this.currentFormMode === FormModeEnum.CREATE) {
                    this.bearbeitungDurch.appendCurrentUser();
                }

                if (callback) {
                    callback();
                }
            });
        }
    }

    mapToDTO(): TeilzahlungBearbeitenParameterDTO {
        // BSP3
        if (!this.formGroup.controls.bearbeitungDurch.value) {
            this.bearbeitungDurch.appendCurrentUser();
        }

        return this.handler.mapToDTO(this.teilzahlungData.tzParamDto);
    }
}

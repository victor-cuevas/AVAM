import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { JaNeinCodeEnum } from '@app/shared/enums/domain-code/amm-ja-nein-code.enum';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { RahmenvertragDTO } from '@app/shared/models/dtos-generated/rahmenvertragDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { DropdownOption } from '@app/shared/services/forms/form-utils.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Subscription } from 'rxjs';
import { RahmenvertragFormModeService } from './rahmenvertrag-form-mode.service';
import { RahmenvertragFormHandlerService } from './rahmenvertrag-handler.service';
import { RahmenvertragReactiveFormsService } from './rahmenvertrag-reactive-forms.service';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';

export interface RahmenvertragData {
    rahmenvertragDto?: RahmenvertragDTO;
    statusOptions?: CodeDTO[];
    gueltigOptions?: CodeDTO[];
    massnahmeOptions?: StrukturElementDTO[];
    leistungsvereinbarungen?: LeistungsvereinbarungDTO[];
}

@Component({
    selector: 'avam-rahmenvertrag-form',
    templateUrl: './rahmenvertrag-form.component.html',
    providers: [RahmenvertragFormHandlerService, RahmenvertragReactiveFormsService, RahmenvertragFormModeService, ObliqueHelperService]
})
export class RahmenvertragFormComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('bearbeitungDurch') bearbeitungDurch: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() rahmenvertragData: RahmenvertragData;

    statusDropdownOptions: DropdownOption[] = [];
    massnhamentypMultiselectOptions: any[];
    gueltigDropdownOptions: DropdownOption[] = [];
    formGroup: FormGroup;
    bearbeitungDurchSuchenTokens = {};
    freigabeDurchSuchenTokens = {};
    benutzerType = BenutzerAutosuggestType.BENUTZER;
    currentFormMode: FormModeEnum;
    pendentId: number;
    modeSubscription: Subscription;
    nachfolgerObject: RahmenvertragDTO;
    jaNeinEnum = JaNeinCodeEnum;
    rahmenvertragDto: RahmenvertragDTO;
    isGueltigNein: boolean;

    constructor(
        private reactiveForms: RahmenvertragReactiveFormsService,
        private facade: FacadeService,
        private handler: RahmenvertragFormHandlerService,
        private formMode: RahmenvertragFormModeService,
        private ammHelper: AmmHelper,
        private obliqueHelperService: ObliqueHelperService,
        private route: ActivatedRoute
    ) {
        this.formGroup = this.reactiveForms.rahmenvertragForm;
    }

    ngOnInit() {
        this.initializeBenutzerTokens();
        this.route.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
        this.obliqueHelperService.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.rahmenvertragData.currentValue) {
            this.rahmenvertragDto = this.rahmenvertragData.rahmenvertragDto;

            if (this.currentFormMode === FormModeEnum.CREATE) {
                this.mapCreateData();
                this.formGroup.controls.bearbeitungDurch.setValue(this.ammHelper.getCurrentUserForAutosuggestDto());
            } else {
                this.mapEditData();
            }
        }
    }

    mapCreateData() {
        if (this.rahmenvertragData) {
            const pendentOption = this.rahmenvertragData.statusOptions.filter(el => el.code === AmmVierAugenStatusCode.PENDENT);
            const jaOption = this.rahmenvertragData.gueltigOptions.filter(el => el.codeId === +JaNeinCodeEnum.JA);

            this.pendentId = pendentOption[0].codeId;
            this.statusDropdownOptions = this.facade.formUtilsService.mapDropdown(pendentOption);
            this.gueltigDropdownOptions = this.facade.formUtilsService.mapDropdown(jaOption);
            this.massnhamentypMultiselectOptions = this.handler.mapMultiselect(this.rahmenvertragData.massnahmeOptions);
            this.formGroup.reset(this.handler.mapDefaultData(this.pendentId));
        }
    }

    mapEditData() {
        if (this.rahmenvertragData && this.rahmenvertragData.rahmenvertragDto) {
            this.reactiveForms.setAdditionalDateValidators(this.rahmenvertragData.leistungsvereinbarungen);
            this.nachfolgerObject = this.rahmenvertragData.rahmenvertragDto.nachfolgerList[0];
            this.statusDropdownOptions = this.facade.formUtilsService.mapDropdown(this.rahmenvertragData.statusOptions);
            this.gueltigDropdownOptions = this.facade.formUtilsService.mapDropdown(this.rahmenvertragData.gueltigOptions);
            this.massnhamentypMultiselectOptions = this.handler.mapMultiselect(this.rahmenvertragData.massnahmeOptions);
            this.formGroup.reset(this.handler.mapToForm(this.rahmenvertragData.rahmenvertragDto, this.massnhamentypMultiselectOptions));
            this.isGueltigNein = this.formGroup.controls.gueltigDropdown.value === +this.jaNeinEnum.NEIN;
        }
    }

    initializeBenutzerTokens() {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = currentUser.benutzerstelleId;

        if (currentUser) {
            this.bearbeitungDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_AKQUISITION_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId
            };

            this.freigabeDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN,
                myBenutzerstelleId: benutzerstelleId
            };
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                if (this.currentFormMode === FormModeEnum.CREATE) {
                    this.formGroup.reset(this.handler.mapDefaultData(this.pendentId));
                    this.formGroup.controls.bearbeitungDurch.setValue(this.ammHelper.getCurrentUserForAutosuggestDto());
                    this.massnhamentypMultiselectOptions = this.handler.mapMultiselect(this.rahmenvertragData.massnahmeOptions);
                } else {
                    this.formGroup.reset(this.handler.mapToForm(this.rahmenvertragData.rahmenvertragDto, this.massnhamentypMultiselectOptions));
                }
            });
        }
    }

    mapToDTO(unternehmenId: number): RahmenvertragDTO {
        if (!this.formGroup.controls.bearbeitungDurch.value) {
            this.bearbeitungDurch.appendCurrentUser();
        }

        return this.handler.mapToDTO(unternehmenId, this.rahmenvertragData);
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }
}

import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Component, OnInit, SimpleChanges, OnChanges, Input, ViewChild, OnDestroy } from '@angular/core';
import { LeistungsvereinbarungFormHandlerService } from './leistungsvereinbarung-handler.service';
import { LeistungsvereinbarungReactiveFormsService } from './leistungsvereinbarung-reactive-forms.service';
import { LeistungsvereinbarungFormModeService } from './leistungsvereinbarung-form-mode.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FacadeService } from '@app/shared/services/facade.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DropdownOption } from '@app/shared/services/forms/form-utils.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { RahmenvertragDTO } from '@app/shared/models/dtos-generated/rahmenvertragDTO';
import { VertragswertDTO } from '@app/shared/models/dtos-generated/vertragswertDTO';

export interface LeistungsvereinbarungData {
    lvDto?: LeistungsvereinbarungDTO;
    rahmenvertragDto?: RahmenvertragDTO;
    statusOptions?: CodeDTO[];
    anbieterId?: number;
    rahmenvertragId?: number;
    vertragswerte?: Array<VertragswertDTO>;
    hasInitialRahmenvertrag?: boolean;
}

@Component({
    selector: 'avam-leistungsvereinbarung-form',
    templateUrl: './leistungsvereinbarung-form.component.html',
    providers: [LeistungsvereinbarungFormHandlerService, LeistungsvereinbarungReactiveFormsService, LeistungsvereinbarungFormModeService]
})
export class LeistungsvereinbarungFormComponent implements OnInit, OnChanges, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('bearbeitungDurch') bearbeitungDurch: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('freigabeDurch') freigabeDurch: AvamPersonalberaterAutosuggestComponent;

    @Input() lvData: LeistungsvereinbarungData;

    formGroup: FormGroup;
    dto: LeistungsvereinbarungDTO;

    benutzerType = BenutzerAutosuggestType.BENUTZER;
    bearbeitungDurchSuchenTokens = {};
    freigabeDurchSuchenTokens = {};
    statusOptions: DropdownOption[] = [];

    modeSubscription: Subscription;
    currentFormMode = FormModeEnum;
    currentMode: string;

    isDisabled = false;
    isDisabledFreigabe = false;
    isDisabledAsalReport = false;

    constructor(
        private handler: LeistungsvereinbarungFormHandlerService,
        private formMode: LeistungsvereinbarungFormModeService,
        private reactiveForms: LeistungsvereinbarungReactiveFormsService,
        private facade: FacadeService,
        private obliqueHelperService: ObliqueHelperService,
        private ammHelper: AmmHelper,
        private route: ActivatedRoute
    ) {
        this.formGroup = this.reactiveForms.lvForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.lvData.currentValue) {
            this.mapData();
            if (this.lvData) {
                if (this.lvData.lvDto) {
                    this.dto = this.lvData.lvDto;
                    this.formGroup.reset(this.handler.mapToForm(this.lvData));
                    this.setReadOnly(this.dto);
                }

                this.reactiveForms.setDefaultValues(this.lvData);
                this.reactiveForms.setDateValidators(this.lvData);
            }

            if (this.currentMode === FormModeEnum.CREATE) {
                this.formGroup.controls.bearbeitungDurch.setValue(this.ammHelper.getCurrentUserForAutosuggestDto());
                this.formGroup.controls.status.setValue(this.lvData.statusOptions.length > 0 ? this.lvData.statusOptions[0].codeId : -1);
            }
        }
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;

        this.route.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentMode = currentMode;
        });

        this.initializeBenutzerTokens();
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.lvData));

                this.reactiveForms.setDefaultValues(this.lvData);
                this.reactiveForms.setDateValidators(this.lvData);

                if (this.currentMode === FormModeEnum.CREATE) {
                    this.bearbeitungDurch.appendCurrentUser();
                }
            });
        }
    }

    mapToDTO(): LeistungsvereinbarungDTO {
        if (!this.formGroup.controls.bearbeitungDurch.value) {
            this.bearbeitungDurch.appendCurrentUser();
        }

        return this.handler.mapToDTO(this.lvData);
    }

    rahmenvertragZuordnen(rahmenvertrag: RahmenvertragDTO) {
        this.formGroup.controls.rahmenvertrag.setValue(rahmenvertrag.rahmenvertragNr);
        this.formGroup.markAsDirty();

        this.lvData = {
            ...this.lvData,
            rahmenvertragDto: rahmenvertrag,
            rahmenvertragId: rahmenvertrag.rahmenvertragId
        };

        this.reactiveForms.setDateValidators(this.lvData);
    }

    updateRahmenvertragValue(event) {
        if (!event.target.value) {
            this.formGroup.markAsDirty();
            this.reactiveForms.setDateValidators(this.lvData);
        }
    }

    appendCurrentUserToFreigabeDurch() {
        this.freigabeDurch.appendCurrentUser();
    }

    private initializeBenutzerTokens() {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        let benutzerstelleId;
        if (this.currentMode === FormModeEnum.EDIT) {
            benutzerstelleId = this.lvData.lvDto ? (this.lvData.lvDto.ownerId ? this.lvData.lvDto.ownerId : currentUser.benutzerstelleId) : currentUser.benutzerstelleId;
        } else if (this.currentMode === FormModeEnum.CREATE) {
            benutzerstelleId = currentUser.benutzerstelleId;
        }

        if (currentUser) {
            this.bearbeitungDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_AKQUISITION_BEARBEITEN,
                myBenutzerstelleId: currentUser.benutzerstelleId
            };

            this.freigabeDurchSuchenTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_AKQUISITION_UNTERSCHREIBEN,
                myBenutzerstelleId: currentUser.benutzerstelleId
            };
        }
    }

    private mapData() {
        this.statusOptions = this.facade.formUtilsService.mapDropdown(this.lvData.statusOptions);
    }

    private setReadOnly(lv: LeistungsvereinbarungDTO) {
        this.isDisabled = lv.disabled;
        this.isDisabledAsalReport = lv.disabledAsalReport;
        this.isDisabledFreigabe = lv.disabledFreigabe;
    }
}

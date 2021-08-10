import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { GesamtbudgetHandlerService } from './gesamtbudget-handler.service';
import { GesamtbudgetReactiveFormsService } from './gesamtbudget-reactive-forms.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { BudgetDTO } from '@app/shared/models/dtos-generated/budgetDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AmmVierAugenStatusCode } from '@app/shared/enums/domain-code/amm-vieraugenstatus-code.enum';
import { FormUtilsService } from '@app/shared';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { GesamtbudgetFormModeService } from './gesamtbudget-form-mode.service';
import { FacadeService } from '@shared/services/facade.service';

export interface GesamtBudgetFormData {
    budget?: BudgetDTO;
    statusOptions?: CodeDTO[];
}

@Component({
    selector: 'avam-gesamtbudget-form',
    templateUrl: './gesamtbudget-form.component.html',
    styleUrls: ['./gesamtbudget-form.component.scss'],
    providers: [GesamtbudgetHandlerService, GesamtbudgetReactiveFormsService, GesamtbudgetFormModeService]
})
export class GesamtbudgetFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;

    public formGroup: FormGroup;
    @Input() formData: GesamtBudgetFormData;

    benutzerType = BenutzerAutosuggestType.BENUTZER;
    bearbeiterSuchenTokens = {};
    freigeberSuchenTokens = {};

    statusOptions = [];

    formModes = FormModeEnum;

    constructor(
        public formMode: GesamtbudgetFormModeService,
        private handler: GesamtbudgetHandlerService,
        private reactiveForms: GesamtbudgetReactiveFormsService,
        private obliqueHelper: ObliqueHelperService,
        private authenticationService: AuthenticationService,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService,
        private facade: FacadeService
    ) {
        this.formGroup = reactiveForms.budgetForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.formData.currentValue) {
            this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(this.formData.statusOptions);
            this.formGroup.reset(this.handler.mapToForm(this.formData.budget));
            this.setBenutzerTokens(this.formData.budget);
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.formData.budget));
            });
        }
    }

    mapToDTO(): BudgetDTO {
        const status = this.formData.statusOptions.find(option => option.codeId === +this.formGroup.controls.status.value) as CodeDTO;
        return this.handler.mapToDTO(this.formData.budget, status);
    }

    checkValidators() {
        if (!this.formGroup.controls.status.value) {
            return;
        }
        const code = this.facade.formUtilsService.getCodeByCodeId(this.formData.statusOptions, this.formGroup.controls.status.value);

        if (code === AmmVierAugenStatusCode.FREIGEGEBEN) {
            this.formGroup.controls.freigabeDurch.setValidators(Validators.required);
        } else {
            this.formGroup.controls.freigabeDurch.clearValidators();
        }
    }

    appendCurrentUser() {
        this.bearbeitung.appendCurrentUser();
    }

    setBenutzerTokens(budgetDto?: BudgetDTO) {
        const currentUser = this.authenticationService.getLoggedUser();
        const benutzerstelleId = budgetDto ? (budgetDto.ownerId ? budgetDto.ownerId : currentUser.benutzerstelleId) : currentUser.benutzerstelleId;

        if (currentUser) {
            this.bearbeiterSuchenTokens = {
                berechtigung: Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET,
                myBenutzerstelleId: benutzerstelleId,
                benutzerstelleId
            };

            this.freigeberSuchenTokens = {
                berechtigung: Permissions.AMM_BUDGETIERUNG_UNTERSCHREIBEN_BUDGET,
                myBenutzerstelleId: benutzerstelleId,
                benutzerstelleId
            };
        }
    }

    changeMode(mode: FormModeEnum) {
        this.formMode.changeMode(mode);
    }
}

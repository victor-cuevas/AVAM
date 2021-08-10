import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CodeDTO } from '@dtos/codeDTO';
import { DateValidator } from '@shared/validators/date-validator';
import { FacadeService } from '@shared/services/facade.service';
import { UserDto } from '@dtos/userDto';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DomainEnum } from '@shared/enums/domain.enum';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { FormModeEnum } from '@shared/enums/form-mode.enum';

@Injectable()
export class AufgabenErfassenReactiveFormsService {
    form: FormGroup;
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel = {
        benutzerstellentyp: null,
        vollzugsregiontyp: null,
        status: StatusEnum.AKTIV,
        kanton: null
    };
    benutzerstelleSuchenTokens: any;
    benutzerSuchenTokens: any;
    benutzerstelleAutosuggestType: BenutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    personalberaterAutosuggestType: BenutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    private static readonly PRIORITY_NIEDRIG = '1';
    private static readonly STATUS_PENDANT = '3';
    private readonly currentUser: UserDto;

    constructor(private formBuilder: FormBuilder, private facade: FacadeService) {
        this.currentUser = facade.authenticationService.getLoggedUser();
        this.createForm();
        this.initTokens();
    }

    setDynamicValidations(formMode: FormModeEnum, statusOptionsCodes?: CodeDTO[], statusCodeId?: number): void {
        this.form.controls.faelligAm.setValidators([DateValidator.val083, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        if (formMode === FormModeEnum.EDIT) {
            const pendantCodeId: string = this.facade.formUtilsService.getCodeIdByCode(statusOptionsCodes, AufgabenErfassenReactiveFormsService.STATUS_PENDANT);
            if (statusCodeId && statusCodeId.toString() === pendantCodeId) {
                this.form.controls.faelligAm.setValidators([DateValidator.val067, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            } else {
                this.form.controls.faelligAm.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            }
            this.form.controls.faelligAm.updateValueAndValidity();
        } else {
            this.form.controls.faelligAm.setValidators([DateValidator.val083, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }
    }

    setDefaultValues(formMode: FormModeEnum, statusOptionsCodes: CodeDTO[], priorityCodes: CodeDTO[], statusCodeId?: number): void {
        this.form.controls.prioritaet.setValue(this.facade.formUtilsService.getCodeIdByCode(priorityCodes, AufgabenErfassenReactiveFormsService.PRIORITY_NIEDRIG));
        if (this.currentUser) {
            this.form.controls.benutzerstelle.setValue({
                code: this.currentUser.benutzerstelleCode,
                benutzerstelleId: this.currentUser.benutzerstelleId
            });
        }
        this.setDynamicValidations(formMode, statusOptionsCodes, statusCodeId);
    }

    setFaelligAmValidators(formMode: FormModeEnum, statusOptionsCodes: CodeDTO[], statusCodeId: number): void {
        this.setDynamicValidations(formMode, statusOptionsCodes, statusCodeId);
    }

    private initTokens(): void {
        if (this.currentUser) {
            this.benutzerstelleSuchenTokens = {
                benutzerstelleId: `${this.currentUser.benutzerstelleId}`,
                vollzugsregionTyp: DomainEnum.STES
            };
            this.benutzerSuchenTokens = {
                myBenutzerstelleId: `${this.currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    private createForm(): void {
        this.form = this.formBuilder.group({
            geschaeftsart: [null, Validators.required],
            prioritaet: [null, Validators.required],
            aufgabentext: [null, Validators.required],
            faelligAm: null,
            benutzerstelle: null,
            zuestaendig: null,
            initialisiertDurch: null,
            status: null
        });
    }
}

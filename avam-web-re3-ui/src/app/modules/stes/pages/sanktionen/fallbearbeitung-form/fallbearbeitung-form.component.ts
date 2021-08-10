import { Permissions } from '@shared/enums/permissions.enum';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@core/services/authentication.service';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DomainEnum } from '@app/shared/enums/domain.enum';

@Component({
    selector: 'avam-fallbearbeitung-form',
    templateUrl: './fallbearbeitung-form.component.html',
    styleUrls: ['./fallbearbeitung-form.component.scss']
})
export class FallbearbeitungFormComponent implements OnInit {
    @Input() public autofocus = false;
    fallbearbeitungForm: FormGroup;
    benutzerSuchenTokensbearbeitung: {};
    benutzerstelleSuchenTokens: any = {};
    bearbeitung: any = null;

    benutzerCode = '';
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(private formBuilder: FormBuilder, private authenticationService: AuthenticationService) {}

    public ngOnInit(): void {
        this.generateForm();
        this.getCurrentUserAndTokens();
    }

    public generateForm(): void {
        this.fallbearbeitungForm = this.formBuilder.group({
            benutzerstellenId: [null, Validators.required],
            bearbeitung: [null, Validators.required],
            notizen: null
        });
    }

    public getCurrentUserAndTokens(): void {
        const currentUser = this.authenticationService.getLoggedUser();
        // TODO when sanktionSachverhaltDTO includes ownerId: const benutzerstelleId = bearbeiten ? dto.ownerId : currentUser.benutzerstelleId;
        const benutzerstelleId = currentUser.benutzerstelleId;

        if (currentUser) {
            this.benutzerSuchenTokensbearbeitung = {
                berechtigung: Permissions.STES_SANKTION_VMF_BEARBEITEN,
                benutzerstelleId,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES
            };
            this.benutzerstelleSuchenTokens = {
                benutzerstelleId: `${benutzerstelleId}`,
                vollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    public mapToForm(dto: SanktionSachverhaltDTO): void {
        this.fallbearbeitungForm.patchValue({
            benutzerstellenId: { code: dto.sanktionSachverhalt.benutzerstelleObject.code },
            bearbeitung: dto.sanktionSachverhalt.sachbearbeitungObject,
            notizen: dto.sanktionSachverhalt.notizen
        });
        this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: dto.sanktionSachverhalt.benutzerstelleObject.code });
        if (!!dto.sanktionSachverhalt.sachbearbeitungObject) {
            this.updateBearbeitung(dto.sanktionSachverhalt.sachbearbeitungObject);
        }
    }

    public bearbeitungValue(value: any) {
        if (value === '' || value === ' ') {
            this.bearbeitung = null;
            this.fallbearbeitungForm.controls.bearbeitung.setValue(null);
        } else if (value === null) {
            if (this.fallbearbeitungForm.controls.benutzerstellenId.value === null) {
                this.fallbearbeitungForm.controls.bearbeitung.setValidators(Validators.required);
                this.fallbearbeitungForm.controls.bearbeitung.updateValueAndValidity();
            } else {
                this.fallbearbeitungForm.controls.bearbeitung.clearValidators();
            }
        }
    }

    public updateBearbeitung(bearbeitung: any): void {
        if (typeof bearbeitung === 'string' && bearbeitung === '') {
            this.bearbeitung = null;
        } else if (typeof bearbeitung !== 'string') {
            if (this.checkReceivedObject(bearbeitung)) {
                this.bearbeitung = bearbeitung;
                this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: bearbeitung.benuStelleCode });
                this.fallbearbeitungForm.controls['benutzerstellenId'].setValidators(Validators.required);
            } else {
                this.bearbeitung = null;
            }
        }
    }

    public updateBenutzerDetail(benutzerDetail: any) {
        this.benutzerCode = benutzerDetail.data.benutzerstelleObject.code;
    }

    onSelectBenutzerstelle(benutzerSelected: any) {
        if (!this.bearbeitung) {
            if (typeof benutzerSelected !== 'object' && benutzerSelected !== null) {
                this.benutzerCode = '';
            } else {
                this.benutzerCode = benutzerSelected.code;
                this.clearValidatorsBearbeitung();
            }
        } else {
            this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: this.bearbeitung.benuStelleCode });
        }
    }

    onInputBenutzerstelle(inputField: any) {
        if (!this.bearbeitung) {
            if (typeof inputField === 'object' && inputField !== null) {
                this.benutzerCode = inputField.code;
                this.clearValidatorsBearbeitung();
            } else if (typeof inputField === 'string') {
                this.benutzerCode = inputField;
                this.clearValidatorsBearbeitung();
            } else {
                this.benutzerCode = '';
            }
            if (this.benutzerCode === '') {
                this.updateValidatorFromBenutzerstellenId();
            }
        } else {
            this.benutzerCode = this.bearbeitung.benuStelleCode;
        }
    }

    onFocusBenutzerstelle(event: any) {
        if (!this.bearbeitung) {
            if (this.benutzerCode === '') {
                this.fallbearbeitungForm.controls['benutzerstellenId'].setValue(null);
                this.updateValidatorFromBenutzerstellenId();
            } else {
                this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: this.benutzerCode });
            }
        } else {
            this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: this.bearbeitung.benuStelleCode });
        }
    }

    resetForm() {
        this.fallbearbeitungForm.reset();
        this.benutzerCode = '';
        this.bearbeitung = null;
    }

    private clearValidatorsBearbeitung() {
        this.fallbearbeitungForm.controls['bearbeitung'].clearValidators();
        this.fallbearbeitungForm.controls['bearbeitung'].updateValueAndValidity();
    }

    private checkReceivedObject(benutzer: any): boolean {
        return benutzer && benutzer.benuStelleCode && benutzer.benutzerDetailId && benutzer.nachname && benutzer.vorname && benutzer.benuStelleCode;
    }

    private updateValidatorFromBenutzerstellenId() {
        if (this.fallbearbeitungForm.controls.bearbeitung.value === null) {
            this.fallbearbeitungForm.controls.bearbeitung.setValidators(Validators.required);
            this.fallbearbeitungForm.controls.bearbeitung.updateValueAndValidity();
        }
        this.fallbearbeitungForm.controls.benutzerstellenId.setValidators(Validators.required);
        this.fallbearbeitungForm.controls.benutzerstellenId.updateValueAndValidity();
    }
}

import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthenticationService } from '@core/services/authentication.service';
import { UserDto } from '@dtos/userDto';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { BenutzerAutosuggestType } from '../../../library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { BenutzerDetailDTO } from '@dtos/benutzerDetailDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';

@Component({
    selector: 'massnahmenverantwortung-benutzerstelle-search',
    templateUrl: './massnahmenverantwortung-benutzerstelle-search.component.html',
    styleUrls: ['./massnahmenverantwortung-benutzerstelle-search.component.scss']
})
export class MassnahmenverantwortungBenutzerstelleSearchComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() displayBenutzerstellenTitle = true;

    public personalberaterTokens: any = {};
    public benutzerstellenIdTokens: any = {};
    public personalberater: BenutzerDetailDTO;

    public benutzerCode = null;

    public benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    public personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(private authenticationService: AuthenticationService) {}
    static isPersonalberaterObject(pb: any): boolean {
        return pb && pb.benuStelleCode && pb.benutzerDetailId && pb.nachname && pb.vorname && pb.benuStelleCode;
    }

    ngOnInit() {
        this.setInitialBenutzerCode(this.authenticationService.getLoggedUser());
        this.getCurrentUserAndTokens();
    }

    public onSelectBenutzerstellenId(benutzerSelected: any) {
        if (typeof benutzerSelected !== 'object' && benutzerSelected !== null) {
            this.benutzerCode = null;
        } else {
            this.benutzerCode = benutzerSelected.code;
        }
    }

    public updateBenutzerstellenId(inputField: any): void {
        if (typeof inputField === 'object' && inputField !== null) {
            this.benutzerCode = inputField.code;
        } else if (typeof inputField === 'string') {
            this.benutzerCode = inputField === '' ? null : inputField;
        } else {
            this.benutzerCode = null;
        }
    }
    public outfocusBenutzerstellenId() {
        if (this.benutzerCode === null) {
            this.parentForm.controls['benutzerstellenId'].setValue(null);
        } else {
            this.parentForm.controls['benutzerstellenId'].setValue({ code: this.benutzerCode });
        }
    }
    public updatePersonalberater(personalberater: any): void {
        if (typeof personalberater !== 'string') {
            if (MassnahmenverantwortungBenutzerstelleSearchComponent.isPersonalberaterObject(personalberater)) {
                this.personalberater = personalberater;
            } else if (this.parentForm.controls['personalberater'].value === '') {
                this.personalberater = null;
            }
        } else if (personalberater.length > 0) {
            this.parentForm.controls['personalberater'].setValue(!!this.personalberater ? this.personalberater : null);
        } else {
            this.personalberater = null;
        }
    }

    public setInitialBenutzerCode(currentUser: UserDto): void {
        const benutzerObject = currentUser.benutzerstelleList.find(b => b.benutzerstelleCode === currentUser.benutzerstelleCode);
        this.benutzerCode = benutzerObject.benutzerstelleCode;
        this.parentForm.controls['benutzerstellenId'].setValue({ code: this.benutzerCode });
    }

    private getCurrentUserAndTokens(): void {
        const currentUser = this.authenticationService.getLoggedUser();
        if (currentUser) {
            this.personalberaterTokens = {
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };
            this.benutzerstellenIdTokens = {
                benutzerstelleId: `${currentUser.benutzerstelleId}`,
                vollzugsregionTyp: DomainEnum.STES
            };
        }
    }
}

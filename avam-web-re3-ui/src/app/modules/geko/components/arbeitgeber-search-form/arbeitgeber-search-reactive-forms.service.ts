import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';
import { UserValidator } from '@shared/validators/autosuggest-validator';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { UserDto } from '@dtos/userDto';
import { DomainEnum } from '@shared/enums/domain.enum';
import { FacadeService } from '@shared/services/facade.service';

@Injectable()
export class ArbeitgeberSearchReactiveFormsService {
    searchForm: FormGroup;
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel = {
        benutzerstellentyp: null,
        vollzugsregiontyp: null,
        status: StatusEnum.AKTIV,
        kanton: null
    };
    benutzerstelleSuchenTokens: any;
    personalberaterAutosuggestType: BenutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    benutzerstelleAutosuggestType: BenutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;

    constructor(private formBuilder: FormBuilder, private facade: FacadeService) {
        this.createForm();
        this.initBenutzerstelleSuchenTokens();
    }

    createForm(): void {
        this.searchForm = this.formBuilder.group(
            {
                geschaeftsartId: null,
                sachstandId: null,
                geschaeftsterminVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                geschaeftsterminBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                erstelltAmVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                erstelltAmBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                fallbearbeiterId: [null, UserValidator.val213frontend],
                benutzerstellenId: [null, UserValidator.val214frontend],
                isBearbeiter: false,
                isFreigeber: false
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('geschaeftsterminVon', 'geschaeftsterminBis', 'val201'),
                    DateValidator.rangeBetweenDates('erstelltAmVon', 'erstelltAmBis', 'val201')
                ]
            }
        );
    }

    setDefaultValues(appendCurrentUserFct: any): void {
        this.searchForm.get('isBearbeiter').setValue(true);
        this.searchForm.get('isFreigeber').setValue(true);

        appendCurrentUserFct();

        const currentUser: UserDto = this.getLoggedUser();
        this.searchForm.get('benutzerstellenId').setValue({
            code: currentUser.benutzerstelleCode,
            benutzerstelleId: currentUser.benutzerstelleId
        });
    }

    isSearchCriteriaGiven(): boolean {
        return (
            [
                'geschaeftsartId',
                'sachstandId',
                'geschaeftsterminVon',
                'geschaeftsterminBis',
                'erstelltAmVon',
                'erstelltAmBis',
                'fallbearbeiterId',
                'benutzerstellenId',
                'isBearbeiter',
                'isFreigeber'
            ].filter(c => this.searchForm.get(c).value).length > 0
        );
    }

    private initBenutzerstelleSuchenTokens(): void {
        this.benutzerstelleSuchenTokens = {
            benutzerstelleId: `${this.getLoggedUser().benutzerstelleId}`,
            vollzugsregionTyp: DomainEnum.STES
        };
    }

    private getLoggedUser(): UserDto {
        return this.facade.authenticationService.getLoggedUser();
    }
}

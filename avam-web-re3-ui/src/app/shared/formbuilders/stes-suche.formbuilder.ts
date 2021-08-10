import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StesSucheQueryDTO } from '@dtos/stesSucheQueryDTO';
import { EnhancedSearchQueryDTO } from '@dtos/enhancedSearchQueryDTO';
import { PersonenNrValidator } from '../validators/personenNr-validator';
import { SvNummerValidator } from '../validators/sv-nummer-validator';
import { StesIdValidator } from '../validators/stesId-validator';
import { GeburtsdatumValidator } from '../validators/geburtsdatum-validator';
import { UserValidator } from '../validators/autosuggest-validator';
import { emptyFormValidator } from '../validators/empty-form.validator';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';

export class StesSucheFormbuilder {
    statusOptionsLabels: any;
    private static readonly searchMaskSkipFields = ['statusId'];
    private static readonly extraCriteriaMaskSkipFields = ['searchLevel3', 'searchLevel1', 'searchFreeText'];
    private static readonly arrayValidate = 'extraCriteria';
    private static readonly searchValidationMessage = { suc100001bsp8: { valid: false, value: null } };
    private static readonly extraCriteriaValidationMessage = { suc100001bsp8: { valid: false, value: null } };

    constructor(private formBuilder: FormBuilder, private dataService: StesDataRestService) {}

    initForm(): FormGroup {
        return this.formBuilder.group(
            {
                statusId: [''],
                nachname: ['', TwoFieldsAutosuggestValidator.inputMinLength(2)],
                vorname: ['', TwoFieldsAutosuggestValidator.inputMinLength(2)],
                geburtsdatum: [
                    '',
                    [
                        GeburtsdatumValidator.formatValidator,
                        GeburtsdatumValidator.anmeldungDateValidator,
                        GeburtsdatumValidator.dateSmallerThanTodayValidator,
                        GeburtsdatumValidator.dateMonthAndDayValidator,
                        GeburtsdatumValidator.dateAnmeldungValidator
                    ]
                ],
                gemeinde: [''],
                svNr: ['', SvNummerValidator.svNummberValid],
                personenNr: ['', PersonenNrValidator.val011],
                stesId: ['', StesIdValidator.val057],
                schlagwort: ['', TwoFieldsAutosuggestValidator.inputMinLength(2)],
                personalBerater: [null, UserValidator.val212],
                extraCriteria: this.formBuilder.array([])
            },
            {
                validators: emptyFormValidator(StesSucheFormbuilder.searchMaskSkipFields, StesSucheFormbuilder.searchValidationMessage, StesSucheFormbuilder.arrayValidate)
            }
        );
    }

    buildQueryDTO(searchFormData: FormGroup, searchDTO: StesSucheQueryDTO, extraCriteria: EnhancedSearchQueryDTO[]): StesSucheQueryDTO {
        searchDTO.nachname = searchFormData.get('nachname').value;
        searchDTO.vorname = searchFormData.get('vorname').value;
        searchDTO.personalberaterId =
            searchFormData.get('personalBerater')['benutzerObject'].benutzerDetailId !== -1 ? searchFormData.get('personalBerater')['benutzerObject'].benutzerDetailId : null;
        searchDTO.geburtsdatum = this.transformDate(searchFormData.get('geburtsdatum').value);
        const personenNr: string = searchFormData.get('personenNr').value;
        searchDTO.personenNr = personenNr ? personenNr.trim() : personenNr;
        searchDTO.svNr = searchFormData.get('svNr').value;
        searchDTO.stesId = searchFormData.get('stesId').value;
        searchDTO.statusId = searchFormData.get('statusId').value;
        const gemeindeObj = searchFormData.get('gemeinde')['gemeindeObj'];
        searchDTO.gemeindeId = gemeindeObj && gemeindeObj.gemeindeBaseInfo ? gemeindeObj.gemeindeBaseInfo.gemeindeId : '';
        searchDTO.gemeindeSearchText = gemeindeObj && gemeindeObj.gemeindeBaseInfo ? gemeindeObj.ortschaftsbezeichnung : '';
        const schlagwort = searchFormData.get('schlagwort').value;
        if (schlagwort) {
            if (schlagwort.value) {
                searchDTO.schlagwort = schlagwort.value;
            } else {
                searchDTO.schlagwort = schlagwort;
            }
        } else {
            searchDTO.schlagwort = '';
        }
        searchDTO.enhancedSearchQueries = extraCriteria;
        return searchDTO;
    }

    buildExtraCriteriaInput() {
        return this.formBuilder.group(
            {
                searchLevel1: [''],
                searchFieldId: [''],
                searchLevel3: [''],
                comparatorId: [''],
                searchFreeText: [''],
                searchValue: ['']
            },
            {
                validators: emptyFormValidator(StesSucheFormbuilder.extraCriteriaMaskSkipFields, StesSucheFormbuilder.extraCriteriaValidationMessage)
            }
        );
    }

    buildExtraCriteriaOutput() {
        return {
            searchFieldId: '',
            comparatorId: '',
            searchValue: ''
        };
    }

    buildStatusOptionLabels(activeLabel: any, inactiveLabel: any, statusAllLabel: any): any[] {
        return [activeLabel, inactiveLabel, statusAllLabel];
    }

    transformDate(value): string {
        if (value && typeof value === 'string') {
            let date = value.split('.', 3);
            if (date[0] === '00' && date[1] !== '00' && date[2] !== '0000') {
                return `${date[1]}.${date[2]}`;
            } else if (date[0] === '00' && date[1] === '00' && date[2] !== '0000') {
                return `${date[2]}`;
            } else {
                return value;
            }
        } else if (value) {
            return `${value.day}.${value.month}.${value.year}`;
        } else {
            return '';
        }
    }
}

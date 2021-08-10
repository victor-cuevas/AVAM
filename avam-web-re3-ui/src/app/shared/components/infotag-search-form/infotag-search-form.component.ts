import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MessageBus } from '../../services/message-bus';
import { filter, takeUntil } from 'rxjs/operators';
import { InfotagService } from '../../services/infotag.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { InfotagMassnahmeDurchfuehrungseinheitRequestDTO } from '@shared/models/dtos-generated/infotagMassnahmeDurchfuehrungseinheitRequestDTO';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { PlzDTO } from '@shared/models/dtos-generated/plzDTO';
import { DateValidator } from '@shared/validators/date-validator';
import { ElementKategorieDTO } from '@shared/models/dtos-generated/elementKategorieDTO';
import { UnternehmenDataService } from '@shared/services/unternehmen-data.service';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { BaseResponseWrapperListElementKategorieDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListElementKategorieDTOWarningMessages';

@Component({
    selector: 'app-infotag-search-form',
    templateUrl: './infotag-search-form.component.html',
    styles: [
        `
            ::ng-deep #dateRangePicker div,
            ::ng-deep #dateRangePicker label {
                text-align: left !important;
            }
        `
    ]
})
export class InfotagSearchFormComponent extends Unsubscribable implements OnInit, AfterViewInit {
    @Input() stesId: string;
    input: InfotagMassnahmeDurchfuehrungseinheitRequestDTO;
    searchFormGroup: FormGroup;
    massnahmeartstrukturen: any[] = [];
    notCombiningActive = false;
    readonly channel: string = 'app-infotag-search';
    private kategories: ElementKategorieDTO[] = [];

    constructor(
        private readonly messageBus: MessageBus,
        private infotagService: InfotagService,
        private spinnerService: SpinnerService,
        private formBuilder: FormBuilder,
        private formUtils: FormUtilsService,
        private unternehmenDataService: UnternehmenDataService
    ) {
        super();
    }

    ngOnInit(): void {
        this.spinnerService.activate(this.channel);
        this.createSearchFormGroup();
        this.infotagService.getKategories().subscribe((response: BaseResponseWrapperListElementKategorieDTOWarningMessages) => {
            this.kategories = response.data;
            this.massnahmeartstrukturen = this.kategories.map(this.customPropertyMapper);
            this.initFormData(true);
            this.onSubmit();
        });
    }

    ngAfterViewInit(): void {
        this.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .pipe(filter(message => message.type === 'infotag-search-form'))
            .subscribe(message => (this.input = this.infotagService.initRequest(message.data, this.kategories)));
        this.unternehmenDataService
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((unternehmen: any) => {
                this.searchFormGroup.controls.anbieter.setValue(unternehmen.data.name);
            });
    }

    onSubmit(): void {
        if (this.searchFormGroup.valid) {
            this.spinnerService.activate(this.channel);
            if (!this.searchFormGroup.dirty) {
                this.infotagService.getDurchfuehrungseinheiten(this.input);
            } else {
                this.infotagService.getDurchfuehrungseinheiten(this.asDto());
            }
        }
    }

    onReset(): void {
        this.initFormData(true);
    }

    isFormEmpty(): boolean {
        return (
            this.isEmptyOrNull(this.searchFormGroup.controls.titel) &&
            this.isEmptyOrNull(this.searchFormGroup.controls.durchfuehrungseinheitId) &&
            this.isEmptyOrNull(this.searchFormGroup.controls.anbieter) &&
            this.isPlzEmpty(this.searchFormGroup.controls.plz) &&
            this.isEmptyOrNull(this.searchFormGroup.controls.zeitraumVon) &&
            this.isEmptyOrNull(this.searchFormGroup.controls.zeitraumBis) &&
            this.isEmptyOrNull(this.searchFormGroup.controls.massnahmeartstruktur)
        );
    }

    checkEnableInputs(value: any): void {
        this.notCombiningActive = !!value;
    }

    private customPropertyMapper = (element: ElementKategorieDTO) => {
        return {
            value: element.elementkategorieId,
            codeId: element.elementkategorieId,
            labelFr: this.buildKategorieLabel(element.beschreibungFr, element.organisation),
            labelIt: this.buildKategorieLabel(element.beschreibungIt, element.organisation),
            labelDe: this.buildKategorieLabel(element.beschreibungDe, element.organisation)
        };
    };

    private createSearchFormGroup(): void {
        this.searchFormGroup = this.formBuilder.group(
            {
                titel: null,
                durchfuehrungseinheitId: [null, NumberValidator.isPositiveInteger],
                anbieter: null,
                plz: this.formBuilder.group({
                    postleitzahl: null,
                    ort: null
                }),
                zeitraumVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                zeitraumBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                massnahmeartstruktur: null
            },
            { validator: DateValidator.rangeBetweenDates('zeitraumVon', 'zeitraumBis', 'val201') }
        );
    }

    private initFormData(isReset?: boolean): void {
        if (isReset) {
            this.input = this.infotagService.initRequest(+this.stesId, this.kategories);
            this.searchFormGroup.reset(this.asFormData());
        } else {
            this.searchFormGroup.setValue(this.asFormData());
            this.searchFormGroup.reset(this.asFormData());
        }
        this.checkEnableInputs(this.searchFormGroup.controls.durchfuehrungseinheitId.value);
    }

    private asFormData(): { [key: string]: any } {
        return {
            titel: this.input.titel,
            durchfuehrungseinheitId: this.input.durchfuehrungseinheitId,
            anbieter: this.input.anbieterName,
            plz: {
                postleitzahl: this.input.plz ? this.input.plz : '',
                ort: this.input.plz ? this.input.plz : ''
            },
            zeitraumVon: this.formUtils.parseDate(this.input.zeitraumVon),
            zeitraumBis: this.formUtils.parseDate(this.input.zeitraumBis),
            massnahmeartstruktur: this.input.elementKategorieId
        };
    }

    private asDto(): InfotagMassnahmeDurchfuehrungseinheitRequestDTO {
        const ret: InfotagMassnahmeDurchfuehrungseinheitRequestDTO = {
            language: this.input.language,
            durchfuehrungseinheitId: this.searchFormGroup.controls.durchfuehrungseinheitId.value,
            stesId: +this.stesId
        };
        return ret.durchfuehrungseinheitId
            ? ret
            : ({
                  ...ret,
                  titel: this.searchFormGroup.controls.titel.value,
                  anbieterId: this.searchFormGroup.controls.anbieter['unternehmenAutosuggestObject'].unternehmenId,
                  anbieterName: this.searchFormGroup.controls.anbieter['unternehmenAutosuggestObject'].name1,
                  elementKategorieId: this.searchFormGroup.controls.massnahmeartstruktur.value !== '' ? this.searchFormGroup.controls.massnahmeartstruktur.value : null,
                  plz: this.mapToPlzDTO(this.searchFormGroup['plzWohnAdresseObject']),
                  isImAngebotSichtbar: this.input.imAngebotSichtbar,
                  zeitraumVon: this.asDate(this.searchFormGroup.controls.zeitraumVon),
                  zeitraumBis: this.asDate(this.searchFormGroup.controls.zeitraumBis)
              } as InfotagMassnahmeDurchfuehrungseinheitRequestDTO);
    }

    private asDate(dateControl: AbstractControl): Date {
        return dateControl.value ? this.formUtils.parseDate(dateControl.value) : null;
    }

    private buildKategorieLabel(beschreibung: string, organisation: string) {
        return `${beschreibung} (${organisation})`;
    }

    private isEmptyOrNull(value): boolean {
        return value === null || value === '';
    }

    private isPlzEmpty(plz): boolean {
        return plz === null || (Number(plz.id) === -1 && plz.inputElementOneValue === null && plz.inputElementTwoValue === null);
    }

    /**
     * Maps the data from the plz-autosuggest to a PlzDTO.
     *
     * @private
     * @param postleitzahl
     * @param ort
     * @returns PlzDTO
     * @memberof AvamUnternehmenSucheComponent
     */
    private mapToPlzDTO(value: any): PlzDTO {
        if (!value || (!value.ortWohnadresseAusland && !value.plzWohnadresseAusland)) {
            return null;
        }

        const plzDTO: PlzDTO = { plzId: -1, ortDe: value.ortWohnadresseAusland, postleitzahl: value.plzWohnadresseAusland };

        return !value.plzId || value.plzId === -1 ? plzDTO : { ...plzDTO, plzId: value.plzId, ortFr: value.ortFr, ortIt: value.ortIt };
    }
}

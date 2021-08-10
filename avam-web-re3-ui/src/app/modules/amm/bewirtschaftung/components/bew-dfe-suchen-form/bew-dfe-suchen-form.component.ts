import { Component, EventEmitter, Output, OnChanges, SimpleChanges, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { TranslateService } from '@ngx-translate/core';
import { DurchfuehrungseinheitSuchenParamDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitSuchenParamDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { BewDfeSuchenHandlerService } from './bew-dfe-suchen-handler.service';
import { BewDfeSuchenReactiveFormsService } from './bew-dfe-suchen-reactive-forms.service';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Component({
    selector: 'avam-bew-dfe-suchen-form',
    templateUrl: './bew-dfe-suchen-form.component.html',
    providers: [ObliqueHelperService, BewDfeSuchenHandlerService, BewDfeSuchenReactiveFormsService]
})
export class BewDfeSuchenFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('data') data = null;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    public formGroup: FormGroup;
    searchForm: FormGroup;
    disableInputs: boolean;
    zulassungstypOptionsMapped: any[];
    zeitraumOptionsMapped: any[];
    platzsituationOptionsMapped: any[];
    statusOptions: any[];
    channel = 'dfe-suchen';
    yesNoOptionsMapped: any[];

    constructor(
        public handler: BewDfeSuchenHandlerService,
        private formUtils: FormUtilsService,
        private fehlermeldungenService: FehlermeldungenService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService
    ) {
        this.formGroup = handler.reactiveForms.searchForm;
    }

    ngOnInit() {
        this.translateService.onLangChange.subscribe(() => {
            this.handler.updateSelectionsLanguage();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            this.mapData();
        }
    }

    mapToForm(data: any) {
        const unternehmen = data.anbieterParam
            ? {
                  unternehmenId: data.anbieterParam ? data.anbieterParam.id : -1,
                  name1: data.anbieterParam ? this.extactNameFromBezeichning(data.anbieterParam.bezeichnung) : null
              }
            : null;

        return {
            strukturelementText: data.strukturelementText,
            strukturelementId: data.strukturelementId,
            durchfuehrungseinheitId: data.durchfuehrungseinheitId,
            beschaeftigungseinheitId: data.beschaeftigungseinheitId,
            titel: data.titel,
            taetigkeit: data.berufTaetigkeit,
            region: data.region,
            regionText: this.dbTranslateService.translate(data.region, 'region'),
            anbieterParam: unternehmen,
            zulassungstypId: data.zulassungstypId,
            statusId: data.statusId,
            dfeImAngebotSichtbar: data.imAngebotSichtbar,
            zeitraumVon: data.zeitraumVon ? new Date(data.zeitraumVon) : '',
            zeitraumBis: data.zeitraumBis ? new Date(data.zeitraumBis) : ''
        };
    }

    mapToDTO(full = false): DurchfuehrungseinheitSuchenParamDTO {
        const anbieter = this.formGroup.controls.anbieterParam['unternehmenAutosuggestObject'];
        const berufTaetigkeit = this.formGroup.controls.taetigkeit['berufAutosuggestObject'];
        const zeitraumOptions = this.formGroup.controls.zeitraum.value;
        const platzsituationOptions = this.formGroup.controls.platzsituation.value;
        const entryTypesArray = [
            String(AmmConstants.ENTRY_ARBEITSPLATZKATEGORIE),
            String(AmmConstants.ENTRY_PRAKTIKUMSSTELLE),
            String(AmmConstants.ENTRY_SESSION),
            String(AmmConstants.ENTRY_STANDORT)
        ];
        return {
            anbieterParam:
                anbieter && anbieter.unternehmenId !== -1
                    ? {
                          id: anbieter.unternehmenId,
                          bezeichnung: this.setBezeichnung(anbieter.name1, anbieter.name2, anbieter.name3)
                      }
                    : null,
            durchfuehrungsbeginn: this.getCheckboxValue(zeitraumOptions, 1),
            durchfuehrungseinheitId: this.formGroup.controls.durchfuehrungseinheitId.value,
            beschaeftigungseinheitId: this.formGroup.controls.beschaeftigungseinheitId.value,
            durchfuehrungsende: this.getCheckboxValue(zeitraumOptions, 2),
            durchfuehrungszeitraum: this.getCheckboxValue(zeitraumOptions, 0),
            eintrittsfrist: this.getCheckboxValue(zeitraumOptions, 4),
            mitFreienPlaetzen: this.getCheckboxValue(platzsituationOptions, 0),
            mitUnterbuchungen: this.getCheckboxValue(platzsituationOptions, 1),
            mitUeberbuchungen: this.getCheckboxValue(platzsituationOptions, 2),
            mitWarteliste: this.getCheckboxValue(platzsituationOptions, 3),
            region: this.formGroup.controls.region.value,
            statusId: this.formGroup.controls.statusId.value,
            stichtag: this.getCheckboxValue(zeitraumOptions, 3),
            imAngebotSichtbar: !!+this.formGroup.controls.dfeImAngebotSichtbar.value,
            elementkategorieId: this.formGroup.controls.elementkategorieId.value,
            strukturelementId: this.formGroup.controls.strukturelementId.value,
            berufTaetigkeit: berufTaetigkeit && berufTaetigkeit.berufId !== -1 ? berufTaetigkeit : null,
            titel: this.formGroup.controls.titel.value,
            vertragswertMId: null,
            zeitraumBis: this.formUtils.parseDate(this.formGroup.controls.zeitraumBis.value),
            zeitraumVon: this.formUtils.parseDate(this.formGroup.controls.zeitraumVon.value),
            zulassungstypId: this.formGroup.controls.zulassungstypId.value,
            entryTypes: entryTypesArray
        };
    }

    setBezeichnung(name1: string, name2: string, name3: string): string {
        return `${name1}${name2 ? ' ' + name2 : ''}${name3 ? ' ' + name3 : ''}`;
    }

    mapData() {
        if (this.data) {
            const DfeZeitraumMap = this.fillAmmDfeZeitraumValues(this.data.formData);
            const DfePlatzsituationMap = this.fillAmmDfePlatzsituationValues(this.data.formData);

            this.zulassungstypOptionsMapped = this.handler.mapDropdown(this.data.zulassungstypOptions);
            this.yesNoOptionsMapped = this.handler.mapDropdown(this.data.yesNoOptions);
            this.zeitraumOptionsMapped = this.data.ammDfeZeitraum.map(value => this.handler.mapMultiselect(value, DfeZeitraumMap));
            this.platzsituationOptionsMapped = this.data.ammDfePlatzsituation.map(value => this.handler.mapMultiselect(value, DfePlatzsituationMap));
            this.statusOptions = this.handler.mapDropdown(this.data.sessionStatus);
            if (this.data.formData) {
                const form = this.mapToForm(this.data.formData);
                this.formGroup.reset(form);
                if (this.data.formData.strukturelementText) {
                    this.handler.selectMassnahmenart(this.data.formData.strukturelementText);
                }

                if (this.data.formData.region) {
                    this.handler.updateSelectionsLanguage();
                }
            } else {
                this.handler.setDefaultValues();
            }
        }
    }

    updateMassnahmenartValue(event) {
        if (!event.target.value) {
            this.handler.clearMassnahmenart();
        }
    }

    reset(callback?) {
        this.fehlermeldungenService.closeMessage();
        this.formGroup.reset();
        this.handler.setDefaultValues();
        const defaultValueMapZR = new Map([[0, true], [1, false], [2, false], [3, false], [4, false]]);
        const defaultValueMapPS = new Map([[0, false], [1, false], [2, false], [3, false]]);
        this.disableInputs = this.handler.toggleEnabledInputs(null, false);
        this.zeitraumOptionsMapped = this.data.ammDfeZeitraum.map(value => this.handler.mapMultiselect(value, defaultValueMapZR));
        this.platzsituationOptionsMapped = this.data.ammDfePlatzsituation.map(value => this.handler.mapMultiselect(value, defaultValueMapPS));
        if (callback) {
            callback();
        }
    }

    toggleEnabledInputs(event: any, dfeSource) {
        if (!event) {
            return;
        }

        const dfeBeNumber = event.target ? event.target.value : event;
        this.disableInputs = this.handler.toggleEnabledInputs(dfeBeNumber, dfeSource);
    }

    onZeitraumChange(event: any) {
        this.handler.reactiveForms.checkRequredDate();
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
    }

    fillAmmDfePlatzsituationValues(data: DurchfuehrungseinheitSuchenParamDTO) {
        const valueMap = new Map([[0, false], [1, false], [2, false], [3, false]]);
        if (data) {
            valueMap.set(0, data.mitFreienPlaetzen ? data.mitFreienPlaetzen : false);
            valueMap.set(1, data.mitUnterbuchungen ? data.mitUnterbuchungen : false);
            valueMap.set(2, data.mitUeberbuchungen ? data.mitUeberbuchungen : false);
            valueMap.set(3, data.mitWarteliste ? data.mitWarteliste : false);
        }
        return valueMap;
    }

    fillAmmDfeZeitraumValues(data: DurchfuehrungseinheitSuchenParamDTO) {
        const valueMap = new Map([[0, true], [1, false], [2, false], [3, false], [4, false]]);
        if (data) {
            valueMap.set(0, data.durchfuehrungszeitraum ? data.durchfuehrungszeitraum : false);
            valueMap.set(1, data.durchfuehrungsbeginn ? data.durchfuehrungsbeginn : false);
            valueMap.set(2, data.durchfuehrungsende ? data.durchfuehrungsende : false);
            valueMap.set(3, data.stichtag ? data.stichtag : false);
            valueMap.set(4, data.eintrittsfrist ? data.eintrittsfrist : false);
        }

        return valueMap;
    }

    onChangeRegionInput(event) {
        if (event.target.value === '') {
            this.formGroup.controls.region.patchValue(null);
        }
    }
    checkRequredDate(event) {
        this.handler.reactiveForms.checkRequredDate();
    }

    private getCheckboxValue(multiselectValue: CoreMultiselectInterface[], id: number): boolean {
        const cbValue = multiselectValue.filter(checkbox => +checkbox.id === id)[0];
        return cbValue ? cbValue.value : false;
    }

    private extactNameFromBezeichning(bezeichnung: string): string {
        return bezeichnung ? bezeichnung.split(' ')[0] : null;
    }
}

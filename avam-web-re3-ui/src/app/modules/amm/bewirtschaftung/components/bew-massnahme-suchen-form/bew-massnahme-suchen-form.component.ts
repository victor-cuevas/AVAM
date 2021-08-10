import { Component, OnInit, OnChanges, Input, SimpleChanges, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BewMassnahmeSuchenHandlerService } from './bew-massnahme-suchen-handler.service';
import { BewMassnahmeSuchenReactiveFormsService } from './bew-massnahme-suchen-reactive-forms.service';
import { DbTranslatePipe, FormUtilsService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { MassnahmeSuchenParamDTO } from '@app/shared/models/dtos-generated/massnahmeSuchenParamDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { RegionSuchenParamDTO } from '@app/shared/models/dtos-generated/regionSuchenParamDTO';
import { StatusEnum } from '@app/shared/classes/fixed-codes';

@Component({
    selector: 'avam-bew-massnahme-suchen-form',
    templateUrl: './bew-massnahme-suchen-form.component.html',
    providers: [BewMassnahmeSuchenHandlerService, BewMassnahmeSuchenReactiveFormsService, DbTranslatePipe]
})
export class BewMassnahmeSuchenFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('data') data = null;

    public formGroup: FormGroup;

    zulassungstypOptionsMapped: any[];
    yesNoOptionsMapped: any[];
    showAdditionalDropdowns: boolean;
    disableInputs: boolean;

    durchfuehrungsregionParams: RegionSuchenParamDTO = {
        gueltigkeit: StatusEnum.ALL
    };

    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    constructor(
        public handler: BewMassnahmeSuchenHandlerService,
        private translateService: TranslateService,
        private formUtils: FormUtilsService,
        private fehlermeldungenService: FehlermeldungenService
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

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
    }

    mapData() {
        if (this.data) {
            this.zulassungstypOptionsMapped = this.handler.mapDropdown(this.data.zulassungstypOptions);
            this.yesNoOptionsMapped = this.handler.mapDropdown(this.data.yesNoOptions);

            if (this.data.state) {
                const form = this.mapToForm(this.data.state);
                this.formGroup.patchValue(form);

                if (this.data.state.strukturelementText) {
                    this.handler.selectMassnahmenart(this.data.state.strukturelementText);
                }

                if (this.data.state.region) {
                    this.handler.updateSelectionsLanguage();
                }
            } else {
                this.handler.reactiveForms.setDefaultValues();
            }
        }
    }

    toggleShowAdditionalDropdowns(event: any) {
        if (!event) {
            this.showAdditionalDropdowns = false;
        } else {
            const selectedZulassungstyp = event.target ? event.target.value : event;
            this.showAdditionalDropdowns = selectedZulassungstyp === this.formUtils.getCodeIdByCode(this.zulassungstypOptionsMapped, AmmZulassungstypCode.INDIV_AB_MASSNAHME);
        }

        if (!this.showAdditionalDropdowns) {
            this.handler.reactiveForms.resetAdditionalDropdowns();
        }
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const massnahmeNrValue = event.target ? event.target.value : event;
        this.disableInputs = this.handler.toggleEnabledInputs(massnahmeNrValue);
    }

    mapToForm(data: any): any {
        const unternehmen = data.anbieterParam
            ? {
                  unternehmenId: data.anbieterParam ? data.anbieterParam.id : -1,
                  name1: data.anbieterParam ? this.extactNameFromBezeichning(data.anbieterParam.bezeichnung) : null
              }
            : null;

        return {
            strukturelementId: data.strukturelementId,
            elementkategorieId: data.elementkategorieId,
            massnahmeId: data.massnahmeId,
            titel: data.titel,
            lamCode: data.lamCode,
            region: data.region,
            anbieterParam: unternehmen,
            zulassungstypId: data.zulassungstypId,
            imAngebotSichtbar: this.yesNoParser(data.imAngebotSichtbar),
            pruefenDurchLam: this.yesNoParser(data.pruefenDurchLam),
            gueltigVon: data.gueltigVon ? new Date(data.gueltigVon) : '',
            gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : ''
        };
    }

    mapToDTO(full = false): MassnahmeSuchenParamDTO {
        if (this.formGroup.controls.massnahmeId.value && !full) {
            return {
                massnahmeId: this.formGroup.controls.massnahmeId.value
            };
        }
        const anbieter = this.formGroup.controls.anbieterParam['unternehmenAutosuggestObject'];

        return {
            anbieterParam:
                anbieter && anbieter.unternehmenId !== -1
                    ? {
                          id: anbieter.unternehmenId,
                          bezeichnung: this.setBezeichnung(anbieter.name1, anbieter.name2, anbieter.name3)
                      }
                    : null,
            gueltigBis: this.formUtils.parseDate(this.formGroup.controls.gueltigBis.value),
            gueltigVon: this.formUtils.parseDate(this.formGroup.controls.gueltigVon.value),

            lamCode: this.formGroup.controls.lamCode.value,
            zulassungstypId: this.formGroup.controls.zulassungstypId.value,
            elementkategorieId: this.formGroup.controls.elementkategorieId.value,
            strukturelementId: this.formGroup.controls.strukturelementId.value,
            titel: this.formGroup.controls.titel.value,
            region: this.formGroup.controls.region.value,
            massnahmeId: this.formGroup.controls.massnahmeId.value,
            pruefenDurchLam: this.formGroup.controls.pruefenDurchLam.value ? !!+this.formGroup.controls.pruefenDurchLam.value : null,
            imAngebotSichtbar: this.formGroup.controls.imAngebotSichtbar.value ? !!+this.formGroup.controls.imAngebotSichtbar.value : null
        };
    }

    reset(callback?) {
        this.fehlermeldungenService.closeMessage();
        this.formGroup.reset();
        this.handler.selectedElement = null;
        this.handler.reactiveForms.setDefaultValues();
        this.disableInputs = this.handler.toggleEnabledInputs(null);
        this.toggleShowAdditionalDropdowns(this.formGroup.controls.zulassungstypId.value);
        this.resetTooltips();

        if (callback) {
            callback();
        }
    }

    setBezeichnung(name1: string, name2: string, name3: string): string {
        return `${name1}${name2 ? ' ' + name2 : ''}${name3 ? ' ' + name3 : ''}`;
    }

    updateMassnahmenartValue(event) {
        if (!event.target.value) {
            this.handler.clearMassnahmenart();
        }
    }

    updateDurchfuehrungsregionValue(event) {
        if (!event.target.value) {
            this.handler.clearDurchfuehrungsregion();
        }
    }

    private extactNameFromBezeichning(bezeichnung: string): string {
        return bezeichnung ? bezeichnung.split(' ')[0] : null;
    }

    private resetTooltips() {
        this.handler.selectedRegionTooltip = { regionDe: ' ', regionFr: ' ', regionIt: ' ' };
        this.handler.selectedAmtsstellePath = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };
    }

    private yesNoParser(option) {
        if (option === true) {
            return '1';
        } else if (option === false) {
            return '0';
        } else {
            return null;
        }
    }
}

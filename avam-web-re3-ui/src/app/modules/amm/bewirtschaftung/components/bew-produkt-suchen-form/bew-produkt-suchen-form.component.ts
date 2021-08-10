import { Component, OnInit, Input, SimpleChanges, OnChanges, EventEmitter, Output, OnDestroy } from '@angular/core';
import { BewProduktSuchenHandlerService } from './bew-produkt-suchen-handler.service';
import { BewProduktSuchenReactiveFormsService } from './bew-produkt-suchen-reactive-forms.service';
import { FormGroup } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { ProduktSuchenParamDTO } from '@app/shared/models/dtos-generated/produktSuchenParamDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'avam-bew-produkt-suchen-form',
    templateUrl: './bew-produkt-suchen-form.component.html',
    providers: [BewProduktSuchenHandlerService, BewProduktSuchenReactiveFormsService]
})
export class BewProduktSuchenFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('data') data = null;

    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    public formGroup: FormGroup;
    zulassungstypOptionsMapped: any[];
    disableInputs: boolean;

    constructor(
        public handler: BewProduktSuchenHandlerService,
        private formUtils: FormUtilsService,
        private fehlermeldungenService: FehlermeldungenService,
        private translateService: TranslateService
    ) {
        this.formGroup = handler.reactiveForms.searchForm;
    }

    ngOnInit() {
        this.translateService.onLangChange.subscribe(() => {
            this.handler.updateSelectedMassnahmenartLanguage();
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
            if (this.data.state) {
                const form = this.mapToForm(this.data.state);
                this.formGroup.reset(form);

                if (this.data.state.strukturelementText) {
                    this.handler.selectMassnahmenart(this.data.state.strukturelementText);
                }
            } else {
                this.handler.setDefaultValues(this.data.zulassungstypOptions);
            }
        }
    }

    mapToForm(data: any): any {
        const zulassungsTyp = this.formUtils.getCodeIdByCode(this.zulassungstypOptionsMapped, data.zulassungsTyp);
        const unternehmen = data.anbieterParam
            ? {
                  unternehmenId: data.anbieterParam ? data.anbieterParam.id : -1,
                  name1: data.anbieterParam ? this.extactNameFromBezeichning(data.anbieterParam.bezeichnung) : null
              }
            : null;

        return {
            strukturelementId: data.strukturelementId,
            elementkategorieId: data.elementkategorieId,
            produktId: data.produktId,
            titel: data.titel,
            lamCode: data.lamCode,
            anbieterParam: unternehmen,
            zulassungsTyp,
            gueltigVon: data.gueltigVon ? new Date(data.gueltigVon) : '',
            gueltigBis: data.gueltigBis ? new Date(data.gueltigBis) : ''
        };
    }

    mapToDTO(full = false): ProduktSuchenParamDTO {
        if (this.formGroup.controls.produktId.value && !full) {
            return {
                produktId: this.formGroup.controls.produktId.value
            };
        }

        const zulassungsTyp = this.formUtils.getCodeByCodeId(this.zulassungstypOptionsMapped, this.formGroup.controls.zulassungsTyp.value);
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
            zulassungsTyp,
            produktId: this.formGroup.controls.produktId.value,
            elementkategorieId: this.formGroup.controls.elementkategorieId.value,
            strukturelementId: this.formGroup.controls.strukturelementId.value,
            titel: this.formGroup.controls.titel.value
        };
    }

    updateMassnahmenartValue(event) {
        if (!event.target.value) {
            this.handler.clearMassnahmenart();
        }
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const produktNrValue = event.target ? event.target.value : event;
        this.disableInputs = this.handler.toggleEnabledInputs(produktNrValue);
    }

    reset(callback?) {
        if (this.formGroup.dirty) {
            this.fehlermeldungenService.closeMessage();
            this.formGroup.reset();
            this.handler.selectedElement = null;
            this.handler.setDefaultValues(this.data.zulassungstypOptions);
            this.disableInputs = this.handler.toggleEnabledInputs(null);
            this.handler.selectedAmtsstellePath = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };

            if (callback) {
                callback();
            }
        }
    }

    setBezeichnung(name1: string, name2: string, name3: string): string {
        return `${name1}${name2 ? ' ' + name2 : ''}${name3 ? ' ' + name3 : ''}`;
    }

    private extactNameFromBezeichning(bezeichnung: string): string {
        return bezeichnung ? bezeichnung.split(' ')[0] : null;
    }
}

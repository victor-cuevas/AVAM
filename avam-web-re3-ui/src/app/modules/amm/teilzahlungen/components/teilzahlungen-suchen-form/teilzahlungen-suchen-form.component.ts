import { Component, OnInit, Output, EventEmitter, SimpleChanges, Input, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { TeilzahlungenSuchenHandlerService } from './teilzahlungen-suchen-handler.service';
import { TeilzahlungenSuchenReactiveFormService } from './teilzahlungen-suchen-reactive-forms.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ZahlungenSuchenParameterDTO } from '@app/shared/models/dtos-generated/zahlungenSuchenParameterDTO';
import { FormUtilsService } from '@app/shared';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-teilzahlungen-suchen-form',
    templateUrl: './teilzahlungen-suchen-form.component.html',
    providers: [TeilzahlungenSuchenHandlerService, TeilzahlungenSuchenReactiveFormService]
})
export class TeilzahlungenSuchenFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    teilzahlungenSuchenForm: FormGroup;
    statusOptions;
    disableInputs: boolean;

    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();
    @Input('data') data = null;

    constructor(
        public handler: TeilzahlungenSuchenHandlerService,
        public reactiveForm: TeilzahlungenSuchenReactiveFormService,
        private fehlermeldungenService: FehlermeldungenService,
        private formUtils: FormUtilsService,
        private obliqueHelper: ObliqueHelperService
    ) {
        this.teilzahlungenSuchenForm = this.reactiveForm.teilzahlungenSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            this.mapData();
        }
    }

    mapData() {
        this.statusOptions = this.handler.mapDropdown(this.data.vierAugenStatus);

        if (this.data.state) {
            const form = this.mapToForm(this.data.state);
            this.teilzahlungenSuchenForm.patchValue(form);
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
            teilzahlungNr: data.teilzahlungNr,
            titel: data.titel,
            anbieter: unternehmen,
            statusTeilzahlung: data.statusTeilzahlung,
            gueltigVon: data.ausfuehrungsdatumVon ? new Date(data.ausfuehrungsdatumVon) : '',
            gueltigBis: data.ausfuehrungsdatumBis ? new Date(data.ausfuehrungsdatumBis) : ''
        };
    }

    reset() {
        this.fehlermeldungenService.closeMessage();
        this.teilzahlungenSuchenForm.reset();
        this.disableInputs = this.handler.toggleEnabledInputs(this.teilzahlungenSuchenForm.controls.teilzahlungNr.value);
    }

    mapToDTO(full = false): ZahlungenSuchenParameterDTO {
        if (this.teilzahlungenSuchenForm.controls.teilzahlungNr.value && !full) {
            return {
                teilzahlungNr: this.teilzahlungenSuchenForm.controls.teilzahlungNr.value
            };
        }
        const anbieter = this.teilzahlungenSuchenForm.controls.anbieter['unternehmenAutosuggestObject'];

        return {
            anbieterId: anbieter && anbieter.unternehmenId !== -1 ? anbieter.unternehmenId : null,
            anbieterName: anbieter.name1,
            ausfuehrungsdatumBis: this.formUtils.parseDate(this.teilzahlungenSuchenForm.controls.gueltigBis.value),
            ausfuehrungsdatumVon: this.formUtils.parseDate(this.teilzahlungenSuchenForm.controls.gueltigVon.value),
            titel: this.teilzahlungenSuchenForm.controls.titel.value,
            statusTeilzahlung: this.teilzahlungenSuchenForm.controls.statusTeilzahlung.value,
            teilzahlungNr: this.teilzahlungenSuchenForm.controls.teilzahlungNr.value
        };
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const teilzahlungNr = event.target ? event.target.value : event;
        this.disableInputs = this.handler.toggleEnabledInputs(teilzahlungNr);
    }

    checkRequiredDate() {
        this.reactiveForm.setDateValidators();
    }

    private extactNameFromBezeichning(bezeichnung: string): string {
        return bezeichnung ? bezeichnung.split(' ')[0] : null;
    }
}

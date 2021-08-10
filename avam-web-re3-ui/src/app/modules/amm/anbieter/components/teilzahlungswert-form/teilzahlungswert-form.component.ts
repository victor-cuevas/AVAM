import { formatNumber } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormatSwissFrancPipe } from '@app/shared';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { TeilzahlungDTO } from '@app/shared/models/dtos-generated/teilzahlungDTO';
import { TeilzahlungswertBearbeitenParameterDTO } from '@app/shared/models/dtos-generated/teilzahlungswertBearbeitenParameterDTO';
import { TeilzahlungswertDTO } from '@app/shared/models/dtos-generated/teilzahlungswertDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { Subscription } from 'rxjs';
import { TeilzahlungswertFormModeService } from './teilzahlungswert-form-mode.service';
import { TeilzahlungswertFormHandlerService } from './teilzahlungswert-handler.service';
import { TeilzahlungswertReactiveFormsService } from './teilzahlungswert-reactive-forms.service';

export interface TeilzahlungswertData {
    teilzahlungswertParam?: TeilzahlungswertBearbeitenParameterDTO;
    dropdownOptions?: CodeDTO[];
}
@Component({
    selector: 'avam-teilzahlungswert-form',
    templateUrl: './teilzahlungswert-form.component.html',
    providers: [TeilzahlungswertFormHandlerService, TeilzahlungswertReactiveFormsService, TeilzahlungswertFormModeService, ObliqueHelperService, FormatSwissFrancPipe]
})
export class TeilzahlungswertFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() teilzahlungswertData: TeilzahlungswertData;
    @Output() teilzahlungsvertSelected: EventEmitter<number> = new EventEmitter();
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    dataSource = [];
    chfTotal: string | number;
    gueltigOptions = [];
    lastData: TeilzahlungswertBearbeitenParameterDTO;
    anbieterId: number;
    fieldsEnum = TeilzahlungswertBearbeitenParameterDTO.EnabledFieldsEnum;
    langSubscription: Subscription;

    constructor(
        private reactiveForms: TeilzahlungswertReactiveFormsService,
        private obliqueHelperService: ObliqueHelperService,
        private facade: FacadeService,
        private formatSwissFrancPipe: FormatSwissFrancPipe,
        private handler: TeilzahlungswertFormHandlerService
    ) {
        this.formGroup = this.reactiveForms.teilzahlungswert;
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.formGroup.patchValue(this.handler.mapToFormTeilzahlung(this.formGroup.controls.selectedTeilzahlung.value));
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.teilzahlungswertData.currentValue) {
            this.lastData = this.teilzahlungswertData.teilzahlungswertParam;
            this.anbieterId = this.lastData.ammAnbieter.unternehmenId;
            this.dataSource = this.lastData.allTeilzahlungswerteOfVertragswert.map(element => this.createRow(element));
            const teilzahlungswerte = [...this.lastData.allTeilzahlungswerteOfVertragswert];
            this.chfTotal = formatNumber(teilzahlungswerte.reduce((acc, obj) => acc + obj.betrag, 0), LocaleEnum.SWITZERLAND, '.2-2');
            this.formGroup.reset(this.handler.mapToForm(this.lastData));
            this.gueltigOptions = this.facade.formUtilsService.mapDropdown(this.teilzahlungswertData.dropdownOptions);
        }
    }

    createRow(element: TeilzahlungswertDTO): any {
        const selectedElement = this.lastData.selectedTeilzahlungForTeilzahlungswertOfVertragswert[element.teilzahlungswertId];

        return {
            teilzahlungswertNr: element.teilzahlungswertNr || '',
            chfBetrag: this.formatSwissFrancPipe.transform(element.betrag),
            teilzahlungsNr: selectedElement ? selectedElement.teilzahlungNr : '',
            vertragswertNr: element.vertragswertObject ? element.vertragswertObject.vertragswertNr : '',
            status: selectedElement ? this.facade.dbTranslateService.translateWithOrder(selectedElement.statusObject, 'text') : ''
        };
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.lastData));
            });
        }
    }

    mapToDTO(): TeilzahlungswertDTO {
        return this.handler.mapToDTO(this.lastData.teilzahlungswert);
    }

    teilzahlungZuordnen(teilzahlung: TeilzahlungDTO) {
        this.formGroup.patchValue(this.handler.mapToFormTeilzahlung(teilzahlung));
        this.formGroup.markAsDirty();
    }

    deleteTeilzahlungsNr(event: any) {
        if (!event.target || !event.target.value) {
            this.formGroup.patchValue(this.handler.mapToFormTeilzahlung(null));
        }
    }

    vorgaengerNachvolgerSelected(teilzahlungswertId: number) {
        this.teilzahlungsvertSelected.emit(teilzahlungswertId);
    }

    ngOnDestroy() {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }
}

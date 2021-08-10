import { VertragswertSuchenHandlerService } from './vertragswert-suchen-handler.service';
import { VertragswertSuchenReactiveFormsService } from './vertragswert-suchen-reactive-forms.service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FacadeService } from '@app/shared/services/facade.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { VertragswertSuchenParamDTO } from '@app/shared/models/dtos-generated/vertragswertSuchenParamDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

export interface VwFiltersData {
    statusOptions?: CodeDTO[];
    yesNoOptions?: CodeDTO[];
    state?: VertragswertSuchenParamDTO;
}

@Component({
    selector: 'avam-vertragswert-suchen-form',
    templateUrl: './vertragswert-suchen-form.component.html',
    providers: [VertragswertSuchenHandlerService, VertragswertSuchenReactiveFormsService]
})
export class VertragswertSuchenFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('data') data = null;

    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    public formGroup: FormGroup;
    statusOptionsMapped: any[];
    nurAktuelleOptionsMapped: any[];
    disableInputs: boolean;

    constructor(public handler: VertragswertSuchenHandlerService, private facade: FacadeService, private ammHelper: AmmHelper) {
        this.formGroup = handler.reactiveForms.searchForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            this.mapData();
        }
    }

    ngOnInit() {}

    ngOnDestroy() {}

    mapData() {
        if (this.data) {
            this.statusOptionsMapped = this.facade.formUtilsService.mapDropdown(this.data.statusOptions);
            this.nurAktuelleOptionsMapped = this.facade.formUtilsService.mapDropdown(this.data.yesNoOptions);
            this.formGroup.reset(this.handler.mapDefaultValues());

            if (this.data.state) {
                const form = this.mapToForm(this.data.state);
                this.formGroup.reset(form);
            }
        }
    }

    mapToDTO(full = false): VertragswertSuchenParamDTO {
        return this.handler.mapToDTO(full);
    }

    mapToForm(data: any): any {
        return this.handler.mapToForm(data);
    }

    reset(callback?) {
        this.facade.fehlermeldungenService.closeMessage();
        this.disableInputs = this.handler.reactiveForms.toggleEnabledInputs(false, false);
        this.formGroup.reset(this.handler.mapDefaultValues());

        if (callback) {
            callback();
        }
    }

    toggleEnabledInputsForProfilNummer(event: any) {
        if (!event) {
            return;
        }

        const profilNrValue = event.target ? event.target.value : event;
        this.disableInputs = this.handler.reactiveForms.toggleEnabledInputs(false, profilNrValue);
    }

    toggleEnabledInputsForLeistungsVertragswertNr(event: any) {
        if (!event) {
            return;
        }

        const vertragswertNrValue = event.target ? event.target.value : event;
        this.disableInputs = this.handler.reactiveForms.toggleEnabledInputs(vertragswertNrValue, false);
    }
}

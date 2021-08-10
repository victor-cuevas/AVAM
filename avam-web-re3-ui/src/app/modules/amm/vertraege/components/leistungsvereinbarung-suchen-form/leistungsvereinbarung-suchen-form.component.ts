import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { LeistungsvereinbarungSuchenHandlerService } from './leistungsvereinbarung-suchen-handler.service';
import { LeistungsvereinbarungSuchenReactiveFormsService } from './leistungsvereinbarung-suchen-reactive-forms.service';
import { FormGroup } from '@angular/forms';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { LeistungsvereinbarungSuchenParamDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungSuchenParamDTO';
import { FacadeService } from '@app/shared/services/facade.service';

export interface LvFiltersData {
    statusOptions?: CodeDTO[];
    state?: LeistungsvereinbarungSuchenParamDTO;
}

@Component({
    selector: 'avam-leistungsvereinbarung-suchen-form',
    templateUrl: './leistungsvereinbarung-suchen-form.component.html',
    providers: [LeistungsvereinbarungSuchenHandlerService, LeistungsvereinbarungSuchenReactiveFormsService]
})
export class LeistungsvereinbarungSuchenFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input('data') data: LvFiltersData;

    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    public formGroup: FormGroup;
    statusOptionsMapped: any[];
    disableInputs: boolean;

    constructor(public handler: LeistungsvereinbarungSuchenHandlerService, private facade: FacadeService) {
        this.formGroup = handler.reactiveForms.searchForm;
    }

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue) {
            this.mapData();
        }
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
    }

    mapData() {
        if (this.data) {
            this.statusOptionsMapped = this.facade.formUtilsService.mapDropdown(this.data.statusOptions);

            if (this.data.state) {
                const form = this.mapToForm(this.data.state);
                this.formGroup.reset(form);
            }
        }
    }

    mapToDTO(full = false): LeistungsvereinbarungSuchenParamDTO {
        return this.handler.mapToDTO(full);
    }

    mapToForm(data: any): any {
        return this.handler.mapToForm(data);
    }

    reset() {
        this.facade.fehlermeldungenService.closeMessage();
        this.formGroup.reset();
        this.disableInputs = this.handler.reactiveForms.toggleEnabledInputs(false, false, false);
    }

    toggleEnabledInputsForLeistungsvereinbarungNr(event: any) {
        if (!event) {
            return;
        }

        const leistungsvereinbarungNrValue = event.target ? event.target.value : event;
        this.disableInputs = this.handler.reactiveForms.toggleEnabledInputs(leistungsvereinbarungNrValue, false, false);
    }

    toggleEnabledInputsForVertragswertNr(event: any) {
        if (!event) {
            return;
        }

        const vertragswertNrValue = event.target ? event.target.value : event;
        this.disableInputs = this.handler.reactiveForms.toggleEnabledInputs(false, vertragswertNrValue, false);
    }

    toggleEnabledInputsForProfilNr(event: any) {
        if (!event) {
            return;
        }

        const profilNrValue = event.target ? event.target.value : event;
        this.disableInputs = this.handler.reactiveForms.toggleEnabledInputs(false, false, profilNrValue);
    }
}

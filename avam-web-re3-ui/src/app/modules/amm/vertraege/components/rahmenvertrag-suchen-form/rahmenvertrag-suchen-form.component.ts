import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { LeistungsvereinbarungSuchenParamDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungSuchenParamDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { RahmenvertragSuchenHandlerService } from './rahmenvertrag-suchen-handler.service';
import { RahmenvertragSuchenReactiveFormsService } from './rahmenvertrag-suchen-reactive-forms.service';

export interface LvFiltersData {
    statusOptions?: CodeDTO[];
    state?: LeistungsvereinbarungSuchenParamDTO;
}

@Component({
    selector: 'avam-rahmenvertrag-suchen-form',
    templateUrl: './rahmenvertrag-suchen-form.component.html',
    providers: [RahmenvertragSuchenHandlerService, RahmenvertragSuchenReactiveFormsService]
})
export class RahmenvertragSuchenFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() rahmenvertragData = null;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    statusOptionsMapped: CodeDTO[];
    gueltigOptionsMapped: CodeDTO[];
    massnahmentypOptionsMapped = [];
    disableInputs = false;

    constructor(public handler: RahmenvertragSuchenHandlerService, private facade: FacadeService, private obliqueHelper: ObliqueHelperService) {
        this.formGroup = handler.reactiveForms.searchForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.rahmenvertragData.currentValue) {
            this.mapData();
        }
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
    }

    mapData() {
        if (this.rahmenvertragData) {
            this.statusOptionsMapped = this.facade.formUtilsService.mapDropdown(this.rahmenvertragData.statusOptions);
            this.gueltigOptionsMapped = this.facade.formUtilsService.mapDropdown(this.rahmenvertragData.gueltigOptions);
            this.massnahmentypOptionsMapped = this.rahmenvertragData.massnahmeOptions.map(this.handler.propertyMapper);
            this.formGroup.reset(this.handler.mapDefaultValues());

            if (this.rahmenvertragData.state) {
                const form = this.handler.mapToForm(this.rahmenvertragData.state);
                this.formGroup.reset(form);
            }
        }
    }

    mapToDTO(): LeistungsvereinbarungSuchenParamDTO {
        return this.handler.mapToDTO(this.statusOptionsMapped);
    }

    reset() {
        this.formGroup.reset(this.handler.mapDefaultValues());
        this.disableInputs = false;
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const rahmenvertragNrValue = event.target ? event.target.value : event;
        this.disableInputs = rahmenvertragNrValue ? true : false;
    }
}

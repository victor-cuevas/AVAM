import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StatusEnum } from '@app/shared/classes/fixed-codes';
import { RegionSuchenParamDTO } from '@app/shared/models/dtos-generated/regionSuchenParamDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { PlanwertSuchenParameterDTO } from '@dtos/planwertSuchenParameterDTO.ts';
import { PlanwertSuchenHandlerService } from './planwert-suchen-handler.service';
import { PlanwertSuchenReactiveFormService } from './planwert-suchen-reactive-form.service';

export interface PlanwertSuchenData {
    state?: PlanwertSuchenParameterDTO;
    massnahmentypOptions?: CodeDTO[];
}

@Component({
    selector: 'avam-planwert-suchen-form',
    templateUrl: './planwert-suchen-form.component.html',
    styleUrls: ['./planwert-suchen-form.component.scss'],
    providers: [PlanwertSuchenHandlerService, PlanwertSuchenReactiveFormService, ObliqueHelperService]
})
export class PlanwertSuchenFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input('planwertData') planwertData: PlanwertSuchenData;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    disableInputs = false;
    massnahmentypOptions = [];
    durchfuehrungsregionParams: RegionSuchenParamDTO = {
        gueltigkeit: StatusEnum.ALL
    };

    planwertSuchenForm: FormGroup;

    constructor(public handler: PlanwertSuchenHandlerService, private obliqueHelperService: ObliqueHelperService) {
        this.planwertSuchenForm = this.handler.reactiveForm.planwertSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.planwertData.currentValue) {
            this.massnahmentypOptions = this.planwertData.massnahmentypOptions.map(this.handler.customPropertyMapper);
            if (this.planwertData.state) {
                this.planwertSuchenForm.reset(this.handler.mapToForm(this.planwertData.state, true));
            }
        }
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const planwertNrValue = event.target ? event.target.value : event;
        this.disableInputs = planwertNrValue ? true : false;
    }

    handleDurchfuehrungsRegionClear(event) {
        if (event && event.target && event.target.value === '') {
            this.planwertSuchenForm.controls.durchfuehrungsRegion.reset();
        }
    }

    reset() {
        this.planwertSuchenForm.reset();
        this.disableInputs = false;
    }
}

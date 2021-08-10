import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeDTO } from '@dtos/codeDTO';
import { InfotagDurchfuehrungseinheitSuchenParamDTO } from '@dtos/infotagDurchfuehrungseinheitSuchenParamDTO';
import { InfotagBewirtschaftungSuchenHandlerService } from './infotag-bewirtschaftung-suchen-handler.service';
import { InfotagBewirtschaftungSuchenReactiveFormsService } from './infotag-bewirtschaftung-suchen-reactive-form.service';

export interface InfotagBewirtschaftungSuchenData {
    state?: InfotagDurchfuehrungseinheitSuchenParamDTO;
    dropdownOptions?: CodeDTO[];
}
@Component({
    selector: 'avam-infotag-bewirtschaftung-suchen-form',
    templateUrl: './infotag-bewirtschaftung-suchen-form.component.html',
    styleUrls: ['./infotag-bewirtschaftung-suchen-form.component.scss'],
    providers: [InfotagBewirtschaftungSuchenReactiveFormsService, InfotagBewirtschaftungSuchenHandlerService]
})
export class InfotagBewirtschaftungSuchenFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input('infotagData') infotagData: InfotagBewirtschaftungSuchenData;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    disableInputs = false;
    defaultDropdownOption: number;
    categoriesOptions = [];
    public infotagSuchenForm: FormGroup;

    constructor(private handler: InfotagBewirtschaftungSuchenHandlerService, private obliqueHelper: ObliqueHelperService) {
        this.infotagSuchenForm = this.handler.reactiveForm.infotagSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.infotagData.currentValue) {
            this.categoriesOptions = this.infotagData.dropdownOptions.map(this.handler.customPropertyMapper);
            this.defaultDropdownOption = this.categoriesOptions.find(el => el.isSelected);
            this.infotagSuchenForm.patchValue(this.handler.getDefaultData(this.defaultDropdownOption));
            if (this.infotagData.state) {
                const form = this.handler.mapStoreDataToForm(this.infotagData.state);
                this.infotagSuchenForm.reset(form);
            }
        }
    }

    mapToDto() {
        return this.handler.mapToDto();
    }

    toggleEnabledInputs(event: any) {
        if (!event) {
            return;
        }

        const massnahmeNrValue = event.target ? event.target.value : event;
        this.disableInputs = massnahmeNrValue ? true : false;
    }

    reset() {
        this.infotagSuchenForm.reset(this.handler.getDefaultData(this.defaultDropdownOption));
        this.disableInputs = false;
    }

    mapStoreData(): InfotagDurchfuehrungseinheitSuchenParamDTO {
        return this.handler.mapDataToStorage();
    }

    mapStorageDataToDto(stateData): InfotagDurchfuehrungseinheitSuchenParamDTO {
        return this.handler.mapStorageDataToDto(stateData);
    }
}

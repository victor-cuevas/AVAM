import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { StatusEnum } from '@app/shared/classes/fixed-codes';
import { CodeSuchenParamDTO } from '@app/shared/models/dtos-generated/codeSuchenParamDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { CodesSuchenHandlerService } from './codes-suchen-handler.service';
import { CodesSuchenReactiveFormService } from './codes-suchen-reactive-form.service';

@Component({
    selector: 'avam-codes-suchen-form',
    templateUrl: './codes-suchen-form.component.html',
    providers: [CodesSuchenHandlerService, CodesSuchenReactiveFormService]
})
export class CodesSuchenFormComponent implements OnInit, OnChanges {
    @Input() formData = null;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();
    //Emits event when state data is mapped to form
    @Output() savedSearchData: EventEmitter<any> = new EventEmitter();
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    readonly stateKey = 'code-search';
    statusDropdownLabels = [];
    public formGroup: FormGroup;

    constructor(private reactiveForm: CodesSuchenReactiveFormService, private handler: CodesSuchenHandlerService, private facade: FacadeService) {
        this.formGroup = this.reactiveForm.codeSuchenForm;
    }

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.formData.currentValue) {
            this.statusDropdownLabels = this.formData.statusOptions.map(this.handler.codePropertyMapper);
            if (this.formData.state) {
                this.formGroup.patchValue(this.formData.state);
                this.savedSearchData.emit();
            } else {
                this.formGroup.controls.status.setValue(StatusEnum.AKTIV);
            }
        }
    }

    reset() {
        this.formGroup.reset();
        this.formGroup.controls.status.setValue(StatusEnum.AKTIV);
    }

    mapToDTO(): CodeSuchenParamDTO {
        return this.handler.mapToDTO();
    }

    mapStateData(): any {
        return this.handler.mapStateData();
    }
}

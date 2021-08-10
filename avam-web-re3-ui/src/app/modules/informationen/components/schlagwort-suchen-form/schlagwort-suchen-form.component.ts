import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { FacadeService } from '@app/shared/services/facade.service';
import { SchlagwortSuchenHandlerService } from './schlagwort-suchen-handler.service';
import { SchlagwortSuchenReactiveFormService } from './schlagwort-suchen-reactive-form.service';

@Component({
    selector: 'avam-schlagwort-suchen-form',
    templateUrl: './schlagwort-suchen-form.component.html',
    providers: [SchlagwortSuchenHandlerService, SchlagwortSuchenReactiveFormService]
})
export class SchlagwortSuchenFormComponent implements OnInit {
    @Input() formData = null;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    readonly stateKey = 'code-search';
    statusDropdownLabels = [];
    verfuegbarInOptions = [];
    benutzerType = BenutzerAutosuggestType.BENUTZER;
    verantwortlichSuchenTokens = {};
    public formGroup: FormGroup;

    constructor(private reactiveForm: SchlagwortSuchenReactiveFormService, private handler: SchlagwortSuchenHandlerService, private facade: FacadeService) {
        this.formGroup = this.reactiveForm.schlagwortSuchenForm;
    }

    ngOnInit() {}

    reset() {
        this.formGroup.reset();
    }
}

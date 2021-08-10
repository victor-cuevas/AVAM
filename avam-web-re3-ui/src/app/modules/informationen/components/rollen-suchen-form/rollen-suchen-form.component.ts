import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { RollenSuchenHandlerService } from '@modules/informationen/components/rollen-suchen-form/rollen-suchen-handler.service';
import { RollenSuchenReactiveFormsService } from '@modules/informationen/components/rollen-suchen-form/rollen-suchen-reactive-forms.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { RollenSuchenFormData } from '@modules/informationen/components/rollen-suchen-form/rollen-suchen-form.data';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-rollen-suchen-form',
    templateUrl: './rollen-suchen-form.component.html',
    providers: [RollenSuchenHandlerService, RollenSuchenReactiveFormsService]
})
export class RollenSuchenFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @Input() stateKey: string;
    @Input() formData: RollenSuchenFormData;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();
    @Output() onStateRestore: EventEmitter<any> = new EventEmitter();
    searchForm: FormGroup;

    constructor(public handler: RollenSuchenHandlerService, private obliqueHelper: ObliqueHelperService) {
        this.searchForm = handler.reactive.searchForm;
    }

    ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.formData.currentValue) {
            this.handler.handle(this.formData, this.stateKey, () => this.onStateRestore.emit());
        }
    }
}

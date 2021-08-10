import { Component, OnInit } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CodeFormModeService } from './code-form-mode.service';
import { CodeFormHandlerService } from './code-handler.service';
import { CodeReactiveFormsService } from './code-reactive-forms.service';

@Component({
    selector: 'avam-code-form',
    templateUrl: './code-form.component.html',
    providers: [CodeFormHandlerService, CodeReactiveFormsService, CodeFormModeService, ObliqueHelperService]
})
export class CodeFormComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}

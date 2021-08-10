import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { AvamPlzAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-plz-autosuggest/avam-plz-autosuggest.component';

@Component({
    selector: 'avam-common-info-fields',
    templateUrl: './common-info-fields.component.html',
    styleUrls: ['./common-info-fields.component.scss']
})
export class CommonInfoFieldsComponent implements AfterViewInit {
    @Input() public form: FormGroup;
    @Input() public requiredFieldValidations = false;
    @Input() public isFirstField = false;
    @Input() public disableControls = false;
    @Input() public readonlyControls = false;
    @Input() public nummerPlaceholder;
    @ViewChild('plzAutosuggestComponent') public plzAutosuggestComponent: AvamPlzAutosuggestComponent;

    public ngAfterViewInit() {
        if (this.requiredFieldValidations) {
            this.form.controls.name.setValidators(Validators.required);
            this.form.controls.land.setValidators(Validators.required);
            this.form.controls.plz.get('postleitzahl').setValidators(TwoFieldsAutosuggestValidator.autosuggestRequired('postleitzahl'));
            this.form.controls.plz.get('ort').setValidators(TwoFieldsAutosuggestValidator.autosuggestRequired('ort'));
            this.form.controls.plzPostfach.get('postleitzahl').setValidators(TwoFieldsAutosuggestValidator.autosuggestRequired('postleitzahl'));
            this.form.controls.plzPostfach.get('ort').setValidators(TwoFieldsAutosuggestValidator.autosuggestRequired('ort'));
        }
    }
}

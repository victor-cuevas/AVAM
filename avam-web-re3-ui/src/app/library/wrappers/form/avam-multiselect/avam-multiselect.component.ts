import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, FormGroupDirective, ValidationErrors } from '@angular/forms';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-multiselect',
    templateUrl: './avam-multiselect.component.html',
    styleUrls: ['./avam-multiselect.component.scss']
})
export class AvamMultiselectComponent implements OnInit, AfterViewInit {
    @ViewChild('multiSelectTemplate') multiSelectTemplate: TemplateRef<any>;
    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @Input('parentForm') parentForm: FormGroup;
    @Input('controlName') controlName: string;
    @Input('enableSearch') enableSearch = true;
    @Input('dynamicTitleMaxItems') dynamicTitleMaxItems = 3;
    @Input('label') label: string;
    @Input('inputClass') inputClass: string;
    @Input('isDisabled') isDisabled: boolean;
    @Input('placeholder') placeholder = false;
    @Output('onChange') onChange: EventEmitter<CoreMultiselectInterface[]> = new EventEmitter();

    @Input('mandatory') set mandatory(value: boolean) {
        this._mandatory = value;
        this.addOrRemoveMandatoryValidator();
        this.addOrRemoveMandatoryClass();
    }
    _mandatory: boolean;

    @Input('options') set options(data) {
        if (Array.isArray(data)) {
            this.data = data;
        }
    }

    data: CoreMultiselectInterface[];
    multiselectBUtton: Element;
    isMandatory = false;

    constructor(private obliqueHelper: ObliqueHelperService, private cd: ChangeDetectorRef) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);

        if (this.parentForm.controls[this.controlName].errors && this.parentForm.controls[this.controlName].errors.required) {
            this.isMandatory = true;
        }
    }

    ngAfterViewInit(): void {
        this.multiselectBUtton = document.getElementsByClassName('multiselect-toggle')[0];
        this.addOrRemoveMandatoryValidator();
        this.addOrRemoveMandatoryClass();
    }

    private addOrRemoveMandatoryValidator() {
        if (this.isMandatory || this._mandatory) {
            this.parentForm.controls[this.controlName].setValidators(AvamMultiselectComponent.hasItemSelected);
        } else {
            this.parentForm.controls[this.controlName].clearValidators();
        }
        this.parentForm.controls[this.controlName].updateValueAndValidity();
    }

    static hasItemSelected(control: AbstractControl): ValidationErrors | null {
        if (AvamMultiselectComponent.hasValue(control)) {
            return null;
        }
        return { required: true };
    }

    static hasValue(control: AbstractControl) {
        return !control.value || control.value.some(item => item.value === true);
    }

    onRemove(currentElement: CoreMultiselectInterface) {
        currentElement.value = false;
        this.options = this.data.slice();
        this.parentForm.markAsDirty();
        this.onChange.emit(this.parentForm.controls[this.controlName].value);
        this.addOrRemoveMandatoryClass();
    }

    onLoaded(options: CoreMultiselectInterface[]) {
        setTimeout(() => {
            this.parentForm.controls[this.controlName].setValue(options);
            this.addOrRemoveMandatoryClass();
        }, 0);
    }

    changedElements() {
        this.onChange.emit(this.parentForm.controls[this.controlName].value);
        this.addOrRemoveMandatoryClass();
    }

    addOrRemoveMandatoryClass() {
        if (this.multiselectBUtton) {
            if (this.isMandatory || this._mandatory) {
                if (AvamMultiselectComponent.hasValue(this.parentForm.controls[this.controlName])) {
                    this.multiselectBUtton.classList.remove('form-control', 'control-mandatory');
                } else {
                    this.multiselectBUtton.classList.add('form-control', 'control-mandatory');
                }
            } else {
                this.multiselectBUtton.classList.remove('form-control', 'control-mandatory');
            }
        }
    }
}

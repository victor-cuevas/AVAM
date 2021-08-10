import { DbTranslateService } from '@shared/services/db-translate.service';
import { CodeDTO } from '@dtos/codeDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'avam-beurteilungscriterium-select',
    templateUrl: './avam-beurteilungscriterium-select.component.html',
    styleUrls: ['./avam-beurteilungscriterium-select.component.scss']
})
export class AvamBeurteilungscriteriumSelectComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() isDisabled: boolean;
    @Input() placeholder: string;
    @Input() label: string;
    @Input() coreReadOnlyClearButton: boolean;
    @Input() customWrapperClass: string;
    @Input() customLabelClass: string;
    @Input() customInputClass: string;
    @Input() customInputContainerClass: string;
    @Input() customReadOnlyClass: string;
    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;

        if (this.isReadOnly && this.selectedValue) {
            this.updateReadOnlyValue();
            this.coreInputComponent.inputElement.nativeElement.value = this.dbTranslateService.translate(this.selectedValue, 'kurzText');
        }
    }

    @Output() onClear: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('coreInput') coreInputComponent: CoreInputComponent;

    readOnlyValue: string;
    isReadOnly: boolean;
    selectedValue: CodeDTO = null;

    constructor(private readonly modalService: NgbModal, private obliqueHelper: ObliqueHelperService, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        this.dbTranslateService.getEventEmitter().subscribe(() => {
            if (this.selectedValue) {
                this.updateInputValue();
                this.updateReadOnlyValue();
            }
        });
    }

    onHandleInput(event: CodeDTO) {
        this.updateFormValues(event);

        setTimeout(() => {
            this.updateInputValue();
        });

        if (this.isReadOnly) {
            this.updateReadOnlyValue();
        }

        this.onInput.emit(event);
    }

    onHandleChange(event) {
        this.onChange.emit(event);
    }

    onClearField(event) {
        this.updateFormValues(null);
        this.updateInputValue();
        this.updateReadOnlyValue();
        this.onClear.emit(event);
    }

    onHandleKeyUp(event) {
        this.onKeyup.emit(event);
    }

    onHandleBlur(event) {
        this.onBlur.emit(event);
    }

    selectFromModal(event: CodeDTO) {
        this.updateFormValues(event);
        this.updateInputValue();
    }

    openModal(content) {
        this.modalService.open(content, { ariaLabelledBy: '', windowClass: 'modal-md', centered: true, backdrop: 'static' });
    }

    updateInputValue() {
        this.coreInputComponent.inputElement.nativeElement.value = this.getTranslatedValue();
    }

    updateReadOnlyValue() {
        this.readOnlyValue = this.getTranslatedValue();
    }

    updateFormValues(event: CodeDTO) {
        if (this.selectedValue !== event) {
            this.selectedValue = event;
            this.parentForm.controls[this.controlName]['beurteilungscriteriumData'] = event;
            this.parentForm.controls[this.controlName].setValue(event);
        }
    }

    getTranslatedValue() {
        return this.dbTranslateService.translate(this.selectedValue, 'kurzText');
    }
}

import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormGroup, NgForm, FormGroupDirective, FormControlName } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subscription } from 'rxjs';

/**
 * Component with input field and modal window.
 *
 * @export
 * @class AvamInputModalComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
@Component({
    selector: 'avam-input-modal',
    templateUrl: './avam-input-modal.component.html',
    styleUrls: ['./avam-input-modal.component.scss']
})
export class AvamInputModalComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: FormControlName;
    @Input() readOnly = false;
    @Input() selectLabel = '';
    @Input() set toolTip(toolTipText: string) {
        this.toolTipText = toolTipText.trim();
    }
    @Input() placeholder: string;
    @Input() isDisabled: boolean;
    @Input() type: string;
    @Input() inputClass: string;
    @Input() modal: ElementRef;
    @Input() isUpperLabel: boolean;
    @Input() modalTooltip: string;
    @Input() coreReadOnly: string;
    @Input() coreReadOnlyClearButton: boolean;
    @Input() hideOpenModalBtn = false;
    @Output() onKeyup: EventEmitter<any> = new EventEmitter();
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    @ViewChild('ngForm') formInstance: FormGroupDirective;

    toolTipText: string;

    sub: Subscription;
    private inputValue = '';

    constructor(private obliqueHelper: ObliqueHelperService, private readonly modalService: NgbModal) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        if (!this.parentForm) {
            throw new Error(
                `AvamInputModalComponent expects the FormGroup instance.
                Please pass one in.\n\n       Example:\n\n    <avam-input-modal [parentForm]="myForm.controls" ...></avam-input-modal>`
            );
        }

        if (!this.controlName) {
            throw new Error(
                `AvamInputModalComponent expects the controlName.
                Please pass one in.\n\n       Example:\n\n    <avam-input-modal controlName="myControlName" ...></avam-input-modal>`
            );
        }
    }

    change(data) {
        this.onChange.emit(data);
    }

    input(data: Event | string) {
        if (data && data instanceof Event) {
            this.inputValue = (data.target as HTMLInputElement).value;
            return;
        }

        this.inputValue = data as string;
        this.onInput.emit(data);
    }

    blur(event: FocusEvent) {
        this.onBlur.emit(event);
    }

    keyup(event: KeyboardEvent) {
        this.onKeyup.emit(event);
    }

    openModal() {
        this.modalService.open(this.modal, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }
}

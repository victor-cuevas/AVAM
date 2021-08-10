import { Component, ElementRef, forwardRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ControlContainer, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputControlValueAccessor } from '../../classes/input-control-value-accessor';

@Component({
    selector: 'app-textarea',
    templateUrl: './textarea.component.html',
    styleUrls: ['./textarea.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true
        }
    ]
})
export class TextareaComponent extends InputControlValueAccessor implements OnInit {
    @Input() selectLabel: string;
    @Input() placeholder: string;
    @Input() tooltip: string;
    @Input() id: string;
    @Input() readonly = false;
    @Input() fullWidth = false;

    /**
     * optional attribute
     */
    @Input() maxLength: number;

    @ViewChild('inputElement') inputElement: ElementRef;

    readonly noIDError = 'You need to specify id for this component!';

    ngOnInit() {
        if (!this.id) {
            throw new Error(this.noIDError);
        }
    }

    /**
     * trigger resize
     */
    writeValue(value): void {
        super.writeValue(value);
        InputControlValueAccessor.dispatchEventTextarea('resize', this.inputElement.nativeElement);
    }

    constructor(private render: Renderer2, private elRef: ElementRef, private controlContainer: ControlContainer) {
        super(render);
    }

    /**
     * truncates provided string if longer than maxLength
     *
     * called on ngModelChange (caused by user changes)
     */
    onChangeTruncate(textAreaContent: string) {
        let valueString = textAreaContent;
        if (this.maxLength && textAreaContent) {
            valueString = '';
            let byteLengthCounter = 0;
            for (let i = 0; i < textAreaContent.length; i++) {
                const char = textAreaContent.substring(i, i + 1);
                const charCode = textAreaContent.charCodeAt(i);
                let byteLength = this.checkByteLength(charCode);

                byteLengthCounter += byteLength;
                if (byteLengthCounter <= this.maxLength) {
                    valueString += char;
                }

                if (charCode >= 0xdc00 && charCode <= 0xdfff) {
                    i++;
                }
            }
        }
        if (textAreaContent !== valueString) {
            this.onChange(valueString);
        } else {
            this._onChange(valueString);
        }
    }

    checkByteLength(charCode: number) {
        let byteLength = 1;
        if (charCode > 0x7f && charCode <= 0x7ff) {
            byteLength = 2;
        } else if (charCode > 0x7ff && charCode <= 0xffff) {
            byteLength = 3;
        }
        return byteLength;
    }

    onFocusOut() {
        const formcontrolName = this.elRef.nativeElement.getAttribute('formcontrolname');
        const control = this.controlContainer.control['controls'][formcontrolName];
        if (control.errors && control.errors.required) {
            this.triggerObliqueValidation(this.controlContainer['form'], control);
        }
    }

    private triggerObliqueValidation(form, control) {
        let markAsPristine = form && !form.dirty && (control.value === null || control.value === '');
        this._onChange(null);
        if (markAsPristine) {
            // Mark the form as pristine if the user leaves the field without changing anything.
            // Examples:
            // - the first field is a required field and the user wants to close the form without any changes
            // - the user goes through the form with tab without any changes
            form.markAsPristine();
        }
    }

    showTooltip(tooltip) {
        tooltip.open();
    }
}

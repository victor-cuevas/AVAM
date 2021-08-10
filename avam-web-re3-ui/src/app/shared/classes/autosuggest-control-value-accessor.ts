import { BaseControlValueAccessor } from './base-control-value-accessor';
import { ViewChild } from '@angular/core';

export class AutosuggestControlValueAccessor extends BaseControlValueAccessor {
    @ViewChild('inputElement') inputElement: any;

    writeValue(value: any): void {
        if (value) {
            this.value = value;
        } else {
            this.value = null;
        }

        if (this.inputElement) {
            this._renderer.setProperty(this.inputElement, 'model', this.value ? value.value : '');
        }
    }

    onChange(value: any): void {
        this._onChange(value);
    }
}

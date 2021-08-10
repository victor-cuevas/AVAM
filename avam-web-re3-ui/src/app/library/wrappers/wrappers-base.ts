import { Input, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    template: ''
})
export class WrappersBaseComponent {
    @Input() parentForm: FormGroup;
    @Input() controlName: any;

    @Input()
    set isDisabled(disabled: boolean) {
        this._isDisabled = disabled;
    }
    get isDisabled() {
        return this._isDisabled;
    }

    private _isDisabled: boolean;

    @Input()
    set readOnly(readonly: boolean) {
        this._readOnly = readonly;
    }
    get readOnly() {
        return this._readOnly;
    }

    private _readOnly: boolean;

    constructor() {}
}

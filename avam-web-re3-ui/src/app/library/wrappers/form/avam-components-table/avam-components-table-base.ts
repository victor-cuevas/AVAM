import { Input, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    template: ''
})
export class AvamComponentsTableBaseComponent implements OnInit {
    isReadOnlyBoolean: boolean;

    @Input() parentForm;
    @Input() controlName;

    @Input()
    set options(data) {
        this._options = data;
    }
    get options() {
        return this._options;
    }

    private _options: any;

    parseChange(group: FormGroup, callback) {
        if (callback) {
            callback(group);
        }
    }

    ngOnInit() {
        this.isReadOnlyBoolean = typeof this.options.component.readOnly === 'boolean';
    }
}

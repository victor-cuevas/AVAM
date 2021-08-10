import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'avam-dropdown-datepicker',
    templateUrl: './avam-dropdown-datepicker.component.html',
    styleUrls: ['./avam-dropdown-datepicker.component.scss']
})
export class AvamDropdownDatepickerComponent implements OnInit {
    @Input() parentForm: FormGroup;
    @Input() controlNameDropdown: string;
    @Input() controlNameVon: string;
    @Input() controlNameBis: string;
    @Input() placeholder: string;
    @Input() label: string;
    @Input() inputClassLabel: string;
    @Input() inputClassControl: string;
    @Input() isDisabled: boolean;
    @Input() disabledDropdown: boolean;
    @Input() disabledDatePicker: boolean;
    @Input() hideEmptyOption: boolean;
    @Input() options: any[];
    @Input() set readOnly(isReadOnly: boolean) {
        this.isReadOnly = isReadOnly;
    }

    /**
     * Field to restrict range dynamicaly
     */
    @Input() minFrom: Date;
    /**
     * Field to restrict range dynamicaly
     */
    @Input() maxFrom: Date;

    /**
     * Field to restrict range dynamicaly
     */
    @Input() minTo: Date;
    /**
     * Field to restrict range dynamicaly
     */
    @Input() maxTo: Date;

    @Output() onChange: EventEmitter<any> = new EventEmitter();

    isReadOnly: boolean;

    constructor() {}

    ngOnInit() {}

    dropdownChange(event) {
        this.onChange.emit(event);
    }
}

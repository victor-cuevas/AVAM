import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DbTranslateService } from '@shared/services/db-translate.service';

@Component({
    selector: 'avam-prepend-dropdown',
    templateUrl: './avam-prepend-dropdown.component.html',
    styleUrls: ['./avam-prepend-dropdown.component.scss']
})
export class AvamPrependDropdownComponent {
    @Input() options = [];
    @Input() selectLabel: string;
    @Input() placeholder: string;
    @Input() inputClass: string;
    @Input() parentForm: FormGroup;
    @Input() controlName: any;
    @Input() isDisabled: boolean;
    @Input() readOnly = false;
    @Input() id: string;
    @Input() hideEmptyOption: boolean;
    @Output() onChange: EventEmitter<any> = new EventEmitter();
    value: string;

    constructor(private dbTranslateService: DbTranslateService) {}

    change(value: string) {
        this.value = value;
        this.onChange.emit(value);
    }

    getReadOnlyValue() {
        const selected = this.options.find(option => option.value === this.value);
        return selected ? this.dbTranslateService.translate(selected, 'label') : null;
    }
}

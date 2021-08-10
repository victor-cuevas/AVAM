import { Component, Input, forwardRef, Renderer2, OnInit } from '@angular/core';
import { BaseControlValueAccessor } from '../../classes/base-control-value-accessor';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService } from '../../services/forms/form-utils.service';

@Component({
    selector: 'app-paragraph',
    templateUrl: './paragraph.component.html',
    styleUrls: ['./paragraph.component.scss'],
    providers: []
})
export class ParagraphComponent implements OnInit {
    @Input() label: string;
    @Input() value: string | NgbDate;
    @Input() id: string;
    @Input() customClassInput: string;

    constructor(private formUtil: FormUtilsService) {}

    ngOnInit() {
        if (!this.id) {
            throw new Error('You need to specify id for this component!');
        }
    }

    getValue() {
        return this.formUtil.transformToStringIfNgbDate(this.value);
    }
}

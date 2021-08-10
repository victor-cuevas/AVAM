import { Component, OnInit, Input } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';

@Component({
    selector: 'app-double-paragraph',
    templateUrl: './double-paragraph.component.html',
    styleUrls: ['./double-paragraph.component.scss']
})
export class DoubleParagraphComponent implements OnInit {
    @Input() label: string;
    @Input() value1: string | NgbDate;
    @Input() value2: string | NgbDate;
    @Input() id: string;
    @Input() customClassInput: string;

    constructor(private formUtil: FormUtilsService) {}

    ngOnInit() {
        if (!this.id) {
            throw new Error('You need to specify id for this component!');
        }
    }

    getValue1() {
        return this.formUtil.transformToStringIfNgbDate(this.value1);
    }
    getValue2() {
        return this.formUtil.transformToStringIfNgbDate(this.value2);
    }
}

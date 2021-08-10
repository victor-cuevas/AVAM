import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { WrappersBaseComponent } from '../../wrappers-base';
import { Subject } from 'rxjs';

@Component({
    selector: 'avam-label-dropdown',
    templateUrl: './avam-label-dropdown.component.html',
    styleUrls: ['./avam-label-dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvamLabelDropdownComponent extends WrappersBaseComponent implements OnInit {
    @Input() selectLabel: string;

    @Input() placeholder: string;

    @Input() hideEmptyOption: boolean;

    @Input() inputClass: string;

    @Input() labelClass: string;

    @Input() id: string;

    @Output() onChange: EventEmitter<any> = new EventEmitter();

    @Input() autoDisplayFirst = false;

    @Input() options: any[];

    @ViewChild('ngForm') formInstance: FormGroupDirective;

    currentValue: string;

    constructor(private dbTranslateService: DbTranslateService, private obliqueHelper: ObliqueHelperService, private cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance, () => {
            this.cd.detectChanges();
        });

        this.dbTranslateService.getEventEmitter().subscribe(() => {
            this.cd.detectChanges();
        });
    }

    change(value) {
        this.currentValue = value;
        this.onChange.emit(value);
    }

    readOnlyValue() {
        let readOnlyValue = '';
        const selectedItem = this.options.find((option: any) => {
            return String(option.value) === String(this.currentValue);
        });

        if (this.dbTranslateService.translate(selectedItem, 'label') !== null) {
            readOnlyValue = String(this.dbTranslateService.translate(selectedItem, 'label'));
        }

        return readOnlyValue;
    }
}

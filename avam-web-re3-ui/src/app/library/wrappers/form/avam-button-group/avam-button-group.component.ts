import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CoreButtonGroupInterface } from '@app/library/core/core-button-group/core-button-group.interface';
import { FormGroup, FormControlName } from '@angular/forms';

@Component({
    selector: 'avam-button-group',
    templateUrl: './avam-button-group.component.html',
    styleUrls: ['./avam-button-group.component.scss']
})
export class AvamButtonGroupComponent implements OnInit {
    /**
     *
     *
     * @type {CoreButtonGroupInterface[]}
     * @memberof AvamButtonGroupComponent
     */
    @Input('group') group: CoreButtonGroupInterface[];

    /**
     *
     *
     * @type {FormGroup}
     * @memberof AvamButtonGroupComponent
     */
    @Input() parentForm: FormGroup;

    /**
     *
     *
     * @type {FormControlName}
     * @memberof AvamButtonGroupComponent
     */
    @Input() controlName: FormControlName;

    /**
     *
     *
     * @memberof AvamButtonGroupComponent
     */
    @Output('onClick') onClick: EventEmitter<any> = new EventEmitter();

    /**
     *Creates an instance of AvamButtonGroupComponent.
     * @memberof AvamButtonGroupComponent
     */
    constructor() {}

    /**
     *
     *
     * @memberof AvamButtonGroupComponent
     */
    ngOnInit() {}

    /**
     *
     *
     * @param {CoreButtonGroupInterface} selected
     * @memberof AvamButtonGroupComponent
     */
    onSelect(selected: CoreButtonGroupInterface) {
        this.onClick.next(selected);
        this.parentForm.controls[String(this.controlName)].setValue(selected);
    }
}

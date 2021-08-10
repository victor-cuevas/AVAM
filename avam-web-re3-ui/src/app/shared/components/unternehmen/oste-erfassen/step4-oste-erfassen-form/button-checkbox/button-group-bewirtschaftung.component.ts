import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreButtonGroupInterface } from '@app/library/core/core-button-group/core-button-group.interface';

@Component({
    selector: 'avam-button-group-bewirtschaftung',
    templateUrl: './button-group-bewirtschaftung.component.html',
    styleUrls: ['./button-group-bewirtschaftung.component.scss']
})
export class ButtonGroupBewirtschaftungComponent {
    @Output() currentValueChanged: EventEmitter<void> = new EventEmitter();
    @Input() parentForm;
    @Input() controlName = '';

    isAnonymDisabled = false;
    isAnonymChecked = false;
    checkBoxLabel = 'common.label.anonym';

    private currentValue: GroupBewirtschaftung;

    group: CoreButtonGroupInterface[] = [
        {
            label: 'common.label.ja',
            value: PublikationEnum.JA,
            disabled: false,
            selected: false
        },
        {
            label: 'common.label.nein',
            value: PublikationEnum.NEIN,
            disabled: false,
            selected: false
        }
    ];

    constructor() {
        this.currentValue = this.getCurrentValue();
    }

    public disableComponent(disableComponent: boolean, anonym?: boolean) {
        this.isAnonymDisabled = typeof anonym === 'undefined' ? disableComponent : anonym;
        this.group.forEach(item => (item.disabled = disableComponent));
    }

    public updateSelectedButton(isYes: boolean, anonym?: boolean) {
        if (isYes) {
            this.group.forEach(item => (item.value === PublikationEnum.JA ? (item.selected = true) : (item.selected = false)));
            if (typeof anonym !== 'undefined') {
                this.isAnonymChecked = anonym;
            }
            this.isAnonymDisabled = false;
        } else {
            this.group.forEach(item => (item.value === PublikationEnum.NEIN ? (item.selected = true) : (item.selected = false)));
            this.isAnonymDisabled = true;
            this.isAnonymChecked = false;
            this.currentValue.isAnonym = false;
        }
    }

    updateAnonymValue(): void {
        this.isAnonymChecked = !this.isAnonymChecked;
        this.parentForm.controls[this.controlName].markAsDirty();
        this.emitCurrentValue();
    }

    emitCurrentValue() {
        const isNein = !this.getCurrentValue().isYesSelected;
        if (isNein) {
            this.isAnonymChecked = false;
        }
        this.isAnonymDisabled = isNein;
        this.currentValueChanged.emit();
    }

    getCurrentValue(): GroupBewirtschaftung {
        let selectedYes = false;
        this.group.forEach(item => {
            if (item.value === PublikationEnum.JA) {
                selectedYes = item.selected;
            }
        });
        return {
            isYesSelected: selectedYes,
            isAnonym: this.isAnonymChecked
        };
    }
}

export interface GroupBewirtschaftung {
    isYesSelected?: boolean;
    isAnonym?: boolean;
}
enum PublikationEnum {
    JA = 'ja',
    NEIN = 'nein'
}

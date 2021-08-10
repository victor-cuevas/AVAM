import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CoreSliderComponent } from '@app/library/core/core-slider/core-slider.component';

@Component({
    selector: 'avam-input-slider',
    templateUrl: './avam-input-slider.component.html',
    styleUrls: ['./avam-input-slider.component.scss']
})
export class AvamInputSliderComponent implements OnInit, AfterViewInit {
    @Input() parentForm: FormGroup;
    @Input() controlName: string;
    @Input() showTwoLines = false;
    @Input() stundenLabel = false;
    @Input() step = 1;
    @Input() isDisabled: boolean;
    @Input() selectLabel = '';
    @Input() prependLabel = '';
    @Input() showPercentageSign = true;
    @Input() min = 0;
    @Input() max = 100;
    @Input() isNullable = true;

    @ViewChild('ngForm') formInstance: FormGroupDirective;
    @ViewChild('sliderControl') sliderControl: CoreSliderComponent;

    constructor(private obliqueHelper: ObliqueHelperService) {}

    ngOnInit() {
        this.obliqueHelper.generateState(this.formInstance);
        if (!this.parentForm.controls[this.controlName].value) {
            this.parentForm.controls[this.controlName].setValue(0);
        }
    }

    ngAfterViewInit(): void {
        // Set the slider to the start-value
        this.setCorrectValues(this.parentForm.controls[this.controlName].value);
    }

    keypress(event: KeyboardEvent) {
        if (event.which !== 46 && event.which !== 8 && (event.which < 48 || event.which > 57)) {
            event.preventDefault();
        }
    }

    onChangeSlider(target: EventTarget) {
        const roundValue = Math.floor(Number((target as HTMLInputElement).value));
        this.setCorrectValues(roundValue);
    }

    onInput(target: EventTarget) {
        if (this.parentForm.controls[this.controlName].valid && target) {
            this.setCorrectValues((target as HTMLInputElement).value);
        }
    }

    onBlur(target: EventTarget) {
        if (this.parentForm.controls[this.controlName].valid) {
            const targetValue: string = (target as HTMLInputElement).value;

            if (targetValue === '') {
                this.setCorrectValues('');
            } else {
                const roundValue = this.min + Math.round((Number(targetValue) - this.min) / this.step) * this.step;
                this.setCorrectValues(roundValue);
            }
        }
    }

    private setCorrectValues(value: number | string) {
        if (this.isNullable && (value === this.min - this.step || value === '')) {
            // Clear the input-field and set the slider to the left
            this.parentForm.controls[this.controlName].setValue('');
            this.sliderControl.writeValue(this.min - this.step);
        } else {
            this.parentForm.controls[this.controlName].setValue(value);
            this.sliderControl.writeValue(Number(value));
        }
    }
}

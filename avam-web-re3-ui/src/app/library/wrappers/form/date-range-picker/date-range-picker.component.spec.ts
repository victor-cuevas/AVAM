import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangePickerComponent } from './date-range-picker.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroupDirective, NgControl, ControlContainer } from '@angular/forms';
import { MockTranslatePipe } from '../../../../../../test_helpers';
import { TranslateService } from '@ngx-translate/core';
import { BsLocaleService, BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { CoreCalendarComponent } from '@app/library/core/core-calendar/core-calendar.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

describe('DateRangePickerComponent', () => {
    let component: DateRangePickerComponent;
    let fixture: ComponentFixture<DateRangePickerComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DateRangePickerComponent, MockTranslatePipe, CoreCalendarComponent, MockTextControlClearDirective],
            imports: [BrowserModule, FormsModule, ReactiveFormsModule, BsDatepickerModule.forRoot(), NgbTooltipModule.forRoot()],
            providers: [
                { provide: FormBuilder, useValue: formBuilder },
                NgControl,
                { provide: ControlContainer, useValue: controlContrainer },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                BsLocaleService,
                BsDatepickerConfig,
                ObliqueHelperService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DateRangePickerComponent);
        component = fixture.componentInstance;
        component.parentForm = formBuilder.group({
            from: [''],
            to: ['']
        });
        controlContrainer.form = component.parentForm;
        component.formControlNameFrom = 'from';
        component.formControlNameTo = 'to';
        fixture.detectChanges();
    });

    xit('should create', () => {
        expect(component).toBeTruthy();
    });
});

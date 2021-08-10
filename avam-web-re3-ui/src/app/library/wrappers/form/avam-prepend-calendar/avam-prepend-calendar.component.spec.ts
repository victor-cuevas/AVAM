import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CoreCalendarComponent } from '@app/library/core/core-calendar/core-calendar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { FormsModule, ReactiveFormsModule, NgControl, FormBuilder, ControlContainer, FormGroupDirective, FormGroup, FormControl } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';

import { AvamPrependCalendarComponent } from './avam-prepend-calendar.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

describe('AvamPrependCalendarComponent', () => {
    let component: AvamPrependCalendarComponent;
    let fixture: ComponentFixture<AvamPrependCalendarComponent>;
    const calendarForm: FormGroup = new FormGroup({
        calendar: new FormControl('')
    });

    const controlContainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContainer.form = calendarForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamPrependCalendarComponent, CoreCalendarComponent, MockTranslatePipe, MockTextControlClearDirective],
            providers: [
                NgControl,
                FormBuilder,
                ObliqueHelperService,
                {
                    provide: ControlContainer,
                    useValue: controlContainer
                },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                }
            ],
            imports: [FormsModule, ReactiveFormsModule, BsDatepickerModule.forRoot(), NgbTooltipModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamPrependCalendarComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.id = 'COMPONENT_ID';
        component.parentForm = formBuilder.group({
            calendar: ''
        });
        component.controlName = 'calendar';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamLabelCalendarComponent } from './avam-label-calendar.component';
import { MockTranslatePipe } from '../../../../../../test_helpers';
import { FormBuilder, ReactiveFormsModule, FormsModule, ControlContainer, FormGroupDirective, FormControl, FormGroup, NgControl } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BsLocaleService, BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { CoreCalendarComponent } from '@app/library/core/core-calendar/core-calendar.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

describe('AvamLabelCalendarComponent', () => {
    let component: AvamLabelCalendarComponent;
    let fixture: ComponentFixture<AvamLabelCalendarComponent>;
    const calendarForm: FormGroup = new FormGroup({
        calendarInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = calendarForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamLabelCalendarComponent, CoreCalendarComponent, MockTranslatePipe, MockTextControlClearDirective],
            providers: [
                NgControl,
                FormBuilder,
                BsLocaleService,
                BsDatepickerConfig,
                { provide: ControlContainer, useValue: controlContrainer },
                { provide: TranslateService, useClass: TranslateServiceStub },
                ObliqueHelperService
            ],
            imports: [FormsModule, ReactiveFormsModule, BsDatepickerModule.forRoot(), NgbTooltipModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamLabelCalendarComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.id = 'testId';
        component.parentForm = formBuilder.group({
            berufsTaetigkeit: null,
            qualifikation: null,
            ausgeuebtB: null,
            zuletztB: null,
            gesuchtB: null,
            berufsErfahrung: null,
            berufsFunktion: null,
            ausbildungsniveau: null,
            berufsAbschluss: null,
            berufsAbschlussAnerkannt: null,
            ausuebungVon: '',
            ausuebungBis: '',
            dauerJahre: { value: null, disabled: true },
            dauerMonate: { value: null, disabled: true },
            fachkenntnisse: null,
            einschraenkungen: null
        });
        component.controlName = 'ausuebungVon';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

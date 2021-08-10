import { CoreCalendarComponent } from './core-calendar.component';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormGroup, FormControl, FormGroupDirective, NgControl, ControlContainer, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsDatepickerModule, BsLocaleService, BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}
describe('CoreCalendarComponent', () => {
    let component: CoreCalendarComponent;
    let fixture: ComponentFixture<CoreCalendarComponent>;
    const calendarForm: FormGroup = new FormGroup({
        calendarInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = calendarForm;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoreCalendarComponent, MockTranslatePipe, MockTextControlClearDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                NgControl,
                { provide: ControlContainer, useValue: controlContrainer },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                BsLocaleService,
                BsDatepickerConfig
            ],
            imports: [FormsModule, ReactiveFormsModule, BsDatepickerModule.forRoot(), NgbTooltipModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoreCalendarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

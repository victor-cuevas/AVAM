import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { ObjectIteratorPipe } from '../../pipes/keys-value.pipe';
import { MockTranslatePipe, MockTextControlClearDirective } from '../../../../../tests/helpers';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { DbTranslatePipe } from '../../pipes/db-translate.pipe';
import { ErwerbssituationAktuellTableComponent } from './erwerbssituation-aktuell-table.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { CustomPopoverDirective } from '@shared/directives/custom-popover.directive';
import { CoreCalendarComponent } from '@app/library/core/core-calendar/core-calendar.component';

describe('ErwerbssituationAktuellTableComponent', () => {
    let component: ErwerbssituationAktuellTableComponent;
    let fixture: ComponentFixture<ErwerbssituationAktuellTableComponent>;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ErwerbssituationAktuellTableComponent,
                ObjectIteratorPipe,
                MockTranslatePipe,
                DbTranslatePipe,
                CoreCalendarComponent,
                MockTextControlClearDirective,
                CustomPopoverDirective
            ],
            imports: [FormsModule, ReactiveFormsModule, NgbModule, BsDatepickerModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [Renderer2, FormBuilder, { provide: TranslateService, useClass: TranslateServiceStub }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ErwerbssituationAktuellTableComponent);
        formBuilder = TestBed.get(FormBuilder);
        component = fixture.componentInstance;

        component.aktuellForm = formBuilder.group({
            header: formBuilder.group({
                dropdownAktuell: '',
                gueltigAb: ''
            }),
            items: new FormArray([])
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

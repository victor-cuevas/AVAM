import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgControl, FormBuilder, ControlContainer, FormsModule, ReactiveFormsModule, FormGroup, FormControl, FormGroupDirective } from '@angular/forms';
import { NgbTooltip, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { MockTranslatePipe, MockTextControlClearDirective, DbTranslateServiceStub } from '@test_helpers/index';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { LandAutosuggestDropdownComponent } from './land-autosuggest-dropdown.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

describe('LandAutosuggestDropdownComponent', () => {
    let component: LandAutosuggestDropdownComponent;
    let fixture: ComponentFixture<LandAutosuggestDropdownComponent>;
    const calendarForm: FormGroup = new FormGroup({
        calendarInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = calendarForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LandAutosuggestDropdownComponent, MockTranslatePipe, NgbTypeahead, MockTextControlClearDirective],
            providers: [
                NgControl,
                ObliqueHelperService,
                FormBuilder,
                { provide: ControlContainer, useValue: controlContrainer },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub }
            ],
            imports: [FormsModule, ReactiveFormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LandAutosuggestDropdownComponent);
        component = fixture.componentInstance;

        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            antragdatum: null,
            abreisedatum: null,
            datumlstexpvon: null,
            datumlstexpbis: null,
            datumrueckkehr: null,
            antragpendent: false,
            antragabgewiesen: false,
            anspruchsberechtigtFurL: false,
            telefonprivat: null,
            plz: null,
            test: null,
            strasse: '',
            strasseNr: null,
            bemerkung: null,
            zielstaatId: null
        });

        component.controlName = 'zielstaatId';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

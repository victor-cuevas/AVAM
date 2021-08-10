import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamLandAutosuggestComponent } from './avam-land-autosuggest.component';
import { NgbTypeaheadModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { MockTranslatePipe, MockTextControlClearDirective, DbTranslateServiceStub } from '../../../../../../../tests/helpers';
import { ReactiveFormsModule, FormGroup, FormControl, FormGroupDirective, ControlContainer, FormBuilder } from '@angular/forms';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

describe('AvamLandAutosuggestComponent', () => {
    let component: AvamLandAutosuggestComponent;
    let fixture: ComponentFixture<AvamLandAutosuggestComponent>;
    const landAutosuggestForm: FormGroup = new FormGroup({
        landInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = landAutosuggestForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamLandAutosuggestComponent, CoreAutosuggestComponent, MockTranslatePipe, MockTextControlClearDirective, DisableControlDirective, NgbTooltip],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [NgbTypeaheadModule, ReactiveFormsModule],
            providers: [
                HttpClient,
                HttpHandler,
                ObliqueHelperService,
                {
                    provide: StesDataRestService,
                    useClass: StesDataRestService
                },
                { provide: ControlContainer, useValue: controlContrainer },
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamLandAutosuggestComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            zusatzadressenTypID: null,
            name: null,
            vorname: null,
            strasse: null,
            strasseNr: null,
            postfachNr: null,
            plz: null,
            staat: null,
            privatTelefon: null,
            korrespondenzAdresse: null
        });
        component.controlName = 'staat';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

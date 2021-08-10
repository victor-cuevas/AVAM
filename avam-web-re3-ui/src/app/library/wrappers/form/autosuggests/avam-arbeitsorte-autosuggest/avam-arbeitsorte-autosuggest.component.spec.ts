import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamArbeitsorteAutosuggestComponent } from './avam-arbeitsorte-autosuggest.component';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { MockTextControlClearDirective, MockTranslatePipe, DbTranslateServiceStub } from '@test_helpers/';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, ControlContainer, FormGroupDirective, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

describe('AvamArbeitsorteAutosuggestComponent', () => {
    let component: AvamArbeitsorteAutosuggestComponent;
    let fixture: ComponentFixture<AvamArbeitsorteAutosuggestComponent>;

    const regionForm: FormGroup = new FormGroup({
        landregionFormInput: new FormControl('')
    });

    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = regionForm;

    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamArbeitsorteAutosuggestComponent, CoreAutosuggestComponent, MockTranslatePipe, MockTextControlClearDirective, DisableControlDirective, NgbTooltip],
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
        fixture = TestBed.createComponent(AvamArbeitsorteAutosuggestComponent);
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

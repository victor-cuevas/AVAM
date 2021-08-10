import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamBrancheAutosuggestComponent } from './avam-branche-autosuggest.component';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { MockTranslatePipe, MockTextControlClearDirective, DbTranslateServiceStub } from '../../../../../../../tests/helpers';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { ReactiveFormsModule, ControlContainer, FormGroup, FormControl, FormGroupDirective, FormBuilder } from '@angular/forms';
import { HttpClient } from 'selenium-webdriver/http';
import { HttpHandler } from '@angular/common/http';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateServiceStub } from '@app/modules/stes/pages/details/pages/stes-details-stellensuche/stes-details-stellensuche.component.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AvamBrancheAutosuggestComponent', () => {
    let component: AvamBrancheAutosuggestComponent;
    let fixture: ComponentFixture<AvamBrancheAutosuggestComponent>;

    const branchAutosuggestForm: FormGroup = new FormGroup({
        branchInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = branchAutosuggestForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamBrancheAutosuggestComponent, CoreAutosuggestComponent, MockTranslatePipe, MockTextControlClearDirective, DisableControlDirective, NgbTooltip],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [NgbTypeaheadModule, ReactiveFormsModule, HttpClientTestingModule],
            providers: [
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
        fixture = TestBed.createComponent(AvamBrancheAutosuggestComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            teatigkeitBranche: null
        });
        component.controlName = 'teatigkeitBranche';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

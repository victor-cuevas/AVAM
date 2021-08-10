import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamBrancheDynamicAutosuggestComponent } from './avam-branche-dynamic-autosuggest.component';
import { ReactiveFormsModule, ControlContainer, FormGroup, FormControl, FormGroupDirective, FormBuilder } from '@angular/forms';
import { AvamBrancheAutosuggestComponent } from '../avam-branche-autosuggest/avam-branche-autosuggest.component';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { MockTranslatePipe, MockTextControlClearDirective, DbTranslateServiceStub } from '@test_helpers/';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '../../../../../shared/components/arbeitsorte-autosuggest/arbeitsorte-autosuggest.component.spec';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AvamBrancheDynamicAutosuggestComponent', () => {
    let component: AvamBrancheDynamicAutosuggestComponent;
    let fixture: ComponentFixture<AvamBrancheDynamicAutosuggestComponent>;

    const branchAutosuggestForm: FormGroup = new FormGroup({
        branchInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = branchAutosuggestForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AvamBrancheDynamicAutosuggestComponent,
                AvamBrancheAutosuggestComponent,
                CoreAutosuggestComponent,
                MockTranslatePipe,
                MockTextControlClearDirective,
                DisableControlDirective,
                NgbTooltip
            ],
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
        fixture = TestBed.createComponent(AvamBrancheDynamicAutosuggestComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            branchen: null
        });
        component.controlName = 'branchen';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DbTranslateServiceStub, MockTextControlClearDirective, MockTranslatePipe } from '../../../../../tests/helpers';
import { ControlContainer, FormBuilder, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { EmailInputComponent } from '@app/shared';
import { CoreInputComponent } from '@app/library/core/core-input/core-input.component';

describe('EmailInputComponent', () => {
    let component: EmailInputComponent;
    let fixture: ComponentFixture<EmailInputComponent>;
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EmailInputComponent, CoreInputComponent, MockTranslatePipe, MockTextControlClearDirective, NgbTooltip],
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
        fixture = TestBed.createComponent(EmailInputComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            email: null
        });
        component.controlName = 'email';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { MockTranslatePipe, MockTextControlClearDirective, DbTranslateServiceStub } from '@test_helpers/';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormGroupDirective, FormBuilder, ControlContainer } from '@angular/forms';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { DbTranslatePipe, AvamBenutzerstelleAutosuggestComponent } from '@app/shared';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { Router } from '@angular/router';

describe('AvamBenutzerstelleAutosuggestComponent', () => {
    let component: AvamBenutzerstelleAutosuggestComponent;
    let fixture: ComponentFixture<AvamBenutzerstelleAutosuggestComponent>;
    const benutzerstelleAutosuggestForm: FormGroup = new FormGroup({
        benutzerstelleInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = benutzerstelleAutosuggestForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AvamBenutzerstelleAutosuggestComponent,
                CoreAutosuggestComponent,
                MockTranslatePipe,
                MockTextControlClearDirective,
                DisableControlDirective,
                NgbTooltip,
                DbTranslatePipe
            ],
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
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                AuthenticationService,
                AuthenticationRestService,
                {
                    provide: Router
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamBenutzerstelleAutosuggestComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            benutzerstelle: null
        });
        component.controlName = 'benutzerstelle';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

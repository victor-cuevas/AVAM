import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { DbTranslatePipe } from '@shared/pipes/db-translate.pipe.ts';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DbTranslateServiceStub, MockTranslatePipe, MockTextControlClearDirective } from '@test_helpers/';
import { BrowserModule } from '@angular/platform-browser';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateServiceStub } from '../../../../../shared/components/arbeitsorte-autosuggest/arbeitsorte-autosuggest.component.spec';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthenticationService } from '@core/services/authentication.service';
import { PersonalberaterDynamicAutosuggestComponent } from './personalberater-dynamic-autosuggest.component';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('PersonalberaterDynamicAutosuggestComponent', () => {
    let component: PersonalberaterDynamicAutosuggestComponent;
    let fixture: ComponentFixture<PersonalberaterDynamicAutosuggestComponent>;

    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PersonalberaterDynamicAutosuggestComponent,
                AvamPersonalberaterAutosuggestComponent,
                CoreAutosuggestComponent,
                DisableControlDirective,
                NgbTooltip,
                MockTranslatePipe,
                DbTranslatePipe,
                MockTextControlClearDirective
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                NgbTypeaheadModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([]),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ],
            providers: [
                ObliqueHelperService,
                StesDataRestService,
                AuthenticationService,
                AuthenticationRestService,
                {
                    provide: Router,
                    useValue: {}
                },
                {
                    provide: DbTranslateService,
                    useClass: DbTranslateServiceStub
                },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PersonalberaterDynamicAutosuggestComponent);
        formBuilder = TestBed.get(FormBuilder);
        component = fixture.componentInstance;
        component.placeholder = '1234';
        component.parentForm = formBuilder.group({
            personalberatern: formBuilder.array([])
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update personalberatern entities', () => {
        component.parentForm.setValue({
            personalberatern: []
        });
        component.parentForm.setControl(
            'personalberatern',
            formBuilder.array([
                formBuilder.group({
                    personalberater: {
                        benutzerId: 'benutzerId',
                        benutzerDetailId: 'benutzerDetailId',
                        benutzerLogin: {},
                        vorname: 'vorname',
                        nachname: 'nachname',
                        value: 'value'
                    }
                })
            ])
        );

        expect(component.parentForm.controls.personalberatern.value.length).toEqual(1);

        component.addItem();

        expect(component.parentForm.controls.personalberatern.value.length).toEqual(2);

        component.removeItem(1);

        expect(component.parentForm.controls.personalberatern.value.length).toEqual(1);
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamBerufAutosuggestComponent } from './avam-beruf-autosuggest.component';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { MockTextControlClearDirective, MockTranslatePipe, DbTranslateServiceStub, NavigationServiceStub } from '../../../../../../../tests/helpers';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { NgbTooltip, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ControlContainer, FormGroup, FormControl, FormGroupDirective, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@app/modules/stes/pages/fachberatung/fachberatung-bearbeiten/fachberatung-bearbeiten.component.spec';
import { NavigationService } from '@shared/services/navigation-service';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';

describe('AvamBerufAutosuggestComponent', () => {
    let component: AvamBerufAutosuggestComponent;
    let fixture: ComponentFixture<AvamBerufAutosuggestComponent>;
    const berufutosuggestForm: FormGroup = new FormGroup({
        berufInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = berufutosuggestForm;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AvamBerufAutosuggestComponent,
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
                GeschlechtPipe,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ stesId: '123' })
                        }
                    }
                },
                {
                    provide: StesDataRestService,
                    useClass: StesDataRestService
                },
                { provide: ControlContainer, useValue: controlContrainer },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: NavigationService, useClass: NavigationServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamBerufAutosuggestComponent);
        component = fixture.componentInstance;

        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            berufsTaetigkeit: null
        });
        component.controlName = 'berufsTaetigkeit';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

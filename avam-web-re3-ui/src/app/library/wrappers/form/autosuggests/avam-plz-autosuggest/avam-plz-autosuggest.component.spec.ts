import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DbTranslateServiceStub } from '@test_helpers/index';
import { TranslateServiceStub } from '../../../../../modules/stes/pages/zwischenverdienste/zwischenverdienste.component.spec';
import { BrowserModule } from '@angular/platform-browser';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/compiler/src/core';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvamPlzAutosuggestComponent } from './avam-plz-autosuggest.component';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

describe('AvamPlzAutosuggestComponent', () => {
    let component: AvamPlzAutosuggestComponent;
    let fixture: ComponentFixture<AvamPlzAutosuggestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamPlzAutosuggestComponent, CoreAutosuggestComponent, MockTranslatePipe],
            imports: [FormsModule, ReactiveFormsModule, BrowserModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                HttpClient,
                HttpHandler,
                StesDataRestService,
                ObliqueHelperService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                {
                    provide: DbTranslateService,
                    useClass: DbTranslateServiceStub
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamPlzAutosuggestComponent);
        component = fixture.componentInstance;

        const formBuilder: FormBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            postleitzahl: null,
            ort: null
        });
        component.ortControl = 'ort';
        component.plzControl = 'postleitzahl';

        fixture.detectChanges();

        TestBed.createComponent(CoreAutosuggestComponent).detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

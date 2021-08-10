import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AvamBerufsgruppeAutosuggestComponent } from './avam-berufsgruppe-autosuggest.component';
import { ReactiveFormsModule, FormGroup, FormControl, FormGroupDirective, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { MockTranslatePipe, DbTranslateServiceStub, MockTextControlClearDirective } from '../../../../../../../tests/helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { CoreAutosuggestComponent } from '@app/library/core/core-autosuggest/core-autosuggest.component';
import { NgbTypeaheadModule, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';

export class TranslateServiceStub {
    public instant(key: any): any {
        return key;
    }
}

describe('AvamBerufsgruppeAutosuggestComponent', () => {
    let component: AvamBerufsgruppeAutosuggestComponent;
    let fixture: ComponentFixture<AvamBerufsgruppeAutosuggestComponent>;
    const form: FormGroup = new FormGroup({
        berufsgruppeInput: new FormControl('')
    });
    const controlContrainer: FormGroupDirective = new FormGroupDirective([], []);
    controlContrainer.form = form;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamBerufsgruppeAutosuggestComponent, CoreAutosuggestComponent, MockTranslatePipe, DisableControlDirective, NgbTooltip, MockTextControlClearDirective],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],

            imports: [NgbTypeaheadModule, ReactiveFormsModule],
            providers: [
                HttpClient,
                HttpHandler,
                ObliqueHelperService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                {
                    provide: StesDataRestService,
                    useClass: StesDataRestService
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamBerufsgruppeAutosuggestComponent);
        component = fixture.componentInstance;
        formBuilder = TestBed.get(FormBuilder);
        component.parentForm = formBuilder.group({
            test1: null,
            test2: null
        });
        component.controlName = 'test1';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

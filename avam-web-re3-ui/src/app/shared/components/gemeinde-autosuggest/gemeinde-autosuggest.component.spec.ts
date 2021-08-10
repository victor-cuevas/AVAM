import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GemeindeAutosuggestComponent } from './gemeinde-autosuggest.component';
import { AutosuggestTwoFieldsComponent } from '../autosuggest-two-fields/autosuggest-two-fields';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AutosuggestInputComponent } from '../autosuggest-input/autosuggest-input.component';
import { NgbTypeaheadModule, NgbTooltipModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { ErrorMessagesService, FormControlStateDirective } from 'oblique-reactive';
import { FormsModule } from '@angular/forms';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { of } from 'rxjs';
import { MockTextControlClearDirective } from '../../../../../tests/helpers';
import { ObjectIteratorPipe } from '@app/shared/pipes/keys-value.pipe';
import { AvamInfoIconBtnComponent } from '../avam-info-icon-btn/avam-info-icon-btn.component';

describe('GemeindeAutosuggestComponent', () => {
    let component: GemeindeAutosuggestComponent;
    let fixture: ComponentFixture<GemeindeAutosuggestComponent>;
    let formControlStateDirectiveMock;
    let stesDataRestService: StesDataRestService;

    beforeAll(() => {
        formControlStateDirectiveMock = {
            pristineValidation: false
        };
    });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                GemeindeAutosuggestComponent,
                AutosuggestTwoFieldsComponent,
                AutosuggestInputComponent,
                AvamInfoIconBtnComponent,
                MockTextControlClearDirective,
                ObjectIteratorPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [ErrorMessagesService, { provide: FormControlStateDirective, useValue: formControlStateDirectiveMock }, StesDataRestService],
            imports: [
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                NgbTypeaheadModule.forRoot(),
                HttpClientTestingModule,
                NgbTooltipModule.forRoot(),
                NgbPopoverModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GemeindeAutosuggestComponent);
        stesDataRestService = TestBed.get(StesDataRestService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should writeValue select value', () => {
        component.writeValue('test');
        expect(component.value).toEqual('test');
    });

    it('should onChange select value', () => {
        spyOn(component, '_onChange');
        component.onChange('test');
        expect(component._onChange).toHaveBeenCalled();
    });

    it('should onChange select value', () => {
        spyOn(component, 'onChange');
        component.inputChange('test');
        expect(component.onChange).toHaveBeenCalled();
    });

    it('should onChange select value', () => {
        spyOn(component, 'onChange');
        component.selectItem('test');
        expect(component.onChange).toHaveBeenCalled();
    });

    it('should test searchFunctionAutosuggestTwo', done => {
        const translateService = fixture.debugElement.injector.get(TranslateService);
        translateService.currentLang = 'de';
        spyOn(stesDataRestService, 'getGemeindeByName').and.returnValue(
            of([
                {
                    gemeindeBaseInfo: {
                        gemeindeId: 123,
                        bfsNummer: 321,
                        nameDe: 'Bern',
                        nameFr: 'Berne',
                        nameIt: 'Berna'
                    },
                    kanton: 'KA',
                    ortschaftsbezeichnung: 'Ortb',
                    plz: 8970
                }
            ])
        );

        component.searchFunctionAutosuggestTwo('test').subscribe(data => {
            expect(data).toEqual([
                {
                    gemeindeBaseInfo: {
                        bfsNummer: 321,
                        gemeindeId: 123,
                        nameDe: 'Bern',
                        nameFr: 'Berne',
                        nameIt: 'Berna'
                    },
                    id: 123,
                    inputElementOneValue: 321,
                    inputElementTwoValue: 'Bern',
                    kanton: 'KA',
                    ortschaftsbezeichnung: 'Ortb',
                    plz: 8970
                }
            ]);
            done();
        });
    });

    it('should test searchFunctionAutosuggestOne', done => {
        const translateService = fixture.debugElement.injector.get(TranslateService);
        translateService.currentLang = 'de';
        spyOn(stesDataRestService, 'getGemeindeByNumber').and.returnValue(
            of([
                {
                    gemeindeBaseInfo: {
                        gemeindeId: 123,
                        bfsNummer: 321,
                        nameDe: 'Bern',
                        nameFr: 'Berna',
                        nameIt: 'Berna'
                    },
                    kanton: 'KA',
                    ortschaftsbezeichnung: 'Ortb',
                    plz: 8970
                }
            ])
        );

        component.searchFunctionAutosuggestOne(1234).subscribe(data => {
            expect(data).toEqual([
                {
                    gemeindeBaseInfo: {
                        gemeindeId: 123,
                        bfsNummer: 321,
                        nameDe: 'Bern',
                        nameFr: 'Berna',
                        nameIt: 'Berna'
                    },
                    id: 123,
                    inputElementOneValue: 321,
                    inputElementTwoValue: 'Bern',
                    ortschaftsbezeichnung: 'Ortb',
                    plz: 8970,
                    kanton: 'KA'
                }
            ]);
            done();
        });
    });
});

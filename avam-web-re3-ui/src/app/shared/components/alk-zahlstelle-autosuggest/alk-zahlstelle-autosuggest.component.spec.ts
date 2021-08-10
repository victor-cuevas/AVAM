import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlkZahlstelleAutosuggestComponent } from './alk-zahlstelle-autosuggest.component';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { of } from 'rxjs';
import { AutosuggestTwoFieldsComponent } from '../autosuggest-two-fields/autosuggest-two-fields';
import { AutosuggestInputComponent } from '../autosuggest-input/autosuggest-input.component';
import { MockTextControlClearDirective } from '../../../../../tests/helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ErrorMessagesService, FormControlStateDirective } from 'oblique-reactive';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeaheadModule, NgbTooltipModule, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ObjectIteratorPipe } from '@app/shared/pipes/keys-value.pipe';
import { AvamInfoIconBtnComponent } from '../avam-info-icon-btn/avam-info-icon-btn.component';

describe('AlkZahlstelleAutosuggestComponent', () => {
    const zahlstelleObj = {
        zahlstelleId: 4,
        alkNr: '02',
        alkZahlstellenNr: '02000',
        zahlstelleNr: '000',
        kassenstatus: '1',
        kurznameDe: 'Bern',
        kurznameFr: 'Bern',
        kurznameIt: 'Bern',
        standStrasse: 'Lagerhausweg 10',
        plz: {
            plzId: 356,
            postleitzahl: 3018,
            ortDe: 'Bern',
            ortFr: 'Berne',
            ortIt: 'Berna'
        }
    };
    let component: AlkZahlstelleAutosuggestComponent;
    let fixture: ComponentFixture<AlkZahlstelleAutosuggestComponent>;
    let stesDataRestService: StesDataRestService;
    let formControlStateDirectiveMock;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AlkZahlstelleAutosuggestComponent,
                AutosuggestTwoFieldsComponent,
                AutosuggestInputComponent,
                MockTextControlClearDirective,
                ObjectIteratorPipe,
                AvamInfoIconBtnComponent,
                NgbPopover
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                ErrorMessagesService,
                {
                    provide: FormControlStateDirective,
                    useValue: formControlStateDirectiveMock
                },
                StesDataRestService
            ],
            imports: [
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                NgbTypeaheadModule.forRoot(),
                HttpClientTestingModule,
                NgbTooltipModule.forRoot()
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlkZahlstelleAutosuggestComponent);
        component = fixture.componentInstance;
        stesDataRestService = TestBed.get(StesDataRestService);
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
        spyOn(stesDataRestService, 'getZahlstelleByKurzname').and.returnValue(of([zahlstelleObj]));

        component.searchFunctionAutosuggestTwo('test').subscribe(data => {
            expect(data).toEqual([{ id: 4, inputElementOneValue: '02000', inputElementTwoValue: 'Bern' }]);
            done();
        });
    });

    it('should test searchFunctionAutosuggestOne', done => {
        const translateService = fixture.debugElement.injector.get(TranslateService);
        translateService.currentLang = 'de';
        spyOn(stesDataRestService, 'getZahlstelleByNummer').and.returnValue(of([zahlstelleObj]));

        component.searchFunctionAutosuggestOne('test').subscribe(data => {
            expect(data).toEqual([{ id: 4, inputElementOneValue: '02000', inputElementTwoValue: 'Bern' }]);
            done();
        });
    });
});

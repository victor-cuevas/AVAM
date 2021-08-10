import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroupDirective } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { of, interval, Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { StesDataRestService } from '../../../core/http/stes-data-rest.service';
import { MockTranslatePipe, MockTextControlClearDirective } from '../../../../../tests/helpers';
import { ArbeitsorteAutosuggestComponent } from './arbeitsorte-autosuggest.component';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
}

describe('ArbeitsorteAutosuggestComponent', () => {
    let component: ArbeitsorteAutosuggestComponent;
    let fixture: ComponentFixture<ArbeitsorteAutosuggestComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ArbeitsorteAutosuggestComponent, MockTranslatePipe, MockTextControlClearDirective],
            imports: [ReactiveFormsModule, NgbTypeaheadModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                HttpClient,
                HttpHandler,
                StesDataRestService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: FormBuilder, useValue: formBuilder },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ArbeitsorteAutosuggestComponent);
        component = fixture.componentInstance;
        component.formGroupDirective = new FormGroupDirective(null, null);
        component.parentForm = formBuilder.group({
            item: {}
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should clear model', () => {
        spyOn(component, 'emmitWriteEvent');

        component.model = 'Test';
        component.onClear();

        expect(component.emmitWriteEvent).toBeCalledWith(null);
        expect(component.model).toEqual('');
    });

    it('should emit selected item', () => {
        const testData = { staatId: 1, code: 'Aaa', iso2Code: 'BBB', iso3Code: 'Cccc', nameDe: 'Aaaaa', nameFr: 'AAFr', nameIt: 'AAIt' };
        component.selectItem.subscribe(g => {
            expect(g).toEqual(testData);
        });
        component.emmitSelectItem(testData);
    });

    it('should return [] on error search', done => {
        const stesStub = TestBed.get(StesDataRestService);
        component.searchFunction = (term: string) => stesStub.getStaaten(term);
        const spy = spyOn(stesStub, 'getStaaten').and.returnValue(
            new Observable(observer => {
                observer.error('This is a test error');
            })
        );

        fixture.detectChanges();

        let input = 'test';
        let textMock$: Observable<string> = of(input);
        component.search(textMock$).subscribe(result => {
            expect(result).toEqual([]);
            expect(component.searchFailed).toBeTruthy();
            done();
        });
    });

    it('should not search item if empty', done => {
        const stesStub = TestBed.get(StesDataRestService);
        component.searchFunction = (term: string) => stesStub.getStaaten(term);
        const spy = spyOn(stesStub, 'getStaaten').and.returnValue(of('Uzbekistan'));

        fixture.detectChanges();

        let input = '';
        let textMock$: Observable<string> = of(input);
        component.search(textMock$).subscribe(result => {
            fixture.detectChanges();
            expect(result).toEqual([]);
            done();
        });
        fixture.detectChanges();
    });

    it('should hide spinner on blur', () => {
        component.searching = true;
        component.dismiss();
        expect(component.searching).toEqual(false);
    });

    it('should test keyUp any key', () => {
        let testEvent = { key: 'TestKey', target: { value: 'Test' } };
        spyOn(component, 'emmitWriteEvent');
        component.onKeyup(testEvent);
        expect(component.emmitWriteEvent).toBeCalledWith('Test');
    });

    it('should test keyUp with enter', () => {
        let testEvent = { key: 'Enter', target: { value: 'Test' } };
        spyOn(component, 'emmitWriteEvent');
        component.onKeyup(testEvent);
        expect(component.emmitWriteEvent).not.toBeCalled();
    });

    it('should test keyUp with return null', () => {
        let testEvent = { key: 'TestKey', target: {} };
        spyOn(component, 'emmitWriteEvent');
        component.onKeyup(testEvent);
        expect(component.emmitWriteEvent).toBeCalledWith(null);
    });

    it('should test emmitWriteEvent', () => {
        let testEvent = { test: 'test' };
        spyOn(component.writeItem, 'emit');
        component.emmitWriteEvent(testEvent);
        expect(component.writeItem.emit).toBeCalledWith(testEvent);
    });
});

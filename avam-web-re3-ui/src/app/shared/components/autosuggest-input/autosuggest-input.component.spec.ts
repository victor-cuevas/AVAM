import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AutosuggestInputComponent } from './autosuggest-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/compiler/src/core';
import { NgbTypeaheadModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { of, interval, Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { StesDataRestService } from '../../../core/http/stes-data-rest.service';
import { MockTranslatePipe, MockTextControlClearDirective } from '../../../../../tests/helpers';
import { ObjectIteratorPipe } from '@app/shared/pipes/keys-value.pipe';
import { AvamInfoIconBtnComponent } from '../avam-info-icon-btn/avam-info-icon-btn.component';

describe('AutosuggestInputComponent', () => {
    let component: AutosuggestInputComponent;
    let fixture: ComponentFixture<AutosuggestInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AutosuggestInputComponent, AvamInfoIconBtnComponent, MockTranslatePipe, MockTextControlClearDirective, ObjectIteratorPipe],
            imports: [ReactiveFormsModule, NgbTypeaheadModule.forRoot(), NgbPopoverModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [HttpClient, HttpHandler, StesDataRestService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AutosuggestInputComponent);
        component = fixture.componentInstance;
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

    it('should emit selected item', done => {
        const testData = { staatId: 1, code: 'Aaa', iso2Code: 'BBB', iso3Code: 'Cccc', nameDe: 'Aaaaa', nameFr: 'AAFr', nameIt: 'AAIt' };
        component.selectItem.subscribe(g => {
            expect(g).toEqual(testData);
            done();
        });
        component.emmitSelectItem(testData);
    });

    it('should search item', fakeAsync(() => {
        const stesStub = TestBed.get(StesDataRestService);
        component.searchFunction = (term: string) => stesStub.getStaaten(term);
        const spy = spyOn(stesStub, 'getStaaten').and.returnValue(of('Uzbekistan'));

        fixture.detectChanges();
        let inputTextArray = ['U', 'Uz', 'Uzb', 'Uzbe', 'Uzbek', 'Uzbeki', 'Uzbekis'];
        let textMock$: Observable<string> = interval(100).pipe(
            take(7),
            map(index => inputTextArray[index])
        );
        component.search(textMock$).subscribe(result => {
            expect(result).toEqual('Uzbekistan');
        });
        tick(1000);
        expect(spy).toHaveBeenCalled();
    }));

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

    it('should test emmitSelectEvent', () => {
        let testEvent = { test: 'test' };
        spyOn(component.selectItem, 'emit');
        component.emmitSelectItem(testEvent);
        expect(component.selectItem.emit).toBeCalledWith(testEvent);
    });

    it('should test emmitWriteEvent', () => {
        let testEvent = { test: 'test' };
        spyOn(component.writeItem, 'emit');
        component.emmitWriteEvent(testEvent);
        expect(component.writeItem.emit).toBeCalledWith(testEvent);
    });
});

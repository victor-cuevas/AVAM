import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosuggestTwoFieldsComponent } from './autosuggest-two-fields';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Renderer2 } from '@angular/core';
import { MockRenderer, MockTextControlClearDirective } from '../../../../../tests/helpers';
import { NgbTooltipModule, NgbTypeaheadModule, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AutosuggestInputComponent } from '../autosuggest-input/autosuggest-input.component';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ObjectIteratorPipe } from '@app/shared/pipes/keys-value.pipe';
import { AvamInfoIconBtnComponent } from '../avam-info-icon-btn/avam-info-icon-btn.component';

describe('PlzAutosuggestComponent', () => {
    let component: AutosuggestTwoFieldsComponent;
    let fixture: ComponentFixture<AutosuggestTwoFieldsComponent>;

    let autosuggestComponent: AutosuggestInputComponent;
    let autosuggestComponentFixture: ComponentFixture<AutosuggestInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AutosuggestTwoFieldsComponent, AutosuggestInputComponent, ObjectIteratorPipe, MockTextControlClearDirective, AvamInfoIconBtnComponent, NgbPopover],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: Renderer2, useClass: MockRenderer }, StesDataRestService, HttpClient, HttpHandler],
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                NgbTooltipModule.forRoot(),
                NgbTypeaheadModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AutosuggestTwoFieldsComponent);
        component = fixture.componentInstance;
        component.inputClassFirst = '';
        component.inputClassSecond = '';
        component.label = '';
        fixture.detectChanges();

        autosuggestComponentFixture = TestBed.createComponent(AutosuggestInputComponent);
        autosuggestComponent = autosuggestComponentFixture.componentInstance;
        autosuggestComponentFixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emitSelectEvent', () => {
        component.emitSelectEvent('test');
        expect(component._value).toEqual('test');
    });

    it('should itemWriteOne', () => {
        component._value = { id: '', inputElementOneValue: '', inputElementTwoValue: '' };
        component.itemWriteOne('testOne');
        expect(component._value).toEqual({ id: '-1', inputElementOneValue: 'testOne', inputElementTwoValue: '' });
    });

    it('should itemWriteTwo', () => {
        component._value = { id: '', inputElementOneValue: '', inputElementTwoValue: '' };
        component.itemWriteTwo('testTwo');
        expect(component._value).toEqual({ id: '-1', inputElementOneValue: '', inputElementTwoValue: 'testTwo' });
    });

    it('should get Value', () => {
        expect(component.value).toBeUndefined();
    });

    it('should not output duplicate values', () => {
        component._value = { id: '', inputElementOneValue: '', inputElementTwoValue: '' };
        spyOn(component, 'emitSelectEvent');
        const testValue = { id: '-1', inputElementOneValue: 'testOne', inputElementTwoValue: '' };
        component.itemWriteOne('testOne');

        expect(component.emitSelectEvent).toHaveBeenCalledWith(testValue);
    });

    it('should set value', () => {
        const testValue: { id; inputElementOneValue; inputElementTwoValue } = { id: 1, inputElementOneValue: 'test1', inputElementTwoValue: 'test2' };
        component.inputElementOne = new AutosuggestInputComponent();
        component.inputElementTwo = new AutosuggestInputComponent();
        component.value = testValue;

        expect(component.inputElementOne.model).toEqual('test1');
        expect(component.inputElementTwo.model).toEqual('test2');
        expect(component.inputElementOne.selectedItem).toEqual({ id: 1, inputElementOneValue: 'test1', inputElementTwoValue: 'test2' });
        expect(component.inputElementTwo.selectedItem).toEqual({ id: 1, inputElementOneValue: 'test1', inputElementTwoValue: 'test2' });
    });

    it('should set value', () => {
        const testValue: { id; inputElementOneValue; inputElementTwoValue } = null;
        component.inputElementTwo = new AutosuggestInputComponent();
        component.value = testValue;

        expect(component._value).toEqual({ id: '', inputElementOneValue: '', inputElementTwoValue: '' });
    });

    it('should set null value', () => {
        const testValue: { id; inputElementOneValue; inputElementTwoValue } = null;
        component.value = testValue;
        expect(component._value).toEqual({ id: '', inputElementOneValue: '', inputElementTwoValue: '' });
    });

    it('should searchFunctionAutosuggestOne throw error', () => {
        expect(component.searchFunctionAutosuggestOne).toThrow('implement');
    });

    it('should resultFormatterAutosuggestOne throw error', () => {
        expect(component.resultFormatterAutosuggestOne).toThrow('implement');
    });

    it('should inputFormatterAutosuggestOne throw error', () => {
        expect(component.inputFormatterAutosuggestOne).toThrow('implement');
    });

    it('should inputFormatterAutosuggestTwo throw error', () => {
        expect(component.inputFormatterAutosuggestTwo).toThrow('implement');
    });

    it('should resultFormatterAutosuggestOne throw error', () => {
        expect(component.resultFormatterAutosuggestOne).toThrow('implement');
    });

    it('should resultFormatterAutosuggestTwo throw error', () => {
        expect(component.resultFormatterAutosuggestTwo).toThrow('implement');
    });

    it('should searchFunctionAutosuggestTwo throw error', () => {
        expect(component.searchFunctionAutosuggestTwo).toThrow('implement');
    });
});

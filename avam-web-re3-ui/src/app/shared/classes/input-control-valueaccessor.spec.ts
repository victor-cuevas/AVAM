import { ElementRef } from "@angular/core";
import { InputControlValueAccessor } from "./input-control-value-accessor";
import { MockRenderer } from "../../../../tests/helpers";

describe('InputControlValueAccessor', () => {

    let inputControlValueAccessor: InputControlValueAccessor;
    beforeEach(() => {
        inputControlValueAccessor = new InputControlValueAccessor(new MockRenderer());
    });

    it('onChange', () => {
        let spy = spyOn(inputControlValueAccessor, '_onChange').and.callThrough();

        inputControlValueAccessor.onChange({ target: { value: 'test' } });

        expect(spy).toHaveBeenCalled();
    });

    it('onKeyup', () => {
        let spy = spyOn(inputControlValueAccessor, '_onChange').and.callThrough();

        inputControlValueAccessor.onKeyup({ target: { value: 'test' } });

        expect(spy).toHaveBeenCalled();
    });

    it('onChange', () => {
        let spy = spyOn(inputControlValueAccessor, '_onTouched').and.callThrough();

        inputControlValueAccessor.onBlur({ target: { value: 'test' } });

        expect(spy).toHaveBeenCalled();
    });

    it('writeValue null', () => {

        inputControlValueAccessor.writeValue(null);

        expect(inputControlValueAccessor.value).toBeNull();
    });

    it('onChange', () => {
        let spy = spyOn(inputControlValueAccessor, '_onChange').and.callThrough();
        inputControlValueAccessor.inputElement = new ElementRef({ nativeElement: { value: 'fail' } });
        inputControlValueAccessor.onChange('test');
        expect(inputControlValueAccessor.inputElement.nativeElement.value).toBe('test');
        expect(inputControlValueAccessor.value).toEqual('test');
        expect(spy).toHaveBeenCalled();
    });

    it('onChange with null', () => {
        let spy = spyOn(inputControlValueAccessor, '_onChange').and.callThrough();
        inputControlValueAccessor.inputElement = new ElementRef({ nativeElement: { value: 'fail' } });
        inputControlValueAccessor.onChange(null);
        expect(inputControlValueAccessor.inputElement.nativeElement.value).toBe('');
        expect(inputControlValueAccessor.value).toEqual(null);
        expect(spy).toHaveBeenCalled();
    });

    it('onChange without input element', () => {
        let spy = spyOn(inputControlValueAccessor, '_onChange').and.callThrough();
        inputControlValueAccessor.onChange('test');
        expect(inputControlValueAccessor.value).toBe('test');
        expect(spy).toHaveBeenCalled();
    });

    it('writeValue', () => {
        inputControlValueAccessor.inputElement = new ElementRef({ nativeElement: { value: 'fail' } });
        inputControlValueAccessor.writeValue('test');
        expect(inputControlValueAccessor.inputElement.nativeElement.value).toEqual('test');
        expect(inputControlValueAccessor.value).toEqual('test');
    });

    it('writeValue null', () => {
        inputControlValueAccessor.inputElement = new ElementRef({ nativeElement: { value: 'fail' } });
        inputControlValueAccessor.writeValue(null);
        expect(inputControlValueAccessor.inputElement.nativeElement.value).toEqual('');
        expect(inputControlValueAccessor.value).toEqual(null);
    });
});

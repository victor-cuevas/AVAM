import { AbstractControl } from '@angular/forms';
import { AutosuggestValidator } from './autosuggest-validator';

describe('Autosuggest Validators', () => {
    it('field requiered all filled', () => {
        const control = { value: { inputElementOneValue: 'aaa', inputElementTwoValue: 'bbbb' } };
        const result = AutosuggestValidator.required(control as AbstractControl);

        expect(result).toBeNull();
    });

    it('field requiered first filled', () => {
        const control = { value: { inputElementOneValue: 'aaa', inputElementTwoValue: '' } };
        const result = AutosuggestValidator.required(control as AbstractControl);

        expect(result).toEqual({ required: true });
    });

    it('field requiered all filled', () => {
        const control = { value: { inputElementOneValue: '', inputElementTwoValue: 'bbbb' } };
        const result = AutosuggestValidator.required(control as AbstractControl);

        expect(result).toEqual({ required: true });
    });

    it('field requiered none filled', () => {
        const control = { value: { inputElementOneValue: '', inputElementTwoValue: '' } };
        const result = AutosuggestValidator.required(control as AbstractControl);

        expect(result).toEqual({ required: true });
    });

    it('should test if first field is not a number', () => {
        const control = { value: { id: -1, inputElementOneValue: 'test', inputElementTwoValue: '' } };
        const result = AutosuggestValidator.valueOneNumericInput(control as AbstractControl);

        expect(result).toEqual(expect.any(Function));
    });

    it('should test if first field is a number', () => {
        const control = { value: { id: -1, inputElementOneValue: '12345', inputElementTwoValue: '' } };
        const result = AutosuggestValidator.valueOneNumericInput(control as AbstractControl);

        expect(result).toEqual(expect.any(Function));
    });

    it('should test when there is no value', () => {
        const control = { value: null };
        const result = AutosuggestValidator.valueOneNumericInput(control as AbstractControl);

        expect(result).toEqual(expect.any(Function));
    });
});

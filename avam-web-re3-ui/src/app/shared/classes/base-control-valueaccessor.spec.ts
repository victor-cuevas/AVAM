import { BaseControlValueAccessor } from "./base-control-value-accessor";
import { Renderer2 } from "@angular/core";


xdescribe('BaseControlValueAccessor', () => {

    let baseControlValueAccessor: BaseControlValueAccessor;
    let renderer: Renderer2;
    beforeEach(() => {
        // baseControlValueAccessor = new BaseControlValueAccessor(renderer);
    });

    it('onChange', () => {
        let spy = spyOn(baseControlValueAccessor, '_onChange').and.callThrough();

        baseControlValueAccessor.onChange({ target: { value: 'test' } });

        expect(spy).toHaveBeenCalled();
    });
    it('onKeyup', () => {
        let spy = spyOn(baseControlValueAccessor, '_onChange').and.callThrough();

        baseControlValueAccessor.onKeyup({ target: { value: 'test' } });

        expect(spy).toHaveBeenCalled();
    });
    it('onChange', () => {
        let spy = spyOn(baseControlValueAccessor, '_onTouched').and.callThrough();

        baseControlValueAccessor.onBlur({ target: { value: 'test' } });

        expect(spy).toHaveBeenCalled();
    });
    it('writeValue', () => {

        baseControlValueAccessor.writeValue('test');

        expect(baseControlValueAccessor.value).toEqual('test');
    });
});

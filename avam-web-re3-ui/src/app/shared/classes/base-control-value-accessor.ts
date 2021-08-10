import { ControlValueAccessor } from '@angular/forms';
import { EventEmitter, Output, Renderer2 } from '@angular/core';

export abstract class BaseControlValueAccessor implements ControlValueAccessor {
    public value = null;
    public disabled = false;

    abstract writeValue(value: any): void;
    abstract onChange(value: any): void;

    @Output() blurHandler: EventEmitter<any> = new EventEmitter();

    constructor(public _renderer: Renderer2) {}

    _onChange = (_: any) => {};
    _onTouched = () => {};

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onKeyup(event: any) {
        this._onChange(event);
    }

    onBlur(event: any) {
        this._onTouched();
        this.blurHandler.emit(event);
    }
}

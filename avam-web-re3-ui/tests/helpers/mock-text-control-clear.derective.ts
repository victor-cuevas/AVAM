import { Directive, Input, EventEmitter, Output, HostBinding } from "@angular/core";
@Directive({
    selector: '[orTextControlClear]',
    exportAs: 'orTextControlClear'
})
export class MockTextControlClearDirective {

    @Input('orTextControlClear')
    control: HTMLInputElement;

    @Input()
    focusOnClear = true;

    @Output()
    onClear = new EventEmitter<MouseEvent>();

    @HostBinding('class.text-control-clear')
    cssClass = true;
}
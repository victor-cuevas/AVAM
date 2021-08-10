import { NgModule, ModuleWithProviders } from '@angular/core';
import { MockTextControlClearDirective } from './mock-text-control-clear.derective';

@NgModule({
    imports: [

    ],
    declarations: [
        MockTextControlClearDirective
    ],
    exports: [
        MockTextControlClearDirective
    ]
})
export class AvamTestModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: AvamTestModule
        };
    }
}

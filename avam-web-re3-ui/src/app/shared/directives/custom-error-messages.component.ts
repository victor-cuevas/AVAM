import { AfterViewInit, Component, Input, Optional } from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { merge as observableMerge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Unsubscribable, ErrorMessagesService } from 'oblique-reactive';
import { CustomFormControlStateDirective } from './custom-form-control-state.directive';

@Component({
    selector: 'custom-error-messages',
    template: `
        <div class="form-control-feedback" *ngFor="let error of errors">{{ error.key | translate: error.params }}</div>
    `
})
export class CustomErrorMessages extends Unsubscribable implements AfterViewInit {
    @Input() control: NgControl;

    errors: { key: string; params: { [param: string]: any } }[] = [];

    private readonly form: NgForm | FormGroupDirective;

    constructor(
        private readonly errorMessagesService: ErrorMessagesService,
        @Optional() private readonly formGroup: CustomFormControlStateDirective,
        @Optional() ngForm: NgForm,
        @Optional() formGroupDirective: FormGroupDirective
    ) {
        super();
        this.form = ngForm || formGroupDirective;

        if (!this.form) {
            throw Error('You need either a NgForm or a FormGroupDirective for the ErrorMessagesComponent');
        }
    }

    ngAfterViewInit() {
        this.control = this.control ? this.control : this.formGroup.ngControl;

        observableMerge(this.control.statusChanges, this.form.ngSubmit)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.generateErrorMessages());

        this.delayMessageGenerationForReactiveForms();
    }

    private generateErrorMessages() {
        const pristineValidation = this.formGroup ? this.formGroup.pristineValidation : false;
        if (this.control.invalid && (this.form.submitted || !this.control.pristine || pristineValidation)) {
            this.errors = this.errorMessagesService.createMessages(this.control);
        } else {
            this.errors = [];
        }
    }

    private delayMessageGenerationForReactiveForms() {
        // Reactive forms instantiate the view only after the model is ready. Thus modifying this.errors in the same
        // tick as ngAfterViewInit will trigger an ExpressionChangedAfterItHasBeenCheckedError
        if (this.form instanceof FormGroupDirective) {
            setTimeout(() => this.generateErrorMessages(), 0);
        }
    }
}

import { Directive, AfterViewInit, ElementRef, Host, Self, Optional } from '@angular/core';
import { ErrorMessagesComponent } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';

/**
 * Directive which "extends" oblique validation.
 * There are 3 things that you need to follow in order to show warning messages.
 *
 * 1 - Add extendWithWarnings on or-error-messages component.
 * <or-error-messages extendWithWarnings></or-error-messages>
 *
 * 2 - When creating validator you need to return {type: 'warning'} to notify the directive that we want to show warning message.
 * static nameIsAvam: ValidatorFn = (control: FormControl) => {
 *  if (control.value === 'avam') {
 *   return { nameIsAvam: { type: 'warning', valid: ...., value: ..... } };
 *  }
 * };
 *
 * 3 - Add your validator in your formbuilder.
 * return formBuilder.group({
 *  name: [null, [EmailValidator.nameIsAvam]]
 * });
 *
 * @export
 * @class ExtendObliqueValidationDirective
 */
@Directive({
    selector: '[extendWithWarnings]'
})
export class ExtendWithWarningsDirective implements AfterViewInit {
    /**
     * Native html element.
     *
     * @type {HTMLElement}
     * @memberof ExtendWithWarningsDirective
     */
    nativeElement: HTMLElement;

    /**
     * Parent of native element.
     *
     * @type {HTMLElement}
     * @memberof ExtendWithWarningsDirective
     */
    parentElement: HTMLElement;

    /**
     * Container of all warning messages visible outside oblique ErrorMessagesComponent scope.
     *
     * @type {*}
     * @memberof ExtendWithWarningsDirective
     */
    warnings: any;

    constructor(private translate: TranslateService, private elRef: ElementRef, @Host() @Self() @Optional() public hostSel: ErrorMessagesComponent) {
        const scope = this;
        const obliqueErrorComponent = hostSel as any;

        /**
         * Overwrite generateErrorMessages method from ErrorMessagesComponent which is part of Oblique.
         * Touch only if you know what you are doing... you can trigger the domino effect here.
         *
         * @memberof ErrorMessagesComponent
         */
        obliqueErrorComponent.generateErrorMessages = function() {
            // Pass the "this" of ErrorMessagesComponent to generateWarnings method and execute it.
            scope.warnings = scope.generateWarnings.call(this);
            // Continue the validation logic of Oblique.
            const pristineValidation = this.formGroup ? this.formGroup.pristineValidation : false;
            if (this.control.invalid && (this.form.submitted || !this.control.pristine || pristineValidation)) {
                this.errors = this.errorMessagesService.createMessages(this.control);
            } else {
                this.errors = [];
            }

            // Check if we have errors and warnings at the same time.
            // We need to show the error message in this case.
            if (this.errors.length > 0 && Object.keys(this.control.warnings).length > 0) {
                scope.createWarningMessages(this.control.warnings);
            } else {
                scope.removeWarningMessages();
            }

            // Check if we dont have errors and warnings at the same time.
            // We need to show the warning messages and make the field orange.
            if (this.errors.length === 0 && Object.keys(this.control.warnings).length > 0) {
                scope.createWarningMessages(this.control.warnings);
                scope.parentElement.classList.add('has-warning');
            } else {
                scope.parentElement.classList.remove('has-warning');
            }
        };
    }

    ngAfterViewInit(): void {
        this.nativeElement = this.elRef.nativeElement;
        this.parentElement = this.nativeElement.parentElement;

        this.translate.onLangChange.subscribe(() => {
            this.createWarningMessages(this.warnings);
        });
    }

    /**
     * The idea of this method is to separate warnings and errors from angular validators.
     *
     * @memberof ExtendWithWarningsDirective
     */
    generateWarnings() {
        // Place to save the warnings.
        const cacheWarnings = {};
        // Place to save the errros.
        let cacheErrors = {};

        // Set empty object warnings in AbstractControl.
        this['control'].warnings = {};

        // Copy all errors.
        const copiedErrors = this['control'].errors;

        // Delete control errors.
        this['control'].control.setErrors(null, { emitEvent: false });

        // Loop through copied control errors.
        for (const key in copiedErrors) {
            if (copiedErrors.hasOwnProperty(key)) {
                const element = copiedErrors[key];
                // Pass if we have element with type property which is equal to warning.
                if (element && element.type === 'warning') {
                    cacheWarnings[key] = element;
                    // Creating dynamiclly property in AbstractControl which shallow copy of all cached warnings.
                    this['control'].warnings = Object.assign({}, cacheWarnings);
                    // Delete control errors.
                    this['control'].control.setErrors(null, { emitEvent: false });
                    // Set errors to null if we don't have any control errors.
                    if (Object.keys(cacheErrors).length > 0) {
                        // Set control errors which cached errors.
                        this['control'].control.setErrors(cacheErrors, { emitEvent: false });
                    } else {
                        // Set control errors to null.
                        this['control'].control.setErrors(null, { emitEvent: false });
                    }
                } else {
                    // Pass here if we have validation errors...

                    // Cache every validation error.
                    cacheErrors[key] = element;
                    // Set control errors which cached errors.
                    this['control'].control.setErrors(cacheErrors, { emitEvent: false });
                }
            }
        }

        return cacheWarnings;
    }

    /**
     * Creates node which warning message.
     *
     * @param {*} warnings
     * @memberof ExtendWithWarningsDirective
     */
    createWarningMessages(warnings) {
        this.removeWarningMessages();

        for (const key in warnings) {
            if (warnings.hasOwnProperty(key)) {
                const node = document.createElement('span');
                node.classList.add('warning-message');
                node.appendChild(document.createTextNode(this.translate.instant('i18n.validation.' + key) + '\u000a'));
                this.parentElement.appendChild(node);
            }
        }
    }

    /**
     * Removes warning message node.
     *
     * @memberof ExtendWithWarningsDirective
     */
    removeWarningMessages() {
        const warningMessages = this.parentElement.querySelectorAll('.warning-message') as any;
        if (warningMessages) {
            this.nativeElement.classList.remove('has-warning');
            for (const el of warningMessages) {
                el.remove();
            }
        }
    }
}

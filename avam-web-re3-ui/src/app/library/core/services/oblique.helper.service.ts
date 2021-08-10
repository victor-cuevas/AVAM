import { Injectable } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Injectable()
export class ObliqueHelperService {
    parent: FormGroupDirective;

    constructor() {}

    set ngForm(ngForm: FormGroupDirective) {
        this.parent = ngForm;
    }

    generateState(child: FormGroupDirective, submitted?: Function) {
        if (this.parent) {
            this.parent.ngSubmit.subscribe(() => {
                child.onSubmit(undefined);
                return submitted && submitted(true);
            });
        }
    }
}

import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvamStesInfoBarTemplateService {
    templateContainer: any[] = [];
    private dynamicTemplate$ = new BehaviorSubject<any>(false);

    constructor() {}

    dispatch(data) {
        if (data) {
            if (!this.templateContainer.find(template => template._def.nodeIndex === data._def.nodeIndex)) {
                this.templateContainer.push(data);
            }
            this.dynamicTemplate$.next(this.templateContainer);
        }
    }

    remove(templateRef) {
        this.templateContainer.forEach((template, index) => {
            if (template._def.nodeIndex === templateRef._def.nodeIndex) {
                this.templateContainer.splice(index, 1);
            }
        });
    }

    pull() {
        return this.dynamicTemplate$;
    }
}

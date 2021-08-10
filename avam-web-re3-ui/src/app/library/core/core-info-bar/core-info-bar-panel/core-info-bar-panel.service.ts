import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoreInfoBarPanelService {
    templateContainer: any[] = [];
    private dynamicTemplate$ = new BehaviorSubject<any>(false);
    private lastUpdate$ = new BehaviorSubject<any>(false);

    constructor() {}

    sendLastUpdate(data) {
        this.lastUpdate$.next(data);
    }

    pullLastUpdate() {
        return this.lastUpdate$;
    }

    sendTemplate(data) {
        if (data) {
            if (!this.templateContainer.find(template => template._def.nodeIndex === data._def.nodeIndex)) {
                this.templateContainer.push(data);
            }
            this.dynamicTemplate$.next(this.templateContainer);
        }
    }

    pullTemplate() {
        return this.dynamicTemplate$;
    }

    remove(templateRef) {
        this.templateContainer.forEach((template, index) => {
            if (template._def.nodeIndex === templateRef._def.nodeIndex) {
                this.templateContainer.splice(index, 1);
            }
        });
    }
}

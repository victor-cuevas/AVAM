import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { Directive, ElementRef, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { debug } from 'util';

@Directive({
    selector: '[closeBrowserTab]'
})
export class CloseTabDirective implements OnInit, OnDestroy {
    @Input() form: FormGroup;

    @Input() set showPromptOnBeforeUnload(shouldShowPrompt: boolean[]) {
        this.shouldShowPrompt = shouldShowPrompt && shouldShowPrompt.length ? shouldShowPrompt[0] : true;
    }

    shouldShowPrompt = true;

    beforeUnloadMethod;
    boundedBeforeUnloadMethod;

    constructor(public hostElement: ElementRef, private translateService: TranslateService) {}

    ngOnInit() {
        this.beforeUnloadMethod = e => {
            if (this.form.dirty && this.shouldShowPrompt) {
                (e || window.event).returnValue = this.translateService.instant('common.message.alertnotsaved2');
            }

            this.shouldShowPrompt = true;
        };

        this.boundedBeforeUnloadMethod = this.beforeUnloadMethod.bind(this);

        window.addEventListener('beforeunload', this.boundedBeforeUnloadMethod);
    }

    ngOnDestroy() {
        window.removeEventListener('beforeunload', this.boundedBeforeUnloadMethod);
    }
}

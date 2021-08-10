import { Directive, ElementRef, Host, Self, Optional, Input, OnDestroy } from '@angular/core';
import { MultiselectComponent } from 'oblique-reactive';
import { BehaviorSubject } from 'rxjs';

@Directive({
    selector: '[multiselectTreeOrExtension]'
})
export class AvamMultiselectTreeOrExtensionDirective implements OnDestroy {
    isTreeMode$ = new BehaviorSubject<any>([]);

    @Input('multiselectTreeOrExtension') set isTreeMode(data) {
        this.isTreeMode$.next(data);
    }
    copyUpdateTitle: () => void;

    constructor(private elRef: ElementRef, @Host() @Self() @Optional() public hostSel: MultiselectComponent) {
        this.isTreeMode$.subscribe(result => {
            if (result) {
                hostSel.updateTitle = function() {
                    const scope = this;
                    const copyModel = this.model.slice();

                    for (let i = 0; i < copyModel.length; i++) {
                        if (copyModel[i].isParent) {
                            copyModel.splice(i, 1);
                        }
                    }

                    if (this.model.length === 0) {
                        this.title = this.texts.defaultTitle || '';
                    } else if (this.dynamicTitleMaxItems && this.dynamicTitleMaxItems >= this.model.length) {
                        this.title = copyModel
                            .map(function(option) {
                                return scope.formatOptionForLabel(option);
                            })
                            .join(', ');
                    } else if (this.enableAllSelectedText && this.model.length === this.options.length) {
                        this.title = this.texts.allSelected || '';
                    } else {
                        this.title = this.texts.checked;
                        this.titleTranslateParams = { amount: copyModel.length };
                    }
                };
            }
        });
    }

    ngOnDestroy(): void {
        this.isTreeMode$.unsubscribe();
    }
}

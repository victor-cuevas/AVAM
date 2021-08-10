import { AfterViewInit, Directive, DoCheck, ElementRef, Input } from '@angular/core';
import { AvamNavTreeItemModel } from '@shared/models/avam-nav-tree-item.model';
import { RouterLinkActive } from '@angular/router';

/**
 * Sets the RouterLinkActive attribute to the provided AvamNavTreeItemModel
 */
@Directive({
    selector: '[avamNavTreeModel]'
})
export class AvamNavTreeModelDirective implements AfterViewInit {
    @Input() avamNavTreeModel: AvamNavTreeItemModel;
    @Input() avamNavTreeRla: RouterLinkActive;

    constructor(private elRef: ElementRef) {}

    ngAfterViewInit() {
        this.avamNavTreeModel.rla = this.avamNavTreeRla;
    }
}

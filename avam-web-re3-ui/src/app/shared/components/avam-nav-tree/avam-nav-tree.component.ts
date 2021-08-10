import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { MessageBus } from '@shared/services/message-bus';
import { AvamNavTreeItemModel } from '@shared/models/avam-nav-tree-item.model';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';

@Component({
    selector: 'avam-nav-tree',
    templateUrl: './avam-nav-tree.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./avam-nav-tree.component.scss']
})
export class AvamNavTreeComponent extends Unsubscribable {
    static DEFAULTS = {
        VARIANT: 'nav-bordered nav-hover',
        LABEL_FORMATTER: defaultLabelFormatterFactory
    };

    activeFragment: string;
    @Input() items: AvamNavTreeItemModel[] = [];
    @Input() labelFormatter: (item: AvamNavTreeItemModel) => string = AvamNavTreeComponent.DEFAULTS.LABEL_FORMATTER(this.translate);
    @Input() variant = AvamNavTreeComponent.DEFAULTS.VARIANT;

    constructor(
        private readonly route: ActivatedRoute,
        private router: Router,
        private readonly translate: TranslateService,
        private messageBus: MessageBus,
        private searchSession: SearchSessionStorageService
    ) {
        super();
        this.route.fragment.pipe(takeUntil(this.unsubscribe)).subscribe(fragment => {
            this.activeFragment = fragment ? fragment : null;
        });
    }

    visible(item: AvamNavTreeItemModel) {
        return !item.disabled;
    }

    itemKey(item: AvamNavTreeItemModel) {
        return item.id;
    }

    isLinkActive(rla: RouterLinkActive, item: AvamNavTreeItemModel) {
        const isLinkActive = rla.isActive;
        return item.fragment ? isLinkActive && this.activeFragment === item.fragment : isLinkActive;
    }

    showRightArrow(item: AvamNavTreeItemModel) {
        if (item.items && !item.collapsed) {
            return this.checkIfActiveChild(item);
        }
        return false;
    }

    showDownArrow(item: AvamNavTreeItemModel) {
        if (item.items && item.collapsed) {
            return this.checkIfActiveChild(item);
        }
        return false;
    }

    checkIfActiveChild(item: AvamNavTreeItemModel) {
        let flag = false;
        item.items.forEach(child => {
            if (!child.disabled) {
                flag = true;
            }
        });
        return flag;
    }

    closeTab(item: AvamNavTreeItemModel) {
        this.messageBus.buildAndSend('close-nav-item', { label: this.translate.instant(item.label || ' '), routes: item.routes, item });
    }

    openTooltip(element, toolTip) {
        if (element.clientWidth !== element.scrollWidth) {
            toolTip.open();
        }
    }

    onItemClick(item, $event) {
        this.searchSession.clearStorageByKey(item.clearStateWithKey);
        this.searchSession.restoreDefaultValues(item.restoreDefaultStateWithKey);
        this.messageBus.buildAndSend('click-sidebar-nav-item', { target: $event.target });
    }
}

export function defaultLabelFormatterFactory(translate: TranslateService) {
    const formatter = (item: AvamNavTreeItemModel) => {
        return translate.instant(item.label || ' ');
    };
    return formatter;
}

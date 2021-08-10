import { Directive, HostListener } from '@angular/core';
import ScrollUtils from '@app/library/core/utils/scroll.utils';

@Directive({
    selector: '[arrow-scrolling]'
})
export class ArrowScrollingDirective {
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (event.key.toLowerCase().endsWith('down') || event.key.toLowerCase().endsWith('up')) {
            const dropdownMenuElement = document.querySelector('.dropdown-menu.show');

            if (!dropdownMenuElement) {
                return;
            }

            const activeElement = dropdownMenuElement.querySelector('.active');
            ScrollUtils.scrollDropdownItemIntoViewIfNeeded(activeElement);
        }
    }
}

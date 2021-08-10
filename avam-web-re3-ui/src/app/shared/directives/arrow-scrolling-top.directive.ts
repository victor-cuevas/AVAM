import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[arrow-scrolling-top]'
})
export class ArrowScrollingTopDirective {
    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key.toLowerCase().endsWith('down') || event.key.toLowerCase().endsWith('up')) {
            const dropdownMenuElement = document.querySelector('.dropdown-menu.show');
            const activeElement = dropdownMenuElement.querySelector('.active');
            // with srollIntoView the whole page is pushed to the left in internet explorer.
            // @ts-ignore
            activeElement.parentNode.scrollTop = activeElement.offsetTop;
        }
    }
}

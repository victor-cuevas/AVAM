import DomHandler from '@app/library/core/utils/domhandler';

export default class ScrollUtils {
    public static scrollDropdownListIntoViewIfNeeded(element) {
        if (element && !this.isDropdownListInViewport(element)) {
            element.scrollIntoView(false);
        }
    }

    public static scrollDropdownItemIntoViewIfNeeded(element) {
        if (element && !this.isDropdownItemInViewport(element)) {
            element.scrollIntoView(false);
        }
    }

    public static scrollActiveMenuItemIntoViewIfNeeded(item?: any): boolean {
        let element = item || document.getElementsByClassName('nav-link active')[0];

        if (!element) {
            return false;
        }

        const sidebar = document.getElementsByClassName('column-content')[0];
        let elementContainer = DomHandler.closest(element, 'li.nav-item', null);

        if (elementContainer.className.indexOf('border-bottom-nav') === -1) {
            // if not top level navigation, go for whole submenu
            elementContainer = DomHandler.closest(elementContainer.parentElement, 'li.nav-item', null);
        }

        if (elementContainer.getBoundingClientRect().top < sidebar.getBoundingClientRect().top) {
            elementContainer.scrollIntoView(true);
            sidebar.scrollTop -= 10;
        } else if (elementContainer.getBoundingClientRect().bottom > sidebar.getBoundingClientRect().bottom) {
            elementContainer.scrollIntoView(false);
            sidebar.scrollTop += 10;
        }

        return true;
    }

    private static isDropdownListInViewport(element) {
        let container = DomHandler.findContainerElement(element);
        if (container) {
            return this.isElementInViewport(element, container.getBoundingClientRect());
        }
        return false;
    }

    private static isDropdownItemInViewport(element) {
        let rect = {
            top: 0,
            left: 0,
            bottom: 10000,
            right: 10000
        };
        let container = DomHandler.findContainerElement(element);
        if (container) {
            let containerRect = container.getBoundingClientRect();
            rect.top = containerRect.top;
            rect.left = containerRect.left;
            rect.bottom = containerRect.bottom;
            rect.right = containerRect.right;
        }
        let dropdown = DomHandler.closest(element.parentElement, 'ngb-typeahead-window', null);
        if (dropdown) {
            let dropdownRect = dropdown.getBoundingClientRect();
            rect.top = dropdownRect.top > rect.top ? dropdownRect.top : rect.top;
            rect.left = dropdownRect.left > rect.left ? dropdownRect.left : rect.left;
            rect.bottom = dropdownRect.bottom < rect.bottom ? dropdownRect.bottom : rect.bottom;
            rect.right = dropdownRect.right < rect.right ? dropdownRect.right : rect.right;
        }
        if (container || dropdown) {
            return this.isElementInViewport(element, rect);
        }
        return false;
    }

    private static isActiveMenuItemInViewport(element) {
        let container = DomHandler.closest(element, '.column-left', null);
        if (container) {
            return this.isElementInViewport(element, container.getBoundingClientRect());
        }
        return false;
    }

    private static isElementInViewport(element, viewport) {
        let elementRect = element.getBoundingClientRect();
        return elementRect.top >= viewport.top && elementRect.left >= viewport.left && elementRect.bottom <= viewport.bottom && elementRect.right <= viewport.right;
    }
}

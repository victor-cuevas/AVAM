export default class DomHandler {
    static closest(el, selector, stopSelector) {
        let retval = null;
        while (el) {
            if (el.matches(selector)) {
                retval = el;
                break;
            } else if (stopSelector && el.matches(stopSelector)) {
                break;
            }
            el = el.parentElement;
        }
        return retval;
    }

    static hideElement(selector) {
        selector.style.visibility = 'hidden';
    }

    static showElement(selector) {
        selector.style.visibility = 'visible';
    }

    public static findSingle(element: any, selector: string): any {
        if (element) {
            return element.querySelector(selector);
        }
        return null;
    }

    public static find(element: any, selector: string[]): any {
        if (element) {
            return element.querySelectorAll(selector);
        }
        return null;
    }

    public static findContainerElement(element) {
        let containerElement = DomHandler.closest(element, '.column-main', null);
        if (containerElement) {
            let stickyElementAroundTable = DomHandler.closest(element, '.sticky-main', '.column-main');
            if (stickyElementAroundTable) {
                // This is used if there's a sticky footer (for example "Infotag suchen")
                containerElement = stickyElementAroundTable;
            }
        } else {
            // Modal-dialog (for example Historisierung, Sprachen)
            containerElement = DomHandler.closest(element, '.scrollable-modal-body', null);
        }
        return containerElement;
    }

    static elementLoaded(selector, forceStop = false): Promise<any> {
        return new Promise(function(resolve, reject) {
            const interval = setInterval(function() {
                if (forceStop) {
                    clearInterval(interval);
                }
                const element = DomHandler.findSingle(document, selector);
                if (element instanceof Element) {
                    clearInterval(interval);
                    resolve(element);
                }
            }, 100);
        });
    }

    static multipleElementLoaded(element, selector: string[], forceStop = false): Promise<any> {
        return new Promise(function(resolve, reject) {
            const interval = setInterval(function() {
                if (forceStop) {
                    clearInterval(interval);
                }
                const foundElement = DomHandler.find(element, selector);
                if (foundElement.length > 0) {
                    clearInterval(interval);
                    resolve(foundElement);
                }
            }, 100);
        });
    }
}

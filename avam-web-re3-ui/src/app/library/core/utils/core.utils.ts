export default class CoreUtils {
    /**
     * Track if the browser is internet explorer
     *
     * @static
     * @type {*}
     * @memberof CoreUtils
     */
    static isIE: any = /*@cc_on!@*/ false || !!document['documentMode'];

    /**
     * Input event wrapper which is helping IE 11 to calm down when there is a placeholder on input element.
     *
     * @static
     * @param {*} callback
     * @returns
     * @memberof CoreUtils
     */
    static onInputWrapper(callback) {
        if (!this.isIE) {
            return callback;
        }

        return function(event) {
            const target = event.target,
                active = target === document.activeElement;
            if (!active || (target.placeholder && target.composition_started !== true)) {
                target.composition_started = active;
                if ((!active && target.tagName === 'TEXTAREA') || target.tagName === 'INPUT') {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            }
            callback(event);
        };
    }

    /**
     * Check if the input value is empty for the IE 11.
     *
     * @static
     * @param {*} value
     * @returns
     * @memberof CoreUtils
     */
    static checkIfEmpty(value) {
        if (this.isIE && value === '') {
            return null;
        } else {
            return value;
        }
    }

    static isFunction(fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    }
}

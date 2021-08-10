/**
 * Utils with reusable and helpfull methods to control or-column-layout.
 *
 * @export
 * @class OrColumnLayoutUtils
 */
export default class OrColumnLayoutUtils {
    /**
     * Scroll to top of router-outlet
     *
     * @static
     * @memberof OrColumnLayoutUtils
     */
    static scrollTop() {
        const routerOutletTop = document.querySelector('.router-outlet-top');
        if (routerOutletTop) {
            routerOutletTop.scrollIntoView();
        }
    }
}

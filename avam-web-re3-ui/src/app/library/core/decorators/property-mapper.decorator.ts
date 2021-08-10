/**
 * Interface for propertyMapper decorator.
 *
 * @export
 * @interface PropertyMapperCondition
 */
export interface PropertyMapperCondition {
    find;
    replaceWith;
}

/**
 * Decorator which allow us to decorate specific properties within our classes.
 *
 * @export
 * @param {PropertyMapperCondition[]} condition
 * @returns
 */
export function propertyMapper(condition: PropertyMapperCondition[]) {
    return function(target: any, key: string) {
        Object.defineProperty(target, key, {
            get() {
                if (this.value) {
                    return this.value.map(item => {
                        condition.forEach(c => {
                            if (item.hasOwnProperty(c.find)) {
                                item[c.replaceWith] = item[c.find];
                                delete item[c.find];
                            }
                        });
                        return item;
                    });
                }
            },
            set(v) {
                this.value = v;
            },
            enumerable: true,
            configurable: true
        });
    };
}

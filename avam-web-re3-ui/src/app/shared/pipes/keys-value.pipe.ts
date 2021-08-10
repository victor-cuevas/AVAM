import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectIterator' })
export class ObjectIteratorPipe implements PipeTransform {
    transform(objValues): any {
        const objArray = [];
        if (objValues) {
            const tooltips = objValues['attTooltips'];
            const htmls = objValues['attHtmls'];
            for (const objKey in objValues) {
                if (!objKey.startsWith('att')) {
                    const tooltip = tooltips ? tooltips.find(t => t.name === objKey) : null;
                    const html = htmls ? htmls.find(h => h.name === objKey) : null;
                    objArray.push({
                        key: objKey,
                        value: objValues[objKey],
                        tooltip: tooltip ? tooltip.tooltip : '',
                        html: html ? true : false
                    });
                }
            }
        }
        return objArray;
    }
}

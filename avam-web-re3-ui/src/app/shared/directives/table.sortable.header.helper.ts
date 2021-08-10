import { SortEvent } from './table.sortable.header.directive';
import { SortOrderEnum } from '../enums/sort-order.enum';
import { Renderer2 } from '@angular/core';

export class SortableHeaderHelper {
    constructor(private renderer: Renderer2) { }

    public static compareString: (v1: any, v2: any) => number = (v1, v2) => {
        v1 = v1 ? v1 : '';
        v2 = v2 ? v2 : '';
        return v1.toLowerCase() < v2.toLowerCase() ? -1 : v1.toLowerCase() > v2.toLowerCase() ? 1 : 0;
    };

    public static compareDate: (v1: any, v2: any) => number = (v1, v2) => {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    };

    public static compareNumber: (v1: any, v2: any) => number = (v1, v2) => {
        return +v1 < +v2 ? -1 : +v1 > +v2 ? 1 : 0;
    };

    public static compareDateFormatModel: (v1: any, v2: any) => number = (v1, v2) => {
        v1 = v1.date;
        v2 = v2.date;

        return SortableHeaderHelper.compareDate(v1, v2);
    };

    public static compareZeitRaumModel: (v1: any, v2: any) => number = (v1, v2) => {
        v1 = v1.datumVon;
        v2 = v2.datumVon;

        return SortableHeaderHelper.compareDate(v1, v2);
    };

    public static clearHeaders(headers, column: string, renderer: Renderer2) {
        if (headers) {
            headers.forEach(header => {
                if (header.sortable !== column) {
                    header.direction = SortOrderEnum.NONE;
                    if (header.hostElement.nativeElement.children.length > 0) {
                        let i: number;
                        for (i = header.hostElement.nativeElement.children.length - 1; i >= 0; i--) {
                            if ((header.hostElement.nativeElement.children[i] as HTMLElement).className.indexOf('fa-caret-') >= 0) {
                                renderer.removeChild(header.hostElement.nativeElement, header.hostElement.nativeElement.children[i]);
                            } else {
                                renderer.setStyle(header.hostElement.nativeElement.children[i] as HTMLElement, 'width', '100%');
                            }
                        }
                    }
                }
            });
        }
    }

    public static clearAllHeaders(headers, renderer: Renderer2) {
        if (headers) {
            headers.forEach(header => {
                header.direction = SortOrderEnum.NONE;
                if (header.hostElement.nativeElement.children.length > 0) {
                    let i: number;
                    for (i = header.hostElement.nativeElement.children.length - 1; i >= 0; i--) {
                        if ((header.hostElement.nativeElement.children[i] as HTMLElement).className.indexOf('fa-caret-') >= 0) {
                            renderer.removeChild(header.hostElement.nativeElement, header.hostElement.nativeElement.children[i]);
                        } else {
                            renderer.setStyle(header.hostElement.nativeElement.children[i] as HTMLElement, 'width', '100%');
                        }
                    }
                }
            });
        }
    }

    onSort({ column, direction }: SortEvent, headers, data) {
        SortableHeaderHelper.clearHeaders(headers, column, this.renderer);

        data.sort((a, b) => {
            const res = SortableHeaderHelper.compareString(a[column], b[column]);
            return direction === SortOrderEnum.ASCENDING ? res : -res;
        });
    }
}

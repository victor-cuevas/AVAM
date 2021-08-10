import { Injectable } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';

export abstract class TableHelperBase<T> {
    static readonly PRINT_STATE_SUFFIX = '_forPrint';
    static readonly ACTIONS = 'actions';
    static readonly ACTIONS_LABEL = 'i18n.common.actions';
    static readonly OEFFNEN_LABEL = 'common.button.oeffnen';
    readonly printStateSuffix = '_forPrint';
    readonly actions = TableHelperBase.ACTIONS;
    readonly actionsLabel = TableHelperBase.ACTIONS_LABEL;
    readonly oeffnenLabel = TableHelperBase.OEFFNEN_LABEL;

    protected constructor(protected dbTranslateService: DbTranslateService) {}

    value(element: any, field: string): string {
        if (element && field) {
            const value = element[field];
            if (value) {
                return value;
            }
        }
        return '';
    }

    sortWithCustomValue(event: TableEvent<T>, getFunction: any): T[] {
        return event.data.sort((d1: T, d2: T) => this.sort(event, getFunction(d1), getFunction(d2)));
    }

    sort(event: TableEvent<T>, value1: any, value2: any): number {
        const str1 = value1 ? value1 : '';
        const str2 = value2 ? value2 : '';
        return event.order * (str1 < str2 ? -1 : str1 > str2 ? 1 : 0);
    }

    append(items: any[]): string {
        if (items) {
            return items
                .filter(Boolean)
                .map(String)
                .filter(i => i.trim())
                .join(' ');
        }
        return '';
    }

    translate(object: any, propertyPrefix): string {
        return this.dbTranslateService.translate(object, propertyPrefix);
    }

    sortWithTranslate(event: TableEvent<T>, propertyPrefix: string): T[] {
        return event.data.sort((d1, d2) => {
            const value1 = this.translate(d1, propertyPrefix);
            const value2 = this.translate(d2, propertyPrefix);
            return this.sort(event, this.toLowerCase(value1), this.toLowerCase(value2));
        });
    }

    sortWithTranslateByObject(event: TableEvent<T>, object: any, propertyPrefix: string): T[] {
        return event.data.sort((d1, d2) => {
            const value1 = this.translate(d1[object], propertyPrefix);
            const value2 = this.translate(d2[object], propertyPrefix);
            return this.sort(event, this.toLowerCase(value1), this.toLowerCase(value2));
        });
    }

    defaultSort(event: TableEvent<T>): T[] {
        return event.data.sort((d1, d2) => {
            const value1 = d1[event.field];
            const value2 = d2[event.field];
            return this.sort(event, value1, value2);
        });
    }

    toLowerCase(str: string): string {
        return str ? str.toLowerCase() : str;
    }

    defineColumn(columnDef: string, header: string, cell: any, sortable?: boolean, width?: string): any {
        const column: any = { columnDef, header, cell };
        column.sortable = sortable === undefined || sortable;
        if (width) {
            column.width = width;
        }
        return column;
    }
}

@Injectable({
    providedIn: 'root'
})
export class TableHelper<T> extends TableHelperBase<T> {
    constructor(protected dbTranslateService: DbTranslateService) {
        super(dbTranslateService);
    }
}

export interface TableEvent<T> {
    data: T[];
    field: string;
    order: number;
}

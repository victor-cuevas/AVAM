import { Observable } from 'rxjs';
import { CdkColumnDef } from '@angular/cdk/table';

export interface ColumnInterface {
    columnDef: string;
    header: string;
    cell?: (element: any) => {};
    component: {};
    width?: number;
}

export interface Dropdown extends ColumnInterface {
    component: {
        type: ComponentType.dropdown;
        options: any[];
        placeholder?: string;
        validators?: any;
        isDisabled?: Observable<any>;
        onChange?: any;
        initialValue?: string;
        readOnly?: any;
    };
}

export interface Autosuggest extends ColumnInterface {
    component: {
        type: ComponentType.autosuggest;
        validators?: any;
        isDisabled?: Observable<any>;
        initialValue?: any;
        readOnly?: any;
    };
}

export interface Calendar extends ColumnInterface {
    component: {
        type: ComponentType.calendar;
        validators?: any;
        isDisabled?: Observable<any>;
        initialValue?: Date;
        readOnly?: any;
    };
}

export interface Input extends ColumnInterface {
    component: {
        type: ComponentType.input;
        validators?: any;
        isDisabled?: Observable<any>;
        initialValue?: string;
        readOnly?: any;
    };
}

export interface ComponentOptions {
    isFirst: boolean;
    index: number;
    columnDef: CdkColumnDef;
    component: any;
    createdRow: boolean;
}

export enum ComponentType {
    dropdown = 'dropdown',
    autosuggest = 'autosuggest',
    calendar = 'calendar',
    input = 'input'
}

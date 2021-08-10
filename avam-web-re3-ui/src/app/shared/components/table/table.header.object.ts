import { SortableHeaderHelper } from '../../directives/table.sortable.header.helper';

export class TableHeaderObject {
    constructor(
        public displayName: string,
        public dataProperty: string,
        public columnWidth?: string,
        public html?: boolean,
        public compare?: (v1: any, v2: any) => number,
        public columnsToSort?: string[]
    ) {
        if (!compare) {
            this.compare = SortableHeaderHelper.compareString;
        }
    }
}

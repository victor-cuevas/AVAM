import { Component, Input } from '@angular/core';
import { VollzugsregionDTO } from '@dtos/vollzugsregionDTO';
import { KontaktPersonTableRow } from '@shared/components/kontaktpersonen-table/kontaktpersonen-table.component';

@Component({
    selector: 'avam-vollzugsregionen',
    templateUrl: './vollzugsregionen.component.html',
    styleUrls: ['./vollzugsregionen.component.scss']
})
export class VollzugsregionenComponent {
    readonly name = 'name';
    readonly type = 'type';
    @Input() regionen: VollzugsregionDTO[];
    columns: TableHeader[] = [
        {
            columnDef: this.name,
            header: 'benutzerverwaltung.label.vregtext',
            cell: (region: VollzugsregionDTO) => region,
            sortable: false
        },
        {
            columnDef: this.type,
            header: 'benutzerverwaltung.label.vregtype',
            cell: (region: VollzugsregionDTO) => region.vregTypeObject,
            sortable: false
        }
    ];
}

interface TableHeader {
    columnDef: string;
    header: string;
    cell: (element: any) => string | KontaktPersonTableRow;
    sortable?: boolean;
    width?: string;
}

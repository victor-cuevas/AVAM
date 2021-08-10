import { AfterViewInit, Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SuitableEnum } from '@app/shared/enums/table-icon-enums';
import { AvamGenericTableComponent } from '../../../library/wrappers/data/avam-generic-table/avam-generic-table.component';

@Component({
    selector: 'avam-profilvergleich-table',
    templateUrl: './profilvergleich-table.component.html',
    styleUrls: ['./profilvergleich-table.component.scss']
})
export class ProfilvergleichTableComponent implements OnInit, AfterViewInit {
    @ViewChild('profilvergleichTable') profilvergleichTable: AvamGenericTableComponent;
    @Input() dataSource: [];
    @Input() maxHeight = 500;
    columns = [
        { columnDef: 'isMismatch', header: '', cell: (element: any) => element.isMismatch, width: '65px' },
        { columnDef: 'attribute', header: '', cell: (element: any) => element.attribute },
        { columnDef: 'osteValue', header: 'stes.label.vermittlung.stellenangebot', cell: (element: any) => `${element.osteValue}` },
        { columnDef: 'stesValue', header: 'stes.label.vermittlung.stellensuchender', cell: (element: any) => `${element.stesValue}` }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    suitableEnum = SuitableEnum;

    constructor(private renderer: Renderer2) {}

    ngOnInit() {}

    ngAfterViewInit(): void {
        this.renderer.removeClass(this.profilvergleichTable.cdkTable['_elementRef']['nativeElement'], 'table-striped');
    }
}

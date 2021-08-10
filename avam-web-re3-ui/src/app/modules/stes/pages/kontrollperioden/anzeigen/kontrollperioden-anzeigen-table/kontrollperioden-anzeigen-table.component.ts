import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { DbTranslateService } from '@shared/services/db-translate.service';
import * as moment from 'moment';

@Component({
    selector: 'avam-kontrollperioden-anzeigen-table',
    templateUrl: './kontrollperioden-anzeigen-table.component.html',
    styleUrls: ['./kontrollperioden-anzeigen-table.component.scss']
})
export class KontrollperiodenAnzeigenTableComponent implements OnInit {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @Output() dbClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() public dataSource = [];
    public displayedColumns = [];
    public columns = [];

    constructor(private formUtils: FormUtilsService, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.columns = [
            {
                columnDef: 'kontrollperiode',
                header: 'stes.label.kontrollperiode',
                cell: (element: any) => this.formUtils.formatDateNgx(element.kontrollperiode, FormUtilsService.GUI_MONTH_DATE_FORMAT)
            },
            { columnDef: 'status', header: 'stes.label.status', cell: (element: any) => `${element.status}` },
            {
                columnDef: 'eingangsdatum',
                header: 'stes.label.eingangsdatum',
                cell: (element: any) => this.formUtils.formatDateNgx(element.eingangsdatum, FormUtilsService.GUI_DATE_FORMAT)
            },
            { columnDef: 'erbracht', header: 'stes.label.erbracht', cell: (element: any) => `${element.erbracht || element.erbracht === 0 ? element.erbracht : ''}` },
            { columnDef: 'vereinbart', header: 'stes.label.vereinbart', cell: (element: any) => `${element.vereinbart || element.vereinbart === 0 ? element.vereinbart : ''}` },
            { columnDef: 'beurteilung', header: 'stes.label.beurteilung', cell: (element: any) => `${element.beurteilung}` },
            { columnDef: 'stesID', header: 'stes.label.stesid', cell: (element: any) => element.stesID || '' },
            { columnDef: 'actions', header: '', cell: () => '', fixWidth: true }
        ];

        this.displayedColumns = this.columns.map(c => c.columnDef);
    }

    public setData(data) {
        this.dataSource = [];
        moment.locale(this.dbTranslateService.getCurrentLang());
        data.forEach(row => {
            this.dataSource.push({
                kontrollperiode: row.datumKontrollPeriode,
                status: this.dbTranslateService.translate(row.statusObject, 'text'),
                eingangsdatum: row.datumEingang,
                erbracht: row.istBewerbungen,
                vereinbart: row.sollBewerbungen,
                beurteilung: this.dbTranslateService.translate(row.beurteilungAbmObject, 'text'),
                stesID: row.stesIdAVAM,
                kontrollperiodeId: row.arbeitsbemuehungenID
            });
        });
    }

    public onClick(row) {
        this.dbClick.emit(row);
    }
}

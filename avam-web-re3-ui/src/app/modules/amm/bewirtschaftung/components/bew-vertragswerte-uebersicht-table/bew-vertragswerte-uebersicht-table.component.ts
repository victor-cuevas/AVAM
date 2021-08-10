import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { VertragswertDTO } from '@app/shared/models/dtos-generated/vertragswertDTO';
import { BewVertragswerteUebersichtTableHandlerService, VWButtonsEnum } from './bew-vertragswerte-uebersicht-table-handler.service';

export interface VertragswerteUebersichtTableRow {
    vertragswertId: number;
    vertragswertNr: number | string;
    vertragswerttyp: string;
    profilNr: number | string;
    gueltigVon: Date | string;
    gueltigBis: Date | string;
    preismodell: string;
    gueltig: string;
    chf: string | number;
    tnTage: number | string;
    tn: number | string;
    leistungsvereinbarungId: number;
    button: string;
}

@Component({
    selector: 'avam-bew-vertragswerte-uebersicht-table',
    templateUrl: './bew-vertragswerte-uebersicht-table.component.html',
    providers: [BewVertragswerteUebersichtTableHandlerService]
})
export class BewVertragswerteUebersichtTableComponent implements OnInit {
    @Input() dataSource: [];
    @Input() hideTableButton = false;
    @Input() vertragswertType: VertragswertTypCodeEnum;
    @Output() onItemSelected: EventEmitter<any> = new EventEmitter();
    @Output() onItemDeleted: EventEmitter<any> = new EventEmitter();

    columns = [
        { columnDef: 'vertragswertNr', header: 'amm.akquisition.label.vertragswertnr', cell: (element: VertragswerteUebersichtTableRow) => `${element.vertragswertNr}` },
        { columnDef: 'vertragswerttyp', header: 'amm.akquisition.label.vertragswerttyp', cell: (element: VertragswerteUebersichtTableRow) => `${element.vertragswerttyp}` },
        { columnDef: 'profilNr', header: 'amm.akquisition.label.profilnr', cell: (element: VertragswerteUebersichtTableRow) => `${element.profilNr}` },
        { columnDef: 'gueltigVon', header: 'common.label.gueltig_von', cell: (element: VertragswerteUebersichtTableRow) => `${element.gueltigVon}` },
        { columnDef: 'gueltigBis', header: 'common.label.gueltig_bis', cell: (element: VertragswerteUebersichtTableRow) => `${element.gueltigBis}` },
        { columnDef: 'preismodell', header: 'amm.akquisition.label.preismodell', cell: (element: VertragswerteUebersichtTableRow) => `${element.preismodell}` },
        { columnDef: 'gueltig', header: 'amm.akquisition.label.gueltig', cell: (element: VertragswerteUebersichtTableRow) => `${element.gueltig}` },
        { columnDef: 'chf', header: 'amm.akquisition.label.chf', cell: (element: VertragswerteUebersichtTableRow) => `${element.chf}` },
        { columnDef: 'tnTage', header: 'amm.akquisition.label.tntage', cell: (element: VertragswerteUebersichtTableRow) => `${element.tnTage}` },
        { columnDef: 'tn', header: 'amm.akquisition.label.tn', cell: (element: VertragswerteUebersichtTableRow) => `${element.tn}` },

        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '100px' }
    ];

    displayedColumns = this.columns.map(c => c.columnDef);
    stateKey = 'vertragswerte-uebersicht-key';

    buttonsEnum = VWButtonsEnum;

    constructor(private handler: BewVertragswerteUebersichtTableHandlerService) {}

    ngOnInit() {
        if (this.hideTableButton) {
            this.displayedColumns = this.displayedColumns.filter(c => c !== 'action');
        }

        switch (this.vertragswertType) {
            case VertragswertTypCodeEnum.MASSNAHME:
                this.stateKey = 'massnahme-vertragswerte-uebersicht-key';
                break;
            case VertragswertTypCodeEnum.KURS:
                this.stateKey = 'kurs-vertragswerte-uebersicht-key';
                break;
            case VertragswertTypCodeEnum.STANDORT:
                this.stateKey = 'standort-vertragswerte-uebersicht-key';
                break;
            default:
                break;
        }
    }

    itemSelected(row) {
        this.onItemSelected.next(row);
    }

    itemDeleted(row) {
        this.onItemDeleted.next(row);
    }

    createTableRow(responseDTO: VertragswertDTO, authorized?: boolean) {
        return this.handler.createRow(responseDTO, authorized);
    }
}

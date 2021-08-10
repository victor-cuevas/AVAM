import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RahmenfristKaeSweDTO } from '@dtos/rahmenfristKaeSweDTO';
import { TableEvent } from '@shared/helpers/table.helper';
import { RahmenfristKaeSweService } from '@modules/arbeitgeber/services/rahmenfrist-kae-swe.service';
import { ActivatedRoute } from '@angular/router';
import { RahmenfristenKaeSweTableHelper } from '@modules/arbeitgeber/arbeitgeber-details/services/rahmenfristen-kae-swe-table.helper';

@Component({
    selector: 'avam-rahmenfristen-kae-swe-table',
    templateUrl: './rahmenfristen-kae-swe-table.component.html'
})
export class RahmenfristenKaeSweTableComponent implements OnInit {
    @Input() dataSource: RahmenfristKaeSweDTO[];
    @Input() forPrinting = false;

    @Output() openDetails: EventEmitter<any> = new EventEmitter();
    @Output() openZahlungen: EventEmitter<any> = new EventEmitter();

    tableColumns: { columnDef: string; header: string; cell: any; sortable: boolean; width?: string }[] = [
        this.helper.defineColumn(this.helper.abteilungName, this.helper.abteilungNameLabel, this.helper.getAbteilungName),
        this.helper.defineColumn(this.helper.abteilungNr, this.helper.abteilungNrLabel, this.helper.getAbteilungNr),
        this.helper.defineColumn(this.helper.rahmenfristNr, this.helper.rahmenfristNrLabel, this.helper.getRahmenfristNr),
        this.helper.defineColumn(this.helper.rahmenfristBeginn, this.helper.rahmenfristBeginnLabel, this.helper.getRahmenfristBeginn),
        this.helper.defineColumn(this.helper.rahmenfristEnde, this.helper.rahmenfristEndeLabel, this.helper.getRahmenfristEnde),
        this.helper.defineColumn(this.helper.alkzahlstelle, this.helper.alkzahlstelleLabel, this.helper.getRahmenfrist),
        this.helper.defineColumn(this.helper.actions, '', this.helper.getActions, false, this.helper.actionColWidth)
    ];

    headers: string[] = this.tableColumns.map(c => c.columnDef);
    aktionenOptions: { label: string; aktionId: number }[] = [
        { label: this.helper.rahmenfristZahlungenLabel, aktionId: this.helper.actionRahmenfristZahlungen },
        { label: this.helper.rahmenfristDetailsLabel, aktionId: this.helper.actionDetailsProRahmenfrist }
    ];

    constructor(private rahmenfristenKaeSweService: RahmenfristKaeSweService, private activatedRoute: ActivatedRoute, public helper: RahmenfristenKaeSweTableHelper) {}

    ngOnInit(): void {
        if (this.forPrinting) {
            this.headers = this.headers.filter(d => d !== this.helper.actions);
        }
    }

    sortFunction(event: TableEvent<RahmenfristKaeSweDTO>): void {
        switch (event.field) {
            case this.helper.abteilungName:
                this.dataSource = this.helper.sortWithCustomValue(event, this.helper.getAbteilungName);
                break;
            case this.helper.abteilungNr:
                this.dataSource = this.helper.sortWithCustomValue(event, this.helper.getAbteilungNr);
                break;
            case this.helper.alkzahlstelle:
                this.dataSource = this.helper.sortWithTranslate(event, this.helper.alkzahlstelleField);
                break;
            default:
                this.dataSource = this.helper.defaultSort(event);
                break;
        }
    }

    get stateKey(): string {
        return this.forPrinting ? `${this.helper.key}${this.helper.printStateSuffix}` : this.helper.key;
    }

    onAction(row: RahmenfristKaeSweDTO, aktionId: number): void {
        switch (aktionId) {
            case this.helper.actionRahmenfristZahlungen:
                this.openZahlungen.emit(row);
                break;
            case this.helper.actionDetailsProRahmenfrist:
                this.openDetails.emit(row);
                break;
            case this.helper.actionOeffnen:
            default:
                this.rahmenfristenKaeSweService.open(this.activatedRoute, row);
                break;
        }
    }
}

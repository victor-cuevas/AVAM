import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VerlaufGeKoArbeitgeberDTO } from '@dtos/verlaufGeKoArbeitgeberDTO';
import { CallbackDTO } from '@dtos/callbackDTO';
import { TableEvent, TableHelper } from '@shared/helpers/table.helper';
import { VerlaufGeKoAmmDTO } from '@dtos/verlaufGeKoAmmDTO';

@Component({
    selector: 'avam-geko-arbeitgeber-search-table',
    templateUrl: './arbeitgeber-search-table.component.html'
})
export class ArbeitgeberSearchTableComponent implements OnInit {
    @Input() dataSource: VerlaufGeKoArbeitgeberDTO[] | VerlaufGeKoAmmDTO[];
    @Input() stateKey?: string;
    @Input() forPrinting = false;
    @Input() forDetails = false;
    @Input() isAmm: boolean;
    @Output() onOpenItem: EventEmitter<CallbackDTO> = new EventEmitter<CallbackDTO>();
    readonly abgelaufen = 'abgelaufen';
    readonly erfasstAm = 'erfasstAm';
    readonly unternehmensname = 'unternehmensname';
    readonly stellenbezeichnung = 'stellenbezeichnung';
    readonly geschaeftsart = 'geschaeftsart';
    readonly sachstand = 'sachstand';
    readonly geschaeftstermin = 'geschaeftstermin';
    readonly actions = 'actions';
    readonly geschaeftsartText = 'geschaeftsartText';
    readonly sachstandText = 'sachstandText';
    columns: any[] = [
        {
            columnDef: this.abgelaufen,
            header: '',
            cell: (row: VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO) => this.helper.value(row, this.abgelaufen),
            sortable: true,
            width: '75px'
        },
        {
            columnDef: this.erfasstAm,
            header: 'geko.label.erstelltAm',
            cell: (row: VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO) => this.helper.value(row, this.erfasstAm),
            width: '142px',
            sortable: true
        },
        {
            columnDef: this.unternehmensname,
            header: this.isAmm ? 'geko.label.anbieter' : 'geko.label.arbeitgeber',
            cell: (row: VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO) => this.helper.value(row, this.unternehmensname),
            sortable: true
        },
        {
            columnDef: this.stellenbezeichnung,
            header: 'geko.label.stellenbezeichnung',
            cell: (row: VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO) => this.helper.value(row, this.stellenbezeichnung),
            sortable: true
        },
        {
            columnDef: this.geschaeftsart,
            header: 'geko.label.geschaeftsart',
            cell: (row: VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO) => this.helper.translate(row, this.geschaeftsartText),
            width: '250px',
            sortable: true
        },
        {
            columnDef: this.sachstand,
            header: 'geko.label.sachstand',
            cell: (row: VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO) => this.helper.translate(row, this.sachstandText),
            width: '280px',
            sortable: true
        },
        {
            columnDef: this.geschaeftstermin,
            header: 'geko.label.termin',
            cell: (row: VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO) => this.helper.value(row, this.geschaeftstermin),
            width: '142px',
            sortable: true
        },
        { columnDef: this.actions, header: '', cell: () => '', width: '60px', sortable: false }
    ];
    headers: string[] = this.columns.map(c => c.columnDef);
    readonly dateFormat = 'dd.MM.yyyy';

    constructor(private helper: TableHelper<VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO>) {}

    ngOnInit(): void {
        this.columns.find(c => c.columnDef === this.unternehmensname).header = this.isAmm ? 'geko.label.anbieter' : 'geko.label.arbeitgeber';
        if (this.isAmm) {
            this.headers = this.headers.filter(d => d !== this.stellenbezeichnung).filter(d => d !== this.unternehmensname);
        }
        if (this.forPrinting) {
            this.headers = this.headers.filter(d => d !== this.actions);
        }
        if (this.forDetails && !this.isAmm) {
            this.headers = this.headers.filter(d => d !== this.unternehmensname);
        }
    }

    getStateKey(): string {
        return this.stateKey ? (this.forPrinting ? this.stateKey + TableHelper.PRINT_STATE_SUFFIX : this.stateKey) : null;
    }

    onOpen(callback: CallbackDTO): void {
        this.onOpenItem.emit(callback);
    }

    sort(event: TableEvent<VerlaufGeKoArbeitgeberDTO | VerlaufGeKoAmmDTO>): void {
        switch (event.field) {
            case this.geschaeftsart:
                this.dataSource = this.helper.sortWithTranslate(event, this.geschaeftsartText);
                break;
            case this.sachstand:
                this.dataSource = this.helper.sortWithTranslate(event, this.sachstandText);
                break;
            case this.actions:
                break;
            default:
                this.dataSource = this.helper.defaultSort(event);
                break;
        }
    }
}

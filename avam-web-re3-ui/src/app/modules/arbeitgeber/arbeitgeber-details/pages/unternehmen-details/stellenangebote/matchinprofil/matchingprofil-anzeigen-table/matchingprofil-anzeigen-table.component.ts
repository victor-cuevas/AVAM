import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { MatchingStesDetailDTO } from '@dtos/matchingStesDetailDTO';
import { SuitableEnum } from '@shared/enums/table-icon-enums';
import { StringHelper } from '@shared/helpers/string.helper';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'avam-matchingprofil-anzeigen-table',
    templateUrl: './matchingprofil-anzeigen-table.component.html',
    styleUrls: ['./matchingprofil-anzeigen-table.component.scss']
})
export class MatchingprofilAnzeigenTableComponent implements OnInit {
    @Output() public dbClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() public onRemoveMarking: EventEmitter<any> = new EventEmitter();
    @Input() public dataSource = [];
    @Input() inputData: Array<MatchingStesDetailDTO> = [];
    @Input() isPrintModal = false;
    public suitableEnum = SuitableEnum;
    public baseTableConfig = {
        columns: [
            {
                columnDef: 'nichtGeeignet',
                header: 'arbeitgeber.oste.button.zuweisungnichtgeeignet',
                width: '65px',
                cell: (element: any) => element.nichtGeeignet
            },
            {
                columnDef: 'taetigkeit',
                header: 'stes.label.beruf',
                cell: (element: any) => `${element.taetigkeit}`
            },
            {
                columnDef: 'beschaeftigungsgrad',
                header: '%',
                cell: (element: any) => `${element.beschaeftigungsgrad}`,
                width: '90px'
            },
            {
                columnDef: 'qualifikation',
                header: 'stes.label.qualifikation',
                cell: (element: any) => `${element.qualifikation}`,
                width: '150px'
            },
            {
                columnDef: 'name',
                header: 'stes.label.name',
                cell: (element: any) => `${element.name}`
            },
            {
                columnDef: 'vorname',
                header: 'stes.label.vorname',
                cell: (element: any) => `${element.vorname}`
            },
            {
                columnDef: 'wohnort',
                header: 'stes.vermittlung.label.wohnort',
                cell: (element: any) => `${element.wohnort}`
            },
            {
                columnDef: 'erwerbssituation',
                header: 'stes.label.erwerbssituation',
                cell: (element: any) => `${element.erwerbssituation}`
            },
            {
                columnDef: 'gesucht',
                header: 'stes.label.gesucht',
                cell: (element: any) => `${element.gesucht}`
            },
            { columnDef: 'actions', header: '', cell: () => '', width: '100px' }
        ],
        config: {
            sortField: 'nichtGeeignet',
            sortOrder: 1
        }
    };
    public displayedColumns = this.baseTableConfig.columns.map(c => c.columnDef);

    constructor(private dbTranslateService: DbTranslateService, private datePipe: DatePipe) {}

    ngOnInit() {
        if (this.isPrintModal) {
            this.displayedColumns = this.displayedColumns.filter(col => col !== 'actions');
            this.setData(this.inputData);
        }
    }

    public setData(data: MatchingStesDetailDTO[]) {
        this.dataSource = [];
        data.forEach(row => {
            this.dataSource.push({
                nichtGeeignetTooltip: this.getMarkierungTooltip(row),
                nichtGeeignet: row.matchingEignungId && row.matchingEignungId >= 0 ? SuitableEnum.NICHT_GEEIGNET : SuitableEnum.GEEIGNET,
                taetigkeit: this.dbTranslateService.translate(row.avamBeruf, 'bezeichnungMa') || '',
                taetigkeitTooltip: row.skills || '',
                beschaeftigungsgrad: row.vermittlungsgrad || '',
                qualifikation: this.dbTranslateService.translate(row.qualifikationCode, 'text') || '',
                qualifikationTooltip: this.getQualifikationTooltip(row) || '',
                name: row.name,
                nameTooltip: this.setNameTooltip(row),
                vorname: row.vorname,
                vornameTooltip: this.setNameTooltip(row),
                wohnort: row.wohnort,
                erwerbssituation: this.dbTranslateService.translate(row.erwerbssituationCode, 'text') || '',
                gesucht: row.gesucht ? this.dbTranslateService.instant('common.label.jaklein') : this.dbTranslateService.instant('common.label.neinklein'),
                stesId: row.stesId,
                fullData: row
            });
        });
    }

    private getQualifikationTooltip(row) {
        return `${this.dbTranslateService.translate(row.erfahrungCode, 'text')} ${this.dbTranslateService.instant('arbeitgeber.oste.label.erfahrung')}` ;
    }

    public specialTooltipCell(column) {
        return column.columnDef === 'qualifikation' || column.columnDef === 'name' || column.columnDef === 'vorname' || column.columnDef === 'taetigkeit';
    }

    public onClick(row) {
        this.dbClick.emit(row);
    }

    public removeMarking(osteId) {
        this.onRemoveMarking.emit(osteId);
    }

    private getMarkierungTooltip(data: MatchingStesDetailDTO) {
        const benutzer = data.benutzer;
        if (benutzer) {
            const date = data.geaendertDatumEignung || data.erfasstDatumEignung;
            const text = this.dbTranslateService.instant('stes.matching.tooltip.vermittlungnichtgeeignet');

            return StringHelper.stringFormatter(text, [
                `${benutzer.benutzerLogin} ${benutzer.nachname}, ${benutzer.vorname} ${benutzer.benuStelleCode}`,
                `${this.datePipe.transform(date, 'dd.MM.yyyy')}`
            ]);
        }

        return '';
    }

    private setNameTooltip(row: MatchingStesDetailDTO) {
        return `${this.dbTranslateService.translate(row.geschlechtCode, 'text') || ''}, ${row.alter} ${this.dbTranslateService.instant('jährig')}`;
    }
}

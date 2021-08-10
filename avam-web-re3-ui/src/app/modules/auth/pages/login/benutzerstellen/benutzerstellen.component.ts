import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/index';
import { TableHeaderObject } from 'src/app/shared/components/table/table.header.object';
import { DbTranslateService } from '../../../../../shared/services/db-translate.service';
import { BenutzerStelleTableRow } from '../../../../../shared/models/dtos/benutzerstelle-table-row.interface';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { StesFormNumberEnum } from '../../../../../shared/enums/stes-form-number.enum';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { BenutzerstelleDto } from '@shared/models/dtos-generated/benutzerstelleDto';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

@Component({
    selector: 'app-benutzerstellen',
    templateUrl: './benutzerstellen.component.html',
    providers: [ObliqueHelperService]
})
export class BenutzerstellenComponent implements OnInit, OnDestroy {
    @Output() emitBenutzerstelleSelected: EventEmitter<BenutzerStelleTableRow> = new EventEmitter();
    @Output() closeBenutzerstelle: EventEmitter<boolean> = new EventEmitter();
    modalToolboxConfiguration: ToolboxConfiguration[];
    userData: JwtDTO;
    observeClickAction: Subscription;

    tableData: BenutzerStelleTableRow[] = [];
    tableHeaders: TableHeaderObject[] = [];
    columns: any;

    constructor(private dbTranslateService: DbTranslateService, private toolboxService: ToolboxService) {
        ToolboxService.CHANNEL = 'benutzerstellen-modal';
    }

    ngOnInit(): void {
        this.loadData();
        this.setTableHeaders();
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
        this.observeClickAction = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.observeClickAction) {
            this.observeClickAction.unsubscribe();
        }
    }

    isBenutzerstellenDataPresent(): boolean {
        return this.userData != null && this.userData.userDto != null && this.userData.userDto.benutzerstelleList != null;
    }

    setTableHeaders() {
        this.columns = [
            { columnDef: 'benutzerstelleCode', header: 'autorisierungsmonitor.label.benutzerstellenId', cell: (element: any) => `${element.benutzerstelleCode}` },
            { columnDef: 'benutzerstelleName', header: 'autorisierungsmonitor.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelleName}` },
            { columnDef: 'plz', header: 'benutzerverwaltung.label.plz', cell: (element: any) => `${element.plz}` },
            { columnDef: 'ort', header: 'common.label.ort', cell: (element: any) => `${element.ort}` },
            { columnDef: 'strasse', header: 'common.label.strassenrlong', cell: (element: any) => `${element.strasse}` },
            { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
        ];

        this.tableHeaders = this.columns.map(c => c.columnDef);
    }

    loadData(): void {
        this.userData = JSON.parse(localStorage.getItem('currentUser'));
        this.loadTableData();
    }

    loadTableData(): void {
        if (this.userData.userDto.benutzerstelleList) {
            this.tableData = this.userData.userDto.benutzerstelleList.map(element => new BenutzerStelleTableRowBuilder(this.dbTranslateService).build(element));
        }
    }

    subscribeBenutzerstelle(row): void {
        this.emitBenutzerstelleSelected.emit(row);
    }

    @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        if (event.key.startsWith('Esc')) {
            this.close();
        }
    }

    close(): void {
        this.closeBenutzerstelle.emit(true);
    }

    getFormNr(): string {
        return StesFormNumberEnum.BENUTZERSTELLE_AUSWAEHLEN_BEI_ANMELDUNG;
    }
}

export class BenutzerStelleTableRowBuilder {
    private benutzerStelleTableRow: BenutzerStelleTableRow;
    private dbTranslateService: DbTranslateService;

    constructor(dbTranslateService: DbTranslateService) {
        this.dbTranslateService = dbTranslateService;
        this.benutzerStelleTableRow = {
            benutzerDetailId: null,
            benutzerstelleCode: null,
            benutzerstelleName: null,
            plz: null,
            ort: null,
            strasse: null,
            kantonKuerzel: null,
            terminUebertragenIcsDownload: null
        } as BenutzerStelleTableRow;
    }

    setBenutzerDetailId(benutzerDetailId: string): void {
        this.benutzerStelleTableRow.benutzerDetailId = benutzerDetailId;
    }

    setBenutzerstelleCode(benutzerstelleCode: string): void {
        this.benutzerStelleTableRow.benutzerstelleCode = benutzerstelleCode;
    }

    setBenutzerstelleName(benutzerstelleName: string): void {
        this.benutzerStelleTableRow.benutzerstelleName = benutzerstelleName;
    }

    setPlz(plz: string): void {
        this.benutzerStelleTableRow.plz = plz;
    }

    setOrt(ort: string): void {
        this.benutzerStelleTableRow.ort = ort;
    }

    setStrasse(strasse: string): void {
        this.benutzerStelleTableRow.strasse = strasse;
    }

    setKantonKuerzel(kantonKuerzel: string): void {
        this.benutzerStelleTableRow.kantonKuerzel = kantonKuerzel;
    }

    setTerminUebertragenIcsDownload(terminUebertragenIcsDownload: boolean): void {
        this.benutzerStelleTableRow.terminUebertragenIcsDownload = terminUebertragenIcsDownload;
    }

    build(dto: BenutzerstelleDto): BenutzerStelleTableRow {
        this.setBenutzerDetailId('' + dto.benutzerDetailId);
        this.setBenutzerstelleCode(dto.benutzerstelleCode);
        this.setBenutzerstelleName(this.dbTranslateService.translate(dto, 'benutzerstelleName'));
        this.setPlz(dto.plz ? dto.plz.toString() : '');
        this.setOrt(this.dbTranslateService.translate(dto, 'ort'));
        this.setStrasse(`${this.dbTranslateService.translate(dto, 'strasse')} ${dto.strasseNr}`);
        this.setKantonKuerzel(dto.kantonKuerzel);
        this.setTerminUebertragenIcsDownload(dto.terminUebertragenIcsDownload);
        return this.benutzerStelleTableRow;
    }
}

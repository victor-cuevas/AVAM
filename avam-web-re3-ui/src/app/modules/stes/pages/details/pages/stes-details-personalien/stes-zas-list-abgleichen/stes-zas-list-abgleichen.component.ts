import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SpinnerService } from 'oblique-reactive';
import { DatePipe } from '@angular/common';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { ToolboxService } from '@app/shared';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';

import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { StaatDTO } from '@shared/models/dtos-generated/staatDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';

@Component({
    selector: 'app-stes-zas-list-abgleichen',
    templateUrl: './stes-zas-list-abgleichen.component.html'
})
export class StesZasListAbgleichenComponent implements OnInit, OnDestroy {
    static readonly SPINNER_CHANNEL: string = 'zas-list-abgleichen-spinner-channel';
    static readonly TOOLBOX_ID: string = 'zasListAbgleichenModal';
    @Input() geschlechtDropdownLables: any[];
    @Input() zasResponse: BaseResponseWrapperListStesZasDTOWarningMessages;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    results: StesZasDTO[] = [];
    tableData: ZasTableRow[] = [];
    modalToolboxConfiguration: ToolboxConfiguration[];
    private observeExit: Subscription;

    constructor(
        private spinnerService: SpinnerService,
        private datepipe: DatePipe,
        private dbTranslateService: DbTranslateService,
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService
    ) {
        ToolboxService.CHANNEL = 'zasListAbgleichenModal';
    }

    ngOnInit(): void {
        this.spinnerService.activate(this.getSpinnerChannel());
        this.initToolboxConfiguration();
        this.results = this.zasResponse.data;
        this.loadTableData();
        this.spinnerService.deactivate(this.getSpinnerChannel());
    }

    ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        if (this.observeExit) {
            this.observeExit.unsubscribe();
        }
    }

    getFormNr(): string {
        return StesFormNumberEnum.ZAS_TREFFERLISTE;
    }

    getSpinnerChannel(): string {
        return StesZasListAbgleichenComponent.SPINNER_CHANNEL;
    }

    isZasDataPresent(): boolean {
        return this.results !== null && typeof this.results !== 'undefined' && this.results.length > 0;
    }

    numberOfPersons(): number {
        return this.isZasDataPresent() ? this.results.length : 0;
    }

    close(): void {
        this.modalService.dismissAll();
    }

    getToolboxId(): string {
        return StesZasListAbgleichenComponent.TOOLBOX_ID;
    }

    private initToolboxConfiguration(): void {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];

        this.observeExit = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((event: any) => {
            if (event.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (event.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    private openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    private loadTableData(): void {
        this.tableData = [];
        if (this.results !== null && typeof this.results !== 'undefined') {
            this.results.forEach(dto => {
                this.tableData.push(
                    new ZasTableRowBuilder(this.datepipe, this.dbTranslateService)
                        .setSvNr(dto.versichertenNrList)
                        .setNameVorname(dto.namePersReg, dto.vornamePersReg)
                        .setGeburtsdatum(dto.geburtsDatum.getTime())
                        .setGeschlecht(dto.geschlechtId, this.geschlechtDropdownLables)
                        .setNationalitaet(dto.nationalitaetObject)
                        .build()
                );
            });
        }
    }
}

class ZasTableRowBuilder {
    private row: ZasTableRow;

    constructor(private datepipe: DatePipe, private dbTranslateService: DbTranslateService) {
        this.row = {
            svNr: null,
            nameVorname: null,
            geburtsdatum: null,
            geschlecht: null,
            nationalitaet: null
        };
    }

    setSvNr(svNrs: PersonVersichertenNrDTO[]): ZasTableRowBuilder {
        this.row.svNr = this.getAktuelleSvNr(svNrs);
        return this;
    }

    setNameVorname(name: string, vorname: string): ZasTableRowBuilder {
        this.row.nameVorname = `${name} ${vorname}`;
        return this;
    }

    setGeburtsdatum(geburtsdatum: number): ZasTableRowBuilder {
        this.row.geburtsdatum = this.datepipe.transform(geburtsdatum, 'dd.MM.yyyy');
        return this;
    }

    setGeschlecht(geschlechtId: number, geschlechtDropdownLables: any[]): ZasTableRowBuilder {
        const selected: any = geschlechtDropdownLables && geschlechtDropdownLables.find(option => option.codeId === geschlechtId);
        this.row.geschlecht = selected ? this.dbTranslateService.translate(selected, 'label') : null;
        return this;
    }

    setNationalitaet(nationalitaet: StaatDTO): ZasTableRowBuilder {
        this.row.nationalitaet = this.dbTranslateService.translate(nationalitaet, 'name');
        return this;
    }

    build(): ZasTableRow {
        return this.row;
    }

    private getAktuelleSvNr(versichertenNrList: PersonVersichertenNrDTO[]): string {
        if (versichertenNrList) {
            const filteredList: PersonVersichertenNrDTO[] = versichertenNrList.filter(value => value.istAktuelleVersichertenNr);
            if (filteredList && filteredList.length > 0) {
                return filteredList[0].versichertenNr;
            }
        }
        return null;
    }
}

interface ZasTableRow {
    svNr: string;
    nameVorname: string;
    geburtsdatum: string;
    geschlecht: string;
    nationalitaet: string;
}

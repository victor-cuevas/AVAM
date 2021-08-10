import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { KontaktpersonSearchParamDTO } from '@app/shared/models/dtos-generated/kontaktpersonSearchParamDTO';
import { KontakteViewDTO } from '@app/shared/models/dtos-generated/kontakteViewDTO';
import { SortEvent } from '@app/shared/directives/table.sortable.header.directive';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { MessageBus } from '@app/shared/services/message-bus';
import { ActivatedRoute } from '@angular/router';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { KontaktpersonStatusCode } from '@app/shared/enums/domain-code/kontakptperson-status-code.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KontaktpersonRestService } from '@core/http/kontaktperson-rest.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';

@Component({
    selector: 'avam-kontaktperson-waehlen-modal',
    templateUrl: './kontaktperson-waehlen-modal.component.html',
    styleUrls: ['./kontaktperson-waehlen-modal.component.scss']
})
export class KontaktpersonWaehlenModalComponent implements OnInit {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    @Input() unternehmenId: number;
    @Output() kontaktpersonSelected: EventEmitter<KontakteViewDTO> = new EventEmitter();

    data: KontakteViewDTO[];
    formNumber = StesFormNumberEnum.KONTAKTPERSON_SUCHEN_MODAL;
    modalToolboxConfiguration: ToolboxConfiguration[];
    defaultSort: SortEvent;
    toolboxClickActionSub: Subscription;
    toolboxChannel = 'kontakt-person-modal';
    oldChannel = '';
    oldFormNumber = '';

    constructor(
        private modalService: NgbModal,
        private dataService: StesDataRestService,
        private toolboxService: ToolboxService,
        private messageBus: MessageBus,
        private route: ActivatedRoute,
        private dbTranslateService: DbTranslateService,
        private kontaktpersonRestService: KontaktpersonRestService,
        private fehlerMeldungService: FehlermeldungenService
    ) {
        this.oldChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit() {
        this.getData();
        this.setToolboxConfig();
        this.toolboxClickActionSub = this.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
        this.informToolbox();
        this.fehlerMeldungService.closeMessage();
    }

    getData() {
        this.dataService.codeSearch(DomainEnum.KONTAKTPERSON_STATUS, KontaktpersonStatusCode.ACTIVE).subscribe(kontaktpersonStatus => {
            this.kontaktpersonRestService.searchKontaktpersonen(this.buildKontaktpersonSearchParams(kontaktpersonStatus)).subscribe(res => {
                if (res.data) {
                    this.data = res.data.map(element => this.createKontaktpersonViewRow(element)).sort((e1, e2) => e1.vorname.localeCompare(e2.vorname));
                }
            });
        });
    }

    createKontaktpersonViewRow(row: KontakteViewDTO): any {
        return {
            anrede: this.dbTranslateService.translate(row, 'anrede'),
            anredeId: row.anredeId,
            name: row.name,
            vorname: row.vorname ? row.vorname : '',
            funktion: row.funktion,
            email: row.email,
            telefonNr: row.telefonNr,
            mobileNr: row.mobileNr,
            telefaxNr: row.telefaxNr,
            kontaktpersonId: row.kontaktpersonId,
            kontaktId: row.kontaktId
        };
    }

    setToolboxConfig() {
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    }

    informToolbox(): void {
        this.route.data.subscribe(value => {
            this.oldFormNumber = value.formNumber;
        });
        if (this.formNumber) {
            this.messageBus.buildAndSend('toolbox.help.formNumber', this.formNumber);
        }
    }

    buildKontaktpersonSearchParams(kontaktpersonStatus: CodeDTO): KontaktpersonSearchParamDTO {
        return {
            arbeitgeber: {
                unternehmenId: this.unternehmenId
            },
            kontaktpersonStatusId: kontaktpersonStatus.codeId
        };
    }

    itemSelected(kontaktperson: KontakteViewDTO) {
        this.kontaktpersonSelected.emit(kontaktperson);
    }

    close(): void {
        ToolboxService.CHANNEL = this.oldChannel;
        this.fehlerMeldungService.closeMessage();
        this.messageBus.buildAndSend('toolbox.help.formNumber', this.oldFormNumber);
        this.modalService.dismissAll();
    }
}

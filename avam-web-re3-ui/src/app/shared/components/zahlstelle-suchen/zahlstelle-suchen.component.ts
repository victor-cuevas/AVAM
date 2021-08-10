import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Zahlstelle } from '../../models/zahlstelle.model';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { TableHeaderObject } from '../table/table.header.object';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '../../services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { OpenModalFensterService } from '@shared/services/open-modal-fenster.service';
import { AvamGenericTablePrintComponent } from '@shared/components/avam-generic-table-print/avam-generic-table-print.component';

@Component({
    selector: 'app-zahlstelle-suchen',
    templateUrl: './zahlstelle-suchen.component.html',
    styleUrls: ['./zahlstelle-suchen.component.scss']
})
export class ZahlstelleSuchenComponent implements OnInit, OnDestroy {
    @Output() emitAlkZahlstelle = new EventEmitter();
    @ViewChild('modalPrint') modalPrint: ElementRef;

    dataSource = [];

    zahlstelleToolboxId = 'zahlstelle-modal';
    modalToolboxConfiguration: ToolboxConfiguration[];
    headers: TableHeaderObject[] = [];
    zahlstelleChannel = 'zahlstelle';
    grunddatenChannel = 'grunddaten';
    private observeClickActionSub: Subscription;
    private originalChannel: string;

    constructor(
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService,
        private stesDataRestService: StesDataRestService,
        private spinnerService: SpinnerService,
        private dbTranslateService: DbTranslateService,
        private modalFernsterService: OpenModalFensterService,
        private translateService: TranslateService
    ) {
        this.originalChannel = ToolboxService.CHANNEL;
        SpinnerService.CHANNEL = this.zahlstelleChannel;
        ToolboxService.CHANNEL = this.zahlstelleChannel;
    }

    ngOnInit() {
        this.loadData();

        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    loadData() {
        this.spinnerService.activate(this.zahlstelleChannel);

        this.stesDataRestService.getAllZahlstellen().subscribe(
            (data: Zahlstelle[]) => {
                this.dataSource = data
                    ? data
                          .map((row, index) => this.mapToRow(row, index))
                          .sort((v1, v2) => (v1.alkZahlstellenNr < v2.alkZahlstellenNr ? -1 : v1.alkZahlstellenNr > v2.alkZahlstellenNr ? 1 : 0))
                    : [];
                this.spinnerService.deactivate(this.zahlstelleChannel);
            },
            () => {
                this.spinnerService.deactivate(this.zahlstelleChannel);
            }
        );
    }

    mapToRow(zahlstelle, index) {
        return {
            id: index,
            zahlstelleId: zahlstelle.zahlstelleId,
            alkNr: zahlstelle.alkNr,
            kurzname: this.dbTranslateService.translate(zahlstelle, 'kurzname') || '',
            ort: this.dbTranslateService.translate(zahlstelle.plz, 'ort') || '',
            zahlstelleNr: zahlstelle.zahlstelleNr || '',
            standStrasse: zahlstelle.standStrasse || '',
            plz: zahlstelle.plz ? zahlstelle.plz.postleitzahl.toString() : '',
            alkZahlstellenNr: zahlstelle.alkZahlstellenNr || '',
            kassenstatus:
                zahlstelle.kassenstatus === '1' ? this.translateService.instant('stes.label.zahlstelleOeffentlich') : this.translateService.instant('stes.label.zahlstellePrivat'),
            rawObject: zahlstelle
        };
    }

    openPrintModal() {
        const modalRef = this.modalService.open(AvamGenericTablePrintComponent, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
        modalRef.result.then(
            result => {},
            reason => {
                ToolboxService.CHANNEL = this.grunddatenChannel;
            }
        );
        modalRef.componentInstance.dataSource = this.dataSource;
        modalRef.componentInstance.content = this.modalPrint;
    }

    receiveData(data) {
        this.emitAlkZahlstelle.emit(data);
        this.close();
        this.modalFernsterService.closeModalFenster();
    }

    getFormNr(): string {
        return StesFormNumberEnum.ZAHLSTELLE_ANZEIGEN;
    }

    close() {
        this.modalService.dismissAll();
    }

    ngOnDestroy() {
        this.modalFernsterService.closeModalFenster();
        this.observeClickActionSub.unsubscribe();
        ToolboxService.CHANNEL = this.originalChannel;
    }
}

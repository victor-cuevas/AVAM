import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { StesAuszahlungProRahmenfristDTO } from 'src/app/shared/models/dtos-generated/stesAuszahlungProRahmenfristDTO';
import { StesModalNumber } from '@app/shared/enums/stes-modal-number.enum';
import { Subscription } from 'rxjs';

// prettier-ignore
import {
    BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages
} from '@shared/models/dtos-generated/baseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages';
import * as moment from 'moment';

@Component({
    selector: 'app-stes-rahmenfristen-auszahlungen',
    templateUrl: './stes-rahmenfristen-auszahlungen.component.html',
    styleUrls: ['./stes-rahmenfristen-auszahlungen.component.scss']
})
export class StesRahmenfristenAuszahlungenComponent extends Unsubscribable implements OnInit {
    @Input() personStesId: number;
    @Input() stesRahmenfristId: number;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    auszahlungToolboxId = 'rahmenfristen-auszahlungen-modal';
    auszahlungProRahmenfristChannel = 'auszahlungProRahmenfrist';

    bezugstageFooter: string;
    auszahlungFooter: string;
    rahmenfristenAuszahlungData = [];
    modalToolboxConfiguration: ToolboxConfiguration[];
    data: StesAuszahlungProRahmenfristDTO;
    modalNumber: StesModalNumber = StesModalNumber.RAHMENFRISTEN_AUSZAHLUNGEN;
    observeClickActionSub: Subscription;

    private totalBezugstage = 0;
    private totalAuszahlung = 0;

    constructor(
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private dataRestService: StesDataRestService
    ) {
        super();
        SpinnerService.CHANNEL = this.auszahlungProRahmenfristChannel;
        ToolboxService.CHANNEL = this.auszahlungToolboxId;
    }

    ngOnInit() {
        this.getData();

        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

        this.observeClickActionSub = this.toolboxService
            .observeClickAction(this.auszahlungToolboxId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(action => {
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.observeClickActionSub.unsubscribe();
    }

    close() {
        this.modalService.dismissAll();
    }

    getData() {
        this.spinnerService.activate(this.auszahlungProRahmenfristChannel);

        this.dataRestService
            .getAuszahlungProRahmenfristen(this.personStesId, this.stesRahmenfristId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages) => {
                    this.totalBezugstage = 0;
                    this.totalAuszahlung = 0;
                    this.rahmenfristenAuszahlungData = response.data.map((row: StesAuszahlungProRahmenfristDTO) => {
                        this.data = row;
                        this.totalBezugstage += this.chStringToNumber(row.bezogeneTaggelder);
                        this.totalAuszahlung += this.chStringToNumber(row.betrag);

                        const tableRow = { ...row, kontrollperiode: row.kontrollperiode ? moment(row.kontrollperiode, 'MM.YYYY').toDate() : '' };

                        return tableRow;
                    });
                    this.bezugstageFooter = this.numberToChString(Math.round(this.totalBezugstage * 100) / 100, 1);
                    this.auszahlungFooter = this.numberToChString(Math.round(this.totalAuszahlung * 100) / 100);

                    this.deactivateSpinner();
                },
                () => this.deactivateSpinner()
            );
    }

    private deactivateSpinner(): void {
        this.spinnerService.deactivate(this.auszahlungProRahmenfristChannel);
    }

    private chStringToNumber(numberAsString: string): number {
        return numberAsString ? Number(numberAsString.replace(/[^\d.-]/g, '')) : 0;
    }

    private numberToChString(num: number, precision = 2): string {
        return num.toLocaleString('de-CH', { minimumFractionDigits: precision }).replace(/\,|\’/g, "'");
    }
}

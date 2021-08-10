import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StesModalNumber } from '@app/shared/enums/stes-modal-number.enum';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesUebersichtZwischenverdienstDTO } from '@app/shared/models/dtos-generated/stesUebersichtZwischenverdienstDTO';
import { Subscription } from 'rxjs';

// prettier-ignore
import {
    BaseResponseWrapperListStesUebersichtZwischenverdienstDTOWarningMessages
} from '@shared/models/dtos-generated/baseResponseWrapperListStesUebersichtZwischenverdienstDTOWarningMessages';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { FormUtilsService } from '@app/shared';

@Component({
    selector: 'app-stes-rahmenfristen-zwischenverdienst',
    templateUrl: './stes-rahmenfristen-zwischenverdienst.component.html',
    styleUrls: ['./stes-rahmenfristen-zwischenverdienst.component.scss']
})
export class StesRahmenfristenZwischenverdienstComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() personStesId: number;
    @Input() stesRahmenfristId: number;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    rahmenfristenZwischenverdienstChannel = 'rahmenfristenZwischenverdienstChannel';
    rahmenfristenZwischenverdienstToolboxId = 'rahmenfristen-zwischenverdienst-modal';
    modalNumber: StesModalNumber = StesModalNumber.RAHMENFRISTEN_ZWISCHENVERDIENST;

    rahmenfristenZwischenverdienstData: StesUebersichtZwischenverdienstDTO[] = [];
    modalToolboxConfiguration: ToolboxConfiguration[];
    data: StesUebersichtZwischenverdienstDTO;

    anzahlKontrollperiodenMitZV = 0;
    observeClickActionSub: Subscription;

    constructor(
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private dataRestService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private formUtilsService: FormUtilsService
    ) {
        super();
        ToolboxService.CHANNEL = this.rahmenfristenZwischenverdienstToolboxId;
    }

    ngOnInit() {
        this.configureToolbox();
        this.getData();

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    ngOnDestroy(): void {
        this.observeClickActionSub.unsubscribe();
        super.ngOnDestroy();
    }

    close() {
        this.modalService.dismissAll();
    }

    configureToolbox() {
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

        this.toolboxService
            .observeClickAction(this.rahmenfristenZwischenverdienstToolboxId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(action => {
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    getData() {
        this.spinnerService.activate(this.rahmenfristenZwischenverdienstChannel);

        this.dataRestService
            .getAuszahlungFuerZwischenverdienst(this.personStesId, this.stesRahmenfristId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperListStesUebersichtZwischenverdienstDTOWarningMessages) => {
                this.rahmenfristenZwischenverdienstData = response.data.map(row => {
                    if (row.zvTaggeld) {
                        row.zvTaggeld = `${row.zvTaggeld} ${this.dbTranslateService.instant('stes.asal.label.tage')}`;
                    }
                    this.data = row;
                    return row;
                });

                const kontrollperiode: Record<string, any[]> = response.data.reduce(
                    (obj, item) => {
                        const value = this.formUtilsService.formatDateNgx(item.kontrollperiode, 'MM.YYYY');
                        obj[value] = (obj[value] || []).concat(item);
                        return obj;
                    },
                    {} as Record<string, any[]>
                );
                this.anzahlKontrollperiodenMitZV = Object.keys(kontrollperiode).length;
            });

        this.spinnerService.deactivate(this.rahmenfristenZwischenverdienstChannel);
    }
}

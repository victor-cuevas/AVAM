import { AlertChannelEnum } from './../alert/alert-channel.enum';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';

import { BaseResponseWrapperProfilvergleichDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperProfilvergleichDTOWarningMessages';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { ProfileCompareAdapter } from '@app/shared/services/profile-compare-adapter/profile-compare-adapter';
import { ProfileCompareRow } from '@app/shared/services/profile-compare-adapter/profile-compare-models';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { AvamGenericTablePrintComponent } from '@shared/components/avam-generic-table-print/avam-generic-table-print.component';

@Component({
    selector: 'avam-profilvergleich-modal',
    templateUrl: './profilvergleich-modal.component.html',
    styleUrls: ['./profilvergleich-modal.component.scss'],
    providers: [ProfileCompareAdapter]
})
export class ProfilvergleichModalComponent implements OnInit, OnDestroy {
    @Input() zuweisungId: string;
    @Input() parentFormNumber: string;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    formNumber = StesFormNumberEnum.PROFILVERGLEICH_MODAL;
    modalToolboxConfiguration: ToolboxConfiguration[];
    toolboxClickActionSub: Subscription;

    toolboxChannel = 'profilvergleich-modal-toolbox';
    spinnerChannel = 'profilvergleich-modal-spinner';
    oldToolboxChannel: string;
    oldSpinnerChannel: string;

    zuweisungsdatum: Date;
    dataSource: ProfileCompareRow[];

    alertChannel = AlertChannelEnum;

    constructor(
        private dataService: StesDataRestService,
        private dbTranslateService: DbTranslateService,
        private messageBus: MessageBus,
        private profileCompareAdapter: ProfileCompareAdapter,
        private readonly modalService: NgbModal,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService
    ) {
        this.oldToolboxChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.toolboxChannel;
        this.oldSpinnerChannel = SpinnerService.CHANNEL;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        if (!this.zuweisungId) {
            throw new Error('Please provide zuweisungId as input for this component! This is needed to fetch the data.');
        }
        if (!this.parentFormNumber) {
            throw new Error('Please provide parentFormNumber as input for this component! This is needed for the Help action in Toolbox');
        }
        this.getData();
        this.modalToolboxConfiguration = this.getToolboxConfiguration();
        this.messageBus.buildAndSend('toolbox.help.formNumber', this.parentFormNumber);
        this.toolboxClickActionSub = this.getToolboxActionSub();
    }

    getToolboxConfiguration(): ToolboxConfiguration[] {
        return [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
    }

    getToolboxActionSub() {
        return this.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    getData() {
        this.spinnerService.activate(this.spinnerChannel);
        this.dataService.getProfilvergleichByZuweisungId(this.zuweisungId, this.dbTranslateService.getCurrentLang(), AlertChannelEnum.MODAL).subscribe(
            (pvData: BaseResponseWrapperProfilvergleichDTOWarningMessages) => {
                if (pvData) {
                    this.zuweisungsdatum = pvData.data.zuweisungsdatum;
                    this.dataSource = this.profileCompareAdapter.adapt(pvData.data, true);
                }
                this.spinnerService.deactivate(this.spinnerChannel);
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
            }
        );
    }

    openPrintModal() {
        const modalRef = this.modalService.open(AvamGenericTablePrintComponent, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
        modalRef.componentInstance.dataSource = this.dataSource;
        modalRef.componentInstance.content = this.modalPrint;
    }

    close() {
        this.modalService.dismissAll();
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        ToolboxService.CHANNEL = this.oldToolboxChannel;
        SpinnerService.CHANNEL = this.oldSpinnerChannel;
        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }
    }
}

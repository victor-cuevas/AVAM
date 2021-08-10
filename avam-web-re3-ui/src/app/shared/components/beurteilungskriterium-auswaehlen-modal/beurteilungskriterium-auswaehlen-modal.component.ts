import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '../../services/toolbox.service';

// How to use beuritelungskriterium-auswaehlen-modal
// You can include the modal with a button in your html and implement openModal method using the
// ModalService to open the modal (windowClass should be modal-md). Beurteilungskriterium-auswaehlen-modal will emit the selected item
// and you should implement selectFromModal method in your component to get the value and use it.
// Beurteilungskriterium-auswaehlen-modal uses ToolboxService, so when you close the modal you should
// set the channel for your component again.
// <button type="button" class="btn btn-secondary rounded-0" (click)="openModal(modalBeurteilungskriterium)"><span class="fa fa-clone"></span></button>
// <ng-template #modalBeurteilungskriterium>
//     <avam-beurteilungskriterium-auswaehlen-modal (emitBeurteilungskriterium)="selectFromModal($event)"></avam-beurteilungskriterium-auswaehlen-modal>
// </ng-template>

@Component({
    selector: 'avam-beurteilungskriterium-auswaehlen-modal',
    templateUrl: './beurteilungskriterium-auswaehlen-modal.component.html',
    styleUrls: ['./beurteilungskriterium-auswaehlen-modal.component.scss']
})
export class BeurteilungskriteriumAuswaehlenModalComponent implements OnInit, OnDestroy {
    @Output() emitBeurteilungskriterium = new EventEmitter();
    dataSource;
    columns = [
        { columnDef: 'code', header: 'common.label.code', cell: (element: any) => `${element.code}`, sortable: true, width: '130px' },
        { columnDef: 'text', header: 'common.label.bezeichnung', cell: (element: any) => `${element.text}`, sortable: true },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.actions}`, width: '65px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    formNumber = StesFormNumberEnum.BEURTEILUNGSKRITERIUM_AUSWAEHLEN;
    modalToolboxConfiguration: ToolboxConfiguration[];
    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    oldSpinnerChannel = '';
    spinnerChannel = 'beurteilungskriterium-auswaehlen-modal';

    constructor(
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService,
        private dataService: StesDataRestService,
        private translate: TranslateService,
        private dbTranslatePipe: DbTranslatePipe,
        private spinnerService: SpinnerService
    ) {
        this.oldSpinnerChannel = SpinnerService.CHANNEL;
        SpinnerService.CHANNEL = this.spinnerChannel;
        ToolboxService.CHANNEL = 'beurteilungskriterium-auswaehlen-modal';
    }

    ngOnInit() {
        this.loadData();
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    loadData() {
        this.spinnerService.activate(this.spinnerChannel);
        this.dataService.getActiveCodeByDomain(DomainEnum.STESHANDLUNGSFELD).subscribe((data: CodeDTO[]) => {
            this.dataSource = data.map(row => this.createRow(row));

            this.spinnerService.deactivate(this.spinnerChannel);
        });
    }

    createRow(codeDTO: CodeDTO) {
        return {
            code: codeDTO.code,
            text: this.dbTranslatePipe.transform(codeDTO, 'text'),
            codeDTO,
            skipRow: this.isHeaderRow(codeDTO)
        };
    }

    isHeaderRow(item: CodeDTO) {
        return +item.code % 10 === 0;
    }

    itemSelected(selectedRow: CodeDTO) {
        this.emitBeurteilungskriterium.emit(selectedRow);
        this.close();
    }

    close() {
        this.modalService.dismissAll();
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
            this.loadData();
        });
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        SpinnerService.CHANNEL = this.oldSpinnerChannel;
    }
}

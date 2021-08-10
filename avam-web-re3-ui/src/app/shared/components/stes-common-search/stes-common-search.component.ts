import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';

import { FormGroupDirective } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { SpinnerService } from 'oblique-reactive';
import { MessageBus } from '@shared/services/message-bus';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
    selector: 'stes-common-search',
    templateUrl: './stes-common-search.component.html',
    styleUrls: ['./stes-common-search.component.scss']
})
export class StesCommonSearchComponent implements OnInit, OnDestroy {
    static TOOLBOX_CHANNEL = 'searchForm';
    static FORM_SPINNER_CHANNEL = 'formSpinner';
    static TABLE_SPINNER_CHANNEL = 'tableSpinner';

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @Output() resetEvent = new EventEmitter<void>();
    @Output() searchEvent = new EventEmitter<void>();
    @Output() navigationEvent = new EventEmitter<any>();
    @Output() changeLanguageEvent = new EventEmitter<any[]>();

    @Input() infoleisteTranslationKey: string;

    @Input() searchButtonDisabled;

    @Input() dataSource: any;
    @Input() columns;
    @Input() displayedColumns;
    @Input() sortField;
    @Input() stateKey: any;

    searchDone = false;
    forPrinting = true;
    public printTableData = [];
    public printTableHeaders = [];

    private unsubscribe$ = new Subject();

    constructor(
        private activatedRoute: ActivatedRoute,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateService: DbTranslateService,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private messageBus: MessageBus,
        private modalService: NgbModal
    ) {
        ToolboxService.CHANNEL = StesCommonSearchComponent.TOOLBOX_CHANNEL;
    }

    ngOnInit() {
        this.configureToolbox();
        this.setSubscriptions();
    }

    public ngOnDestroy(): void {
        this.toolboxService.sendConfiguration([]);
        this.fehlermeldungenService.closeMessage();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public manageSpinners(activateTSpinner: boolean, activateFSpinner?: boolean): void {
        activateTSpinner
            ? this.spinnerService.activate(StesCommonSearchComponent.TABLE_SPINNER_CHANNEL)
            : this.spinnerService.deactivate(StesCommonSearchComponent.TABLE_SPINNER_CHANNEL);

        if (activateFSpinner !== undefined) {
            activateFSpinner
                ? this.spinnerService.activate(StesCommonSearchComponent.FORM_SPINNER_CHANNEL)
                : this.spinnerService.deactivate(StesCommonSearchComponent.FORM_SPINNER_CHANNEL);
        }
    }

    public reset(): void {
        this.fehlermeldungenService.closeMessage();
        this.printTableData = [];
        this.resetEvent.emit();
    }

    public search(): void {
        this.searchEvent.emit();
    }

    public navigate(data): void {
        this.navigationEvent.emit(data);
    }

    private configureToolbox(): void {
        this.toolboxService.sendConfiguration(
            [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)],
            StesCommonSearchComponent.TOOLBOX_CHANNEL
        );

        this.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.snapshot.data.formNumber);
    }

    private setSubscriptions(): void {
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
        this.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.changeLanguageEvent.emit();
            });
    }

    private openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }
}

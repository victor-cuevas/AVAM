import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TableHeaderObject } from 'src/app/shared/components/table/table.header.object';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { DomainEnum } from 'src/app/shared/enums/domain.enum';
import { ErwerbssituationAktuellTableComponent, FormUtilsService, ToolboxService } from 'src/app/shared';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { ErwBerechnet, ErwBerechnetBuilder } from './stes-erwerbssituation.helper';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { FehlermeldungModel } from 'src/app/shared/models/fehlermeldung.model';
import { takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxConfiguration } from 'src/app/shared/services/toolbox.service';
import { StesModalNumber } from 'src/app/shared/enums/stes-modal-number.enum';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';

import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import PrintHelper from '@shared/helpers/print.helper';
import * as moment from 'moment';
import { SortableHeaderHelper } from '@shared/directives/table.sortable.header.helper';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxConfig } from '@app/shared/components/toolbox/toolbox-config';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ErwerbssituationAktuellDTO } from '@app/shared/models/dtos-generated/erwerbssituationAktuellDTO';
import { DateValidator } from '@app/shared/validators/date-validator';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AvamComponentsTableComponent } from '@app/library/wrappers/form/avam-components-table/avam-components-table.component';
import { ColumnInterface, Dropdown, ComponentType, Calendar } from '@app/library/wrappers/form/avam-components-table/avam-components-table.interface';
import { sort } from '@app/library/wrappers/form/avam-components-table/avam-components-table-sorting';
import { FacadeService } from '@shared/services/facade.service';

export enum COLUMN {
    erwerbssituationAktuell = 'erwerbssituationAktuell',
    gueltigAb = 'gueltigAb'
}

@Component({
    selector: 'app-stes-erwerbssituation',
    templateUrl: './stes-erwerbssituation.component.html',
    styleUrls: ['./stes-erwerbssituation.component.scss']
})
export class StesErwerbssituationComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(ErwerbssituationAktuellTableComponent) erwerbssituationAktuellTableComponent: ErwerbssituationAktuellTableComponent;
    @ViewChild('confirmClose') confirmClose: NgbModalRef;
    @ViewChild('table') table: AvamComponentsTableComponent;

    @Input() stesId;

    modalNumber: StesModalNumber = StesModalNumber.GRUNDDATEN_ERWERBSSITUATION;
    headersAktuell: TableHeaderObject[] = [];
    headersBerechnet: any;

    dataBerechnet: any;
    columns: any;

    erwerbssituationAktuellList: any;

    erwerbssituationAktuellColumns: ColumnInterface[];
    stesErwerbssituationIDs = [];
    dataSource;

    modalToolboxConfiguration: ToolboxConfiguration[];
    erwerbssituationToolboxId = 'erwerbssituation-modal';

    ueberschrift: string;
    ueberschriftModal: string;
    erwerbssituationChannel = 'erwerbssituation';
    aktuellDropdownOptions: any[] = [];
    btnPermissions = [Permissions.STES_ANMELDEN_BEARBEITEN];
    messages: FehlermeldungModel[] = [];
    masterLayout = null;
    ewerwerbssituationModal = null;
    stesHeader: any;
    observeClickActionSub: Subscription;

    alertChannel = AlertChannelEnum;

    private fehlermeldungenSubscription: Subscription;
    private dataSubscription: Subscription;
    private originalChannel: string;

    constructor(
        private readonly modalService: NgbModal,
        private readonly notificationService: NotificationService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private dataRestService: StesDataRestService,
        private facade: FacadeService,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateSerivce: DbTranslateService,
        private resetDialogService: ResetDialogService,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        SpinnerService.CHANNEL = this.erwerbssituationChannel;
        ToolboxService.CHANNEL = this.erwerbssituationToolboxId;
        this.masterLayout = document.querySelectorAll<HTMLElement>('or-column-layout')[0];
    }

    ngOnInit() {
        this.addHeadersAktuell();
        this.addHeadersBerechnet();
        this.setUeberSchrift();

        this.fehlermeldungenSubscription = this.fehlermeldungenService
            .getMessage(AlertChannelEnum.MODAL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message) {
                    this.messages.push({ text: message.text, type: message.type, channel: message.channel });
                } else {
                    this.messages = [];
                }
            });
    }

    ngAfterViewInit(): void {
        Promise.resolve().then(() => {
            this.configureToolbox();
        });

        this.getData();
    }

    getData() {
        this.spinnerService.activate(this.erwerbssituationChannel);

        const getErwerbssituationAktuell = this.dataRestService.getErwerbssituationAktuell(this.stesId, AlertChannelEnum.MODAL);
        const getErwerbssituationBerechnet = this.dataRestService.getErwerbssituationBerechnet(this.stesId, AlertChannelEnum.MODAL);
        const getCode = this.dataRestService.getCode(DomainEnum.ERWERBSSITUATIONAKTUELL, AlertChannelEnum.MODAL);
        const getStesHeader = this.dataRestService.getStesHeader(this.stesId, SpracheEnum.DEUTSCH, AlertChannelEnum.MODAL);

        forkJoin([getErwerbssituationAktuell, getErwerbssituationBerechnet, getCode, getStesHeader]).subscribe(
            ([erwerbssituationAktuellResponse, erwerbssituationBerechnetResponse, codeResponse, stesHeaderResponse]) => {
                this.aktuellDropdownOptions = this.facade.formUtilsService.mapDropdownKurztext(codeResponse);
                this.createColumns();

                this.stesHeader = { ...stesHeaderResponse };
                this.toolboxService.sendEmailAddress(this.stesHeader.stesBenutzerEmail ? this.stesHeader.stesBenutzerEmail : '');
                this.stesInfobarService.sendDataToInfobar({ title: `${this.ueberschrift} - ${this.ueberschriftModal}` });

                const lastUpdated = this.findLastUpdated(erwerbssituationAktuellResponse);
                this.stesInfobarService.sendLastUpdate(lastUpdated);

                this.erwerbssituationAktuellList = erwerbssituationAktuellResponse;
                this.mapToDataSource();

                this.dataBerechnet = erwerbssituationBerechnetResponse
                    .map(row => this.createErwBerechnet(row))
                    .sort((a, b) => -SortableHeaderHelper.compareDate(moment(a.gueltigAb, 'DD.MM.YYYY'), moment(b.gueltigAb, 'DD.MM.YYYY')));

                this.spinnerService.deactivate(this.erwerbssituationChannel);
            },
            () => {
                this.spinnerService.deactivate(this.erwerbssituationChannel);
            }
        );
    }

    ngOnDestroy(): void {
        ToolboxService.CHANNEL = this.originalChannel;
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);

        this.stesInfobarService.sendDataToInfobar({ title: this.ueberschrift });
        this.stesInfobarService.sendLastUpdate(null, true);
        this.toolboxService.sendConfiguration(ToolboxConfig.getDefaultConfig(), this.originalChannel, ToolboxDataHelper.createForStellensuchende(this.stesId));

        this.observeClickActionSub.unsubscribe();

        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }

    loadDetailsHeaderContent(stesId: string) {
        this.dataSubscription = this.dataRestService.getStesHeader(stesId, SpracheEnum.DEUTSCH, AlertChannelEnum.MODAL).subscribe((data: StesHeaderDTO) => {
            this.stesHeader = { ...data };
            this.toolboxService.sendEmailAddress(this.stesHeader.stesBenutzerEmail ? this.stesHeader.stesBenutzerEmail : '');
            this.stesInfobarService.sendDataToInfobar({ title: `${this.ueberschrift} - ${this.ueberschriftModal}` });
        });
    }

    addHeadersAktuell() {
        this.headersAktuell.push(new TableHeaderObject('stes.label.erwerbssituationAktuell', 'erwkurztext'));
        this.headersAktuell.push(new TableHeaderObject('stes.label.gueltigab', 'gueltigAbDisplay'));
    }

    addHeadersBerechnet() {
        this.columns = [
            { columnDef: 'erwkurztext', header: 'stes.label.erwerbssituationBerechnet', cell: (element: any) => `${element.erwkurztext}` },
            { columnDef: 'arbkurztext', header: 'stes.label.arbeitsmarktsituationBerechnet', cell: (element: any) => `${element.arbkurztext}` },
            { columnDef: 'gueltigAb', header: 'stes.label.gueltigab', dataType: 'date', cell: (element: any) => `${element.gueltigAb}` }
        ];

        this.headersBerechnet = this.columns.map(c => c.columnDef);
    }

    save() {
        if (this.table.form.valid) {
            this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
            this.spinnerService.activate(this.erwerbssituationChannel);

            this.dataRestService.createErwerbssituation(this.stesId, this.mapDataToSave(), AlertChannelEnum.MODAL).subscribe(
                response => {
                    if (response.data) {
                        this.erwerbssituationAktuellList = response.data;

                        const lastUpdated = this.findLastUpdated(this.erwerbssituationAktuellList);
                        this.stesInfobarService.sendLastUpdate(lastUpdated);

                        this.mapToDataSource();
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    }

                    this.spinnerService.deactivate(this.erwerbssituationChannel);

                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.erwerbssituationChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        } else {
            this.table.triggerValidation();
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger', AlertChannelEnum.MODAL);
            OrColumnLayoutUtils.scrollTop();
        }
    }

    close() {
        this.modalService.dismissAll();
    }

    canClose() {
        return !this.table.form.dirty;
    }

    reset() {
        if (this.table.form.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
                this.mapToDataSource();
            });
        }
    }

    closeMessage(index: number) {
        this.messages.splice(index, 1);
    }

    onSort(event) {
        const mapOptions = {};
        this.aktuellDropdownOptions.forEach(option => {
            mapOptions[option.value] = option;
        });
        event.data = this.table.components.controls.map((formGroup: FormGroup) => {
            return {
                id: formGroup.controls.rowId.value,
                erwerbssituationAktuell: formGroup.controls.erwerbssituationAktuell.value,
                gueltigAb: formGroup.controls.gueltigAb.value
            };
        });

        switch (event.field) {
            case COLUMN.erwerbssituationAktuell:
                sort.AvamLabelDropdownComponent(event, mapOptions);
                break;
            case COLUMN.gueltigAb:
                sort.AvamLabelCalendarComponent(event);
                break;
            default:
                break;
        }
    }

    private mapToDataSource() {
        this.dataSource = [];
        this.stesErwerbssituationIDs = [];

        this.erwerbssituationAktuellList.sort((a, b) => SortableHeaderHelper.compareDate(b.gueltigAb, a.gueltigAb));
        this.erwerbssituationAktuellList.forEach((row, index) => {
            this.stesErwerbssituationIDs.push({ stesErwerbssituationId: row.stesErwerbssituationId, ojbVersion: row.ojbVersion });
            this.dataSource.push({
                id: index,
                erwerbssituationAktuell: row.erwerbssituationAktuellId ? row.erwerbssituationAktuellId.toString() : null,
                gueltigAb: row.gueltigAb ? this.facade.formUtilsService.parseDate(row.gueltigAb) : null
            });
        });
    }

    private createColumns() {
        const erwerbssituationAktuell: Dropdown = {
            columnDef: COLUMN.erwerbssituationAktuell,
            header: 'stes.label.erwerbssituationAktuell',
            cell: (element: any) => {
                return element.erwerbssituationAktuell;
            },
            component: {
                type: ComponentType.dropdown,
                options: this.aktuellDropdownOptions,
                validators: Validators.required
            }
        };

        const gueltigAb: Calendar = {
            columnDef: COLUMN.gueltigAb,
            header: 'stes.label.gueltigab',
            cell: (element: any) => {
                return element.gueltigab;
            },
            component: {
                type: ComponentType.calendar,
                validators: [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]
            }
        };

        const ActionColumn = {
            columnDef: 'actions',
            header: '',
            cell: (element: any) => {
                return '';
            },
            component: {}
        };
        this.erwerbssituationAktuellColumns = [erwerbssituationAktuell, gueltigAb, ActionColumn];
    }

    private createErwBerechnet(data): ErwBerechnet {
        const builder = new ErwBerechnetBuilder();
        builder.setArbkurztext(this.dbTranslateSerivce.translate(data, 'arbkurztext'));
        builder.setErwkurztext(this.dbTranslateSerivce.translate(data, 'erwkurztext'));
        builder.setGueltigAb(this.facade.formUtilsService.parseDate(data.gueltigAb));

        return builder.build();
    }

    private mapDataToSave() {
        const erwerbssituationAktuellDTO: ErwerbssituationAktuellDTO[] = [];

        const rowsFormGroups = (this.table.form.controls.tableRows as FormArray).controls;
        rowsFormGroups.forEach((row: FormGroup) => {
            const rowID = row.controls.rowId.value;
            let ojbVersion = 0;
            let stesErwerbssituationId = 0;

            if (rowID < this.stesErwerbssituationIDs.length) {
                if (this.stesErwerbssituationIDs[rowID].ojbVersion) {
                    ojbVersion = this.stesErwerbssituationIDs[rowID].ojbVersion;
                }
                if (this.stesErwerbssituationIDs[rowID].stesErwerbssituationId) {
                    stesErwerbssituationId = this.stesErwerbssituationIDs[rowID].stesErwerbssituationId;
                }
            }

            erwerbssituationAktuellDTO.push({
                ojbVersion,
                stesErwerbssituationId,
                gueltigAb: this.facade.formUtilsService.parseDate(row.controls.gueltigAb.value),
                erwerbssituationAktuellId: row.controls.erwerbssituationAktuell.value
            });
        });

        return erwerbssituationAktuellDTO;
    }

    private setUeberSchrift() {
        this.ueberschrift = `${this.translateService.instant('arbeitgeber.oste.label.grunddaten')}`;
        this.ueberschriftModal = `${this.translateService.instant('stes.label.erwerbssituation')} / ${this.translateService.instant('stes.label.arbeitsmarktsituation')}`;
    }

    private configureToolbox() {
        const modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe(data => {
            if (data.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (data.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
            if (data.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.stesId, AvamCommonValueObjectsEnum.T_STES);
            }
        });

        this.toolboxService.sendConfiguration(modalToolboxConfiguration, this.erwerbssituationToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId), false);
    }

    private openPrintModal() {
        this.masterLayout.style.visibility = 'hidden';
        this.ewerwerbssituationModal = this.modalService['_modalStack']['_modalRefs'][0];
        this.ewerwerbssituationModal.result.then(
            () => {
                this.masterLayout.style.visibility = 'visible';
            },
            () => {
                this.masterLayout.style.visibility = 'visible';
            }
        );
        PrintHelper.print();
    }

    private openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private findLastUpdated(erwerbssituationAktuell) {
        const datesArr = [];

        erwerbssituationAktuell.forEach((e, index) => {
            if (e.geaendertAm) {
                datesArr.push({ date: e.geaendertAm, index });
            } else {
                datesArr.push({ date: e.erfasstAm, index });
            }
        });

        datesArr.sort((a, b) => SortableHeaderHelper.compareDate(b.date, a.date));

        return erwerbssituationAktuell[datesArr[0].index];
    }
}

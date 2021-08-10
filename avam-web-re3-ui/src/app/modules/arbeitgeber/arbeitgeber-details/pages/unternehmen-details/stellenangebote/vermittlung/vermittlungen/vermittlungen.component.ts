import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { NavigationService } from '@shared/services/navigation-service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseResponseWrapperListZuweisungListeViewDTOWarningMessages } from '@dtos/baseResponseWrapperListZuweisungListeViewDTOWarningMessages';
import { ZuweisungListeViewDTO } from '@dtos/zuweisungListeViewDTO';
import { forkJoin } from 'rxjs';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { OsteDTO } from '@dtos/osteDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { Permissions } from '@shared/enums/permissions.enum';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';

@Component({
    selector: 'avam-vermittlungen',
    templateUrl: './vermittlungen.component.html'
})
export class VermittlungenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    permissions: typeof Permissions = Permissions;

    tableConfig: any;
    printColumns: any;
    printConfig: any;
    zuweisungen: ZuweisungListeViewDTO[] = [];
    vermittlungenChannel = 'vermittlungenChannel';
    oste: OsteDTO;

    private osteId: string;
    private unternehmenId: string;
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'flag',
                header: '',
                fixWidth: true,
                cell: (element: any) => element.flag
            },
            {
                columnDef: 'vermittlungVom',
                header: 'arbeitgeber.label.vermittlungVom',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.vermittlungVom, FormUtilsService.GUI_DATE_FORMAT)}`
            },
            {
                columnDef: 'fullZuweisungNummer',
                header: 'stes.label.fachberatung.zuweisungsnr',
                cell: (element: any) => element.fullZuweisungNummer
            },
            {
                columnDef: 'stesName',
                header: 'common.label.name',
                cell: (element: any) => element.stesName
            },
            {
                columnDef: 'stesVorname',
                header: 'common.label.vorname',
                cell: (element: any) => element.stesVorname
            },
            {
                columnDef: 'stesOrt',
                header: 'common.label.ort',
                cell: (element: any) => element.stesOrt
            },
            {
                columnDef: 'stesIdAvam',
                header: 'arbeitgeber.label.stesId',
                cell: (element: any) => element.stesIdAvam
            },
            {
                columnDef: 'zuweisungStatus',
                header: 'common.label.status',
                cell: (element: any) => element.zuweisungStatus
            },
            {
                columnDef: 'vermittlungsstand',
                header: 'stes.label.zuweisungstes.vermittlungsstand',
                cell: (element: any) => element.vermittlungsstand
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'vermittlungVom',
            sortOrder: -1,
            displayedColumns: []
        }
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private formUtils: FormUtilsService,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private osteService: OsteDataRestService,
        private translateService: TranslateService,
        private navigationService: NavigationService,
        private infopanelService: AmmInfopanelService,
        private unternehmenService: UnternehmenRestService,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private osteSideNavHelper: OsteNavigationHelperService
    ) {
        super();
    }

    ngOnInit() {
        this.setTableData([]);
        this.infopanelService.updateInformation({ subtitle: UnternehmenSideNavLabels.STELLENAGEBOT_VERMITTLUNGEN_ANZEIGEN });
        this.getRouteParams();
        this.initToolbox();

        this.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.setTableData(this.zuweisungen);
            });
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    selectItem(data: any) {
        this.router.navigate(['./bearbeiten'], { queryParams: { osteId: this.osteId, zuweisungId: data.additionalData.zuweisungId }, relativeTo: this.route });
    }

    erfassen() {
        this.router.navigate(['./erfassen'], { queryParams: { osteId: this.osteId }, relativeTo: this.route });
    }

    isErfassenAllowed(): boolean {
        return (
            this.oste &&
            (!this.oste.abmeldeDatum && !this.oste.abmeldeGrund) &&
            (!this.oste.gueltigkeit || !moment(this.oste.gueltigkeit).isBefore(moment.now())) &&
            !this.oste.zuweisungStop &&
            (!this.oste.zuweisungMax || !this.zuweisungen || this.oste.zuweisungMax > this.zuweisungen.length)
        );
    }

    private getRouteParams() {
        this.route.parent.params.subscribe(parentData => {
            this.unternehmenId = parentData['unternehmenId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.osteId = params.get('osteId');
            this.osteSideNavHelper.setFirstLevelNav();
        });
    }

    private initToolbox() {
        ToolboxService.CHANNEL = this.vermittlungenChannel;
        this.printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = { ...this.tableConfig.config, displayedColumns: this.printColumns.map(c => c.columnDef) };
        this.toolboxService.sendConfiguration(ToolboxConfig.getVermittlungenAnzeigenConfig(), this.vermittlungenChannel, ToolboxDataHelper.createForOsteZuweisung(+this.osteId));
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.modalService.open(this.modalPrint, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' }));
    }

    private getData() {
        this.spinnerService.activate(this.vermittlungenChannel);
        forkJoin<BaseResponseWrapperListZuweisungListeViewDTOWarningMessages, OsteDTO>([
            this.unternehmenService.getZuweisungen(this.osteId),
            this.osteService.searchByOste(this.osteId)
        ])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([vermittlungenWrapper, oste]) => {
                    if (vermittlungenWrapper.data && oste) {
                        this.oste = oste;
                        vermittlungenWrapper.data.sort((v1, v2) => (v1.zuweisungNummer < v2.zuweisungNummer ? 1 : v1.zuweisungNummer > v2.zuweisungNummer ? -1 : 0));
                        this.zuweisungen = vermittlungenWrapper.data;
                        this.setTableData(this.zuweisungen);
                        this.infopanelService.updateInformation({ tableCount: vermittlungenWrapper.data.length });
                    }
                    this.spinnerService.deactivate(this.vermittlungenChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.vermittlungenChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
    }

    private setTableData(data: ZuweisungListeViewDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: ZuweisungListeViewDTO) {
        const stesOrt = this.dbTranslateService.translate(data.stesOrt, 'text');
        const vermittlungsstand = this.dbTranslateService.translate(data.zuweisungVermittlungsstand, 'text');
        const zuweisungStatus = this.dbTranslateService.translate(data.zuweisungStatus, 'text');

        return {
            flag: data.meldepflicht != null ? (data.meldepflicht ? MeldepflichtEnum.UNTERLIEGT_LAUFEND : MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN) : null,
            vermittlungVom: data.zuweisungDatumVom,
            fullZuweisungNummer: data.zuweisungNummer,
            stesName: data.stesName,
            stesVorname: data.stesVorname,
            stesOrt,
            stesIdAvam: data.stesIdAvam,
            zuweisungStatus,
            vermittlungsstand,
            additionalData: data,
            inactive: data.bold
        };
    }
}

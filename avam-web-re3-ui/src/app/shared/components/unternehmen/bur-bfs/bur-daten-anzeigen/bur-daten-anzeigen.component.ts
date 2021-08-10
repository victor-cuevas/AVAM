import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages } from '@dtos/baseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages';
import { BurOertlicheEinheitDetailViewDTO } from '@dtos/burOertlicheEinheitDetailViewDTO';
import { FacadeService } from '@shared/services/facade.service';
import { BaseResponseWrapperListBurBetriebeProUidXDTOWarningMessages } from '@dtos/baseResponseWrapperListBurBetriebeProUidXDTOWarningMessages';
import { BurBetriebeProUidXDTO } from '@dtos/burBetriebeProUidXDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { ArbeitgeberPaths, StesDetailsPaths, StesFachberatungPaths, UnternehmenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { UnternehmenTypes } from '@shared/enums/unternehmen.enum';

@Component({
    selector: 'avam-bur-daten-anzeigen',
    templateUrl: './bur-daten-anzeigen.component.html',
    styleUrls: ['./bur-daten-anzeigen.component.scss']
})
export class BurDatenAnzeigenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static burDatenAnzeigenChannel = 'burDatenAnzeigen';
    static modalToolboxId = 'tableBetriebeModal';
    unternehmenId: number;
    burDetailDTO: BurOertlicheEinheitDetailViewDTO;
    type: string;

    @ViewChild('tableModal') private tableModal: ElementRef;
    private tableConfig;
    private formNr = '0150055';
    private originalChannel: string;
    private modalToolboxConfiguration: ToolboxConfiguration[] = [
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
        new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
    ];
    private baseTableConfig = {
        columns: [
            {
                columnDef: 'burnummer',
                header: 'unternehmen.label.burnummer',
                cell: (element: any) => `${element.burnummer}`,
                initWidth: '9%'
            },
            {
                columnDef: 'name',
                header: 'unternehmen.label.burunternehmensname',
                cell: (element: any) => `${element.name}`,
                initWidth: '22%',
                tooltip: (element: any) => `${element.tooltipName}`
            },
            {
                columnDef: 'strasseNummer',
                header: 'common.label.strassenr',
                cell: (element: any) => `${element.strasseNummer}`
            },
            {
                columnDef: 'plzort',
                header: 'common.label.plzort',
                cell: (element: any) => `${element.plzOrt}`
            },
            {
                columnDef: 'betriebsart',
                header: 'unternehmen.label.betriebsart',
                cell: (element: any) => `${element.betriebsart}`,
                tooltip: (element: any) => `${element.tooltipBetriebsart}`
            },
            {
                columnDef: 'quelle',
                header: 'unternehmen.label.quelle',
                cell: (element: any) => `${element.quelle}`,
                initWidth: '9%'
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'strasseNummer',
            sortOrder: 1,
            displayedColumns: []
        }
    };

    constructor(
        private activatedRoute: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private unternehmenRestService: UnternehmenRestService,
        private modalService: NgbModal,
        private facadeService: FacadeService,
        private router: Router
    ) {
        super();
    }

    public ngOnInit(): void {
        this.setTableData([]);
        this.getRouteData();
        this.configureToolbox();
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.burdaten' });
    }

    public ngAfterViewInit(): void {
        this.getData();
    }

    public ngOnDestroy(): void {
        this.facadeService.toolboxService.sendConfiguration([]);
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    public openBetriebe(): void {
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = BurDatenAnzeigenComponent.modalToolboxId;

        this.modalService.open(this.tableModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' }).result.then(
            () => {
                ToolboxService.CHANNEL = this.originalChannel;
            },
            () => {
                ToolboxService.CHANNEL = this.originalChannel;
            }
        );

        this.facadeService.spinnerService.activate(BurDatenAnzeigenComponent.modalToolboxId);
        this.unternehmenRestService
            .getBetriebeByUID(this.burDetailDTO.uidFull.substring(0, 3), this.burDetailDTO.uidOrganisationId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(BurDatenAnzeigenComponent.modalToolboxId))
            )
            .subscribe((response: BaseResponseWrapperListBurBetriebeProUidXDTOWarningMessages) => {
                this.setTableData(response.data);
                this.facadeService.spinnerService.deactivate(BurDatenAnzeigenComponent.modalToolboxId);
            });
    }

    public getModalHeader() {
        return `${this.facadeService.translateService.instant('unternehmen.label.burbetriebezuuid')} ${this.burDetailDTO.uidFull}`;
    }

    public selectItem(row): void {
        this.modalService.dismissAll();
        this.facadeService.spinnerService.activate(BurDatenAnzeigenComponent.burDatenAnzeigenChannel);
        this.unternehmenRestService
            .getUnternehmenIdByBurOrEnheitNummer(row.burOrtEinheitId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(BurDatenAnzeigenComponent.burDatenAnzeigenChannel))
            )
            .subscribe((response: BaseResponseWrapperLongWarningMessages) => {
                switch (this.type) {
                    case UnternehmenTypes.ARBEITGEBER:
                        this.router.navigate([`${ArbeitgeberPaths.ARBEITGEBER_DETAILS}/${response.data}/${ArbeitgeberPaths.ADRESSDATEN}`]);
                        break;
                    case UnternehmenTypes.FACHBERATUNG:
                        this.router.navigate([`${StesDetailsPaths.STES}/${StesFachberatungPaths.FACHBERATUNG}/${response.data}/${ArbeitgeberPaths.ADRESSDATEN}`]);
                        break;
                    default:
                        this.router.navigate([`${UnternehmenPaths.AMM_ANBIETER}/${response.data}/${ArbeitgeberPaths.ADRESSDATEN}`]);
                }
            });
    }

    private getRouteData() {
        this.type = this.activatedRoute.parent.snapshot.data['type'];
        this.activatedRoute.parent.params.subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });
    }

    private getData() {
        this.facadeService.spinnerService.activate(BurDatenAnzeigenComponent.burDatenAnzeigenChannel);
        this.unternehmenRestService
            .getBurDataByUnternehmenId(this.unternehmenId, this.activatedRoute.snapshot.data['type'])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(BurDatenAnzeigenComponent.burDatenAnzeigenChannel))
            )
            .subscribe((response: BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages) => {
                if (!response.warning) {
                    this.burDetailDTO = response.data;
                }
                this.facadeService.toolboxService
                    .observeClickAction(ToolboxService.CHANNEL)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe((action: any) => {
                        if (action.message.action === ToolboxActionEnum.PRINT) {
                            PrintHelper.print();
                        } else if (action.message.action === ToolboxActionEnum.HISTORY && this.burDetailDTO) {
                            this.openHistoryModal(String(this.burDetailDTO.burOrtEinheitId), AvamCommonValueObjectsEnum.T_BUR_OERTLICHE_EINHEIT);
                        }
                    });
            });
    }

    private configureToolbox() {
        ToolboxService.CHANNEL = BurDatenAnzeigenComponent.burDatenAnzeigenChannel;
        this.facadeService.toolboxService.sendConfiguration(
            ToolboxConfig.getBurDatenAnzeigenConfig(),
            BurDatenAnzeigenComponent.burDatenAnzeigenChannel,
            ToolboxDataHelper.createForUnternehmen(this.unternehmenId)
        );
        this.facadeService.messageBus.buildAndSend('toolbox.help.formNumber', this.activatedRoute.snapshot.data.formNumber);
        this.facadeService.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: this.activatedRoute.snapshot.data.formNumber });
    }

    private openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private setTableData(data: BurBetriebeProUidXDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: BurBetriebeProUidXDTO) {
        const betriebsart =
            data[`betriebsart${this.facadeService.translateService.currentLang[0].toUpperCase() + this.facadeService.translateService.currentLang[1].toLowerCase()}`];
        const tooltipTypeLocal =
            data[`typeLocal${this.facadeService.translateService.currentLang[0].toUpperCase() + this.facadeService.translateService.currentLang[1].toLowerCase()}`];
        return {
            burnummer: data.localId,
            name: data.name,
            strasseNummer: !!data.strasseNummer ? data.strasseNummer : '',
            plzOrt: data.plzOrt,
            betriebsart: !!betriebsart ? betriebsart : '',
            quelle: data.ugInAvam ? 'unternehmen.label.avam' : 'unternehmen.label.bur',
            disabled: !data.ugInAvam,
            burOrtEinheitId: data.burOrtEinheitId,
            tooltipName: !!data.legalName ? data.legalName : '',
            tooltipBetriebsart: !!data.typeLocalCD && !!tooltipTypeLocal ? `${data.typeLocalCD} ${tooltipTypeLocal}` : ''
        };
    }
}

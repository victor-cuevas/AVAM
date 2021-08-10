import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { VertragswertDTO } from '@app/shared/models/dtos-generated/vertragswertDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { forkJoin, Subscription } from 'rxjs';
import { BewVertragswerteUebersichtTableComponent } from '../../components';
import { VWButtonsEnum } from '../../components/bew-vertragswerte-uebersicht-table/bew-vertragswerte-uebersicht-table-handler.service';
import { BewVertragswerteUebersichtHelperService, VertragswerteUebersichtInfobarData } from '../../services/bew-vertragswerte-uebersicht-helper.service';
import { BaseResponseWrapperListVertragswertDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListVertragswertDTOWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-kurs-vertragswerte',
    templateUrl: './bew-kurs-vertragswerte.component.html',
    providers: [BewVertragswerteUebersichtHelperService]
})
export class BewKursVertragswerteComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'kurs-vertragswerte-uebersicht';

    public get CHANNEL_STATE_KEY() {
        return BewKursVertragswerteComponent.CHANNEL_STATE_KEY;
    }

    @ViewChild('table') table: BewVertragswerteUebersichtTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;
    @ViewChild('vertragswertModal') vertragswertModal: ElementRef;

    kursId: number;
    produktId: number;
    vertragswerteListDto: VertragswertDTO[];
    datasource = [];
    massnahmeDto: MassnahmeDTO;
    kursDto: SessionDTO;

    isAuthorizedForBtn = false;
    showHinzufuegenBtn = false;

    langSubscription: Subscription;
    toolboxSubscription: Subscription;
    types = VertragswertTypCodeEnum;
    infobarData: VertragswerteUebersichtInfobarData;

    constructor(
        private route: ActivatedRoute,
        private facade: FacadeService,
        private vertraegeRestService: VertraegeRestService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private vertragswerteHelperService: BewVertragswerteUebersichtHelperService,
        private infopanelService: AmmInfopanelService,
        private modalService: NgbModal,
        private ammHelper: AmmHelper
    ) {
        ToolboxService.CHANNEL = this.CHANNEL_STATE_KEY;
    }

    ngOnInit() {
        this.route.parent.queryParams.subscribe(params => {
            this.kursId = +params['dfeId'];
        });

        this.route.parent.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.toolboxSubscription = this.vertragswerteHelperService.subscribeToToolbox(this.CHANNEL_STATE_KEY, this.modalPrint);
        this.vertragswerteHelperService.configureToolbox(this.CHANNEL_STATE_KEY, this.getToolboxConfigData());

        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.vertragswerteHelperService.updateSecondLabel(this.kursDto);
            this.infobarData = this.vertragswerteHelperService.addToInforbar(this.massnahmeDto);
            this.infopanelService.appendToInforbar(this.infobarTemplate);
            this.datasource = this.vertragswerteListDto ? this.vertragswerteListDto.map((row: VertragswertDTO) => this.table.createTableRow(row, this.isAuthorizedForBtn)) : [];
        });
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        this.langSubscription.unsubscribe();
        this.toolboxSubscription.unsubscribe();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.updateInformation({
            tableCount: undefined
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        const getVwForKurs = this.vertraegeRestService.getVertragswerteUebersichtForKurs(this.kursId);
        const isUserAuthorizedForButtons = this.vertraegeRestService.isUserAuthorisedForVwUebersichtButtons(this.produktId);
        const getDfeSession = this.bewirtschaftungRestService.getDfeSession(this.kursId);

        forkJoin([getVwForKurs, getDfeSession, isUserAuthorizedForButtons]).subscribe(
            ([vertragswerteResponse, kursResponse, isAuthorizedResponse]) => {
                this.isAuthorizedForBtn = isAuthorizedResponse.data;

                if (kursResponse.data) {
                    this.kursDto = kursResponse.data;
                    this.massnahmeDto = this.kursDto.massnahmeObject;

                    this.vertragswerteHelperService.updateSecondLabel(this.kursDto);
                    this.infobarData = this.vertragswerteHelperService.addToInforbar(this.massnahmeDto);
                    this.infopanelService.appendToInforbar(this.infobarTemplate);
                }

                this.handleVwUebersichtResponse(vertragswerteResponse);

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    zurKursplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.kursId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    openVertragswertZuordnenModal() {
        this.facade.openModalFensterService.openXLModal(this.vertragswertModal);
    }

    vertragswertZuordnen(vertragswertId: number) {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.vertraegeRestService.attachMassnahmenVertragswertToKurs(vertragswertId, this.kursId).subscribe(
            () => {
                this.refreshData('amm.akquisition.feedback.vertragswerthinzugefuegt');
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    onRowSelected(event: any) {
        const anbieterId = this.massnahmeDto.ammAnbieterObject.unternehmen.unternehmenId;
        this.vertragswerteHelperService.onVwRowSelected(event, anbieterId, this.CHANNEL_STATE_KEY);
    }

    onRowDeleted(event: any) {
        this.openDeleteModal(event.vertragswertId);
    }

    private openDeleteModal(vwId: number) {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.componentInstance.promptLabel = this.facade.translateService.instant('amm.akquisition.message.vertragswertzuordnungaufheben');
        modalRef.componentInstance.primaryButton = 'amm.akquisition.button.zuordnungaufheben';

        modalRef.result.then(result => {
            if (result) {
                this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
                this.vertraegeRestService.detachMassnahmenVertragswertFromKurs(vwId, this.kursId).subscribe(
                    () => {
                        this.refreshData('amm.akquisition.feedback.vertragswertentfernt');
                    },
                    () => {
                        this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
                    }
                );
            }
        });
    }

    private handleVwUebersichtResponse(response: BaseResponseWrapperListVertragswertDTOWarningMessages) {
        if (response.data) {
            this.vertragswerteListDto = response.data;
            this.datasource = this.vertragswerteListDto ? this.vertragswerteListDto.map((row: VertragswertDTO) => this.table.createTableRow(row, this.isAuthorizedForBtn)) : [];
            this.showHinzufuegenBtn = !this.datasource.some(row => row.button === VWButtonsEnum.DELETE || row.button === VWButtonsEnum.NONE);

            this.infopanelService.updateInformation({ tableCount: this.datasource.length });
        }
    }

    private refreshData(successMessage: string) {
        this.vertraegeRestService.getVertragswerteUebersichtForKurs(this.kursId).subscribe(
            vertragswerteResponse => {
                this.handleVwUebersichtResponse(vertragswerteResponse);

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );

        this.facade.notificationService.success(this.facade.dbTranslateService.instant(successMessage));
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.kurs',
            subtitle: 'amm.akquisition.subnavmenuitem.vertragswerte',
            tableCount: this.datasource ? this.datasource.length : undefined
        });
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.kursId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_KURS
        };
    }
}

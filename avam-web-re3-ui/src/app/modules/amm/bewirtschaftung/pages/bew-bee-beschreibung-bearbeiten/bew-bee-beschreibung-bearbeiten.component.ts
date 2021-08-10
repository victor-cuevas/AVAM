import { Permissions } from '@shared/enums/permissions.enum';
import { BeschaeftigungseinheitDTO } from '@dtos/beschaeftigungseinheitDTO';
import { forkJoin, Subscription } from 'rxjs';
import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxService, ToolboxConfiguration, ToolboxActionEnum } from '@shared/services/toolbox.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { FacadeService } from '@shared/services/facade.service';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { AmmZulassungstypCode } from '@shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { AmmDmsTypeEnum } from '@shared/enums/amm-dms-type.enum';
import { DomainEnum } from '@shared/enums/domain.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { AmmHelper } from '@shared/helpers/amm.helper';
import { StandortDTO } from '@dtos/standortDTO';
import { BewBeschreibungFormComponent } from '../../components';
import { AmmConstants } from '@app/shared/enums/amm-constants';

@Component({
    selector: 'avam-bew-bee-beschreibung-bearbeiten',
    templateUrl: './bew-bee-beschreibung-bearbeiten.component.html'
})
export class BewBeeBeschreibungBearbeitenComponent implements AfterViewInit, DeactivationGuarded, OnDestroy {
    @ViewChild('beschreibungFormComponent') beschreibungFormComponent: BewBeschreibungFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    permissions: typeof Permissions = Permissions;
    erfassungsspracheIdBeschreibungState: number;
    channel = 'be-beschreibung-bearbeiten';
    observeClickActionSub: Subscription;
    beDto: BeschaeftigungseinheitDTO;
    langSubscription: Subscription;
    isIndividuelleAmm: boolean;
    organisationInfoBar: string;
    isPraktikumsstelle: boolean;
    unternehmenStatus: string;
    unternehmensname: string;
    standortDto: StandortDTO;
    burNrToDisplay: number;
    beschreibungData: any;
    massnahmeId: number;
    provBurNr: number;
    dfeId: number;
    beId: number;

    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private ammHelper: AmmHelper
    ) {}

    ngAfterViewInit() {
        this.route.parent.queryParams.subscribe(params => {
            this.beId = +params['beId'];
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];
        });

        this.getData();
        this.configureToolbox();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.sendTemplateToInfobar(this.standortDto);
            this.updateSecondLabel(this.beDto);
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getBeschaeftigungseinheit(this.beId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.stesDataRestService.getCode(DomainEnum.STESHANDLUNGSFELD)
        ]).subscribe(
            ([beResponse, spracheResponse, sparchkenntnisseResponse, ausbildungsniveauResponse, berufsfunktionResponse, steshandlungsfeldResponse]) => {
                if (beResponse.data) {
                    this.standortDto = beResponse.data;
                    this.beDto = beResponse.data.beschaeftigungseinheiten[0];
                    this.isPraktikumsstelle = this.beDto.type === AmmConstants.PRAKTIKUMSSTELLE;
                    this.isIndividuelleAmm = this.standortDto.massnahmeObject.zulassungstypObject.code === AmmZulassungstypCode.INDIVIDUELL;
                    this.initInfopanel();
                    this.updateSecondLabel(this.beDto);
                    this.sendTemplateToInfobar(this.standortDto);
                    this.infopanelService.sendLastUpdate(this.beDto.ammBeschreibungObject);
                }

                this.beschreibungData = {
                    beschreibungDto: this.beDto.ammBeschreibungObject,
                    erfassungsspracheOptions: spracheResponse,
                    spracheOptions: spracheResponse,
                    muendlichOptions: sparchkenntnisseResponse,
                    schriftlichOptions: sparchkenntnisseResponse,
                    ausbildungsniveauOptions: ausbildungsniveauResponse,
                    funktionInitialCodeList: berufsfunktionResponse,
                    beurteilungskriterienOptions: steshandlungsfeldResponse,
                    isIndividuelleAmm: this.isIndividuelleAmm
                };

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.beschreibungFormComponent.formGroup.invalid) {
            this.beschreibungFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.channel);
        this.erfassungsspracheIdBeschreibungState = this.beschreibungFormComponent.formGroup.controls.erfassungssprache.value;

        this.bewirtschaftungRestService.saveBeBeschreibung(this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto), this.beId).subscribe(
            beschreibungResponse => {
                if (beschreibungResponse.data) {
                    this.beschreibungData = {
                        ...this.beschreibungData,
                        beschreibungDto: beschreibungResponse.data,
                        erfassungsspracheIdBeschreibungState: this.erfassungsspracheIdBeschreibungState
                    };

                    this.infopanelService.sendLastUpdate(beschreibungResponse.data);
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    canDeactivate(): boolean {
        return this.beschreibungFormComponent.formGroup.dirty;
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.updateInformation({ secondTitle: '' });
        this.langSubscription.unsubscribe();

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.beschreibungData.beschreibungDto.ammBeschreibungId, AvamCommonValueObjectsEnum.T_AMM_BESCHREIBUNG);
            }
        });
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.dfeId },
            uiSuffix: this.isPraktikumsstelle ? AmmDmsTypeEnum.DMS_TYP_PRAKTIKUMSTELLE : AmmDmsTypeEnum.DMS_TYP_ARBEITSPLATZKATEGORIE
        };
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: this.isPraktikumsstelle ? 'amm.massnahmen.subnavmenuitem.praktikumsstelle' : 'amm.massnahmen.subnavmenuitem.arbkategorie',
            subtitle: 'amm.massnahmen.subnavmenuitem.beschreibung'
        });
    }

    private updateSecondLabel(beDto: BeschaeftigungseinheitDTO) {
        if (beDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(beDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(standortDto: StandortDTO) {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            standortDto.massnahmeObject.produktObject.elementkategorieAmtObject,
            standortDto.massnahmeObject.produktObject.strukturelementGesetzObject
        );

        this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
            standortDto.massnahmeObject.ammAnbieterObject.unternehmen.name1,
            standortDto.massnahmeObject.ammAnbieterObject.unternehmen.name2,
            standortDto.massnahmeObject.ammAnbieterObject.unternehmen.name3
        );

        this.provBurNr = standortDto.massnahmeObject.ammAnbieterObject.unternehmen.provBurNr;
        this.burNrToDisplay = this.provBurNr ? this.provBurNr : standortDto.massnahmeObject.ammAnbieterObject.unternehmen.burNummer;
        this.unternehmenStatus = this.facade.dbTranslateService.translate(standortDto.massnahmeObject.ammAnbieterObject.unternehmen.statusObject, 'text');

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }
}

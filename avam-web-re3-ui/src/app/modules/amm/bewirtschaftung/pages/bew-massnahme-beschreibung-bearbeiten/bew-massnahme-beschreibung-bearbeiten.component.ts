import { FacadeService } from '@shared/services/facade.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ToolboxService, ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BewBeschreibungFormComponent } from '../../components';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { forkJoin, Subscription } from 'rxjs';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-massnahme-beschreibung-bearbeiten',
    templateUrl: './bew-massnahme-beschreibung-bearbeiten.component.html'
})
export class BewMassnahmeBeschreibungBearbeitenComponent implements AfterViewInit, DeactivationGuarded, OnDestroy {
    @ViewChild('beschreibungFormComponent') beschreibungFormComponent: BewBeschreibungFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'massnahme-beschreibung-bearbeiten';
    beschreibungData: any;
    massnahmeId: number;
    isIndividuelleAmm: boolean;
    erfassungsspracheIdBeschreibungState: any;
    observeClickActionSub: Subscription;
    isInPlanungSichtbar: boolean;
    produktId: number;
    zulassungstyp: string;
    provBurNr: number;
    burNrToDisplay: number;
    unternehmensname: string;
    unternehmenStatus: string;
    massnahmeDto: MassnahmeDTO;
    langSubscription: Subscription;
    organisationInfoBar: string;
    permissions: typeof Permissions = Permissions;

    constructor(
        private route: ActivatedRoute,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private modalService: NgbModal,
        private ammHelper: AmmHelper,
        private facade: FacadeService
    ) {}

    ngAfterViewInit() {
        this.route.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
        });

        this.getData();
        this.configureToolbox();
        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.sendTemplateToInfobar(this.massnahmeDto);
            this.updateSecondLabel(this.massnahmeDto);
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getMassnahme(this.massnahmeId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.stesDataRestService.getCode(DomainEnum.STESHANDLUNGSFELD)
        ]).subscribe(
            ([massnahmeResponse, spracheResponse, sparchkenntnisseResponse, ausbildungsniveauResponse, berufsfunktionResponse, steshandlungsfeldResponse]) => {
                if (massnahmeResponse.data) {
                    this.massnahmeDto = massnahmeResponse.data;
                    this.isInPlanungSichtbar = this.massnahmeDto.inPlanungAkquisitionSichtbar;
                    this.isIndividuelleAmm = this.massnahmeDto.zulassungstypObject.code === AmmZulassungstypCode.INDIVIDUELL;
                    this.updateSecondLabel(this.massnahmeDto);
                    this.sendTemplateToInfobar(this.massnahmeDto);
                    this.infopanelService.sendLastUpdate(this.massnahmeDto.ammBeschreibungObject);
                }

                this.beschreibungData = {
                    beschreibungDto: this.massnahmeDto.ammBeschreibungObject,
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

        this.bewirtschaftungRestService.saveMassnahmeBeschreibung(this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto), this.massnahmeId).subscribe(
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

    reset() {
        this.beschreibungFormComponent.reset();
    }

    zurMassnahmenplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.massnahmeId, ElementPrefixEnum.MASSNAHME_PREFIX);
    }

    canDeactivate(): boolean {
        return this.beschreibungFormComponent.formGroup.dirty;
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.resetTemplateInInfobar();
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
            entityIDsMapping: { MASSNAHME_ID: this.massnahmeId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_MASSNAHME
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
            title: 'amm.massnahmen.subnavmenuitem.massnahme',
            subtitle: 'amm.massnahmen.subnavmenuitem.beschreibung'
        });
    }

    private updateSecondLabel(massnahmeDto: MassnahmeDTO) {
        if (massnahmeDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(massnahmeDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(massnahmeDto: MassnahmeDTO) {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
            massnahmeDto.produktObject.elementkategorieAmtObject,
            massnahmeDto.produktObject.strukturelementGesetzObject
        );
        this.zulassungstyp = this.facade.dbTranslateService.translate(massnahmeDto.zulassungstypObject, 'kurzText');
        this.provBurNr = massnahmeDto.ammAnbieterObject.unternehmen.provBurNr;
        this.burNrToDisplay = this.provBurNr ? this.provBurNr : massnahmeDto.ammAnbieterObject.unternehmen.burNummer;
        this.unternehmensname = this.ammHelper.concatenateUnternehmensnamen(
            massnahmeDto.ammAnbieterObject.unternehmen.name1,
            massnahmeDto.ammAnbieterObject.unternehmen.name2,
            massnahmeDto.ammAnbieterObject.unternehmen.name3
        );
        this.unternehmenStatus = this.facade.dbTranslateService.translate(massnahmeDto.ammAnbieterObject.unternehmen.statusObject, 'text');

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }
}

import { FacadeService } from '@shared/services/facade.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { ActivatedRoute } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { forkJoin, Subscription } from 'rxjs';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmBeschreibungDTO } from '@app/shared/models/dtos-generated/ammBeschreibungDTO';
import { BewBeschreibungFormComponent } from '../../components/bew-beschreibung-form/bew-beschreibung-form.component';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { ProduktDTO } from '@app/shared/models/dtos-generated/produktDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-produkt-beschreibung-bearbeiten',
    templateUrl: './bew-produkt-beschreibung-bearbeiten.component.html'
})
export class BewProduktBeschreibungBearbeitenComponent implements AfterViewInit, DeactivationGuarded, OnDestroy {
    @ViewChild('beschreibungFormComponent') beschreibungFormComponent: BewBeschreibungFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'produkt-beschreibung-bearbeiten';
    beschreibungData: any;
    produktId: number;
    isIndividuelleAmm: boolean;
    erfassungsspracheIdBeschreibungState: any;
    observeClickActionSub: Subscription;
    beschreibungDto: AmmBeschreibungDTO;
    isInPlanungSichtbar: boolean;
    produktDto: ProduktDTO;
    organisationInfoBar: string;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;

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
        this.route.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.getData();
        this.configureToolbox();
        this.initInfopanel();
        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.updateSecondLabel(this.produktDto);
            this.sendTemplateToInfobar(this.produktDto);
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getProdukt(this.produktId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.SPRACHE),
            this.stesDataRestService.getCode(DomainEnum.SPRACHKENNTNISSE),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.AUSBILDUNGSNIVEAU),
            this.stesDataRestService.getCode(DomainEnum.BERUFSFUNKTION),
            this.stesDataRestService.getCode(DomainEnum.STESHANDLUNGSFELD)
        ]).subscribe(
            ([produktResponse, spracheResponse, sparchkenntnisseResponse, ausbildungsniveauResponse, berufsfunktionResponse, steshandlungsfeldResponse]) => {
                if (produktResponse.data) {
                    this.produktDto = produktResponse.data;
                    this.isInPlanungSichtbar = this.produktDto.inPlanungSichtbar;
                    this.beschreibungDto = this.produktDto.ammBeschreibungObject;
                    this.isIndividuelleAmm = this.produktDto.individuellenAMM;
                }

                this.beschreibungData = {
                    beschreibungDto: this.beschreibungDto,
                    erfassungsspracheOptions: spracheResponse,
                    spracheOptions: spracheResponse,
                    muendlichOptions: sparchkenntnisseResponse,
                    schriftlichOptions: sparchkenntnisseResponse,
                    ausbildungsniveauOptions: ausbildungsniveauResponse,
                    funktionInitialCodeList: berufsfunktionResponse,
                    beurteilungskriterienOptions: steshandlungsfeldResponse,
                    isIndividuelleAmm: this.isIndividuelleAmm
                };

                this.infopanelService.sendLastUpdate(this.beschreibungDto);
                this.updateSecondLabel(this.produktDto);
                this.sendTemplateToInfobar(this.produktDto);

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

        this.bewirtschaftungRestService.saveProduktBeschreibung(this.beschreibungFormComponent.mapToDTO(this.beschreibungData.beschreibungDto), this.produktId).subscribe(
            response => {
                if (response.data) {
                    this.beschreibungData = {
                        ...this.beschreibungData,
                        beschreibungDto: response.data,
                        erfassungsspracheIdBeschreibungState: this.erfassungsspracheIdBeschreibungState
                    };

                    this.infopanelService.sendLastUpdate(response.data);
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

    zurProduktplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.produktId, ElementPrefixEnum.PRODUKT_PREFIX);
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

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData(), true);

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
            entityIDsMapping: { PRODUKT_ID: this.produktId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYPE_PRODUKT
        };
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.produkt',
            subtitle: 'amm.massnahmen.subnavmenuitem.beschreibung'
        });
    }

    private updateSecondLabel(produktDto: ProduktDTO) {
        if (produktDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(produktDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(produktDto: ProduktDTO) {
        this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(produktDto.elementkategorieAmtObject, produktDto.strukturelementGesetzObject);

        this.infopanelService.sendTemplateToInfobar(this.infobarTemplate);
    }

    private openHistoryModal(objId: number, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
    }
}

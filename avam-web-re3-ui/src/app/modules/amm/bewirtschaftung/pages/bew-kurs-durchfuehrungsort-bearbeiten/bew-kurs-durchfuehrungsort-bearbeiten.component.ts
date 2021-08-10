import { AmmConstants } from '@app/shared/enums/amm-constants';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { DokumentVorlageActionDTO } from '@dtos/dokumentVorlageActionDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StaatDTO } from '@dtos/staatDTO';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { Component, ViewChild, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ActivatedRoute } from '@angular/router';
import { BewDurchfuehrungsortFormComponent } from '@app/modules/amm/bewirtschaftung/components';
import { Subscription, forkJoin } from 'rxjs';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxService } from '@app/shared';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DurchfuehrungsortDTO } from '@dtos/durchfuehrungsortDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@app/shared/services/facade.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DeactivationGuarded } from '@app/shared/services/can-deactive-guard.service';
import { SessionDTO } from '@app/shared/models/dtos-generated/sessionDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';

@Component({
    selector: 'avam-bew-kurs-durchfuehrungsort-bearbeiten',
    templateUrl: './bew-kurs-durchfuehrungsort-bearbeiten.component.html'
})
export class BewKursDurchfuehrungsortBearbeitenComponent implements AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('durchfuehrungsortFormComponent') durchfuehrungsortFormComponent: BewDurchfuehrungsortFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'kurs-dfo-bearbeiten';
    durchfuehrungsortData: any;
    observeClickActionSub: Subscription;
    organisationInfoBar: string;
    unternehmensname: string;
    burNrToDisplay: number;
    unternehmenStatus: string;
    provBurNr: number;
    langSubscription: Subscription;
    permissions: typeof Permissions = Permissions;
    switzerland: StaatDTO;
    dfeId: number;
    isInPlanungSichtbar: boolean;
    isIndividuelleAmm: boolean;
    produktId: number;
    sessionDto: SessionDTO;
    dfoId: number;
    isKontaktpersonSelected: boolean;
    massnahmeDto: MassnahmeDTO;

    constructor(
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private infopanelService: AmmInfopanelService,
        private stesDataRestService: StesDataRestService,
        private ammHelper: AmmHelper,
        private facade: FacadeService,
        private route: ActivatedRoute,
        private modalService: NgbModal
    ) {}

    ngAfterViewInit() {
        this.route.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.route.parent.queryParams.subscribe(params => {
            this.dfeId = +params['dfeId'];
        });

        this.getData();
        this.configureToolbox();
        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.sendTemplateToInfobar(this.massnahmeDto);
            this.updateSecondLabel(this.sessionDto);
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            //NOSONAR
            this.bewirtschaftungRestService.getDfeSession(this.dfeId),
            this.stesDataRestService.getStaatSwiss()
        ]).subscribe(
            ([sessionResponse, swissResponse]) => {
                this.sessionDto = sessionResponse.data;
                let dfoDto: DurchfuehrungsortDTO;

                if (this.sessionDto) {
                    this.massnahmeDto = this.sessionDto.massnahmeObject;
                    dfoDto = this.sessionDto.durchfuehrungsortObject;
                    this.isInPlanungSichtbar = this.sessionDto.inPlanungAkquisitionSichtbar;
                    this.isIndividuelleAmm = this.sessionDto.massnahmeObject.zulassungstypObject.code === AmmZulassungstypCode.INDIVIDUELL;
                }

                this.switzerland = swissResponse;

                if (dfoDto) {
                    this.dfoId = dfoDto.durchfuehrungsortId;
                    this.isAnbieterInfoChanged(dfoDto);
                    this.updateSecondLabel(this.sessionDto);
                    this.sendTemplateToInfobar(this.massnahmeDto);
                    this.infopanelService.sendLastUpdate(dfoDto);
                    this.isKontaktpersonSelected = !!dfoDto.ammKontaktpersonObject.kontaktId;
                }

                this.durchfuehrungsortData = {
                    durchfuehrungsortDTO: dfoDto,
                    individuellenAMM: this.isIndividuelleAmm
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

    isAnbieterInfoChanged(dfoDto: DurchfuehrungsortDTO) {
        if (dfoDto && this.ammHelper.isAddressDifferentFromAnbieter(dfoDto, this.switzerland)) {
            this.facade.fehlermeldungenService.showMessage('amm.message.abweichungstandortadresse', 'info');
            OrColumnLayoutUtils.scrollTop();
        }

        if (dfoDto && dfoDto.ammKontaktpersonObject.kontaktObject && this.isKontaktpersonInfoDifferentFromAnbieter(dfoDto)) {
            this.facade.fehlermeldungenService.showMessage('amm.message.abweichungkontaktperson', 'info');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.durchfuehrungsortFormComponent.formGroup.invalid) {
            this.durchfuehrungsortFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.channel);

        this.bewirtschaftungRestService.saveDfeDurchfuehrungsort(this.durchfuehrungsortFormComponent.mapToDTO(), this.dfeId).subscribe(
            durchfuehrungsortResponse => {
                const dfoDto = durchfuehrungsortResponse.data;

                if (dfoDto) {
                    this.durchfuehrungsortData = {
                        durchfuehrungsortDTO: dfoDto,
                        individuellenAMM: this.isIndividuelleAmm
                    };

                    this.isAnbieterInfoChanged(dfoDto);
                    this.infopanelService.sendLastUpdate(dfoDto);
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

    ngOnDestroy(): void {
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ secondTitle: '' });

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.langSubscription.unsubscribe();
    }

    zurKursplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    anbieterdatenUebernehmen() {
        this.facade.spinnerService.activate(this.channel);
        this.facade.fehlermeldungenService.closeMessage();

        this.bewirtschaftungRestService.anbieterdatenUebernehmenDfe(this.dfeId).subscribe(
            response => {
                if (response.data) {
                    this.durchfuehrungsortData = {
                        durchfuehrungsortDTO: response.data,
                        individuellenAMM: this.isIndividuelleAmm,
                        markFormDirty: true
                    };

                    this.isKontaktpersonSelected = !!response.data.ammKontaktpersonObject.kontaktId;
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    canDeactivate(): boolean {
        return this.durchfuehrungsortFormComponent.formGroup.dirty;
    }

    onKpersonSelected(event) {
        this.isKontaktpersonSelected = !!event;
    }

    private isKontaktpersonInfoDifferentFromAnbieter(dfoDto: DurchfuehrungsortDTO): boolean {
        return this.ammHelper.isKontaktpersonInfoDifferentFromAnbieterBearbeiten(
            dfoDto.ammKontaktpersonObject,
            this.isKontaktpersonSelected,
            dfoDto.ammKontaktpersonObject.kontaktObject
        );
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
                this.openHistoryModal(this.dfoId, AvamCommonValueObjectsEnum.T_DURCHFUEHRUNGSORT, AmmConstants.VERANTWORTLICHER_PERSON);
            }
        });
    }

    private openHistoryModal(objId: number, objType: string, ref: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId.toString();
        comp.type = objType;
        comp.ref = ref;
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KURS,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.dfeId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_KURS
        };
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.kurs',
            subtitle: 'amm.massnahmen.subnavmenuitem.durchfuehrungsort'
        });
    }

    private updateSecondLabel(sessionDto: SessionDTO) {
        if (sessionDto) {
            this.infopanelService.updateInformation({
                secondTitle: this.facade.dbTranslateService.translateWithOrder(sessionDto, 'titel')
            });
        }
    }

    private sendTemplateToInfobar(massnahmeDto: MassnahmeDTO) {
        if (massnahmeDto) {
            this.organisationInfoBar = this.ammHelper.getMassnahmenOrganisationTypKuerzel(
                massnahmeDto.produktObject.elementkategorieAmtObject,
                massnahmeDto.produktObject.strukturelementGesetzObject
            );
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
}

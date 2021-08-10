import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { BewMassnahmeTeilnehmerlisteFormComponent } from '../../components';
import { FacadeService } from '@app/shared/services/facade.service';
import { forkJoin, Subscription } from 'rxjs';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { ActivatedRoute } from '@angular/router';
import { FiltersData } from '../../components/bew-massnahme-teilnehmerliste-form/bew-massnahme-teilnehmerliste-form.component';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { AmmTeilnehmerlisteManuellUmbuchbarDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteManuellUmbuchbarDTO';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { StandortDTO } from '@app/shared/models/dtos-generated/standortDTO';
import { AmmTeilnehmerlisteHelperService, TeilnehmerInfobarData } from '../../services/amm-teilnehmerliste-helper.service';
import { TeilnehmerlisteExportParamDto } from '@app/shared/models/dtos-generated/teilnehmerlisteExportParamDto';
import { FormGroup } from '@angular/forms';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-bew-standort-teilnehmerliste',
    templateUrl: './bew-standort-teilnehmerliste.component.html'
})
export class BewStandortTeilnehmerlisteComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: BewMassnahmeTeilnehmerlisteFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    permissions: typeof Permissions = Permissions;

    channel = 'massnahme-standort-teilnehmerliste-form';
    resultsChannel = 'massnahme-standort-teilnehmerliste-results';
    stateChannel = 'massnahme-standort-teilnehmerliste-state';

    langSubscription: Subscription;
    toolboxSubscription: Subscription;
    lastUpdate: TeilnehmerDTO[];

    dataSource: any;
    data: FiltersData;
    produktId: number;
    massnahmeId: number;
    dfeId: number;
    beschaeftigungseinheitId: number;
    massnahmeDto: MassnahmeDTO;
    standortDto: StandortDTO;

    inPlanungAkquisitionSichtbar = false;
    teilnehmerlisteBuchungen: AmmTeilnehmerlisteBuchungenParamDTO;
    manuellUmbuchbar: AmmTeilnehmerlisteManuellUmbuchbarDTO;

    infobarData: TeilnehmerInfobarData;

    constructor(
        private route: ActivatedRoute,
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private searchSession: SearchSessionStorageService,
        private stesDataRestService: StesDataRestService,
        private teilnehmerHelperService: AmmTeilnehmerlisteHelperService,
        private ammHelper: AmmHelper
    ) {
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.parent.parent.params.subscribe(params => {
            this.produktId = +params['produktId'];
        });

        this.route.parent.queryParams.subscribe(params => {
            this.massnahmeId = +params['massnahmeId'];
            this.dfeId = +params['dfeId'];
            this.beschaeftigungseinheitId = +params['beId'];
            this.data = {
                ...this.data,
                massnahmeId: this.massnahmeId,
                dfeId: this.dfeId ? this.dfeId : 0,
                beschaeftigungseinheitId: this.beschaeftigungseinheitId ? this.beschaeftigungseinheitId : 0
            };
        });

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
            this.teilnehmerHelperService.updateSecondLabel(this.standortDto);
            this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
            this.infopanelService.appendToInforbar(this.infobarTemplate);
        });

        this.toolboxSubscription = this.subscribeToToolbox();
        this.teilnehmerHelperService.configureToolbox(this.channel, this.getToolboxConfigData());
        this.initInfopanel();
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
        this.toolboxSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
    }

    onRefresh() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.formComponent.formGroup.valid) {
            const dto = this.formComponent.mapToDto(this.data);
            this.searchSession.storeFieldsByKey(this.stateChannel, dto);
            this.search(dto);
        } else {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([
            this.bewirtschaftungRestService.getDfeStandort(this.produktId, this.massnahmeId, this.dfeId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZEITRAUMFILTER)
        ]).subscribe(
            ([standortResponse, zeitraumfilterOptionsResponse]) => {
                if (standortResponse.data) {
                    this.data = { ...this.data, zeitraumfilterOptions: zeitraumfilterOptionsResponse };

                    this.standortDto = standortResponse.data;
                    this.massnahmeDto = this.standortDto.massnahmeObject;

                    this.teilnehmerHelperService.updateSecondLabel(this.standortDto);
                    this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
                    this.infopanelService.appendToInforbar(this.infobarTemplate);

                    const state = this.searchSession.restoreStateByKey(this.stateChannel);
                    this.search(state ? state.fields : this.formComponent.mapToDto(this.data));
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

    zurStandortplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.dfeId, ElementPrefixEnum.DURCHFUEHRUNGSEINHEIT_PREFIX);
    }

    private search(teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO) {
        this.facade.spinnerService.activate(this.resultsChannel);

        this.bewirtschaftungRestService.getStandortTeilnehmerliste(teilnehmerlisteParams).subscribe(
            teilnehmerlisteBuchungenResponse => {
                if (teilnehmerlisteBuchungenResponse.data) {
                    this.lastUpdate = teilnehmerlisteBuchungenResponse.data.teilnehmerlisteArray;
                    this.dataSource = teilnehmerlisteBuchungenResponse.data.teilnehmerlisteArray.map((row: TeilnehmerDTO, index) => this.createRow(row, index));
                    this.formComponent.teilnehmerlisteBuchungenDto = teilnehmerlisteBuchungenResponse.data;
                    this.formComponent.mapToForm();
                    this.inPlanungAkquisitionSichtbar = teilnehmerlisteBuchungenResponse.data.durchfuehrungseinheit
                        ? teilnehmerlisteBuchungenResponse.data.durchfuehrungseinheit.inPlanungAkquisitionSichtbar
                        : false;

                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.resultsChannel);
                }
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.resultsChannel);
            }
        );
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { DFE_ID: this.dfeId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_STANDORT
        };
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXCEL) {
                const formGroup: FormGroup = this.formComponent.formGroup;

                const teilnehmerlisteExportParamDto: TeilnehmerlisteExportParamDto = {} as TeilnehmerlisteExportParamDto;
                teilnehmerlisteExportParamDto.dfeId = this.data.dfeId;

                this.teilnehmerHelperService.onExcelExport(teilnehmerlisteExportParamDto, formGroup, this.data, this.resultsChannel);
            }
        });
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.standort',
            subtitle: 'amm.massnahmen.subnavmenuitem.teilnehmerliste'
        });
    }

    private createRow(teilnehmer: TeilnehmerDTO, index: number) {
        return {
            index,
            ammBuchungId: teilnehmer.ammBuchungId,
            kanton: teilnehmer.kanton,
            platz: teilnehmer.buchungPlatz ? teilnehmer.buchungPlatz : '',
            teilnehmer: `${teilnehmer.stesName}, ${teilnehmer.stesVorname}`,
            personenNr: teilnehmer.personenNr,
            benutzerId: teilnehmer.benutzerLogin,
            bearbeitung: `${teilnehmer.benutzerNachname}, ${teilnehmer.benutzerVorname}`,
            benutzerstelle: teilnehmer.benutzerstelleId,
            buchungsdatum: teilnehmer.buchungDatum ? new Date(teilnehmer.buchungDatum) : '',
            von: teilnehmer.buchungVon ? new Date(teilnehmer.buchungVon) : '',
            bis: teilnehmer.buchungBis ? new Date(teilnehmer.buchungBis) : '',
            abbruch: teilnehmer.buchungAbbruch ? new Date(teilnehmer.buchungAbbruch) : '',
            entscheidart: this.facade.dbTranslateService.translateWithOrder(teilnehmer.entscheidArt, 'kurzText'),
            status: this.facade.dbTranslateService.translateWithOrder(teilnehmer.entscheidStatus, 'kurzText')
        };
    }
}

import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { BewMassnahmeTeilnehmerlisteTableComponent, BewMassnahmeTeilnehmerlisteFormComponent } from '../../components';
import { ActivatedRoute } from '@angular/router';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FiltersData } from '../../components/bew-massnahme-teilnehmerliste-form/bew-massnahme-teilnehmerliste-form.component';
import { Subscription, forkJoin } from 'rxjs';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';

import { Permissions } from '@app/shared/enums/permissions.enum';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { AmmTeilnehmerlisteHelperService, TeilnehmerInfobarData } from '../../services/amm-teilnehmerliste-helper.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { TeilnehmerlisteExportParamDto } from '@app/shared/models/dtos-generated/teilnehmerlisteExportParamDto';
import { FormGroup } from '@angular/forms';
import { ElementPrefixEnum } from '@app/shared/enums/domain-code/element-prefix.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Component({
    selector: 'avam-massnahme-teilnehmerliste',
    templateUrl: './bew-massnahme-teilnehmerliste.component.html'
})
export class BewMassnahmeTeilnehmerlisteComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: BewMassnahmeTeilnehmerlisteFormComponent;
    @ViewChild('tableComponent') tableComponent: BewMassnahmeTeilnehmerlisteTableComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    permissions: typeof Permissions = Permissions;

    langSubscription: Subscription;
    lastUpdate;
    massnahmeId: number;
    dfeId: number;
    beschaeftigungseinheitId: number;
    data: FiltersData;
    dataSource;
    massnahmeDto: MassnahmeDTO;

    infobarData: TeilnehmerInfobarData;

    inPlanungAkquisitionSichtbar = false;

    channel = 'massnahme-teilnehmerliste-form';
    resultsChannel = 'massnahme-teilnehmerliste-results';
    stateChannel = 'massnahme-teilnehmerliste-state';
    toolboxSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private facade: FacadeService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private searchSession: SearchSessionStorageService,
        private teilnehmerHelperService: AmmTeilnehmerlisteHelperService,
        private ammHelper: AmmHelper
    ) {
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
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

        this.teilnehmerHelperService.configureToolbox(this.channel, this.getToolboxConfigData());
        this.toolboxSubscription = this.subscribeToToolbox();

        this.initInfopanel();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.teilnehmerHelperService.updateSecondLabel(this.massnahmeDto);
            this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
            this.infopanelService.appendToInforbar(this.infobarTemplate);
            this.dataSource = this.lastUpdate ? this.lastUpdate.map((row, index) => this.createRow(row, index)) : [];
        });
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy() {
        this.toolboxSubscription.unsubscribe();
        this.langSubscription.unsubscribe();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
        this.facade.fehlermeldungenService.closeMessage();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin([this.bewirtschaftungRestService.getMassnahme(this.massnahmeId), this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZEITRAUMFILTER)]).subscribe(
            ([massnahmeResponse, zeitraumfilterOptionsResponse]) => {
                this.data = { ...this.data, zeitraumfilterOptions: zeitraumfilterOptionsResponse };
                this.massnahmeDto = massnahmeResponse.data;
                this.inPlanungAkquisitionSichtbar = massnahmeResponse.data ? massnahmeResponse.data.inPlanungAkquisitionSichtbar : false;

                this.teilnehmerHelperService.updateSecondLabel(this.massnahmeDto);
                this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
                this.infopanelService.appendToInforbar(this.infobarTemplate);

                const state = this.searchSession.restoreStateByKey(this.stateChannel);
                this.search(state ? state.fields : this.formComponent.mapToDto(this.data));

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    onRefresh() {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.formComponent.formGroup.valid) {
            this.searchSession.storeFieldsByKey(this.stateChannel, this.formComponent.mapToDto(this.data));
            this.search(this.formComponent.mapToDto(this.data));
        } else {
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    zurMassnahmenplanung() {
        this.ammHelper.navigateToPlanungAnzeigen(this.massnahmeId, ElementPrefixEnum.MASSNAHME_PREFIX);
    }

    private search(teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO) {
        this.facade.spinnerService.activate(this.resultsChannel);

        this.bewirtschaftungRestService.getMassnahmeDfeTeilnehmerliste(teilnehmerlisteParams).subscribe(
            teilnehmerlisteBuchungenResponse => {
                if (teilnehmerlisteBuchungenResponse.data) {
                    this.lastUpdate = teilnehmerlisteBuchungenResponse.data.teilnehmerlisteArray;
                    this.dataSource = teilnehmerlisteBuchungenResponse.data.teilnehmerlisteArray.map((row: TeilnehmerDTO, index) => this.createRow(row, index));
                    this.formComponent.teilnehmerlisteBuchungenDto = teilnehmerlisteBuchungenResponse.data;
                    this.formComponent.mapToForm();

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
            entityIDsMapping: { MASSNAHME_ID: this.massnahmeId },
            uiSuffix: AmmDmsTypeEnum.DMS_TYP_MASSNAHME
        };
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXCEL) {
                const formGroup: FormGroup = this.formComponent.formGroup;

                const teilnehmerlisteExportParamDto: TeilnehmerlisteExportParamDto = {} as TeilnehmerlisteExportParamDto;
                teilnehmerlisteExportParamDto.massnahmeId = this.data.massnahmeId;

                this.teilnehmerHelperService.onExcelExport(teilnehmerlisteExportParamDto, formGroup, this.data, this.resultsChannel);
            }
        });
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: 'amm.massnahmen.subnavmenuitem.massnahme',
            subtitle: 'amm.massnahmen.subnavmenuitem.teilnehmerliste'
        });
    }

    private createRow(teilnehmer: TeilnehmerDTO, index: number) {
        return {
            index,
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

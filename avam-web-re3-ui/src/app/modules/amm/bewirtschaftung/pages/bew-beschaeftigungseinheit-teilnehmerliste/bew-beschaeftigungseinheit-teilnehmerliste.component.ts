import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { BewMassnahmeTeilnehmerlisteFormComponent } from '../../components';
import { FiltersData } from '../../components/bew-massnahme-teilnehmerliste-form/bew-massnahme-teilnehmerliste-form.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ActivatedRoute } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmTeilnehmerlisteBuchungenParamDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteBuchungenParamDTO';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { AmmTeilnehmerlisteManuellUmbuchbarDTO } from '@app/shared/models/dtos-generated/ammTeilnehmerlisteManuellUmbuchbarDTO';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { AmmDmsTypeEnum } from '@app/shared/enums/amm-dms-type.enum';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BeschaeftigungseinheitDTO } from '@app/shared/models/dtos-generated/beschaeftigungseinheitDTO';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { AmmTeilnehmerlisteHelperService, TeilnehmerInfobarData } from '../../services/amm-teilnehmerliste-helper.service';
import { TeilnehmerlisteExportParamDto } from '@app/shared/models/dtos-generated/teilnehmerlisteExportParamDto';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-teilnehmerliste',
    templateUrl: './bew-beschaeftigungseinheit-teilnehmerliste.component.html'
})
export class BewBeschaeftigungseinheitTeilnehmerlisteComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('formComponent') formComponent: BewMassnahmeTeilnehmerlisteFormComponent;
    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    channel = 'massnahme-beschaeftigungseinheit-teilnehmerliste-form';
    resultsChannel = 'massnahme-beschaeftigungseinheit-teilnehmerliste-results';
    stateChannel = 'massnahme-beschaeftigungseinheit-teilnehmerliste-state';

    langSubscription: Subscription;
    toolboxSubscription: Subscription;
    lastUpdate: TeilnehmerDTO[];
    massnahmeDto: MassnahmeDTO;
    beDto: BeschaeftigungseinheitDTO;

    produktId: number;
    massnahmeId: number;
    dfeId: number;
    beschaeftigungseinheitId: number;
    isPraktikumstelle = false;

    manuellUmbuchbar: AmmTeilnehmerlisteManuellUmbuchbarDTO;
    infobarData: TeilnehmerInfobarData;

    dataSource: any[] = [];
    data: FiltersData;

    constructor(
        private route: ActivatedRoute,
        private facade: FacadeService,
        private bewirtschaftungRestService: BewirtschaftungRestService,
        private stesDataRestService: StesDataRestService,
        private searchSession: SearchSessionStorageService,
        private infopanelService: AmmInfopanelService,
        private teilnehmerHelperService: AmmTeilnehmerlisteHelperService
    ) {
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.parent.parent.parent.params.subscribe(params => {
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
            this.teilnehmerHelperService.updateSecondLabel(this.beDto);
            this.infobarData = this.teilnehmerHelperService.addToInforbar(this.massnahmeDto);
            this.infopanelService.appendToInforbar(this.infobarTemplate);
        });

        this.toolboxSubscription = this.subscribeToToolbox();
        this.teilnehmerHelperService.configureToolbox(this.channel, this.getToolboxConfigData());
    }

    ngAfterViewInit() {
        this.getData();
    }

    ngOnDestroy(): void {
        this.langSubscription.unsubscribe();
        this.facade.fehlermeldungenService.closeMessage();
        this.toolboxSubscription.unsubscribe();
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
            this.bewirtschaftungRestService.getBeschaeftigungseinheit(this.beschaeftigungseinheitId),
            this.stesDataRestService.getActiveCodeByDomain(DomainEnum.ZEITRAUMFILTER)
        ]).subscribe(
            ([beResponse, zeitraumfilterOptionsResponse]) => {
                if (beResponse.data) {
                    this.data = { ...this.data, zeitraumfilterOptions: zeitraumfilterOptionsResponse };
                    this.massnahmeDto = beResponse.data.massnahmeObject;

                    this.beDto = beResponse.data.beschaeftigungseinheiten.find(v => v.beschaeftigungseinheitId === this.beschaeftigungseinheitId);
                    this.isPraktikumstelle = this.beDto.type === AmmConstants.PRAKTIKUMSSTELLE;
                    this.initInfopanel();

                    this.teilnehmerHelperService.updateSecondLabel(this.beDto);
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

    private search(teilnehmerlisteParams: AmmTeilnehmerlisteBuchungenParamDTO) {
        this.facade.spinnerService.activate(this.resultsChannel);

        this.bewirtschaftungRestService.getBeschaeftigungseinheitTeilnehmerliste(teilnehmerlisteParams).subscribe(
            teilnehmerlisteBuchungenResponse => {
                if (teilnehmerlisteBuchungenResponse.data) {
                    const teilnehmerlisteBuchungen = teilnehmerlisteBuchungenResponse.data;
                    this.lastUpdate = teilnehmerlisteBuchungen.teilnehmerlisteArray;
                    this.dataSource = teilnehmerlisteBuchungen.teilnehmerlisteArray.map((row: TeilnehmerDTO, index) => this.createRow(row, index));
                    this.formComponent.teilnehmerlisteBuchungenDto = teilnehmerlisteBuchungen;
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
            entityIDsMapping: { DFE_ID: this.dfeId },
            uiSuffix: this.isPraktikumstelle ? AmmDmsTypeEnum.DMS_TYP_PRAKTIKUMSTELLE : AmmDmsTypeEnum.DMS_TYP_ARBEITSPLATZKATEGORIE
        };
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.channel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXCEL) {
                const formGroup: FormGroup = this.formComponent.formGroup;

                const teilnehmerlisteExportParamDto: TeilnehmerlisteExportParamDto = {} as TeilnehmerlisteExportParamDto;
                teilnehmerlisteExportParamDto.dfeId = this.data.dfeId;
                teilnehmerlisteExportParamDto.bfeId = this.data.beschaeftigungseinheitId;

                this.teilnehmerHelperService.onExcelExport(teilnehmerlisteExportParamDto, formGroup, this.data, this.resultsChannel);
            }
        });
    }

    private initInfopanel() {
        this.infopanelService.dispatchInformation({
            title: this.isPraktikumstelle ? 'amm.massnahmen.subnavmenuitem.praktikumsstelle' : 'amm.massnahmen.subnavmenuitem.arbkategorie',
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

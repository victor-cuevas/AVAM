import { FacadeService } from '@app/shared/services/facade.service';
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { AuszahlungsdatenTableType } from '../../components/auszahlungsdaten-table/auszahlungsdaten-table.component';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TeilzahlungX1001DTO } from '@app/shared/models/dtos-generated/teilzahlungX1001DTO';
import { AbrechnungX1001DTO } from '@app/shared/models/dtos-generated/abrechnungX1001DTO';
import { FormatSwissFrancPipe } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { forkJoin, Subscription } from 'rxjs';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { HttpResponse } from '@angular/common/http';
import { HttpResponseHelper } from '@app/shared/helpers/http-response.helper';
import { VertragswertDTO } from '@app/shared/models/dtos-generated/vertragswertDTO';
import { VertragswertMDTO } from '@app/shared/models/dtos-generated/vertragswertMDTO';
import { VertragswertDDTO } from '@app/shared/models/dtos-generated/vertragswertDDTO';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { LeistungsvereinbarungDTO } from '@app/shared/models/dtos-generated/leistungsvereinbarungDTO';
import { MassnahmeDTO } from '@app/shared/models/dtos-generated/massnahmeDTO';
import { DurchfuehrungseinheitDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitDTO';
import { SpinnerService } from 'oblique-reactive';
import { Permissions } from '@shared/enums/permissions.enum';

@Component({
    selector: 'avam-vertragswert-asal-daten',
    templateUrl: './vertragswert-asal-daten.component.html',
    providers: [FormatSwissFrancPipe]
})
export class VertragswertAsalDatenComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'vertragswert-asal-daten';
    permissions: typeof Permissions = Permissions;

    @ViewChild('infobarTemplate') infobarTemplate: TemplateRef<any>;

    public get CHANNEL_STATE_KEY() {
        return VertragswertAsalDatenComponent.CHANNEL_STATE_KEY;
    }

    tableType = AuszahlungsdatenTableType;

    lv: LeistungsvereinbarungDTO;
    lvId: number;
    lvStatus: string;
    vertragswert: VertragswertDTO;
    vertragswertId: number;
    vertragswertType: string;
    massnahme: MassnahmeDTO;
    kurs: DurchfuehrungseinheitDTO;
    standort: DurchfuehrungseinheitDTO;
    nummerLabel: string;
    reverenzierteObjNummer: number;
    title: string;
    quernavigationsLabel: string;

    toolboxSubscription: Subscription;
    langSubscription: Subscription;

    teilzahlungswerteDataSource: any[];
    teilzahlungswerteTotal: string | number;
    abrechnungswerteDataSource: any[];
    abrechnungswerteTotal: string | number;
    summeTotal: string | number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formatSwissFrancPipe: FormatSwissFrancPipe,
        private facade: FacadeService,
        private vertraegeRestService: VertraegeRestService,
        private anbieterRestService: AnbieterRestService,
        private infopanelService: AmmInfopanelService
    ) {
        ToolboxService.CHANNEL = this.CHANNEL_STATE_KEY;
        SpinnerService.CHANNEL = this.CHANNEL_STATE_KEY;
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.vertragswertId = +params['vertragswertId'];
            this.lvId = +params['lvId'];
            this.getData();
        });
    }

    ngAfterViewInit() {
        this.initInfopanel();

        this.configureToolbox();
        this.toolboxSubscription = this.subscribeToToolbox();

        this.langSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.lvStatus = this.lv ? this.facade.dbTranslateService.translate(this.lv.statusObject, 'text') : '';

            const refObj = this.massnahme || this.kurs || this.standort;
            this.translateTitelWithOrder(refObj);

            this.infopanelService.appendToInforbar(this.infobarTemplate);
            this.initInfopanel();
        });
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.toolboxSubscription.unsubscribe();
        this.langSubscription.unsubscribe();
        this.infopanelService.removeFromInfobar(this.infobarTemplate);
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);
        const getVertragswertAsalDaten = this.vertraegeRestService.getVertragswertAsalDaten(this.vertragswertId);
        const getVertragswert = this.vertraegeRestService.getVertragswertDetailById(this.vertragswertId, this.lvId);
        const getLV = this.anbieterRestService.getLeistungsvereinbarungById(this.lvId);
        forkJoin([getVertragswertAsalDaten, getVertragswert, getLV]).subscribe(
            ([asalResponse, vertragswertResponse, lvResponse]) => {
                this.lv = lvResponse.data ? lvResponse.data : null;
                this.lvStatus = this.lv ? this.facade.dbTranslateService.translate(this.lv.statusObject, 'text') : '';

                if (asalResponse.data) {
                    const asalData = asalResponse.data;

                    this.teilzahlungswerteDataSource = asalData.teilzahlungsliste.map(el => this.createTeilzahlungswerteRow(el));
                    this.teilzahlungswerteTotal = this.formatSwissFrancPipe.transform(asalData.summeTeilzahlungswerte || 0);

                    this.abrechnungswerteDataSource = asalData.abrechnungsliste.map(el => this.createAbrechnungswerteRow(el));
                    this.abrechnungswerteTotal = this.formatSwissFrancPipe.transform(asalData.summeAbrechnungswerte || 0);

                    this.summeTotal = this.formatSwissFrancPipe.transform(asalData.summeZahlungen || 0);
                } else {
                    this.teilzahlungswerteTotal = this.formatSwissFrancPipe.transform(0);
                    this.abrechnungswerteTotal = this.formatSwissFrancPipe.transform(0);
                    this.summeTotal = this.formatSwissFrancPipe.transform(0);
                }

                if (vertragswertResponse.data && vertragswertResponse.data.typ) {
                    this.vertragswert = vertragswertResponse.data;
                    this.vertragswertType = this.vertragswert.typ.code;
                    this.extractVertragswertData();
                    this.quernavigationsLabel = this.setButtonLabel();
                }
                this.infopanelService.appendToInforbar(this.infobarTemplate);
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY)
        );
    }

    extractVertragswertData() {
        switch (this.vertragswertType) {
            case VertragswertTypCodeEnum.MASSNAHME:
                this.massnahme = (this.vertragswert as VertragswertMDTO).massnahmeObject;
                this.reverenzierteObjNummer = this.massnahme.massnahmeId;
                this.nummerLabel = 'amm.akquisition.label.massnahmenNr';
                this.title = this.translateTitelWithOrder(this.massnahme);
                break;
            case VertragswertTypCodeEnum.KURS:
                this.kurs = (this.vertragswert as VertragswertDDTO).durchfuehrungseinheitObject;
                this.reverenzierteObjNummer = this.kurs.durchfuehrungsId;
                this.nummerLabel = 'amm.akquisition.label.durchfuehrungsnrkurs';
                this.title = this.translateTitelWithOrder(this.kurs);
                break;
            case VertragswertTypCodeEnum.STANDORT:
                this.standort = (this.vertragswert as VertragswertDDTO).durchfuehrungseinheitObject;
                this.reverenzierteObjNummer = this.standort.durchfuehrungsId;
                this.nummerLabel = 'amm.akquisition.label.durchfuehrungsnrstandort';
                this.title = this.translateTitelWithOrder(this.standort);
                break;
        }
    }

    quernavigate() {
        switch (this.vertragswertType) {
            case VertragswertTypCodeEnum.MASSNAHME:
                const massnahmeProduktId = this.massnahme.produktObject.produktId;
                this.router.navigate([`/amm/bewirtschaftung/produkt/${massnahmeProduktId}/massnahmen/massnahme/grunddaten`], {
                    queryParams: { massnahmeId: this.massnahme.massnahmeId }
                });
                break;
            case VertragswertTypCodeEnum.KURS:
                const kursMassnahme = this.kurs.massnahmeObject;
                const kursProduktId = kursMassnahme.produktObject.produktId;
                this.router.navigate([`/amm/bewirtschaftung/produkt/${kursProduktId}/massnahmen/massnahme/kurse/kurs/grunddaten`], {
                    queryParams: { massnahmeId: kursMassnahme.massnahmeId, dfeId: this.kurs.durchfuehrungsId }
                });
                break;
            case VertragswertTypCodeEnum.STANDORT:
                const standortMassnahme = this.standort.massnahmeObject;
                const standortProduktId = standortMassnahme.produktObject.produktId;
                this.router.navigate([`amm/bewirtschaftung/produkt/${standortProduktId}/massnahmen/massnahme/standorte/standort/grunddaten`], {
                    queryParams: { dfeId: this.standort.durchfuehrungsId, massnahmeId: standortMassnahme.massnahmeId }
                });
                break;
        }
    }

    private createTeilzahlungswerteRow(teilzahlungswert: TeilzahlungX1001DTO) {
        const row = this.createRow(teilzahlungswert);

        row.entscheidNr = teilzahlungswert.teilzahlungswertNr || '';

        return row;
    }

    private initInfopanel() {
        const vertragswertLabel = this.facade.translateService.instant('amm.akquisition.subnavmenuitem.vertragswert');
        const asaldatenTitel = this.facade.translateService.instant('amm.akquisition.subnavmenuitem.asaldaten');

        this.infopanelService.updateInformation({
            subtitle: `${vertragswertLabel} - ${asaldatenTitel}`
        });
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EXCEL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.ZURUECK, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.CHANNEL_STATE_KEY, this.getToolboxConfigData(), true);
    }

    private getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { VERTRAGSWERT_ID: this.vertragswertId }
        };
    }

    private subscribeToToolbox(): Subscription {
        return this.facade.toolboxService.observeClickAction(this.CHANNEL_STATE_KEY).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXCEL) {
                this.getExcelExport();
            }
        });
    }

    private getExcelExport() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.vertraegeRestService.getVertragswertAsalDatenExcelExport(this.vertragswertId).subscribe(
            (res: HttpResponse<any>) => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
                HttpResponseHelper.openBlob(res);
            },
            error => {
                this.facade.fehlermeldungenService.showMessage(error, 'danger');
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    private createAbrechnungswerteRow(abrechnungswert: AbrechnungX1001DTO) {
        const row = this.createRow(abrechnungswert);

        row.entscheidNr = abrechnungswert.abrechnungswertNr || '';

        return row;
    }

    private createRow(wert: TeilzahlungX1001DTO | AbrechnungX1001DTO) {
        return {
            auszahlungsNr: wert.auszahlungsNr || '',
            entscheidNr: null,
            entschaedigungsart: wert.entschaedigungsArt || '',
            betrag: this.formatSwissFrancPipe.transform(wert.betrag || 0),
            auszahlungsperiode: this.facade.formUtilsService.parseDate(wert.auszahlungsPeriode) || '',
            valuta: this.facade.formUtilsService.parseDate(wert.valutaDatum) || '',
            burNr: wert.burNr || ''
        };
    }

    private setButtonLabel(): string {
        let label = '';
        switch (this.vertragswertType) {
            case VertragswertTypCodeEnum.MASSNAHME:
                label = 'amm.akquisition.button.zurmassnahme';
                break;
            case VertragswertTypCodeEnum.KURS:
                label = 'amm.akquisition.button.zumkurs';
                break;
            case VertragswertTypCodeEnum.STANDORT:
                label = 'amm.akquisition.button.zumstandort';
                break;
        }

        return label;
    }

    private translateTitelWithOrder(refObj: MassnahmeDTO | DurchfuehrungseinheitDTO) {
        return this.facade.dbTranslateService.translateWithOrder(refObj, 'titel');
    }
}

import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { FormatSwissFrancPipe } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { VertragswertTypCodeEnum } from '@app/shared/enums/domain-code/vertragswert-typ-code.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { TeilzahlungswertDTO } from '@app/shared/models/dtos-generated/teilzahlungswertDTO';
import { TeilzahlungswertUebersichtParameterDTO } from '@app/shared/models/dtos-generated/teilzahlungswertUebersichtParameterDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-teilzahlungswerte-uebersicht',
    templateUrl: './teilzahlungswerte-uebersicht.component.html',
    providers: [FormatSwissFrancPipe]
})
export class TeilzahlungswerteUebersichtComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    vertragswertId: number;
    lvId: number;
    calculatedChfSum = 0;
    chfTotal: string | number;
    dataSource;
    channel = 'teilzahlungswerte-uebersicht-channel';
    lastData: TeilzahlungswertUebersichtParameterDTO;
    vertragswertTypEnum = VertragswertTypCodeEnum;
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    permissions: typeof Permissions = Permissions;
    unternehmenId: number;

    constructor(
        private facade: FacadeService,
        private route: ActivatedRoute,
        private vertraegeRestService: VertraegeRestService,
        private formatSwissFrancPipe: FormatSwissFrancPipe,
        private infopanelService: AmmInfopanelService,
        private router: Router
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.showSideNavigation();
        this.getRouteData();
        this.getData();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.configureToolbox();
    }

    getRouteData() {
        this.route.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.vertragswertId = params.vertragswertId;
            this.lvId = params.lvId;
        });
        this.route.parent.parent.parent.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(res => {
            this.unternehmenId = +res.unternehmenId;
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        this.vertraegeRestService.getVertragswertTeilzahlungswerte(this.vertragswertId).subscribe(
            res => {
                this.lastData = res.data;
                this.dataSource = res.data.teilzahlungswerte.map(element => this.createRow(element));
                this.chfTotal = this.formatSwissFrancPipe.transform(this.calculatedChfSum);
                this.updateInfopanel();

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    createRow(element: TeilzahlungswertDTO): any {
        const selectedElement = this.lastData.selectedTeilzahlungForTeilzahlungswert[element.teilzahlungswertId];
        this.calculatedChfSum += element.betrag;

        return {
            teilzahlungswertId: element.teilzahlungswertId,
            teilzahlungswertNr: element.teilzahlungswertNr,
            chfBetrag: this.formatSwissFrancPipe.transform(element.betrag),
            faelligAm: this.facade.formUtilsService.parseDate(element.faelligkeitDatum),
            vorgaenger: element.vorgaengerObject ? element.vorgaengerObject.teilzahlungswertNr : '',
            nachfolger: element.nachfolgerObject ? element.nachfolgerObject.teilzahlungswertNr : '',
            vertragswertNr: element.vertragswertObject.vertragswertNr,
            teilzahlungsNr: selectedElement ? selectedElement.teilzahlungNr : '',
            titel: selectedElement ? selectedElement.titel : '',
            ausfuehrungsDatum: selectedElement ? this.facade.formUtilsService.parseDate(selectedElement.ausfuehrungsdatum) : ''
        };
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.subnavmenuitem.vertragswertTeilzahlungswerte',
            hideInfobar: false
        });

        this.infopanelService.appendToInforbar(this.panelTemplate);
        this.infopanelService.updateInformation({ tableCount: this.lastData ? this.lastData.teilzahlungswerte.length : undefined });
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
    }

    openPrintModal() {
        this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, this.getToolboxConfigData());
    }

    getToolboxConfigData(): DokumentVorlageToolboxData {
        return {
            targetEntity: null,
            vorlagenKategorien: null,
            entityIDsMapping: { VERTRAGSWERT_ID: this.vertragswertId }
        };
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.facade.fehlermeldungenService.closeMessage();
            this.getData();
        });
    }

    teilzahlungswertErfassen() {
        this.router.navigate([`amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/erfassen`], {
            queryParams: { lvId: this.lvId, vertragswertId: this.vertragswertId }
        });
    }

    navigateToTzwert(event) {
        this.router.navigate([`/amm/anbieter/${this.unternehmenId}/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/teilzahlungswerte/teilzahlungswert`], {
            queryParams: {
                vertragswertId: this.vertragswertId,
                teilzahlungswertId: event.teilzahlungswertId,
                lvId: this.lvId
            }
        });
    }

    navigateToProdukt(type: string) {
        const produktId = this.lastData.vertragswert['massnahmeObject']
            ? this.lastData.vertragswert['massnahmeObject'].produktObject.produktId
            : this.lastData.vertragswert['durchfuehrungseinheitObject'].massnahmeObject.produktObject.produktId;

        const massnahmeId = this.lastData.vertragswert['massnahmeObject']
            ? this.lastData.vertragswert['massnahmeObject'].massnahmeId
            : this.lastData.vertragswert['durchfuehrungseinheitObject'].massnahmeObject.massnahmeId;

        const dfeId = this.lastData.vertragswert['durchfuehrungseinheitObject'] ? this.lastData.vertragswert['durchfuehrungseinheitObject'].durchfuehrungsId : 0;

        switch (type) {
            case this.vertragswertTypEnum.MASSNAHME:
                this.router.navigate([`/amm/bewirtschaftung/produkt/${produktId}/massnahmen/massnahme/grunddaten`], {
                    queryParams: { massnahmeId }
                });
                break;
            case this.vertragswertTypEnum.KURS:
                this.router.navigate([`/amm/bewirtschaftung/produkt/${produktId}/massnahmen/massnahme/kurse/kurs/grunddaten`], {
                    queryParams: { massnahmeId, dfeId }
                });
                break;
            case this.vertragswertTypEnum.STANDORT:
                this.router.navigate([`/amm/bewirtschaftung/produkt/${produktId}/massnahmen/massnahme/standorte/standort/grunddaten`], {
                    queryParams: { massnahmeId, dfeId }
                });
                break;
        }
    }

    showSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute('./teilzahlungswerte');
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.infopanelService.revertTemplateInInfobar();
        this.infopanelService.removeFromInfobar(this.panelTemplate);
        this.facade.toolboxService.sendConfiguration([]);
    }
}

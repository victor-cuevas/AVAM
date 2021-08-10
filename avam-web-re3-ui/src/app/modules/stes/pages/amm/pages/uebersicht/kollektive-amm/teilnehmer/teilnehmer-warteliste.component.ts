import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { Subscription, forkJoin } from 'rxjs';
import { AMMLabels } from '@app/shared/enums/stes-routing-labels.enum';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { SpinnerService } from 'oblique-reactive';
import { BaseResponseWrapperListTeilnehmerDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListTeilnehmerDTOWarningMessages';
import { TableHeaderObject } from '@app/shared/components/table/table.header.object';
import { TeilnehmerWartelisteData } from './teilnehmer-warteliste.helper';
import { ToolboxService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@shared/services/facade.service';
import { AmmCloseableAbstract } from '@stes/pages/amm/classes/amm-closeable-abstract';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { AmmMassnahmenCode } from '@shared/enums/domain-code/amm-massnahmen-code.enum';

@Component({
    selector: 'avam-teilnehmer-warteliste',
    templateUrl: './teilnehmer-warteliste.component.html',
    providers: [ObliqueHelperService]
})
export class TeilnehmerWartelisteComponent extends AmmCloseableAbstract implements OnInit, OnDestroy {
    @ViewChild('infobartemp') infobartemp: TemplateRef<any>;

    ammMassnahmenType: string;
    geschaeftsfallId: number;
    entscheidId: number;
    massnahmeId: number;
    basisNr: number;

    tableHeaders: TableHeaderObject[] = [];
    teilnehmerlisteData: TeilnehmerWartelisteData[];
    wartelisteData: TeilnehmerWartelisteData[];
    columns: any;

    channel = 'teilnehmer-warteliste-channel';

    langChangeSubscription: Subscription;
    observeClickActionSub: Subscription;

    buchungData: AmmBuchungParamDTO;

    constructor(
        private route: ActivatedRoute,
        protected router: Router,
        private ammDataService: AmmRestService,
        private translateService: TranslateService,
        private stesInfobarService: AvamStesInfoBarService,
        private ammHelper: AmmHelper,
        protected interactionService: StesComponentInteractionService,
        protected facade: FacadeService
    ) {
        super(facade, router, interactionService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];

            this.route.queryParamMap.subscribe(param => {
                this.geschaeftsfallId = +param.get('gfId');
                this.entscheidId = +param.get('entscheidId');
            });

            this.route.paramMap.subscribe(param => {
                this.ammMassnahmenType = param.get('type');
                this.ammEntscheidTypeCode = AmmMassnahmenCode[Object.keys(AmmMassnahmenCode).find(key => AmmMassnahmenCode[key] === this.ammMassnahmenType)];
            });
        });

        this.ammDataService.getAmmBuchungParam(this.geschaeftsfallId, this.ammMassnahmenType, this.stesId).subscribe(buchungResponse => {
            if (buchungResponse.data) {
                this.buchungData = buchungResponse.data;

                this.massnahmeId = this.buchungData.massnahmeId;
                this.basisNr = this.ammHelper.getAmmBuchung(this.buchungData).ammGeschaeftsfallObject.basisNr;

                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
                this.stesInfobarService.addItemToInfoPanel(this.infobartemp);

                this.getData();
            }
        });

        this.setTableHeaders();

        this.setSideNavigation();

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            if (this.buchungData) {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle(this.facade.dbTranslateService.translate(this.buchungData.titel, 'name')) });
            } else {
                this.stesInfobarService.sendDataToInfobar({ title: this.configureInfobarTitle() });
            }

            this.getData();
        });
        super.ngOnInit();
    }

    setTableHeaders() {
        this.columns = [
            { columnDef: 'kanton', header: 'common.label.kanton', cell: (element: any) => `${element.kanton}` },
            { columnDef: 'platz', header: 'amm.nutzung.label.platz', cell: (element: any) => `${element.platz}` },
            { columnDef: 'teilnehmer', header: 'amm.nutzung.label.teilnehmer', cell: (element: any) => `${element.teilnehmer}` },
            { columnDef: 'personenNr', header: 'stes.label.personennr', cell: (element: any) => `${element.personenNr}` },
            { columnDef: 'bearbeitung', header: 'amm.nutzung.label.bearbeitung', cell: (element: any) => `${element.bearbeitung}` },
            { columnDef: 'buchungsdatum', header: 'amm.nutzung.label.datumBuchung', cell: (element: any) => `${element.buchungsdatum}` },
            { columnDef: 'von', header: 'amm.nutzung.label.von', cell: (element: any) => `${element.von}` },
            { columnDef: 'bis', header: 'amm.nutzung.label.bis', cell: (element: any) => `${element.bis}` },
            { columnDef: 'abbruch', header: 'amm.massnahmen.label.abbruch', cell: (element: any) => `${element.abbruch}` },
            { columnDef: 'entscheidart', header: 'amm.nutzung.label.entscheidart', cell: (element: any) => `${element.entscheidart}` },
            { columnDef: 'status', header: 'amm.nutzung.label.status', cell: (element: any) => `${element.status}` }
        ];

        this.tableHeaders = this.columns.map(c => c.columnDef);
    }

    isOurLabel(message) {
        return (
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.TEILNEHMERWARTELISTE) ||
            message.data.label === this.facade.dbTranslateService.instant(AMMLabels.KOLLEKTIV_KURS)
        );
    }

    isOurUrl(): boolean {
        return this.router.url.includes(AMMPaths.TEILNEHMERWARTELISTE.replace(':type', this.ammMassnahmenType));
    }

    canDeactivate() {
        return false;
    }

    ngOnDestroy() {
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        this.facade.toolboxService.sendConfiguration([]);
        this.stesInfobarService.removeItemFromInfoPanel(this.infobartemp);

        super.ngOnDestroy();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        forkJoin<BaseResponseWrapperListTeilnehmerDTOWarningMessages, BaseResponseWrapperListTeilnehmerDTOWarningMessages>([
            this.ammDataService.getTeilnehmerliste(this.stesId, this.geschaeftsfallId, this.ammMassnahmenType, this.massnahmeId),
            this.ammDataService.getWarteliste(this.stesId, this.geschaeftsfallId, this.ammMassnahmenType, this.massnahmeId)
        ]).subscribe(
            ([teilnehmerResponse, wartelisteResponse]) => {
                if (teilnehmerResponse.data) {
                    this.teilnehmerlisteData = teilnehmerResponse.data.map(
                        element => new TeilnehmerWartelisteData(element, this.facade.formUtilsService, this.facade.dbTranslateService)
                    );
                }

                if (wartelisteResponse.data) {
                    this.wartelisteData = wartelisteResponse.data.map(
                        element => new TeilnehmerWartelisteData(element, this.facade.formUtilsService, this.facade.dbTranslateService)
                    );
                }

                this.configureToolbox();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForAmmGeschaeftsfall(+this.stesId, this.geschaeftsfallId));

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private configureInfobarTitle(title?) {
        const massnahmenLabel = this.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.ammMassnahmenType).label);
        const teilnehmerWartelisteTranslatedLabel = this.translateService.instant(AMMLabels.TEILNEHMERWARTELISTE);

        return `${massnahmenLabel} ${title} - ${teilnehmerWartelisteTranslatedLabel}`;
    }

    private setSideNavigation() {
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.AMM_GENERAL.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });

        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BESCHREIBUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.KOLLEKTIV_DURCHFUHRUNG.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.TEILNEHMERWARTELISTE.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.SPESEN.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
        this.facade.navigationService.showNavigationTreeRoute(AMMPaths.BIM_BEM_ENTSCHEID.replace(':type', this.ammMassnahmenType), {
            gfId: this.geschaeftsfallId,
            entscheidId: this.entscheidId
        });
    }
}

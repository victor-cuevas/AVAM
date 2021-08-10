import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';

import { StesWdgAktionDTO } from '@app/shared/models/dtos-generated/stesWdgAktionDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';

export interface WDGAktionRow {
    aktion: string;
    aktionId: number;
    bearbeitung: string;
    bis: Date;
    durchgefuehrt: string;
    erfassungsDatum: Date;
    inDerZeitVon: Date;
}
@Component({
    selector: 'avam-wdgaktionen-anzeigen',
    templateUrl: './wdgaktionen-anzeigen.component.html',
    styleUrls: ['./wdgaktionen-anzeigen.component.scss']
})
export class WdgAktionenAnzeigenComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    cache: StesWdgAktionDTO[] = [];

    dataSource: WDGAktionRow[] = [];
    langChangeSubscription: Subscription;
    toolboxClickActionSub: Subscription;
    stesId: string;
    WDGAktionenChanel = 'WiedereinglierungsAktionen';
    WDGAktionenToolboxId = 'WiedereingliederungsАktionen';
    permissions: typeof Permissions = Permissions;

    constructor(
        private dataService: StesDataRestService,
        private dbTranslateSerivce: DbTranslateService,
        private modalService: NgbModal,
        private navigationService: NavigationService,
        private route: ActivatedRoute,
        private router: Router,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private translate: TranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private stesInfobarService: AvamStesInfoBarService,
        private formUtils: FormUtilsService
    ) {
        SpinnerService.CHANNEL = this.WDGAktionenChanel;
        ToolboxService.CHANNEL = this.WDGAktionenToolboxId;
    }

    ngOnInit() {
        this.setRouteParams();
        this.setSideNavigation();
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.aktionen' });
        this.configureToolbox();
        this.toolboxClickActionSub = this.subscribeToToolbox();
        this.langChangeSubscription = this.subscribeToLangChange();
        this.loadData();
    }

    setRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    loadData() {
        this.spinnerService.activate(this.WDGAktionenChanel);
        this.dataService.getWDGAktionen(this.stesId).subscribe(
            response => {
                this.cache = response.data;
                this.dataSource = response.data.map(element => this.createWdgAktionenRow(element));
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.aktionen', tableCount: response.data.length });
                this.spinnerService.deactivate(this.WDGAktionenChanel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.WDGAktionenChanel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    createWdgAktionenRow(data: StesWdgAktionDTO): WDGAktionRow {
        return {
            aktion: data.aktionAmm ? data.aktionAmm : data.aktionFreitext,
            aktionId: data.stesWdgAktionID,
            bearbeitung: this.extractBearbeitung(data),
            bis: this.formUtils.parseDate(data.zeitBis),
            durchgefuehrt: data.durchgefuehrt ? 'amm.massnahmen.label.ja' : 'amm.massnahmen.label.nein',
            erfassungsDatum: this.formUtils.parseDate(data.wdgAktionErfasstAm),
            inDerZeitVon: this.formUtils.parseDate(data.zeitVon)
        };
    }

    extractBearbeitung(row: StesWdgAktionDTO): string {
        const bearbeiterName = `${row.erfBenDetailObject.vorname} ${row.erfBenDetailObject.nachname}`;
        const benutzerstelle = this.dbTranslateSerivce.translate(row.erfBenDetailObject, 'benuStelleName');
        const bearbeitung = `${bearbeiterName} (${benutzerstelle})`;
        return bearbeitung;
    }

    aktionErfassen() {
        this.router.navigate([`./erfassen`], { relativeTo: this.route });
    }

    itemSelected(wdgAktionId) {
        this.router.navigate([`./bearbeiten/`], { queryParams: { wdgAktionId }, relativeTo: this.route });
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIELE_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN);
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];

        this.toolboxService.sendConfiguration(toolboxConfig, this.WDGAktionenToolboxId, ToolboxDataHelper.createStesData(null, null, this.stesId));
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    subscribeToLangChange(): Subscription {
        return this.translate.onLangChange.subscribe(() => {
            this.dataSource = this.cache.map(element => this.createWdgAktionenRow(element));
        });
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        this.toolboxClickActionSub.unsubscribe();
        this.langChangeSubscription.unsubscribe();
    }
}

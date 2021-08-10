import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';

import { BenutzerDetailDTO } from '@app/shared/models/dtos-generated/benutzerDetailDTO';
import { StesWdgZielDTO } from '@app/shared/models/dtos-generated/stesWdgZielDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface WdgZielRow {
    ziel: string;
    erfassungsdatum: Date;
    fristBis: Date;
    erreicht: string;
    bearbeitung: string;
    zielId: number;
}

@Component({
    selector: 'avam-wiedereingliederungsziele-anzeigen',
    templateUrl: './wdgziele-anzeigen.component.html',
    styleUrls: ['./wdgziele-anzeigen.component.scss']
})
export class WdgZieleAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    stesId: string;

    tableData: WdgZielRow[] = [];
    zieleChannel = 'wdgZiele';
    zieleToolboxId = 'wdgZieleAnzeigen';

    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;

    permissions: typeof Permissions = Permissions;

    toolboxConfig: ToolboxConfiguration[] = [
        new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
    ];

    constructor(
        private navigationService: NavigationService,
        private toolboxService: ToolboxService,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private dataRestService: StesDataRestService,
        private spinnerService: SpinnerService,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private stesInfobarService: AvamStesInfoBarService,
        private formUtils: FormUtilsService
    ) {
        super();
        ToolboxService.CHANNEL = this.zieleToolboxId;
        SpinnerService.CHANNEL = this.zieleChannel;
    }

    ngOnInit() {
        this.setStesIdFromParams();
        this.setSideNavigation();

        this.configureToolbox();
        this.setToolboxActions();

        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.ziele' });
        this.subscribeToLangChange();

        this.loadData();
    }

    setStesIdFromParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    configureToolbox() {
        this.toolboxService.sendConfiguration(this.toolboxConfig, this.zieleToolboxId, ToolboxDataHelper.createStesData(null, null, this.stesId));
    }

    setToolboxActions() {
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' }).result.then(
            result => {
                ToolboxService.CHANNEL = 'wdgZieleAnzeigen';
            },
            reason => {}
        );
    }

    navigateZielErfassen() {
        this.router.navigate(['./erfassen'], { relativeTo: this.route });
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
            this.loadData();
        });
    }

    loadData() {
        this.spinnerService.activate(this.zieleChannel);

        this.dataRestService
            .getWiedereingliederungsziele(this.stesId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.tableData = response.data.map((row: StesWdgZielDTO) => this.createWdgZielRow(row));
                    this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.ziele', tableCount: this.tableData.length });
                    this.spinnerService.deactivate(this.zieleChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.zieleChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
    }

    createWdgZielRow(row: StesWdgZielDTO): WdgZielRow {
        return {
            ziel: row.ziel,
            erfassungsdatum: this.formUtils.parseDate(row.datumErfasstAm),
            fristBis: this.formUtils.parseDate(row.datumFrist),
            erreicht: row.erreicht ? 'i18n.common.yes' : 'i18n.common.no',
            bearbeitung: this.extractBearbeitung(row.erfasserBenutzerDetailObject),
            zielId: row.stesWdgZielId
        };
    }

    extractBearbeitung(benutzer: BenutzerDetailDTO): string {
        const bearbeiterName = `${benutzer.vorname} ${benutzer.nachname}`;
        const benutzerstelle = this.dbTranslateService.translate(benutzer, 'benuStelleName');
        const bearbeitung = `${bearbeiterName} (${benutzerstelle})`;
        return bearbeitung;
    }

    itemSelected(stesWdgZielId) {
        this.router.navigate([`stes/details/${this.stesId}/wiedereingliederung/ziele/bearbeiten`], { queryParams: { stesWdgZielId } });
    }

    setSideNavigation() {
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIELE_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN);
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }
}

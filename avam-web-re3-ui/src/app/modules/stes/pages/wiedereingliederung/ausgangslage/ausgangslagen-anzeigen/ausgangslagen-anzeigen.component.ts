import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesWiedereingliederungPaths } from '@app/shared/enums/stes-navigation-paths.enum';

import { BaseResponseWrapperListStesAusgangslageDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListStesAusgangslageDTOWarningMessages';
import { StesAusgangslageDTO } from '@app/shared/models/dtos-generated/stesAusgangslageDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { Subscription } from 'rxjs';

export interface AusgangslagenRow {
    gultigAb: Date;
    qualifizierungsbedarf: string;
    bearbeitung: string;
    vermittelbarkeit: string;
    stesIdAvam: string;
    stesAusgangslageID: number;
}

@Component({
    selector: 'avam-ausgangslagen-anzeigen',
    templateUrl: './ausgangslagen-anzeigen.component.html',
    styleUrls: ['./ausgangslagen-anzeigen.component.scss']
})
export class AusgangslagenAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    stesId: string;
    dataSource: AusgangslagenRow[] = [];
    ausgangslageChannel = 'ausgangslage-table';
    ausgangslageToolboxId = 'ausgangslage-table';
    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;

    permissions: typeof Permissions = Permissions;

    constructor(
        private spinnerService: SpinnerService,
        private dataRestService: StesDataRestService,
        private translate: TranslateService,
        private route: ActivatedRoute,
        private dbTranslateSerivce: DbTranslateService,
        private navigationService: NavigationService,
        private readonly modalService: NgbModal,
        private router: Router,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private stesInfobarService: AvamStesInfoBarService,
        private formUtils: FormUtilsService
    ) {
        super();
        SpinnerService.CHANNEL = this.ausgangslageChannel;
        ToolboxService.CHANNEL = this.ausgangslageChannel;
    }

    ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.ausgangslageBearbeiten' });
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AUSGANGSLAGEN_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.ZIELE_ANZEIGEN);
        this.navigationService.showNavigationTreeRoute(StesWiedereingliederungPaths.AKTIONEN_ANZEIGEN);
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
        this.subscribeToLangChange();
        this.loadData();
        this.configureToolbox();
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    close() {
        this.modalService.dismissAll();
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
            this.loadData();
        });
    }

    loadData() {
        this.spinnerService.activate(this.ausgangslageChannel);
        this.dataRestService.getAusgangslage(this.stesId).subscribe(
            (response: BaseResponseWrapperListStesAusgangslageDTOWarningMessages) => {
                this.dataSource = response.data.map((dataEntry: StesAusgangslageDTO) => this.createAusgangslagenRow(dataEntry));
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.wiedereingliederung.ausgangslageBearbeiten', tableCount: response.data.length });
                this.spinnerService.deactivate(this.ausgangslageChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.ausgangslageChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];

        this.toolboxService.sendConfiguration(toolboxConfig, this.ausgangslageToolboxId, ToolboxDataHelper.createStesData(null, null, this.stesId));
    }

    createAusgangslagenRow(row: StesAusgangslageDTO): AusgangslagenRow {
        return {
            gultigAb: this.formUtils.parseDate(row.ausgangslageGueltigAb),
            qualifizierungsbedarf: this.dbTranslateSerivce.translate(row, 'qualifikationsbedarf') ? this.dbTranslateSerivce.translate(row, 'qualifikationsbedarf') : '',
            bearbeitung: this.extractBearbeitung(row),
            vermittelbarkeit: this.dbTranslateSerivce.translate(row, 'vermittelbarkeit') ? this.dbTranslateSerivce.translate(row, 'vermittelbarkeit') : '',
            stesIdAvam: row.stesIdAvam,
            stesAusgangslageID: row.stesAusgangslageID
        };
    }

    extractBearbeitung(row: StesAusgangslageDTO): string {
        const bearbeiterName = `${row.vorname} ${row.nachname}`;
        const benutzerstelle = this.dbTranslateSerivce.translate(row, 'benutzerstelle');
        const bearbeitung = `${bearbeiterName} (${benutzerstelle})`;
        return bearbeitung;
    }

    itemSelected(ausgangslageId) {
        this.router.navigate([`./bearbeiten/`], { queryParams: { ausgangslageId }, relativeTo: this.route });
    }

    navigateAusgangslageErfassen() {
        this.router.navigate(['./erfassen'], { relativeTo: this.route });
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
        this.observeClickActionSub.unsubscribe();
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }
}

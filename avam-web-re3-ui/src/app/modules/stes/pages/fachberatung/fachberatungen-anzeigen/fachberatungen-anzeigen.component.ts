import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { FachberatungPaths } from '@app/shared/enums/stes-navigation-paths.enum';

import { ZuwFachberatungViewDTO } from '@app/shared/models/dtos-generated/zuwFachberatungViewDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';

@Component({
    selector: 'avam-fachberatungen-anzeigen',
    templateUrl: './fachberatungen-anzeigen.component.html'
})
export class FachberatungenAnzeigenComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    observeClickActionSub: Subscription;
    fachberatungToolboxId = 'fachberatung-table';
    fachberatungChannel = 'fachberatung-channel';
    dataSource: any[];
    stesId: string;
    langChangeSubscription: Subscription;
    permissions: typeof Permissions = Permissions;

    constructor(
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private router: Router,
        private route: ActivatedRoute,
        private dataService: StesDataRestService,
        private spinnerService: SpinnerService,
        private dbTranslateSerivce: DbTranslateService,
        private translate: TranslateService,
        protected modalService: NgbModal,
        private stesInfobarService: AvamStesInfoBarService,
        private formUtils: FormUtilsService
    ) {
        ToolboxService.CHANNEL = this.fachberatungToolboxId;
        SpinnerService.CHANNEL = this.fachberatungChannel;
    }

    ngOnInit() {
        this.setRouteParams();
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.zuweisungfachberatung.zugewiesenefachbertung' });
        this.configureToolbox();
        this.observeClickActionSub = this.subscribeToToolbox();
        this.loadData();
        this.subscribeToLangChange();
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];

        this.toolboxService.sendConfiguration(toolboxConfig, this.fachberatungToolboxId, ToolboxDataHelper.createStesData(null, null, this.stesId));
    }

    subscribeToToolbox() {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    create() {
        sessionStorage.removeItem('fachberatung-search-key');
        this.router.navigate([`/stes/${this.stesId}/${FachberatungPaths.FACHBERATUNG_ERFASSEN}/step1`]);
    }

    setRouteParams() {
        this.stesId = this.route.parent.snapshot['stesId'];
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    loadData() {
        this.spinnerService.activate(this.fachberatungChannel);

        this.dataService.getFachberatungen(this.stesId).subscribe(
            response => {
                if (response.data) {
                    this.dataSource = response.data
                        .map(element => this.createZuwFachberatungViewRow(element))
                        .sort((v1, v2) => (v1.zuweisungNr < v2.zuweisungNr ? 1 : v1.zuweisungNr > v2.zuweisungNr ? -1 : 0));
                }
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.zuweisungfachberatung.zugewiesenefachbertung', tableCount: response.data.length });
                this.spinnerService.deactivate(this.fachberatungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.fachberatungChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    createZuwFachberatungViewRow(row: ZuwFachberatungViewDTO): any {
        return {
            zuweisungDatumVom: this.formUtils.parseDate(row.zuweisungDatumVom),
            zuweisungNr: row.zuweisungNr,
            fachberatungsbereich: this.dbTranslateSerivce.translate(row, 'fachberatungsbereich'),
            bezeichnung: row.bezeichnung,
            zuweisungsStatus: this.dbTranslateSerivce.translate(row, 'zuweisungsStatus') ? this.dbTranslateSerivce.translate(row, 'zuweisungsStatus') : '',
            angebotNr: row.angebotNr,
            stesIdAvam: row.stesIdAvam,
            zuweisungStesFachberatungId: row.zuweisungStesFachberatungId
        };
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
            this.loadData();
        });
    }

    itemSelected(fachberatungId: number) {
        this.router.navigate([`stes/details/${this.stesId}/${FachberatungPaths.FACHBERATUNG_BEARBEITEN}`], { queryParams: { fachberatungId } });
    }
}

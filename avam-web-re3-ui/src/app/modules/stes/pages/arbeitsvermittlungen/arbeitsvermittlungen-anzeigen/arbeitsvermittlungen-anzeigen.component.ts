import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FormUtilsService } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';

import { ArbeitsvermittlungViewDTO } from '@app/shared/models/dtos-generated/arbeitsvermittlungViewDTO';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';

export interface ArbeitsvermittlungRow {
    meldepflicht: number;
    zuweisungDatumVom: Date;
    zuweisungNr: number;
    zuweisungId: number;
    schnellZuweisungFlag: boolean;
    stellenbezeichnung: string;
    unternehmensname: string;
    ort: string;
    stesIdAvam: string;
    zuweisungStatus: string;
    vermittlungsstand: string;
    isBold: boolean;
}

@Component({
    selector: 'avam-arbeitsvermittlungen-anzeigen',
    templateUrl: './arbeitsvermittlungen-anzeigen.component.html',
    styleUrls: ['./arbeitsvermittlungen-anzeigen.component.scss']
})
export class ArbeitsvermittlungenAnzeigenComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    stesId: string;
    stesHeader: StesHeaderDTO;
    arbeitsvermittlungTableData: ArbeitsvermittlungRow[] = [];
    toolboxClickActionSub: Subscription;

    langChangeSubscription: Subscription;
    footerButtonsHidden: boolean;
    permissions: typeof Permissions = Permissions;

    vermittlungenChannel = 'arbeitsVermittlungen';
    arbeitsvemittlungToolboxId = 'arbeitsvermittlungAnzeigen';

    constructor(
        private modalService: NgbModal,
        private route: ActivatedRoute,
        private toolboxService: ToolboxService,
        private arbeitsvermittlungRestService: ArbeitsvermittlungRestService,
        private dbTranslateService: DbTranslateService,
        private spinnerService: SpinnerService,
        private translate: TranslateService,
        private router: Router,
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private fehlermeldungService: FehlermeldungenService,
        private authService: AuthenticationService,
        private stesInfobarService: AvamStesInfoBarService,
        private formUtils: FormUtilsService
    ) {
        ToolboxService.CHANNEL = this.arbeitsvemittlungToolboxId;
        SpinnerService.CHANNEL = this.vermittlungenChannel;
    }

    ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.arbeitsvermittlung' });
        this.getRouteParams();
        this.configureToolbox();
        this.setToolboxActions();
        this.loadData();
        this.subscribeToLangChange();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true)
        ];

        this.toolboxService.sendConfiguration(toolboxConfig, this.arbeitsvemittlungToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId));
    }

    setToolboxActions() {
        this.toolboxClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true });
    }

    navigateVermittlungErfassen() {
        this.router.navigate([`/stes/${this.stesId}/vermittlung/erfassen`], { state: { clearSearchState: true } });
    }

    navigateSchnellZuweisungErfassen() {
        this.router.navigate([`./schnellzuweisung-erfassen`], { relativeTo: this.route });
    }

    getRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    itemSelected(selectedRow: ArbeitsvermittlungRow) {
        const zuweisungId = selectedRow.zuweisungId;
        const url = selectedRow.schnellZuweisungFlag ? 'schnellzuweisung-bearbeiten' : 'vermittlung-bearbeiten';
        this.router.navigate([`stes/details/${this.stesId}/arbeitsvermittlungen/${url}`], { queryParams: { zuweisungId } });
    }

    loadData() {
        this.spinnerService.activate(this.vermittlungenChannel);
        forkJoin(
            this.arbeitsvermittlungRestService.getArbeitsvermittlungenView(this.stesId, this.translate.currentLang),
            this.dataService.getStesHeader(this.stesId, this.translateService.currentLang)
        ).subscribe(
            ([arbeitsvermittlungData, stesHeader]) => {
                if (!stesHeader.zuweisungsStop) {
                    this.authService.setStesPermissionContext(parseInt(this.stesId, 10));
                }
                this.stesHeader = stesHeader;
                this.footerButtonsHidden = stesHeader.zuweisungsStop;
                this.displayVermittlungsstoppAktiviertMsg(stesHeader.zuweisungsStop);
                if (arbeitsvermittlungData.data) {
                    this.arbeitsvermittlungTableData = arbeitsvermittlungData.data
                        .map((arbeitsvermittlung: ArbeitsvermittlungViewDTO) => this.buildTableRow(arbeitsvermittlung))
                        .sort((v1, v2) => (v1.zuweisungNr < v2.zuweisungNr ? 1 : v1.zuweisungNr > v2.zuweisungNr ? -1 : 0));
                    this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.arbeitsvermittlung', tableCount: arbeitsvermittlungData.data.length });
                }
                this.spinnerService.deactivate(this.vermittlungenChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.vermittlungenChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    displayVermittlungsstoppAktiviertMsg(zuweisungsStop: boolean) {
        if (zuweisungsStop) {
            this.fehlermeldungService.showMessage('stes.feedback.vermittlung.steszuweisungsstopp', 'info');
        }
    }

    buildTableRow(arbeitsvermittlung: ArbeitsvermittlungViewDTO): ArbeitsvermittlungRow {
        return {
            meldepflicht: this.getMeldepflichtStatus(arbeitsvermittlung),
            zuweisungDatumVom: this.formUtils.parseDate(arbeitsvermittlung.zuweisungDatumVom),
            zuweisungNr: arbeitsvermittlung.zuweisungNr,
            zuweisungId: arbeitsvermittlung.zuweisungId,
            schnellZuweisungFlag: arbeitsvermittlung.schnellZuweisungFlag,
            stellenbezeichnung: arbeitsvermittlung.stellenbezeichnung,
            unternehmensname: arbeitsvermittlung.unternehmensName,
            ort: arbeitsvermittlung.unternehmensOrt,
            stesIdAvam: arbeitsvermittlung.stesIdAvam,
            zuweisungStatus: this.dbTranslateService.translate(arbeitsvermittlung, 'zuweisungStatus'),
            vermittlungsstand: this.dbTranslateService.translate(arbeitsvermittlung, 'vermittlungsstand'),
            isBold: this.shouldRowBeBold(arbeitsvermittlung)
        };
    }

    shouldRowBeBold(arbeitsvermittlung: ArbeitsvermittlungViewDTO): boolean {
        if (arbeitsvermittlung.zuweisungErledigt) {
            return false;
        } else {
            // BSP3
            if (arbeitsvermittlung.stesAbmeldungId !== 0) {
                return true;
            }
            // BSP4
            if (!arbeitsvermittlung.schnellZuweisungFlag && arbeitsvermittlung.osteAbgemeldet) {
                return true;
            }
            return false;
        }
    }

    getMeldepflichtStatus(arbeitsvermittlung: ArbeitsvermittlungViewDTO) {
        if (!arbeitsvermittlung.meldepflicht) {
            return MeldepflichtEnum.KEIN_MELDEPFLICHT;
        } else {
            const today = moment();
            if (moment(arbeitsvermittlung.sperrfristDatum).isSameOrAfter(today, 'day')) {
                return MeldepflichtEnum.UNTERLIEGT_LAUFEND;
            } else {
                return MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN;
            }
        }
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
            this.fehlermeldungService.closeMessage();
            this.loadData();
        });
    }

    ngOnDestroy() {
        this.authService.setStesPermissionContext(parseInt(this.stesId, 10));
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }
        this.toolboxService.sendConfiguration([]);
        this.fehlermeldungService.closeMessage();
    }
}

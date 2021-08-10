import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService, GeschlechtPipe } from '@app/shared';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@app/shared/enums/permissions.enum';

import { SchnellzuweisungDTO } from '@app/shared/models/dtos-generated/schnellzuweisungDTO';
import { StesZwischenverdienstDTO } from '@app/shared/models/dtos-generated/stesZwischenverdienstDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { TableHeaderObject } from 'src/app/shared/components/table/table.header.object';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { TableButtonTypeEnum } from '@app/shared/enums/table-button-type.enum';

@Component({
    selector: 'avam-zwischenverdienste',
    templateUrl: './zwischenverdienste.component.html',
    styleUrls: ['./zwischenverdienste.component.scss']
})
export class ZwischenverdiensteComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    headers: TableHeaderObject[] = [];
    data: StesZwischenverdienstDTO[] = [];
    zwischenverdienstChannel = 'zwischenverdienst-table';
    zwischenverdiesntToolboxId = 'zwischenverdiesnt-table';
    stesId: string;
    tableButton = TableButtonTypeEnum.ANSCHAUEN;
    langChangeSubscription: Subscription;
    observeClickActionSub: Subscription;

    permissions: typeof Permissions = Permissions;

    constructor(
        protected readonly modalService: NgbModal,
        protected translate: TranslateService,
        protected dbTranslateSerivce: DbTranslateService,
        protected toolboxService: ToolboxService,
        protected router: Router,
        protected route: ActivatedRoute,
        protected dataService: StesDataRestService,
        protected spinnerService: SpinnerService,
        protected geschlechtPipe: GeschlechtPipe,
        private stesInfobarService: AvamStesInfoBarService,
        private formUtils: FormUtilsService
    ) {
        SpinnerService.CHANNEL = this.zwischenverdienstChannel;
        ToolboxService.CHANNEL = this.zwischenverdiesntToolboxId;
    }

    ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.zwischenverdienste' });
        this.setRouteParams();
        this.subscribeToLangChange();
        this.configureToolbox();
        this.observeClickActionSub = this.subscribeToToolbox();
        this.loadData();
    }

    setRouteParams() {
        this.stesId = this.route.parent.snapshot['stesId'];
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    subscribeToToolbox() {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
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

    loadData() {
        this.spinnerService.activate(this.zwischenverdienstChannel);
        this.dataService.getZwischenverdienste(this.stesId).subscribe(
            response => {
                this.data = response.data.map(element => this.createZwischenverdienstRow(element));
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.zwischenverdienste', tableCount: response.data.length });
                this.spinnerService.deactivate(this.zwischenverdienstChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.zwischenverdienstChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    createZwischenverdienstRow(row: StesZwischenverdienstDTO): any {
        return {
            berufsTaetigkeit: this.extractBeruf(row),
            zvDatumVon: this.formUtils.parseDate(row.zvDatumVon) ? this.formUtils.parseDate(row.zvDatumVon) : '',
            zvDatumBis: this.formUtils.parseDate(row.zvDatumBis) ? this.formUtils.parseDate(row.zvDatumBis) : '',
            arbeitgeber: this.extractArbeitgeber(row),
            vermittlung: this.extractVermittlungStatusMessage(row),
            vermittlungNr: this.extractVermittlungsNr(row),
            status: this.extractStatsActive(row),
            stesId: row.stesIdAvam,
            zwischenverdienstId: row.zwischenverdienstId
        };
    }

    extractBeruf({ berufTaetigkeitObject = null, geschlecht = '', schnellzuweisungObject = null }): string {
        return berufTaetigkeitObject
            ? this.dbTranslateSerivce.translate(berufTaetigkeitObject, this.geschlechtPipe.transform('bezeichnung', geschlecht))
            : this.extractBerufFromSchnellzuweisung(schnellzuweisungObject, geschlecht);
    }

    extractBerufFromSchnellzuweisung(schnellZuweisung: SchnellzuweisungDTO, geschlecht: string): string {
        if (schnellZuweisung == null) {
            return '';
        }
        return schnellZuweisung.berufObject ? this.dbTranslateSerivce.translate(schnellZuweisung.berufObject, this.geschlechtPipe.transform('bezeichnung', geschlecht)) : '';
    }

    extractVermittlungStatusMessage(row: StesZwischenverdienstDTO): string {
        const labelKey = row.zuweisungId > 0 || row.schnellzuweisungId > 0 ? 'i18n.common.yes' : 'i18n.common.no';

        return this.translate.instant(labelKey);
    }

    extractArbeitgeber(row: StesZwischenverdienstDTO): string {
        let arbeitgeberName = '';
        const arbeitgeberId = row.arbeitgeberId;
        const arbeitgeberBURId = row.arbeitgeberBURId;

        let arbeitgeber;
        let nameAccessor;

        if (arbeitgeberId > 0) {
            arbeitgeber = row.arbeitgeberObject;
            nameAccessor = 'name';
        } else if (arbeitgeberBURId > 0) {
            arbeitgeber = row.arbeitgeberBURObject;
            nameAccessor = 'letzterAGName';
        } else if (row.schnellzuweisungId > 0) {
            arbeitgeber = row.schnellzuweisungObject;
            nameAccessor = 'unternehmenName';
        } else {
            return '';
        }

        // Get all 3 names if they exist
        for (let i = 0; i < 3; i++) {
            const currentName = arbeitgeber[nameAccessor + (i + 1)];
            arbeitgeberName += currentName ? currentName + ' ' : '';
        }

        return arbeitgeberName;
    }

    extractVermittlungsNr(row: StesZwischenverdienstDTO): string {
        if (row.zuweisungNr > 0) {
            return 'Z-' + row.zuweisungNr; // Z- is a flag for zuweisungNr
        } else if (row.schnellzuweisungId > 0 && row.schnellzuweisungObject) {
            if (row.schnellzuweisungObject.schnellzuweisungNr > 0) {
                return 'SZ-' + row.schnellzuweisungObject.schnellzuweisungNr; // SZ- a flag for schnellZuweisung
            }
        }

        return '';
    }

    extractStatsActive(row: StesZwischenverdienstDTO): string {
        const today = moment();
        if (row.zvDatumVon) {
            const startDate = this.formUtils.parseDate(row.zvDatumVon);
            const startDateIsBeforeToday = today.isSameOrAfter(startDate, 'day');
            if (row.zvDatumBis) {
                const endDate = this.formUtils.parseDate(row.zvDatumBis);
                const endDateIsAfterToday = today.isSameOrBefore(endDate, 'day');
                if (startDateIsBeforeToday && endDateIsAfterToday) {
                    return this.translate.instant('common.label.aktiv');
                }
            } else if (startDateIsBeforeToday) {
                return this.translate.instant('common.label.aktiv');
            }
        }
        return this.translate.instant('common.label.inaktiv');
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];

        this.toolboxService.sendConfiguration(toolboxConfig, this.zwischenverdiesntToolboxId);
    }

    itemSelected(zwischenverdienstId: number) {
        this.router.navigate([`stes/details/${this.stesId}/zwischenverdienste/bearbeiten`], { queryParams: { zwischenverdienstId } });
    }

    navigateToZwischenverdienstErfassen(): void {
        this.router.navigate([`./erfassen`], { relativeTo: this.route });
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
            this.loadData();
        });
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }
}

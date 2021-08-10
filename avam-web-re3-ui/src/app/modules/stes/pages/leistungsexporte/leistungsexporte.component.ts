import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesLeistungsexporteDTO } from '@app/shared/models/dtos-generated/stesLeistungsexporteDTO';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { FacadeService } from '@shared/services/facade.service';

export interface TableRow {
    sachbearbeitung: string;
    abreiseDatum: Date;
    antragsDatum: Date;
    leistungExpVon: Date;
    bis: Date;
    leistungsexportId: number;
    stesIdAvam: string;
    zielstaat: string;
}

@Component({
    selector: 'avam-leistungsexporte',
    templateUrl: './leistungsexporte.component.html',
    styleUrls: ['./leistungsexporte.component.scss']
})
export class LeistungsexporteComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;

    stesId: string;
    dataSource: TableRow[];
    leistungsexporteChannel = 'leistungsexporte-table';
    leistungsexportToolboxId = 'leistungsexporte-table';

    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    permissions: typeof Permissions = Permissions;

    constructor(
        protected router: Router,
        protected route: ActivatedRoute,
        protected dataRestService: StesDataRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private facade: FacadeService
    ) {
        SpinnerService.CHANNEL = this.leistungsexporteChannel;
        ToolboxService.CHANNEL = this.leistungsexportToolboxId;
    }

    ngOnInit() {
        this.facade.fehlermeldungenService.closeMessage();
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.leistungsexporte' });
        this.setRouteParams();
        this.configureToolbox();
        this.observeClickActionSub = this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.loadData();
    }

    setRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.leistungsexportToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId));
    }

    subscribeToToolbox() {
        return this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.loadData();
        });
    }

    loadData() {
        this.facade.spinnerService.activate(this.leistungsexporteChannel);

        this.dataRestService.getLeistungsexporte(this.stesId).subscribe(
            response => {
                this.dataSource = response.data.map(element => this.createLeistungsexportRow(element));
                this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.leistungsexporte', tableCount: response.data.length });

                this.facade.spinnerService.deactivate(this.leistungsexporteChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.facade.spinnerService.deactivate(this.leistungsexporteChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    openPrintModal() {
        this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
    }

    createLeistungsexportRow(row: StesLeistungsexporteDTO): TableRow {
        return {
            sachbearbeitung: this.extractSachbearbeitung(row),
            abreiseDatum: new Date(row.datumAbreise),
            antragsDatum: new Date(row.datumAntrag),
            leistungExpVon: new Date(row.datumLEvon),
            bis: new Date(row.datumLEbis),
            leistungsexportId: row.leistungsexportID,
            stesIdAvam: row.stesIdAVAM,
            zielstaat: this.extractZielstaat(row)
        };
    }

    extractSachbearbeitung(row: StesLeistungsexporteDTO): string {
        const bearbeiter = row.bearbeiterBenuDetailObject;
        const bearbeiterName = `${bearbeiter['vorname']} ${bearbeiter['nachname']}`;
        const benuStelleName = this.facade.dbTranslateService.translate(row.bearbeiterBenuDetailObject, 'benuStelleName');
        return `${bearbeiterName} (${benuStelleName})`;
    }

    extractZielstaat(row: StesLeistungsexporteDTO): string {
        return this.facade.dbTranslateService.translate(row.zielStaatObject, 'text');
    }

    leistungsexporteErfassen(): void {
        this.router.navigate([`./erfassen`], { relativeTo: this.route });
    }

    itemSelected(leistungsexportId) {
        this.router.navigate([`stes/details/${this.stesId}/leistungsexporte/bearbeiten/`], { queryParams: { leistungsexportId } });
    }

    ngOnDestroy() {
        this.facade.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
    }
}

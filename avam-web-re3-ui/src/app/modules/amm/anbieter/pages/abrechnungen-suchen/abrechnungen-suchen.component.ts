import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ToolboxService } from '@app/shared';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AbrechnungenSuchenFormComponent } from '../../components/abrechnungen-suchen-form/abrechnungen-suchen-form.component';
import { takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { FacadeService } from '@app/shared/services/facade.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'avam-abrechnungen-suchen',
    templateUrl: './abrechnungen-suchen.component.html',
    styleUrls: ['./abrechnungen-suchen.component.scss']
})
export class AbrechnungenSuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('searchForm') searchForm: AbrechnungenSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    searchChannel = 'abrechnung-search-channel';
    tableChannel = 'abrechnung-table-channel';

    readonly stateKey = 'abrechnung-search-cache-state-key';
    readonly tableStateKey = 'abrechnung-search-table-state-key';

    dataSource = [];
    statusOptions: CodeDTO[];

    disableSearch: boolean;

    constructor(
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private infopanelService: AmmInfopanelService,
        private fehlermeldungenService: FehlermeldungenService,
        private facade: FacadeService,
        private stesRestService: StesDataRestService,
        private searchSession: SearchSessionStorageService,
        private dbTranslateService: DbTranslateService,
        private translate: TranslateService,
        private anbieterRestService: AnbieterRestService,
        private router: Router
    ) {
        super();
        ToolboxService.CHANNEL = this.searchChannel;
    }

    ngOnInit() {
        this.getData();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.infopanelService.dispatchInformation({
            title: 'amm.abrechnungen.topnavmenuitem.abrechnung',
            hideInfobar: true
        });

        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dataSource = this.dataSource.map(this.createAbrechnungRow);
        });

        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.searchChannel);
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.searchChannel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    searchCriteriaExists(): boolean {
        const controls = this.searchForm.formGroup.controls;
        for (const field in controls) {
            if (controls[field].value) {
                return true;
            }
        }
        return false;
    }

    getData() {
        this.spinnerService.activate(this.searchChannel);

        this.stesRestService.getCode(DomainEnum.VIERAUGENSTATUS).subscribe(
            response => {
                this.statusOptions = response;

                const state = this.searchSession.restoreStateByKey(this.stateKey);

                if (state) {
                    this.searchForm.mapToForm(state.fields);
                    this.searchAbrechnungen();
                }

                this.spinnerService.deactivate(this.searchChannel);
            },
            error => {
                this.spinnerService.deactivate(this.searchChannel);
            }
        );
    }

    reset() {
        this.searchForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(this.stateKey);
        this.searchSession.restoreDefaultValues(this.tableStateKey);
    }

    search() {
        this.fehlermeldungenService.closeMessage();

        if (!this.searchForm.formGroup.valid) {
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            this.searchForm.ngForm.onSubmit(undefined);
            return;
        }

        if (!this.searchCriteriaExists()) {
            this.facade.openModalFensterService.openInfoModal('common.message.suchkriteriumeingeben');
            return;
        }
        this.searchSession.resetSelectedTableRow(this.tableStateKey);
        this.searchAbrechnungen();

        this.searchSession.storeFieldsByKey(this.stateKey, this.searchForm.mapToDTO());
    }

    searchAbrechnungen() {
        this.spinnerService.activate(this.tableChannel);

        this.anbieterRestService.searchAbrechnungen(this.searchForm.mapToDTO()).subscribe(
            response => {
                this.dataSource = [...response.data].map(this.createAbrechnungRow);
                this.infopanelService.updateInformation({ tableCount: this.dataSource.length });

                this.spinnerService.deactivate(this.tableChannel);
            },
            error => {
                this.spinnerService.deactivate(this.tableChannel);
            }
        );
    }

    itemSelected(data) {
        this.router.navigate([`amm/anbieter/${data.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId: data.abrechnungId } });
    }

    createAbrechnungRow = data => {
        return {
            abrechnungId: data.abrechnungId,
            abrechnungNr: data.abrechnungNr,
            ammAnbieterId: data.ammAnbieterId,
            titel: data.titel,
            anbieterName: data.anbieterName,
            ausfuehrungsdatum: this.facade.formUtilsService.parseDate(data.ausfuehrungsdatum),
            statusObject: data.statusObject,
            status: data.statusObject ? this.dbTranslateService.translate(data.statusObject, 'kurzText') : '',
            vorgaengerObject: data.vorgaengerObject,
            vorgaenger: data.vorgaengerObject ? data.vorgaengerObject.abrechnungNr : '',
            nachfolgerObject: data.nachfolgerObject,
            nachfolger: data.nachfolgerObject ? data.nachfolgerObject.abrechnungNr : ''
        };
    };

    ngOnDestroy() {
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }
}

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { ToolboxService } from '@app/shared';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { DateRangeFormComponent } from '@app/shared/components/date-range-form/date-range-form.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { RahmenvertragDTO } from '@app/shared/models/dtos-generated/rahmenvertragDTO';
import { RahmenvertragSuchenParamDTO } from '@app/shared/models/dtos-generated/rahmenvertragSuchenParamDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-rahmenvertraege-uebersicht',
    templateUrl: './rahmenvertraege-uebersicht.component.html',
    styleUrls: ['./rahmenvertraege-uebersicht.component.scss']
})
export class RahmenvertraegeUebersichtComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly channel = 'rahmenvertraege-uebersicht-component';
    @ViewChild('suchenFormComponent') suchenFormComponent: DateRangeFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    unternehmenId: number;
    formData = {};
    dataSource = [];
    permissions: typeof Permissions = Permissions;

    constructor(
        private facade: FacadeService,
        private infopanelService: AmmInfopanelService,
        private route: ActivatedRoute,
        private searchSession: SearchSessionStorageService,
        private vertraegeService: VertraegeRestService,
        private router: Router
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.getUnternehmenId();
        this.updateInfopanel();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.configureToolbox();
        this.setupForm();
    }

    ngAfterViewInit(): void {
        this.getData();
    }

    getUnternehmenId() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            this.unternehmenId = data['unternehmenId'];
        });
    }

    updateInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.anbieter.subnavmenuitem.rahmenvertraege',
            hideInfobar: false
        });
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
            entityIDsMapping: { UNTERNEHMEN_ID: this.unternehmenId }
        };
    }

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.facade.fehlermeldungenService.closeMessage();
            this.getData();
        });
    }

    setupForm() {
        const state = this.searchSession.restoreStateByKey(this.channel);
        if (state) {
            this.formData = {
                state: state.fields
            };
        }
    }

    onRefresh() {
        this.facade.fehlermeldungenService.closeMessage();
        this.getData();
    }

    getData() {
        if (!this.suchenFormComponent.isValid()) {
            this.suchenFormComponent.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        this.facade.spinnerService.activate(this.channel);
        this.vertraegeService.searchRahmenvertraege(this.getSearchParams()).subscribe(
            searchRes => {
                this.searchSession.storeFieldsByKey(this.channel, this.suchenFormComponent.mapToDTO());
                this.dataSource = [...searchRes.data]
                    .sort((v1, v2) => (v1.rahmenvertragNr > v2.rahmenvertragNr ? 1 : v1.rahmenvertragNr < v2.rahmenvertragNr ? -1 : 0))
                    .map(element => this.createRow(element));
                this.infopanelService.updateInformation({ tableCount: this.dataSource.length });

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    getSearchParams(): RahmenvertragSuchenParamDTO {
        const formValue = this.suchenFormComponent.mapToDTO();

        return {
            gueltigVon: formValue.gueltigVon,
            gueltigBis: formValue.gueltigBis,
            anbieterId: +this.unternehmenId,
            aktuell: true
        };
    }

    createRow(rahmenvertrag: RahmenvertragDTO) {
        return {
            rahmenvertragNr: rahmenvertrag.rahmenvertragNr,
            titel: rahmenvertrag.titel || '',
            gueltigVon: rahmenvertrag.gueltigVon,
            gueltigBis: rahmenvertrag.gueltigBis,
            gueltig: rahmenvertrag.gueltigB ? this.facade.translateService.instant('common.label.ja') : this.facade.translateService.instant('common.label.nein'),
            status: rahmenvertrag.statusObject ? this.facade.dbTranslateService.translateWithOrder(rahmenvertrag.statusObject, 'text') : '',
            rahmenvertragId: rahmenvertrag.rahmenvertragId
        };
    }

    onCreate() {
        this.router.navigate([`amm/anbieter/${this.unternehmenId}/rahmenvertraege/erfassen`]);
    }

    onItemSelected(event) {
        this.router.navigate([`/amm/anbieter/${this.unternehmenId}/rahmenvertraege/bearbeiten`], {
            queryParams: { rahmenvertragId: event.rahmenvertragId }
        });
    }

    public get channel() {
        return RahmenvertraegeUebersichtComponent.channel;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.facade.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ tableCount: undefined });
    }
}

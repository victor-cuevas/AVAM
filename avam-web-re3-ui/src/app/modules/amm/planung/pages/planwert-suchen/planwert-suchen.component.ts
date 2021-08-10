import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AmmAdministrationRestService } from '@app/modules/amm/administration/services/amm-administration-rest.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { PlanwerttypEnum } from '@app/shared/enums/domain-code/planwerttyp.enum';
import { PlanwertSuchenParameterDTO } from '@app/shared/models/dtos-generated/planwertSuchenParameterDTO';
import { PlanwertViewDTO } from '@app/shared/models/dtos-generated/planwertViewDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { PlanwertSuchenFormComponent, PlanwertSuchenTableComponent } from '../../components';
import { PlanwertSuchenData } from '../../components/planwert-suchen-form/planwert-suchen-form.component';
import { AmmPlanwertRestService } from '../../services/amm-planwert-rest.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-planwert-suchen',
    templateUrl: './planwert-suchen.component.html',
    styleUrls: ['./planwert-suchen.component.scss']
})
export class PlanwertSuchenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    static readonly STATE_KEY = 'planwert-suchen-cache-state-key';
    @ViewChild('planwertSuchenForm') planwertSuchenForm: PlanwertSuchenFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    channel = 'planwert-suchen-channel';
    dataSource = [];
    planwertData: PlanwertSuchenData;

    constructor(
        private infopanelService: AmmInfopanelService,
        private planwertRestService: AmmPlanwertRestService,
        private facade: FacadeService,
        private searchSession: SearchSessionStorageService,
        private router: Router,
        private administrationRestService: AmmAdministrationRestService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToLangChange();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.setupInfobar();
        this.getData();
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngAfterViewInit() {}

    subscribeToLangChange() {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            if (this.dataSource.length > 0) {
                this.search();
            }
            this.setupInfobar();
        });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel, null, true);
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    setupInfobar() {
        this.infopanelService.dispatchInformation({
            title: 'amm.planung.subnavmenuitem.planwerte',
            hideInfobar: true
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        const gueltigVon = this.planwertSuchenForm.handler.mapToDTO().gueltigVon || new Date();

        this.administrationRestService.getGesetzlicheMassnahmentypListeOhneSpez(gueltigVon).subscribe(
            resp => {
                const state = this.searchSession.restoreStateByKey(PlanwertSuchenComponent.STATE_KEY);
                this.planwertData = { massnahmentypOptions: resp.data, state: state ? state.fields : null };

                if (state) {
                    this.searchRestCall(state.fields);
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.planwertSuchenForm.planwertSuchenForm.valid) {
            this.planwertSuchenForm.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        const searchData = this.planwertSuchenForm.handler.mapToDTO();
        this.searchSession.storeFieldsByKey(PlanwertSuchenComponent.STATE_KEY, searchData);
        this.searchSession.resetSelectedTableRow(PlanwertSuchenTableComponent.STATE_KEY);
        this.searchRestCall(searchData);
    }

    searchRestCall(data: PlanwertSuchenParameterDTO) {
        this.facade.spinnerService.activate(this.channel);
        this.planwertRestService.searchPlanwerte(data).subscribe(
            res => {
                if (res.data) {
                    this.dataSource = res.data.map(element => this.createRow(element));
                }

                this.infopanelService.updateInformation({ tableCount: res.data.length });
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    reset() {
        this.planwertSuchenForm.reset();
        this.facade.fehlermeldungenService.closeMessage();
        this.dataSource = [];
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.searchSession.clearStorageByKey(PlanwertSuchenComponent.STATE_KEY);
        this.searchSession.restoreDefaultValues(PlanwertSuchenTableComponent.STATE_KEY);
    }

    createRow(element: PlanwertViewDTO): any {
        return {
            planwertNr: element.planwertId,
            planwerttyp: this.facade.dbTranslateService.translateWithOrder(element, 'typText') || '',
            titelpmd: this.getTitle(element),
            gueltigVon: element.gueltigVon,
            gueltigBis: element.gueltigBis,
            chfBetrag: element.chfBetrag,
            teilnehmerTage: element.teilnehmerTage,
            teilnehmer: element.teilnehmer
        };
    }

    getTitle(obj: PlanwertViewDTO): string {
        switch (obj.typCode.trim()) {
            case PlanwerttypEnum.PRODUKT:
                return this.facade.dbTranslateService.translateWithOrder(obj, 'produktTitel') || '';
            case PlanwerttypEnum.MASSNAHME:
                return this.facade.dbTranslateService.translateWithOrder(obj, 'massnahmeTitel') || '';
            case PlanwerttypEnum.KURS:
                return this.facade.dbTranslateService.translateWithOrder(obj, 'sessionTitel') || '';
            case PlanwerttypEnum.STANDORT:
                return this.facade.dbTranslateService.translateWithOrder(obj, 'standortTitel') || '';
            default:
                return '';
        }
    }

    onItemSelected(item) {
        this.facade.spinnerService.activate(this.channel);
        this.planwertRestService.getPlanwert(item.planwertNr, false).subscribe(
            resp => {
                switch (resp.data.typ.code.trim()) {
                    case PlanwerttypEnum.PRODUKT:
                        this.router.navigate([`amm/bewirtschaftung/produkt/${resp.data.produktObject.produktId}/planwerte/planwert/bearbeiten`], {
                            queryParams: { planwertId: item.planwertNr }
                        });
                        break;
                    case PlanwerttypEnum.MASSNAHME:
                        this.router.navigate(
                            [`amm/bewirtschaftung/produkt/${resp.data.massnahmeObject.produktObject.produktId}/massnahmen/massnahme/planwerte/planwert/bearbeiten`],
                            {
                                queryParams: { massnahmeId: resp.data.massnahmeObject.massnahmeId, planwertId: item.planwertNr }
                            }
                        );
                        break;
                    case PlanwerttypEnum.KURS:
                        this.router.navigate(
                            [
                                `amm/bewirtschaftung/produkt/${
                                    resp.data.durchfuehrungseinheitObject.massnahmeObject.produktObject.produktId
                                }/massnahmen/massnahme/kurse/kurs/planwerte/planwert/bearbeiten`
                            ],
                            {
                                queryParams: {
                                    massnahmeId: resp.data.durchfuehrungseinheitObject.massnahmeObject.massnahmeId,
                                    dfeId: resp.data.durchfuehrungseinheitObject.durchfuehrungsId,
                                    planwertId: item.planwertNr
                                }
                            }
                        );
                        break;
                    case PlanwerttypEnum.STANDORT:
                        this.router.navigate(
                            [
                                `amm/bewirtschaftung/produkt/${
                                    resp.data.durchfuehrungseinheitObject.massnahmeObject.produktObject.produktId
                                }/massnahmen/massnahme/standorte/standort/planwerte/planwert/bearbeiten`
                            ],
                            {
                                queryParams: {
                                    massnahmeId: resp.data.durchfuehrungseinheitObject.massnahmeObject.massnahmeId,
                                    dfeId: resp.data.durchfuehrungseinheitObject.durchfuehrungsId,
                                    planwertId: item.planwertNr
                                }
                            }
                        );
                        break;
                    default:
                        break;
                }
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    ngOnDestroy(): void {
        this.infopanelService.updateInformation({
            hideInfobar: false,
            tableCount: null
        });
        super.ngOnDestroy();
    }
}

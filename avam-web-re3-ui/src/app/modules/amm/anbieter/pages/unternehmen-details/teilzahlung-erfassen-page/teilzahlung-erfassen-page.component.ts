import { FormatSwissFrancPipe } from '@shared/pipes/format-swiss-franc.pipe';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { FacadeService } from '@shared/services/facade.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { TeilzahlungFormComponent, TeilzahlungData } from '../../../components/teilzahlung-form/teilzahlung-form.component';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { TeilzahlungswertListeViewDTO } from '@app/shared/models/dtos-generated/teilzahlungswertListeViewDTO';
import { BaseResponseWrapperListButtonsEnumWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListButtonsEnumWarningMessages';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { TeilzahlungswerteTableType } from '../../../components/teilzahlung-form/anbieter-teilzahlungswerte-table/anbieter-teilzahlungswerte-table.component';
import { TeilzahlungswertService } from '@app/shared/services/teilzahlungswert.service';
import { TeilzahlungswertDTO } from '@app/shared/models/dtos-generated/teilzahlungswertDTO';

@Component({
    selector: 'avam-teilzahlung-erfassen-page',
    templateUrl: './teilzahlung-erfassen-page.component.html',
    providers: [FormatSwissFrancPipe]
})
export class TeilzahlungErfassenPageComponent implements DeactivationGuarded, AfterViewInit, OnDestroy {
    @ViewChild('tzform') tzformComponent: TeilzahlungFormComponent;

    teilzahlungData: TeilzahlungData;
    channel = 'teilzahlung-erfassen-channel';
    anbieterId: number;
    langSubscription: Subscription;
    tableDataSource: any;
    summeTotal: number | string;
    teilzahlungswerte: TeilzahlungswertListeViewDTO[];
    buttons: Subject<any[]> = new Subject();
    buttonsEnum = BaseResponseWrapperListButtonsEnumWarningMessages.DataEnum;
    observeClickActionSub: Subscription;
    messageBusSub: Subscription;
    translateSub: Subscription;
    teilzahlungswerteTableType = TeilzahlungswerteTableType;
    selectedFromSearch: TeilzahlungswertDTO[];
    isTeilzahlungCreated: boolean;

    constructor(
        private facade: FacadeService,
        private route: ActivatedRoute,
        private infopanelService: AmmInfopanelService,
        private anbieterRestService: AnbieterRestService,
        private formatSwissFrancPipe: FormatSwissFrancPipe,
        private router: Router,
        private teilzahlungswertService: TeilzahlungswertService
    ) {}

    ngAfterViewInit() {
        this.selectedFromSearch = this.teilzahlungswertService.getTeilzahlungswertIds().map(tzwId => {
            return { teilzahlungswertId: tzwId };
        });
        this.route.parent.params.subscribe(params => {
            this.anbieterId = +params['unternehmenId'];
        });

        this.facade.navigationService.showNavigationTreeRoute('./teilzahlungen/erfassen');

        this.messageBusSub = this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.cancel();
            }
        });

        this.getData();
        this.configureToolbox();
        this.initInfopanel();

        this.translateSub = this.facade.translateService.onLangChange.subscribe(() => {
            this.tableDataSource = this.teilzahlungswerte.map(el => this.createTeilzahlungswertRow(el));
        });
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);

        const getTeilzahlungBearbeitenParam = this.selectedFromSearch.length
            ? this.anbieterRestService.getTeilzahlungParamByTeilzahlungswerte(this.selectedFromSearch)
            : this.anbieterRestService.getTeilzahlungParamByAnbieterId(this.anbieterId);

        getTeilzahlungBearbeitenParam.subscribe(
            tzResponse => {
                const tzParamDto = tzResponse.data;

                if (tzParamDto) {
                    this.teilzahlungswerte = tzParamDto.teilzahlungswertListe ? [...tzParamDto.teilzahlungswertListe] : [];
                    this.tableDataSource = this.teilzahlungswerte.map(el => this.createTeilzahlungswertRow(el));
                    this.summeTotal = this.formatSwissFrancPipe.transform(tzParamDto.summeTeilzahlungswerte);
                    this.buttons.next(tzParamDto.enabledActions);
                }

                this.teilzahlungData = {
                    tzParamDto
                };

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    createTeilzahlungswertRow(teilzahlungswert: TeilzahlungswertListeViewDTO) {
        const sprachTitel = {
            titelDe: teilzahlungswert.durchfuehrungsTitelDe || teilzahlungswert.massnahmeTitelDe,
            titelFr: teilzahlungswert.durchfuehrungsTitelFr || teilzahlungswert.massnahmeTitelFr,
            titelIt: teilzahlungswert.durchfuehrungsTitelIt || teilzahlungswert.massnahmeTitelIt
        };
        return {
            teilzahlungswertId: teilzahlungswert.teilzahlungswertId,
            teilzahlungswertNr: teilzahlungswert.teilzahlungswertNr || '',
            chf: this.formatSwissFrancPipe.transform(teilzahlungswert.teilzahlungswertBetrag),
            faelligAm: teilzahlungswert.teilzahlungswertFaelligkeitDatum,
            titel: this.facade.dbTranslateService.translateWithOrder(sprachTitel, 'titel') || '',
            gueltigVon: teilzahlungswert.vertragswertGueltigVon,
            gueltigBis: teilzahlungswert.vertragswertGueltigBis,
            profilNr: teilzahlungswert.vertragswertProfilNr || ''
        };
    }

    cancel() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/teilzahlungen`]);
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.tzformComponent.formGroup.invalid) {
            this.tzformComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.channel);

        this.anbieterRestService.saveTeilzahlungParam(this.tzformComponent.mapToDTO()).subscribe(
            response => {
                if (response.data) {
                    this.tzformComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));
                    this.isTeilzahlungCreated = true;
                    this.router.navigate([`/amm/anbieter/${this.anbieterId}/teilzahlungen/bearbeiten`], {
                        queryParams: { teilzahlungId: response.data.teilzahlung.teilzahlungId }
                    });
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.channel);
            }
        );
    }

    canDeactivate() {
        return this.tzformComponent.formGroup.dirty;
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (!this.isTeilzahlungCreated) {
            this.teilzahlungswertService.clearTeilzahlungswertIds();
        }

        this.facade.navigationService.hideNavigationTreeRoute('./teilzahlungen/erfassen');
        this.messageBusSub.unsubscribe();
        this.translateSub.unsubscribe();
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.channel);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private initInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.zahlungen.button.teilzahlungerfassen'
        });
    }
}

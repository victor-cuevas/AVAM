import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';
import * as moment from 'moment';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BaseResponseWrapperArbeitgeberGeschaeftsgangDTOWarningMessages } from '@dtos/baseResponseWrapperArbeitgeberGeschaeftsgangDTOWarningMessages';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { ArbeitgeberGeschaeftsgangDTO } from '@dtos/arbeitgeberGeschaeftsgangDTO';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { Permissions } from '@shared/enums/permissions.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { TableConfigsService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/geschaefts-statistik/table-configs.service';
import { forkJoin } from 'rxjs';
import { DbTranslateService } from '@shared/services/db-translate.service';

@Component({
    selector: 'avam-geschaefts-statistik',
    templateUrl: './geschaefts-statistik.component.html',
    styleUrls: ['./geschaefts-statistik.component.scss']
})
export class GeschaeftsStatistikComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    public channel = 'geschaeftsstatistik';
    public searchForm: FormGroup;
    public statisticsForm: FormGroup;
    public readonly toolboxChannel = 'geschaefts-statistik-channel';
    public permissions: typeof Permissions = Permissions;
    public tableConfigs;
    public formNr = {
        stellenangebotRav: '0200013',
        zwischenVerdienst: '0200014',
        neuerArbeitgeber: '0200015',
        letzterArbeitgeber: '0200016',
        einarbeitungZuschuss: '0200017',
        ausbildungsZuschuss: '0200018',
        berufspratika: '0200019',
        ausbildungsPraktika: '0200020'
    };
    private unternehmenId;

    constructor(
        private formBuilder: FormBuilder,
        private unternehmenRestService: UnternehmenRestService,
        private activatedRoute: ActivatedRoute,
        private translateService: TranslateService,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private fehlermeldungenService: FehlermeldungenService,
        private resetDialogService: ResetDialogService,
        private notificationService: NotificationService,
        private toolboxService: ToolboxService,
        private infopanelService: AmmInfopanelService,
        private tableService: TableConfigsService,
        private dbTranslateService: DbTranslateService
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    public ngOnInit() {
        this.generateForm();
        this.setSubscriptions();
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.geschaeftsstatistik' });
        this.initToolbox();
        this.tableConfigs = this.tableService.getModalConfigs();
    }

    public ngAfterViewInit(): void {
        this.getData();
    }

    public ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    public reset() {
        OrColumnLayoutUtils.scrollTop();
        this.fehlermeldungenService.closeMessage();
        if (this.searchForm.dirty) {
            this.resetDialogService.reset(() => {
                this.searchForm.reset({
                    zeitraumVon: new Date(
                        moment()
                            .subtract(3, 'months')
                            .toISOString()
                    ),
                    zeitraumBis: new Date()
                });
            });
        }
    }

    public openWindow(entityData: any, entityType: string) {
        if (entityData) {
            const url = this.getWindowUrl(entityData, entityType);
            if (!!url) {
                window.open(url, '_blank');
            }
        }
    }

    private getWindowUrl(entityData: any, entityType: string): string {
        switch (entityType) {
            case 'stellenangebotRAV':
                return `arbeitgeber/details/${entityData.dto.unternehmenId}/stellenangebote/stellenangebot/bewirtschaftung?osteId=${entityData.dto.osteId}`;
            case 'zwischenVerdienst':
                return `stes/details/${entityData.dto.stes}/zwischenverdienste/bearbeiten?zwischenverdienstId=${entityData.dto.zwischenverdienstId}`;
            case 'neuerArbeitgeber':
                return `stes/details/${entityData.dto.stes}/abmeldung`;
            case 'letzterArbeitgeber':
                return `stes/details/${entityData.dto.stes}/stellensuche`;
            case 'einarbeitungZuschuss':
                return `stes/details/${entityData.dto.stes}/amm/uebersicht/2/speziell-entscheid?gfId=${entityData.dto.geschaeftsfallId}&entscheidId=${entityData.dto.entscheidId}`;
            case 'ausbildungsZuschuss':
                return `stes/details/${entityData.dto.stes}/amm/uebersicht/1/speziell-entscheid?gfId=${entityData.dto.geschaeftsfallId}&entscheidId=${entityData.dto.entscheidId}`;
            case 'berufspratika':
                return `stes/details/${entityData.dto.stes}/amm/uebersicht/11/bim-bem-entscheid?gfId=${entityData.dto.geschaeftsfallId}&entscheidId=${entityData.dto.entscheidId}`;
            case 'ausbildungspraktika':
                return `stes/details/${entityData.dto.stes}/amm/uebersicht/6/bim-bem-entscheid?gfId=${entityData.dto.geschaeftsfallId}&entscheidId=${entityData.dto.entscheidId}`;
            default:
                return null;
        }
    }

    private getData(shouldUseParams = false) {
        this.fehlermeldungenService.closeMessage();
        if (this.searchForm.valid) {
            this.spinnerService.activate(this.channel);
            this.unternehmenRestService
                .getGeschaeftsStatistikByUnternehmenId(
                    this.unternehmenId,
                    this.translateService.currentLang,
                    shouldUseParams ? this.formUtils.formatDateNgx(this.searchForm.controls.zeitraumVon.value) : null,
                    shouldUseParams ? this.formUtils.formatDateNgx(this.searchForm.controls.zeitraumBis.value) : null
                )
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperArbeitgeberGeschaeftsgangDTOWarningMessages) => {
                        this.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                        if (response.data) {
                            this.mapToForm(response.data);
                            this.getModalData(response.data);
                            if (shouldUseParams) {
                                this.notificationService.success('arbeitgeber.message.zeitraumaktualisiert');
                            }
                        }
                    },
                    () => {
                        OrColumnLayoutUtils.scrollTop();
                        this.spinnerService.deactivate(this.channel);
                    }
                );
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    private getModalData(data: ArbeitgeberGeschaeftsgangDTO) {
        const observable = this.tableService.getModalObservable(
            data,
            this.unternehmenId,
            this.formUtils.formatDateNgx(this.searchForm.controls.zeitraumVon.value),
            this.formUtils.formatDateNgx(this.searchForm.controls.zeitraumBis.value),
            this.translateService.currentLang
        );
        forkJoin(observable)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([
                    ravAnbegoteData,
                    zwischenVerdienstData,
                    neuerArbeitgeberData,
                    letztArbeitgeberData,
                    einarbeitungZuschussData,
                    ausbildungsZuschussData,
                    berufspratikaData,
                    ausbildungsPraktikaData
                ]) => {
                    this.tableConfigs.rav.data = ravAnbegoteData ? ravAnbegoteData.data.map(row => this.tableService.createRAVStellenangeboteRow(row)) : [];
                    this.tableConfigs.zv.data = zwischenVerdienstData ? this.tableService.sortAndCreateZwischenverdienstRow(zwischenVerdienstData.data) : [];
                    this.tableConfigs.neuerArbeitgeber.data = neuerArbeitgeberData ? this.tableService.sortAndCreateNeuArbeitgeberRow(neuerArbeitgeberData.data) : [];
                    this.tableConfigs.letztArbeitgeber.data = letztArbeitgeberData ? this.tableService.sortAndCreateLetztArbeitgeberRow(letztArbeitgeberData.data) : [];
                    this.tableConfigs.einarbeitungZuschuss.data = einarbeitungZuschussData ? this.tableService.sortAndCreateZuschussPraktikaRow(einarbeitungZuschussData.data) : [];
                    this.tableConfigs.ausbildungsZuschuss.data = ausbildungsZuschussData ? this.tableService.sortAndCreateZuschussPraktikaRow(ausbildungsZuschussData.data) : [];
                    this.tableConfigs.berufspratika.data = berufspratikaData ? this.tableService.sortAndCreateZuschussPraktikaRow(berufspratikaData.data) : [];
                    this.tableConfigs.ausbildungsPraktika.data = ausbildungsPraktikaData ? this.tableService.sortAndCreateZuschussPraktikaRow(ausbildungsPraktikaData.data) : [];
                }
            );
    }

    private mapToForm(statistics: ArbeitgeberGeschaeftsgangDTO) {
        this.statisticsForm.patchValue({
            stellenangebot: statistics.stellen,
            stellenangebotRAV: statistics.besetztRav,
            arbeitEntschaedigung: statistics.kurzarbeit,
            schlechtWetter: statistics.schlechtwetter,
            zwischenVerdienst: statistics.zwischenverdienst,
            neuerArbeitgeber: statistics.angestellt,
            letzterArbeitgeber: statistics.betrieb,
            einarbeitungZuschuss: statistics.einarbeitung,
            ausbildungsZuschuss: statistics.ausbildung,
            berufspratika: statistics.praktika,
            ausbildungspraktika: statistics.ausbildungsPraktika
        });
    }

    private generateForm() {
        this.searchForm = this.formBuilder.group(
            {
                zeitraumVon: [
                    new Date(
                        moment()
                            .subtract(3, 'months')
                            .toISOString()
                    ),
                    [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]
                ],
                zeitraumBis: [new Date(), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: DateValidator.rangeBetweenDates('zeitraumVon', 'zeitraumBis', 'val201')
            }
        );
        this.statisticsForm = this.formBuilder.group({
            stellenangebot: 0,
            stellenangebotRAV: 0,
            arbeitEntschaedigung: 0,
            schlechtWetter: 0,
            zwischenVerdienst: 0,
            neuerArbeitgeber: 0,
            letzterArbeitgeber: 0,
            einarbeitungZuschuss: 0,
            ausbildungsZuschuss: 0,
            berufspratika: 0,
            ausbildungspraktika: 0
        });
    }

    private setSubscriptions() {
        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(PrintHelper.print);

        this.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.getData();
            });
    }

    private initToolbox() {
        this.toolboxService.sendConfiguration(ToolboxConfig.getGeschaeftsStatistikConfig(), this.toolboxChannel, ToolboxDataHelper.createForArbeitgeber(this.unternehmenId));
    }
}

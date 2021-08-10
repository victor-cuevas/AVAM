import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ToolboxService } from '@app/shared';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { takeUntil } from 'rxjs/operators';
import { FacadeService } from '@app/shared/services/facade.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { DateRangeFormComponent } from '@app/shared/components/date-range-form/date-range-form.component';
import { AbrechnungSuchenParamDTO } from '@app/shared/models/dtos-generated/abrechnungSuchenParamDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';

@Component({
    selector: 'avam-abrechnungen-anzeigen',
    templateUrl: './abrechnungen-anzeigen.component.html',
    styleUrls: ['./abrechnungen-anzeigen.component.scss']
})
export class AbrechnungenAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('searchForm') searchForm: DateRangeFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    channel = 'amm-anbieter-abrechnungen';
    data = { state: null };

    anbieterId: string;
    dataSource = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private infopanelService: AmmInfopanelService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private dbTranslateService: DbTranslateService,
        private translate: TranslateService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            this.anbieterId = data['unternehmenId'];
        });
        this.data = {
            state: {
                gueltigVon: new Date(new Date().getFullYear() - 1, 0, 1),
                gueltigBis: new Date(2099, 11, 31)
            }
        };
        this.searchAbrechnungen();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.infopanelService.updateInformation({
            subtitle: 'amm.anbieter.subnavmenuitem.abrechnungen',
            hideInfobar: false
        });
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.dataSource = this.dataSource.map(this.createAbrechnungRow);
        });
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel);
    }

    search() {
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.searchForm.isValid()) {
            this.searchForm.ngForm.onSubmit(undefined);
            this.facade.openModalFensterService.openInfoModal('stes.error.bearbeiten.pflichtfelder');
            return;
        }

        this.searchAbrechnungen();
    }

    searchAbrechnungen() {
        this.spinnerService.activate(this.channel);

        this.anbieterRestService.searchAbrechnungen(this.mapToDTO()).subscribe(
            response => {
                this.dataSource = [...response.data].sort((a, b) => (a.abrechnungNr > b.abrechnungNr ? -1 : b.abrechnungNr > a.abrechnungNr ? 1 : 0)).map(this.createAbrechnungRow);
                this.infopanelService.updateInformation({ tableCount: this.dataSource.length });

                this.spinnerService.deactivate(this.channel);
            },
            error => {
                this.spinnerService.deactivate(this.channel);
            }
        );
    }

    navigateToCreate() {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/erfassen`]);
    }

    itemSelected(data) {
        this.router.navigate([`amm/anbieter/${this.anbieterId}/abrechnungen/bearbeiten`], { queryParams: { abrechnungId: data.abrechnungId } });
    }

    mapToDTO(): AbrechnungSuchenParamDTO {
        const ausfuehrungsDates = this.searchForm.mapToDTO();
        return {
            abrechnungNr: '',
            anbieterName: '',
            anbieterId: this.anbieterId,
            statusAbrechnung: '',
            titel: '',
            mitNachfolger: false,
            shouldBeValidated: true,
            inclusiveBerechtigung: false,
            ausfuehrungsdatumVon: ausfuehrungsDates.gueltigVon,
            ausfuehrungsdatumBis: ausfuehrungsDates.gueltigBis
        };
    }

    createAbrechnungRow = data => {
        return {
            abrechnungId: data.abrechnungId,
            abrechnungNr: data.abrechnungNr,
            titel: data.titel,
            ausfuehrungsdatum: this.facade.formUtilsService.parseDate(data.ausfuehrungsdatum),
            statusObject: data.statusObject,
            status: data.statusObject ? this.dbTranslateService.translate(data.statusObject, 'kurzText') : ''
        };
    };

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        this.infopanelService.updateInformation({ tableCount: undefined });
    }
}

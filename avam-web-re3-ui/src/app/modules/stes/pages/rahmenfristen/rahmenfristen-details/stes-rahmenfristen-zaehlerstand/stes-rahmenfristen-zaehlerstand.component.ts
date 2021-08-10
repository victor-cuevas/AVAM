import { BaseResponseWrapperStesRahmenfristDTOWarningMessages } from './../../../../../../shared/models/dtos-generated/baseResponseWrapperStesRahmenfristDTOWarningMessages';
import { StesRahmenfristDTO } from 'src/app/shared/models/dtos-generated/stesRahmenfristDTO';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { StesRahmenfristenPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-rahmenfristen-zaehlerstand',
    templateUrl: './stes-rahmenfristen-zaehlerstand.component.html',
    styleUrls: ['./stes-rahmenfristen-zaehlerstand.component.scss']
})
export class StesRahmenfristenZaehlerstandComponent extends Unsubscribable implements OnInit, OnDestroy {
    stesId: string;
    rahmenfristId: string;
    rahmenfristenZaehlerstandChannel = 'rahmenfristenZaehlerstand';
    zaehlerstandData: StesRahmenfristDTO = null;
    observeClickActionSub: Subscription;

    constructor(
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private router: Router,
        private facade: FacadeService,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super();
        ToolboxService.CHANNEL = this.rahmenfristenZaehlerstandChannel;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.route.queryParamMap.subscribe(params => {
            this.rahmenfristId = params.get('rahmenfristId');
            this.facade.navigationService.showNavigationTreeRoute(StesRahmenfristenPaths.RAHMENFRIST, { rahmenfristId: this.rahmenfristId });
            this.facade.navigationService.showNavigationTreeRoute(StesRahmenfristenPaths.RAHMENFRISTZAELERSTAND, { rahmenfristId: this.rahmenfristId });
        });

        this.loadData();

        this.configureToolbox();

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });

        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(event => {
                this.facade.messageBus.buildAndSend('stes-details-content-ueberschrift', { ueberschrift: this.updateTitle() });
                this.stesInfobarService.sendDataToInfobar({ title: this.updateTitle() });
            });

        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    loadData() {
        this.facade.spinnerService.activate(this.rahmenfristenZaehlerstandChannel);
        this.stesDataRestService
            .getZaehlerstand(this.rahmenfristId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperStesRahmenfristDTOWarningMessages) => {
                    this.zaehlerstandData = response.data;
                    this.facade.messageBus.buildAndSend('stes-details-content-ueberschrift', { ueberschrift: this.updateTitle() });
                    this.stesInfobarService.sendDataToInfobar({ title: this.updateTitle() });
                    this.facade.spinnerService.deactivate(this.rahmenfristenZaehlerstandChannel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.rahmenfristenZaehlerstandChannel);
                }
            );
    }

    updateTitle(): string {
        let screenTitle = this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesRahmenFristDetails');
        const componentTitle = this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesRahmenFristZaehlerstand');
        screenTitle = `${screenTitle} ${moment(this.zaehlerstandData.raDatumRahmenfristVon).format('DD.MM.YYYY')}  - ${moment(this.zaehlerstandData.raDatumRahmenfristBis).format(
            'DD.MM.YYYY'
        )} - ${componentTitle}`;
        return screenTitle;
    }

    cancel() {
        this.router.navigate([`stes/details/${this.stesId}/rahmenfristen/rahmenfristdetails`], { queryParams: { rahmenfristId: this.rahmenfristId } });
    }

    closeComponent(message) {
        if (message.data.label === this.facade.dbTranslateService.instant('common.label.rahmenfrist')) {
            this.router.navigate([`./${StesRahmenfristenPaths.RAHMENFRISTEN}`], { relativeTo: this.route.parent });
            this.facade.navigationService.hideNavigationTreeRoute(StesRahmenfristenPaths.RAHMENFRIST);
        }
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.rahmenfristenZaehlerstandChannel);
    }
}

import { VertragswerteTableComponent } from './../../../components/leistungsvereinbarung-form/vertragswerte-table/vertragswerte-table.component';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { LeistungsvereinbarungFormComponent, LeistungsvereinbarungData } from '../../../components/leistungsvereinbarung-form/leistungsvereinbarung-form.component';
import { FacadeService } from '@app/shared/services/facade.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of, Observable, Subscription } from 'rxjs';
import { VertraegeRestService } from '@app/core/http/vertraege-rest.service';
import { BaseResponseWrapperRahmenvertragDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperRahmenvertragDTOWarningMessages';
import { Subject } from 'rxjs/internal/Subject';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import PrintHelper from '@app/shared/helpers/print.helper';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-leistungsvereinbarung-erfassen-page',
    templateUrl: './leistungsvereinbarung-erfassen-page.component.html'
})
export class LeistungsvereinbarungErfassenPageComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly CHANNEL_STATE_KEY = 'leistungsvereinbarung-erfassen';

    public get CHANNEL_STATE_KEY() {
        return LeistungsvereinbarungErfassenPageComponent.CHANNEL_STATE_KEY;
    }

    @ViewChild('form') lvFormComponent: LeistungsvereinbarungFormComponent;
    @ViewChild('table') vertragswerteTableComponent: VertragswerteTableComponent;

    lvData: LeistungsvereinbarungData;
    buttons: Subject<any[]> = new Subject();
    ammButtonsTypeEnum: typeof AmmButtonsTypeEnum = AmmButtonsTypeEnum;

    observeClickActionSub: Subscription;
    messageBusSub: Subscription;

    constructor(
        private facade: FacadeService,
        private anbieterRestService: AnbieterRestService,
        private vertraegeRestService: VertraegeRestService,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.lvData = { statusOptions: [] };
    }

    ngAfterViewInit() {
        this.route.parent.parent.params.subscribe(params => {
            this.lvData = { ...this.lvData, anbieterId: +params['unternehmenId'] };
        });

        this.route.parent.queryParams.subscribe(params => {
            const rahmenvertragId = +params['rahmenvertragId'];

            this.lvData = {
                ...this.lvData,
                rahmenvertragId,
                hasInitialRahmenvertrag: !!rahmenvertragId
            };
            if (rahmenvertragId) {
                this.facade.navigationService.showNavigationTreeRoute('./rahmenvertraege/bearbeiten', { rahmenvertragId });
                this.facade.navigationService.showNavigationTreeRoute('./leistungsvereinbarungen/erfassen', { rahmenvertragId });
            } else {
                this.facade.navigationService.showNavigationTreeRoute('./leistungsvereinbarungen/erfassen');
            }

            this.getData();
            this.configureToolbox();
            this.initInfopanel();
        });

        this.messageBusSub = this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.close();
            }
        });
    }

    ngOnDestroy() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.navigationService.hideNavigationTreeRoute('./leistungsvereinbarungen/erfassen');
        this.observeClickActionSub.unsubscribe();
        this.messageBusSub.unsubscribe();
    }

    canDeactivate() {
        return this.lvFormComponent.formGroup.dirty;
    }

    getData() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        const getStatusOptions = this.anbieterRestService.getLeistungsvereinbarungStati(0);
        const getButtons = this.anbieterRestService.getLeistungsvereinbarungButtons(0);
        const getRahmenvertrag = this.lvData.rahmenvertragId
            ? this.vertraegeRestService.getRahmenvertrag(this.lvData.rahmenvertragId)
            : of(null as Observable<BaseResponseWrapperRahmenvertragDTOWarningMessages>);

        forkJoin([getStatusOptions, getButtons, getRahmenvertrag]).subscribe(
            ([statusOptionsResponse, buttons, rahmenvertragResponse]) => {
                this.lvData = { ...this.lvData, statusOptions: statusOptionsResponse.data };
                this.buttons.next(buttons.data);

                if (rahmenvertragResponse && rahmenvertragResponse.data) {
                    this.lvData = { ...this.lvData, rahmenvertragDto: rahmenvertragResponse.data };
                }

                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    close() {
        this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen`]);
    }

    submit() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.lvFormComponent.formGroup.invalid) {
            this.lvFormComponent.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();

            return;
        }

        this.save();
    }

    save() {
        this.facade.spinnerService.activate(this.CHANNEL_STATE_KEY);

        this.anbieterRestService.saveLeistungsvereinbarung(this.lvFormComponent.mapToDTO(), true).subscribe(
            response => {
                if (response.data) {
                    this.lvFormComponent.formGroup.markAsPristine();
                    this.facade.notificationService.success(this.facade.translateService.instant('common.message.datengespeichert'));

                    const queryParams = this.lvData.rahmenvertragId
                        ? { lvId: response.data.leistungsvereinbarungId, rahmenvertragId: this.lvData.rahmenvertragId }
                        : { lvId: response.data.leistungsvereinbarungId };
                    this.router.navigate([`/amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen/leistungsvereinbarung`], {
                        queryParams
                    });
                }

                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            },
            () => {
                this.facade.notificationService.error(this.facade.translateService.instant('common.message.datennichtgespeichert'));
                OrColumnLayoutUtils.scrollTop();
                this.facade.spinnerService.deactivate(this.CHANNEL_STATE_KEY);
            }
        );
    }

    reset() {
        this.lvFormComponent.reset();
    }

    cancel() {
        if (this.lvData.hasInitialRahmenvertrag) {
            this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/rahmenvertraege/bearbeiten`], {
                queryParams: { rahmenvertragId: this.lvData.rahmenvertragId }
            });
        } else {
            this.router.navigate([`amm/anbieter/${this.lvData.anbieterId}/leistungsvereinbarungen`]);
        }
    }

    private configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.CHANNEL_STATE_KEY);

        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    private initInfopanel() {
        this.infopanelService.updateInformation({
            subtitle: 'amm.akquisition.kopfzeile.leistungsvereinbarungerfassen'
        });
    }
}

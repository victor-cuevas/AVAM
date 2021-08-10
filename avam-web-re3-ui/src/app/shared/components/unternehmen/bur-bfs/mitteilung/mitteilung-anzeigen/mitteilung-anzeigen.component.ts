import { Component, OnInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { ToolboxService, FormUtilsService, GenericConfirmComponent } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import PrintHelper from '@shared/helpers/print.helper';
import { MitteilungBfsDTO } from '@dtos/mitteilungBfsDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { TranslateService } from '@ngx-translate/core';
import { BaseResponseWrapperMitteilungBfsDTOWarningMessages } from '@dtos/baseResponseWrapperMitteilungBfsDTOWarningMessages';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { NavigationService } from '@shared/services/navigation-service';
import { Subscription } from 'rxjs';
import { MessageBus } from '@shared/services/message-bus';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { NavigationDto } from '@shared/models/dtos/navigation-dto';
import { RedirectService } from '@shared/services/redirect.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'avam-mitteilung-anzeigen',
    templateUrl: './mitteilung-anzeigen.component.html',
    styleUrls: ['./mitteilung-anzeigen.component.scss']
})
export class MitteilungAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    mitteilungAnzeigenChannel: 'mitteilungAnzeigenChannel';
    tableConfig: any;
    mitteilungBfsResponse: MitteilungBfsDTO;
    unternehmenId = this.activatedRoute.snapshot.parent.params.unternehmenId;
    mitteilungId = this.activatedRoute.snapshot.queryParams.mitteilungId;
    autosuggestForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private restService: UnternehmenRestService,
        private activatedRoute: ActivatedRoute,
        private stesInfobarService: AvamStesInfoBarService,
        private infopanelService: AmmInfopanelService,
        private notificationService: NotificationService,
        private fehlermeldungenService: FehlermeldungenService,
        private router: Router,
        private messageBus: MessageBus,
        private navigationService: NavigationService,
        private redirectService: RedirectService
    ) {
        super();
    }

    ngOnInit() {
        this.infopanelService.updateInformation({ tableCount: undefined });
        this.initToolBox();
        this.createForm();
        this.getData();
        this.subscribeOnOpenNavItem();
        this.subscribeOnCloseNavItem();
    }

    public ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    goToMitteilungTable() {
        this.fehlermeldungenService.closeMessage();
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    }

    mitteilungBeantworten() {
        this.spinnerService.activate(this.mitteilungAnzeigenChannel);
        this.fehlermeldungenService.closeMessage();
        this.restService
            .mitteilungBeantworten(this.mitteilungId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperMitteilungBfsDTOWarningMessages) => {
                    this.spinnerService.deactivate(this.mitteilungAnzeigenChannel);
                    if (response.data) {
                        this.mitteilungBfsResponse = response.data;
                        this.notificationService.success('unternehmen.label.mitteilung');
                    }
                },
                () => this.spinnerService.deactivate(this.mitteilungAnzeigenChannel)
            );
    }

    private subscribeOnOpenNavItem() {
        this.activatedRoute.queryParamMap.subscribe(params => {
            this.mitteilungId = params.get('mitteilungId');
            this.navigationService.showNavigationTreeRoute('./mitteilungen/bearbeiten', { mitteilungId: this.mitteilungId });
        });
    }

    private subscribeOnCloseNavItem(): Subscription {
        return this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.onCancelPageSideNavigation(message);
            }
        });
    }

    private openBeantwortenDialog(): void {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.mitteilungBeantworten();
            }
        });
        modalRef.componentInstance.titleLabel = 'unternehmen.button.mitteilungbeantworten';
        modalRef.componentInstance.promptLabel = 'unternehmen.feedback.mitteilungbeantworten';
        modalRef.componentInstance.primaryButton = 'common.button.JaBeantworten';
        modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
    }

    private onCancelPageSideNavigation(message): void {
        if (message.data.label === this.translateService.instant(UnternehmenSideNavLabels.BUR_MITTEILUNG)) {
            this.hideNavItem(message);
            this.createNavigationDto(`../`, this.activatedRoute);
        }
    }

    private createNavigationDto(commands: any, activatedRoute: ActivatedRoute, mitteilungId?: number): void {
        const navigationDto: NavigationDto = {
            commands: [commands],
            extras: {
                relativeTo: activatedRoute,
                queryParams: { mitteilungId: mitteilungId ? String(mitteilungId) : null }
            }
        };
        this.redirectService.navigate(navigationDto);
    }

    private hideNavItem(message) {
        this.navigationService.hideNavigationTreeRoute(message.data.routes.join('/').replace('//', '/'));
    }

    private initToolBox() {
        ToolboxService.CHANNEL = this.mitteilungAnzeigenChannel;
        this.toolboxService.sendConfiguration(
            ToolboxConfig.getMitteilungAnzeigenConfig(),
            this.mitteilungAnzeigenChannel,
            ToolboxDataHelper.createForUnternehmen(+this.unternehmenId)
        );

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(PrintHelper.print);
    }

    private createForm(): void {
        this.autosuggestForm = this.fb.group({
            ansprechperson: null
        });
    }

    private setFormValue(): void {
        this.autosuggestForm.controls.ansprechperson.setValue(this.mitteilungBfsResponse.ansprechpersonAvamObject);
    }

    private getData() {
        this.spinnerService.activate(this.mitteilungAnzeigenChannel);
        this.restService
            .getMitteilung(this.unternehmenId, this.mitteilungId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperMitteilungBfsDTOWarningMessages) => {
                    this.spinnerService.deactivate(this.mitteilungAnzeigenChannel);
                    if (response.data) {
                        this.mitteilungBfsResponse = response.data;
                        this.setFormValue();
                        this.infopanelService.updateInformation({
                            subtitle: `${this.translateService.instant('unternehmen.label.mitteilung')} ${this.formUtils.formatDateNgx(
                                response.data.erfasstAm,
                                FormUtilsService.GUI_DATE_FORMAT
                            )}`
                        });
                    }
                },
                () => this.spinnerService.deactivate(this.mitteilungAnzeigenChannel)
            );
    }
}

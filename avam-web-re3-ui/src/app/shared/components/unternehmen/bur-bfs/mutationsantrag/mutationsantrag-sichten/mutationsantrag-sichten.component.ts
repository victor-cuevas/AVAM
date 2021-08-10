import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from '@shared/services/navigation-service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { filter, takeUntil } from 'rxjs/operators';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { BaseResponseWrapperMutationsAntragBfsDTOWarningMessages } from '@dtos/baseResponseWrapperMutationsAntragBfsDTOWarningMessages';
import { MutationsAntragBfsDTO } from '@dtos/mutationsAntragBfsDTO';
import { MessageBus } from '@shared/services/message-bus';
import { StesFormNumberEnum as FormNumber } from '@shared/enums/stes-form-number.enum';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormUtilsService, GenericConfirmComponent, ToolboxService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { BFSAntragsStatusCode } from '@shared/enums/domain-code/bfs-antrag-status-code.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';

@Component({
    selector: 'avam-mutationsantrag-sichten',
    templateUrl: './mutationsantrag-sichten.component.html',
    styleUrls: ['./mutationsantrag-sichten.component.scss']
})
export class MutationsantragSichtenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    mutationId: string;
    unternehmenId: string;
    autosuggestForm: FormGroup;
    mutationDTO: MutationsAntragBfsDTO;
    mutationsAntragChannel = 'mutationsAntragChannel';

    public permissions: typeof Permissions = Permissions;
    checkIsStatusBentwortet = true;

    prependFooterMethod: any;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private messageBus: MessageBus,
        private formUtils: FormUtilsService,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private navigationService: NavigationService,
        private infopanelService: AmmInfopanelService,
        private dataService: UnternehmenRestService,
        private stesDataService: StesDataRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private modalService: NgbModal,
        private notificationService: NotificationService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.getRouteParams();
        this.createForm();
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.mutationsantrag' });
        this.subscribeOnCloseNavItem();

        this.prependFooterMethod = this.prependFooterOnTop.bind(this);
        window.addEventListener('beforeprint', this.prependFooterMethod);
    }

    public ngAfterViewInit(): void {
        this.getData();
    }

    public ngOnDestroy(): void {
        window.removeEventListener('beforeprint', this.prependFooterMethod);
        super.ngOnDestroy();
    }

    public cancel(): void {
        this.fehlermeldungenService.closeMessage();
        this.router.navigate(['../'], { relativeTo: this.route });
        this.closeSideNavigation();
    }

    public ConfirmationStatusBeantworten() {
        this.openConfirmationStatusBeantworten(GenericConfirmComponent);
    }

    public openConfirmationStatusBeantworten(content) {
        const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.beantworten();
            }
        });
        modalRef.componentInstance.titleLabel = 'unternehmen.button.mutationsantragbeantworten';
        modalRef.componentInstance.promptLabel = 'common.label.statusMutationsantragToBeantwortet';
        modalRef.componentInstance.primaryButton = 'common.button.JaBeantworten';
        modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
    }

    public beantworten(): void {
        this.spinnerService.activate(this.mutationsAntragChannel);
        this.dataService
            .postMutationsAntrageBeantwortet(this.unternehmenId, this.mutationId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperMutationsAntragBfsDTOWarningMessages) => {
                    if (!!response.data) {
                        this.mutationDTO = response.data;
                        this.checkStatus(this.mutationDTO.mutationsAntragStatusObject);
                        this.notificationService.success('unternehmen.feedback.mutationbeantwortet');
                    }
                    this.spinnerService.deactivate(this.mutationsAntragChannel);
                },
                () => this.spinnerService.deactivate(this.mutationsAntragChannel)
            );
    }

    private getRouteParams(): void {
        this.route.parent.params.subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });

        this.route.queryParamMap.subscribe(params => {
            this.mutationId = params.get('mutationsAntragId');
            this.navigationService.showNavigationTreeRoute('./mutationsantraege/bearbeiten', { mutationsAntragId: this.mutationId });
        });
    }

    private getData(): void {
        this.spinnerService.activate(this.mutationsAntragChannel);
        this.dataService
            .getMutationAntrag(this.unternehmenId, this.mutationId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperMutationsAntragBfsDTOWarningMessages) => {
                    this.mutationDTO = response.data;
                    this.checkStatus(this.mutationDTO.mutationsAntragStatusObject);
                    this.configureInfoleiste();
                    this.configureToolbox();
                    this.setFormValue();
                    this.spinnerService.deactivate(this.mutationsAntragChannel);
                },
                () => this.spinnerService.deactivate(this.mutationsAntragChannel)
            );
    }

    private createForm(): void {
        this.autosuggestForm = this.fb.group({
            ansprechperson: null
        });
    }

    private setFormValue(): void {
        this.autosuggestForm.controls.ansprechperson.setValue(this.mutationDTO.ansprechpersonAvamObject);
    }

    private configureInfoleiste(): void {
        this.infopanelService.sendLastUpdate({}, true);
        this.infopanelService.updateInformation({
            subtitle: `${this.translateService.instant('unternehmen.label.mutationsantrag')} ${this.formUtils.formatDateNgx(
                this.mutationDTO.erfasstAm,
                FormUtilsService.GUI_DATE_FORMAT
            )}`
        });
    }

    private configureToolbox(): void {
        ToolboxService.CHANNEL = this.mutationsAntragChannel;
        this.toolboxService.sendConfiguration(ToolboxConfig.getMutationsAntragConfig(), this.mutationsAntragChannel);
        const formNumber = this.mutationDTO.neuerfassung ? FormNumber.MUTATION_NEU_ERFASSUNG : FormNumber.DETAIL_MUTATION;
        this.messageBus.buildAndSend('toolbox.help.formNumber', formNumber);
        this.messageBus.buildAndSend('footer-infos.formNumber', { formNumber });
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(PrintHelper.print);
    }

    private checkStatus(item: CodeDTO): void {
        this.checkIsStatusBentwortet =
            item.code === BFSAntragsStatusCode.BEANTWORTET || item.code === BFSAntragsStatusCode.BEANTWORTET2 || item.code === BFSAntragsStatusCode.BEANTWORTET3;
    }

    private closeSideNavigation() {
        this.navigationService.hideNavigationTreeRoute('./mutationsantraege/bearbeiten');
    }

    private subscribeOnCloseNavItem(): Subscription {
        return this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
    }

    private closeComponent(message) {
        if (message.data.label === this.translateService.instant(UnternehmenSideNavLabels.MUTATIONSANTRAG)) {
            this.cancel();
        }
    }

    private prependFooterOnTop() {
        const footer: HTMLElement = document.querySelector('.footer-item-logo').cloneNode(true) as HTMLElement;
        document.querySelector('.application-footer').classList.add('hide-application-footer-on-print');
        footer.classList.add('print-footer');
        footer.classList.add('d-none');
        document.querySelector('.h-100.default-layout').prepend(footer);
    }
}

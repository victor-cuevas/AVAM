import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from '@shared/services/navigation-service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { BeschaeftigterBerufDTO } from '@dtos/beschaeftigterBerufDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { CodeDTO } from '@dtos/codeDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';
import { UnternehmenSideNavLabels as NavLabels } from '@shared/enums/stes-routing-labels.enum';
import { ArbeitsForm } from '@shared/enums/arbeitgeber-arbeitsform.enum';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { forkJoin, of } from 'rxjs';
import { BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages } from '@dtos/baseResponseWrapperBeschaeftigterBerufDTOWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseResponseWrapperObjectWarningMessages } from '@dtos/baseResponseWrapperObjectWarningMessages';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';

@Component({
    selector: 'avam-beruftaetigkeit-erfassen-bearbeiten',
    templateUrl: './beruftaetigkeit-erfassen-bearbeiten.component.html',
    styleUrls: ['./beruftaetigkeit-erfassen-bearbeiten.component.scss']
})
export class BeruftaetigkeitErfassenBearbeitenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    beruftaetigkeitForm: FormGroup;
    channel = 'beruftaetigkeitErfassenChannel';
    permissions: typeof Permissions = Permissions;

    private unternehmenId: string;
    private beschaeftigterBerufId: string;
    private besondereArbeitsformen: CodeDTO[];
    private beschaeftigterBerufDTO: BeschaeftigterBerufDTO;
    private erfassenNavigationRoute = './berufe-taetigkeit/erfassen';
    private bearbeitenNavigationRoute = './berufe-taetigkeit/bearbeiten';

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private messageBus: MessageBus,
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private activatedRoute: ActivatedRoute,
        private translateService: TranslateService,
        private restService: UnternehmenRestService,
        private navigationService: NavigationService,
        private infopanelService: AmmInfopanelService,
        private resetDialogService: ResetDialogService,
        private stesDataRestService: StesDataRestService,
        private notificationService: NotificationService,
        private fehlermeldungenService: FehlermeldungenService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.getRouteParams();
        this.setSideNav();
        this.initForm();
        this.configureToolbox();
        this.setSubscriptions();
    }

    public ngAfterViewInit(): void {
        this.beruftaetigkeitForm.controls.berufTaetigkeit.updateValueAndValidity();
        this.getInitialData();
    }

    public ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    public canDeactivate(): boolean {
        return this.beruftaetigkeitForm.dirty;
    }

    public cancel(): void {
        this.hideSideNav();
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    }

    public reset(): void {
        if (this.beruftaetigkeitForm.dirty) {
            this.fehlermeldungenService.closeMessage();
            this.resetDialogService.reset(() => {
                this.beschaeftigterBerufId ? this.mapToForm() : this.beruftaetigkeitForm.reset();
                this.beruftaetigkeitForm.markAsPristine();
                this.beruftaetigkeitForm.markAsUntouched();
                this.beruftaetigkeitForm.updateValueAndValidity();
            });
        }
    }

    public openDeleteDialog(): void {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    public save(): void {
        this.fehlermeldungenService.closeMessage();
        if (this.beruftaetigkeitForm.valid) {
            this.spinnerService.activate(this.channel);
            const restService = this.beschaeftigterBerufDTO
                ? this.restService.updateBeschaeftigterBeruf(this.mapToDTO(), this.beschaeftigterBerufDTO.berufId, this.translateService.currentLang)
                : this.restService.saveBeschaeftigterBeruf(this.mapToDTO(), this.translateService.currentLang);
            restService.pipe(takeUntil(this.unsubscribe)).subscribe(
                (response: BaseResponseWrapperObjectWarningMessages) => {
                    this.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                    if (response.data) {
                        this.hideSideNav();
                        this.beruftaetigkeitForm.markAsPristine();
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        if (this.beschaeftigterBerufDTO) {
                            this.beschaeftigterBerufDTO = response.data;
                            this.mapToForm();
                        } else {
                            this.router.navigate(['../bearbeiten'], { queryParams: { beschaeftigterBerufId: response.data }, relativeTo: this.activatedRoute });
                        }
                    }
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    private mapToDTO(): BeschaeftigterBerufDTO {
        const berufObject = this.beruftaetigkeitForm.controls.berufTaetigkeit.value ? this.beruftaetigkeitForm.controls.berufTaetigkeit['berufAutosuggestObject'] : null;
        const besondereArbeitsFormenSet = [];
        this.besondereArbeitsformen.forEach((value: CodeDTO) => {
            if (
                (value.code === ArbeitsForm.SONNFEIERTAGSARBEIT_CODE && this.beruftaetigkeitForm.controls.sonnfeiertagsarbeit.value) ||
                (value.code === ArbeitsForm.SCHICHTARBEIT_CODE && this.beruftaetigkeitForm.controls.schichtarbeit.value) ||
                (value.code === ArbeitsForm.NACHTARBEIT_CODE && this.beruftaetigkeitForm.controls.nachtarbeit.value) ||
                (value.code === ArbeitsForm.HEIMARBEIT_CODE && this.beruftaetigkeitForm.controls.heimarbeit.value)
            ) {
                besondereArbeitsFormenSet.push(value.codeId);
            }
        });

        return {
            unternehmenId: +this.unternehmenId,
            beschaeftigterberufId: this.beschaeftigterBerufId ? +this.beschaeftigterBerufId : null,
            vollzeit: this.beruftaetigkeitForm.controls.vollzeit.value,
            teilzeit: this.beruftaetigkeitForm.controls.teilzeit.value,
            temporaer: this.beruftaetigkeitForm.controls.temporaer.value,
            lehrstellen: this.beruftaetigkeitForm.controls.lehrstellen.value,
            praktikumstellen: this.beruftaetigkeitForm.controls.praktikumstellen.value,
            monatslohn: this.beruftaetigkeitForm.controls.monatslohn.value,
            stundenlohn: this.beruftaetigkeitForm.controls.stundenlohn.value,
            akkordlohn: this.beruftaetigkeitForm.controls.akkordlohn.value,
            provision: this.beruftaetigkeitForm.controls.provision.value,
            bemerkungen: this.beruftaetigkeitForm.controls.angaben.value,
            arbeitsformen: besondereArbeitsFormenSet,
            berufObject
        };
    }

    private mapToForm(): void {
        this.beruftaetigkeitForm.patchValue({
            sonnfeiertagsarbeit: this.includesCodeId(ArbeitsForm.SONNFEIERTAGSARBEIT_CODE),
            schichtarbeit: this.includesCodeId(ArbeitsForm.SCHICHTARBEIT_CODE),
            nachtarbeit: this.includesCodeId(ArbeitsForm.NACHTARBEIT_CODE),
            heimarbeit: this.includesCodeId(ArbeitsForm.HEIMARBEIT_CODE),
            vollzeit: this.beschaeftigterBerufDTO.vollzeit,
            teilzeit: this.beschaeftigterBerufDTO.teilzeit,
            temporaer: this.beschaeftigterBerufDTO.temporaer,
            lehrstellen: this.beschaeftigterBerufDTO.lehrstellen,
            praktikumstellen: this.beschaeftigterBerufDTO.praktikumstellen,
            monatslohn: this.beschaeftigterBerufDTO.monatslohn,
            stundenlohn: this.beschaeftigterBerufDTO.stundenlohn,
            akkordlohn: this.beschaeftigterBerufDTO.akkordlohn,
            provision: this.beschaeftigterBerufDTO.provision,
            angaben: this.beschaeftigterBerufDTO.bemerkungen,
            berufTaetigkeit: this.beschaeftigterBerufDTO.berufObject
        });
        this.beruftaetigkeitForm.updateValueAndValidity();
    }

    private includesCodeId(code: string): boolean {
        return this.beschaeftigterBerufDTO.arbeitsformen.includes(this.besondereArbeitsformen.find((value: CodeDTO) => value.code === code).codeId);
    }

    private delete(): void {
        this.spinnerService.activate(this.channel);
        this.restService
            .deleteBeschaeftigterBeruf(this.beschaeftigterBerufId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages) => {
                    if (!response.warning) {
                        OrColumnLayoutUtils.scrollTop();
                        this.spinnerService.deactivate(this.channel);
                        this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                        this.beruftaetigkeitForm.markAsPristine();
                        this.cancel();
                    }
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    private getRouteParams(): void {
        this.activatedRoute.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
            }
        });

        this.activatedRoute.queryParamMap.subscribe(params => {
            if (params.get('beschaeftigterBerufId')) {
                this.beschaeftigterBerufId = params.get('beschaeftigterBerufId');
            }
        });
    }

    private setSideNav(): void {
        if (this.beschaeftigterBerufId) {
            this.navigationService.showNavigationTreeRoute(this.bearbeitenNavigationRoute, { beschaeftigterBerufId: this.beschaeftigterBerufId }); // bearbeiten
            this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.label.beruf' });
        } else {
            this.navigationService.showNavigationTreeRoute(this.erfassenNavigationRoute); // erfassen
            this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.oste.label.beruftaetigkeiterfassen' });
        }
    }

    private hideSideNav(): void {
        if (this.beschaeftigterBerufId) {
            this.navigationService.hideNavigationTreeRoute(this.bearbeitenNavigationRoute, { beschaeftigterBerufId: this.beschaeftigterBerufId }); // bearbeiten
        } else {
            this.navigationService.hideNavigationTreeRoute(this.erfassenNavigationRoute); // erfassen
        }
    }

    private initForm(): void {
        this.beruftaetigkeitForm = this.fb.group({
            berufTaetigkeit: [null, [Validators.required]],
            sonnfeiertagsarbeit: false,
            schichtarbeit: false,
            nachtarbeit: false,
            heimarbeit: false,
            vollzeit: false,
            teilzeit: false,
            temporaer: false,
            praktikumstellen: false,
            lehrstellen: false,
            monatslohn: false,
            stundenlohn: false,
            akkordlohn: false,
            provision: false,
            angaben: null
        });
    }

    private configureToolbox(): void {
        ToolboxService.CHANNEL = this.channel;
        const toolboxConfig = this.beschaeftigterBerufId ? ToolboxConfig.getBerufTaetigkeitBearbeitenConfig() : ToolboxConfig.getBerufTaetigkeitErfassenConfig();
        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, ToolboxDataHelper.createForArbeitgeber(+this.unternehmenId));
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.beschaeftigterBerufId, AvamCommonValueObjectsEnum.T_BESCHAEFTIGTER_BERUF);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });
    }

    private openDmsCopyModal(): void {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_UNTERNEHMENARBEITGEBER;
        comp.id = this.unternehmenId;
    }

    private openHistoryModal(objId: string, objType: string): void {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private setSubscriptions(): void {
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
    }

    public closeComponent(message): void {
        if (message.data.label === this.translateService.instant(this.beschaeftigterBerufId ? NavLabels.BERUFE_TAETIGKEIT_BEARBEITEN : NavLabels.BERUFE_TAETIGKEIT_ERFASSEN)) {
            this.cancel();
        }
    }

    private getInitialData(): void {
        this.spinnerService.activate(this.channel);
        const initialDataObservables = forkJoin<CodeDTO[], BaseResponseWrapperBeschaeftigterBerufDTOWarningMessages>([
            this.stesDataRestService.getCode(DomainEnum.ARBEITSFORM),
            this.beschaeftigterBerufId ? this.restService.getBeschaeftigterBeruf(this.beschaeftigterBerufId) : of(null)
        ]);

        initialDataObservables.pipe(takeUntil(this.unsubscribe)).subscribe(
            ([arbeitsForm, beschaeftigterBerufData]) => {
                this.spinnerService.deactivate(this.channel);
                if (arbeitsForm && arbeitsForm.length) {
                    this.besondereArbeitsformen = arbeitsForm;
                }
                if (beschaeftigterBerufData && beschaeftigterBerufData.data) {
                    this.beschaeftigterBerufDTO = beschaeftigterBerufData.data;
                    this.mapToForm();
                }
            },
            () => this.spinnerService.deactivate(this.channel)
        );
    }
}

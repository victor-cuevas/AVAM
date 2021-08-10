import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Unsubscribable } from 'oblique-reactive';
import { FormUtilsService, GenericConfirmComponent, ToolboxService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { DateValidator } from '@shared/validators/date-validator';
import { InfoMessageDTO } from '@dtos/infoMessageDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { WarningMessages } from '@dtos/warningMessages';
import KeyEnum = WarningMessages.KeyEnum;
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InfoMessageRestService } from '@core/http/info-message-rest.service';
import { BaseResponseWrapperInfoMessageDTOWarningMessages } from '@dtos/baseResponseWrapperInfoMessageDTOWarningMessages';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AmmValidators } from '@shared/validators/amm-validators';

@Component({
    selector: 'avam-informationsmeldung-erfassen-bearbeiten',
    templateUrl: './informationsmeldung-erfassen-bearbeiten.component.html',
    styleUrls: ['./informationsmeldung-erfassen-bearbeiten.component.scss']
})
export class InformationsmeldungErfassenBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    channel: 'InformationsmeldungErfassenBearbeiten';
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('infobartemplate') infobartemplate: TemplateRef<any>;
    meldungForm: FormGroup;
    isBearbeiten = false;
    infomeldungDTO: InfoMessageDTO;
    navigateToSearch: any;

    constructor(
        private obliqueHelper: ObliqueHelperService,
        private infoMessageRestService: InfoMessageRestService,
        private fb: FormBuilder,
        private facadeService: FacadeService,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private formUtils: FormUtilsService,
        public modalService: NgbModal
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
        this.navigateToSearch = this.router.getCurrentNavigation().extras.state && this.router.getCurrentNavigation().extras.state.navigateToSearch;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.isBearbeiten = this.activatedRoute.snapshot.queryParams.meldungId ? true : false;
        this.infopanelService.updateInformation({
            title: this.isBearbeiten ? 'informationen.topmenuitem.informationsmekdungenbearbeiten' : 'verzeichnisse.topnavmenuitem.informationsmeldungerfassen',
            subtitle: '',
            hideInfobar: this.isBearbeiten ? false : true
        });
        this.generateForm();
        this.configureToolbox();
    }

    ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.infopanelService.updateInformation({ title: '', hideInfobar: true });
        this.infopanelService.resetTemplateInInfobar();
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    ngAfterViewInit(): void {
        if (this.isBearbeiten) {
            this.getData();
        }
    }

    navigateHome() {
        if (this.navigateToSearch) {
            this.router.navigate(['/informationen/informationsmeldungen/meldungen/suchen']);
        } else {
            this.router.navigate(['/home']);
        }
    }

    reset() {
        if (this.meldungForm.dirty) {
            this.facadeService.resetDialogService.reset(() => {
                this.ngForm.reset();
                if (this.isBearbeiten) {
                    this.mapToForm(this.infomeldungDTO);
                }
            });
        }
    }

    save() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.meldungForm.valid) {
            this.facadeService.spinnerService.activate(this.channel);
            if (!this.isBearbeiten) {
                this.infoMessageRestService
                    .createSystemmeldung(this.mapToDTO())
                    .pipe(
                        takeUntil(this.unsubscribe),
                        finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
                    )
                    .subscribe((response: BaseResponseWrapperLongWarningMessages) => {
                        if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key === KeyEnum.DANGER).length) {
                            this.facadeService.notificationService.success('common.message.datengespeichert');
                            this.meldungForm.markAsPristine();
                            this.router.navigate([`../bearbeiten`], {
                                queryParams: { meldungId: response.data },
                                relativeTo: this.activatedRoute
                            });
                        }
                    });
            } else {
                this.update();
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    update() {
        this.infoMessageRestService
            .updateSystemmeldung(this.mapToDTO())
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe((response: BaseResponseWrapperInfoMessageDTOWarningMessages) => {
                if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key === KeyEnum.DANGER).length) {
                    this.facadeService.notificationService.success('common.message.datengespeichert');
                    this.infomeldungDTO = response.data;
                    this.meldungForm.markAsPristine();
                    this.infopanelService.sendTemplateToInfobar(this.infobartemplate);
                    this.infopanelService.sendLastUpdate(response.data);
                }
            });
    }

    delete() {
        this.facadeService.spinnerService.activate(this.channel);
        this.infoMessageRestService
            .delete(this.activatedRoute.snapshot.queryParams.meldungId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                })
            )
            .subscribe(response => {
                if (!response.warning || !response.warning.filter((warningMessage: WarningMessages) => warningMessage.key === KeyEnum.DANGER).length) {
                    this.facadeService.notificationService.success('common.message.datengeloescht');
                    this.router.navigate([`../suchen`], { relativeTo: this.activatedRoute });
                }
            });
    }

    canDeactivate() {
        return this.meldungForm.dirty;
    }

    openDeleteModalConfirmation(): void {
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

    private configureToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getInformationsmeldungenErfassenConfig(), ToolboxService.CHANNEL);
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(
                takeUntil(this.unsubscribe),
                filter(action => action.message.action === ToolboxActionEnum.PRINT)
            )
            .subscribe(PrintHelper.print);
    }

    private generateForm() {
        this.meldungForm = this.fb.group(
            {
                meldungstextdeutsch: [null, Validators.maxLength(512)],
                meldungstextfranzoesisch: [null, Validators.maxLength(512)],
                meldungstextitalienisch: [null, Validators.maxLength(512)],
                gueltigVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                gueltigBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
            },
            {
                validators: [
                    DateValidator.rangeBetweenDates('gueltigVon', 'gueltigBis', 'val201'),
                    AmmValidators.atLeastOneRequiredWithMoreThenOneValidator('meldungstextdeutsch', 'meldungstextfranzoesisch', 'meldungstextitalienisch')
                ]
            }
        );
    }

    private mapToDTO(): InfoMessageDTO {
        const meldungControls = this.meldungForm.controls;
        const dto: InfoMessageDTO = {
            messageDe: meldungControls.meldungstextdeutsch.value,
            messageFr: meldungControls.meldungstextfranzoesisch.value,
            messageIt: meldungControls.meldungstextitalienisch.value,
            gueltigAb: meldungControls.gueltigVon.value,
            gueltigBis: meldungControls.gueltigBis.value
        };
        if (this.isBearbeiten) {
            dto.infomessageId = this.infomeldungDTO.infomessageId;
            dto.ojbVersion = this.infomeldungDTO.ojbVersion;
        }
        return dto;
    }

    private mapToForm(dto: InfoMessageDTO) {
        this.meldungForm.patchValue({
            meldungstextdeutsch: dto.messageDe,
            meldungstextfranzoesisch: dto.messageFr,
            meldungstextitalienisch: dto.messageIt,
            gueltigVon: this.formUtils.parseDate(dto.gueltigAb),
            gueltigBis: this.formUtils.parseDate(dto.gueltigBis)
        });
        this.meldungForm.controls.meldungstextdeutsch.updateValueAndValidity();
    }

    private getData() {
        this.facadeService.spinnerService.activate(this.channel);
        this.infoMessageRestService
            .getById(this.activatedRoute.snapshot.queryParams.meldungId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    OrColumnLayoutUtils.scrollTop();
                })
            )
            .subscribe((response: BaseResponseWrapperInfoMessageDTOWarningMessages) => {
                this.mapToForm(response.data);
                this.infomeldungDTO = response.data;
                this.infopanelService.sendTemplateToInfobar(this.infobartemplate);
                this.infopanelService.sendLastUpdate(response.data);
            });
    }
}

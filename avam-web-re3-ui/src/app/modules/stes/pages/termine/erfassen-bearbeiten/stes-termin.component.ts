import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericConfirmComponent, TerminAngabenFormComponent, ToolboxService } from 'src/app/shared';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { StesTerminDetailsDTO } from '@shared/models/dtos-generated/stesTerminDetailsDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { first, takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesTerminRestService } from '@core/http/stes-termin-rest.service';
import { ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { HttpResponse } from '@angular/common/http';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { StesTerminTeilnehmerInternDTO } from '@shared/models/dtos-generated/stesTerminTeilnehmerInternDTO';
import { StesTerminTeilnehmerExternDTO } from '@shared/models/dtos-generated/stesTerminTeilnehmerExternDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { StesTerminePaths } from '@shared/enums/stes-navigation-paths.enum';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { buildStesPath } from '@shared/services/build-route-path.function';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HttpResponseHelper } from '@shared/helpers/http-response.helper';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { MessageBus } from '@shared/services/message-bus';
import * as moment from 'moment';
import { TerminArtCodeEnum } from '@app/shared/enums/domain-code/termin-art-code.enum';
import { TerminStatusCodeEnum } from '@app/shared/enums/domain-code/termin-status-code.enum';
import { UserValidator } from '@shared/validators/autosuggest-validator';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import PrintHelper from '@shared/helpers/print.helper';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { BenutzerDetailDTO } from '@shared/models/dtos-generated/benutzerDetailDTO';
import { StesTermineLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { TerminUebertragenComponent } from '@shared/components/termin-uebertragen/termin-uebertragen.component';
import { TeilnehmerFormComponent } from '@stes/pages/termine/teilnehmer-form/teilnehmer-form.component';
import { FacadeService } from '@shared/services/facade.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';

@Component({
    selector: 'app-stes-termin',
    templateUrl: './stes-termin.component.html',
    providers: [ObliqueHelperService]
})
export class StesTerminComponent extends AbstractBaseForm implements OnInit, OnDestroy {
    terminChannel = 'termin';
    additionalInfo: FormControl;
    formNumber = null;
    teilnehmerIntern: StesTerminTeilnehmerInternDTO[] = [];
    teilnehmerExtern: StesTerminTeilnehmerExternDTO[] = [];

    terminArtOptions: any;
    terminStatusOptions: any;
    isBearbeiten: boolean;
    permissions: typeof Permissions = Permissions;

    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('angabenForm') angabenForm: TerminAngabenFormComponent;
    @ViewChild('interneTeilnehmerForm') interneTeilnehmerForm: TeilnehmerFormComponent;
    @ViewChild('externeTeilnehmerForm') externeTeilnehmerForm: TeilnehmerFormComponent;
    @ViewChild('modalTerminUebertragen') modalTerminUebertragen: TerminUebertragenComponent;

    public onInitTeilnehmerNumber: number;
    private currentInternTeilnehmer = 0;
    private updateTerminDTO: StesTerminDetailsDTO = {};
    private stesId: string;
    private terminId: string;
    private terminData: StesTerminDetailsDTO = null;
    private path: string;
    private observeClickActionSub: Subscription;
    private stesTermineToolboxId = 'stesTermin';
    private currentUser: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
    private keepMessages = false;
    private beraterDetail: BenutzerDetailDTO;
    private closeSideNav: Subscription;

    constructor(
        private readonly notificationService: NotificationService,
        toolboxService: ToolboxService,
        private router: Router,
        private route: ActivatedRoute,
        private dataService: StesDataRestService,
        private terminRestService: StesTerminRestService,
        spinnerService: SpinnerService,
        modalService: NgbModal,
        fehlermeldungenService: FehlermeldungenService,
        messageBus: MessageBus,
        private obliqueHelperService: ObliqueHelperService,
        private stesInfobarService: AvamStesInfoBarService,
        private facadeService: FacadeService,
        private interactionService: StesComponentInteractionService
    ) {
        super('termin', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
        SpinnerService.CHANNEL = this.terminChannel;
        ToolboxService.CHANNEL = this.terminChannel;
    }

    getData(): void {
        // implemented in ngOnInit
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesTermine.bearbeiten' });
        this.additionalInfo = new FormControl([null]);
        this.route.data.subscribe(data => {
            if (data.formNumber === StesFormNumberEnum.TERMIN_ERFASSEN) {
                this.path = StesTerminePaths.TERMINERFASSEN;
                this.toolboxService.sendConfiguration(ToolboxConfig.getStesTerminerfassenConfig(), this.stesTermineToolboxId);
                this.isBearbeiten = false;
            } else if (data.formNumber === StesFormNumberEnum.TERMIN_BEARBEITEN) {
                this.path = StesTerminePaths.TERMINBEARBEITEN;
                this.route.queryParamMap.subscribe(params => {
                    this.terminId = params.get('terminId');
                    this.toolboxService.sendConfiguration(
                        ToolboxConfig.getStesTerminbearbeitenConfig(),
                        this.stesTermineToolboxId,
                        ToolboxDataHelper.createForStesTermin(this.terminId)
                    );
                });
                this.isBearbeiten = true;
            }
            this.formNumber = data.formNumber;
        });
        this.stesId = this.route.parent.snapshot.paramMap.get('stesId');
        this.facadeService.navigationService.showNavigationTreeRoute(this.path, { terminId: this.terminId });
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.terminId, AvamCommonValueObjectsEnum.T_STES_TERMIN);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal();
            }
        });
        this.initControls();
        this.closeSideNav = this.messageBus.getData().subscribe(message => {
            if (
                message.type === 'close-nav-item' &&
                message.data &&
                message.data.label &&
                ((message.data.label === this.facadeService.translateService.instant(StesTermineLabels.TERMINERFASSEN) && !this.isBearbeiten) ||
                    (message.data.label === this.facadeService.translateService.instant(StesTermineLabels.TERMINBEARBEITEN) && this.isBearbeiten))
            ) {
                this.closeComponent(message);
            }
        });

        this.facadeService.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(event => {
                this.stesInfobarService.sendDataToInfobar({ title: this.updateTitle() });
            });
    }

    closeComponent(message) {
        if (
            message.data.label === this.facadeService.translateService.instant(StesTermineLabels.TERMINBEARBEITEN) ||
            message.data.label === this.facadeService.translateService.instant(StesTermineLabels.TERMINERFASSEN)
        ) {
            this.cancel();
        }
    }

    /**
     * is business object present
     */
    isBoPresent(): boolean {
        return !!this.terminId;
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_TERMIN;
        comp.id = this.terminId;
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.sendLastUpdate({}, true);
        this.observeClickActionSub.unsubscribe();
        this.facadeService.authenticationService.removeOwnerPermissionContext();
        this.messageBus.buildAndSend('stes-details-content', { ueberschriftAddition: null });
        if (!this.keepMessages) {
            this.fehlermeldungenService.closeMessage();
        }
        if (!this.isBearbeiten) {
            this.hideNavItem();
        }
        super.ngOnDestroy();
    }

    initControls() {
        forkJoin<any[], any[], any>(
            this.dataService.getCode(DomainEnum.TERMINART),
            this.dataService.getCode(DomainEnum.TERMINSTATUS),
            this.dataService.getGrunddatenBearbeiten(this.stesId)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(([terminArt, terminStatus, data]) => {
                this.terminArtOptions = terminArt;
                this.terminStatusOptions = terminStatus;

                if (this.formNumber === StesFormNumberEnum.TERMIN_BEARBEITEN) {
                    this.getTerminData();
                } else if (this.formNumber === StesFormNumberEnum.TERMIN_ERFASSEN) {
                    if (data.data) {
                        this.beraterDetail = data.data.personalberater;
                    }
                    this.setErfassenData();
                }
            });
    }

    getTerminData() {
        this.spinnerService.activate(SpinnerService.CHANNEL);
        this.terminRestService
            .getTerminById(this.stesId, this.facadeService.translateService.currentLang, this.terminId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                termin => {
                    this.spinnerService.deactivate(SpinnerService.CHANNEL);
                    this.terminData = termin.data;
                    this.facadeService.authenticationService.setOwnerPermissionContext(this.terminData.stesId, this.terminData.ownerId);
                    this.updateInfoleiste();
                    this.setBearbeitenData();
                },
                () => {
                    this.spinnerService.deactivate(SpinnerService.CHANNEL);
                }
            );
    }

    setStesBerater() {
        if (this.beraterDetail) {
            this.interneTeilnehmerForm.setInternTeilnehmer(this.beraterDetail, true, 0);
            this.interneTeilnehmerForm.updateTeilnehmerSelected(0);
            this.onInitTeilnehmerNumber = 1;
        }
    }

    setErfassenData() {
        this.initOptions();
        this.angabenForm.resetForm();
        this.angabenForm.art = Number(this.facadeService.formUtilsService.getCodeIdByCode(this.terminArtOptions, TerminArtCodeEnum.BERATUNGSGESPRRAECH));
        this.angabenForm.status = Number(this.facadeService.formUtilsService.getCodeIdByCode(this.terminStatusOptions, TerminStatusCodeEnum.GEPLANT));
        this.setStesBerater();
        const exactUser = this.currentUser.userDto.benutzerstelleList.find(v => this.currentUser.userDto.benutzerstelleCode === v.benutzerstelleCode);
        let ortLocale = `benutzerstelleName${this.facadeService.translateService.currentLang[0].toUpperCase()}${this.facadeService.translateService.currentLang[1]}`;
        this.angabenForm.ort = exactUser[ortLocale];
        this.facadeService.translateService.onLangChange.subscribe(() => {
            ortLocale = `benutzerstelleName${this.facadeService.translateService.currentLang[0].toUpperCase()}${this.facadeService.translateService.currentLang[1]}`;
            this.angabenForm.ort = exactUser[ortLocale];
        });
    }

    updateTitle(): string {
        let screenTitle = this.facadeService.translateService.instant('stes.subnavmenuitem.stesTermine.bearbeiten');
        screenTitle = `${screenTitle} ${moment(this.terminData.beginn).format('DD.MM.YYYY')} `;
        return screenTitle;
    }

    setBearbeitenData() {
        // Set angaben form
        this.initOptions();
        this.angabenForm.art = this.terminData.art.codeId;
        this.angabenForm.datum = this.terminData.beginn;
        this.angabenForm.zeitVon = moment(this.terminData.beginn).format('HH:mm');
        this.angabenForm.zeitBis = moment(this.terminData.ende).format('HH:mm');
        this.angabenForm.status = this.terminData.status.codeId;
        this.angabenForm.ort = this.terminData.ort;
        this.angabenForm.betreff = this.terminData.betreff;
        this.additionalInfo.setValue(this.terminData.angaben);
        this.stesInfobarService.sendDataToInfobar({ title: this.updateTitle() });
        this.messageBus.buildAndSend('stes-details-content', { ueberschriftAddition: moment(this.terminData.beginn).format('DD.MM.YYYY') });
        this.onInitTeilnehmerNumber = this.terminData.teilnehmerInternList.length;
        // Set interne teilnehmer form
        this.terminData.teilnehmerInternList.forEach((teilnehmer, index) => {
            this.interneTeilnehmerForm.setInternTeilnehmer(teilnehmer.benutzerDetail, teilnehmer.kontaktperson, index);
        });
        // Set externe teilnehmer form
        this.terminData.teilnehmerExternList.forEach((teilnehmer, index) => {
            this.externeTeilnehmerForm.setExternTeilnehmer(teilnehmer, teilnehmer.kontaktperson, index);
        });

        //AVB-7776
        if (!this.terminData.teilnehmerInternList.length) {
            this.interneTeilnehmerForm.addTeilnehmer();
        }
    }

    uebertragen() {
        if (this.currentUser.userDto.terminUebertragenIcsDownload) {
            this.terminRestService
                .getStesTerminCalendar(this.stesId, this.terminId)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((resp: HttpResponse<Blob>) => HttpResponseHelper.openBlob(resp, 'text/calendar'));
        } else {
            this.modalService.open(this.modalTerminUebertragen, {
                ariaLabelledBy: 'modal-basic-title',
                windowClass: 'modal-md',
                backdrop: 'static',
                centered: true
            });
        }
    }

    delete() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.deleteNow();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    deleteNow() {
        this.fehlermeldungenService.closeMessage();

        this.updateForm();
        this.spinnerService.activate(this.terminChannel);
        this.terminRestService
            .deleteTermin(this.stesId, this.facadeService.translateService.currentLang, this.terminId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                () => {
                    this.spinnerService.deactivate(SpinnerService.CHANNEL);
                    this.notificationService.success('common.message.datengeloescht');
                    this.hideNavItem();
                    this.router.navigate([buildStesPath(this.stesId, StesTerminePaths.TERMINEANZEIGEN)]);
                },
                () => {
                    this.spinnerService.deactivate(SpinnerService.CHANNEL);
                }
            );
    }

    resetExterneTeilnehmerSelected() {
        this.externeTeilnehmerForm.cancelTeilnehmerSelected();
        this.resetInterneTeilnehmerValidations();
    }

    resetInterneTeilnehmerValidations() {
        const internTeilnehmerSelected = this.interneTeilnehmerForm.kontaktperson.findIndex(item => item === true);
        if (internTeilnehmerSelected !== -1) {
            const formField = this.interneTeilnehmerForm.teilnehmer.get(internTeilnehmerSelected.toString()).get('personalberater');
            formField.setValidators([Validators.required, UserValidator.val212, UserValidator.val052]);
            formField.updateValueAndValidity();
        }
    }

    resetExterneTeilnehmerValidations() {
        const externTeilnehmerSelected = this.externeTeilnehmerForm.kontaktperson.findIndex(item => item === true);
        if (externTeilnehmerSelected !== -1) {
            const existingExternalTeilnehmerVorname = this.externeTeilnehmerForm.teilnehmer.get(externTeilnehmerSelected.toString()).get('vorname');
            const existingExternalTeilnehmerName = this.externeTeilnehmerForm.teilnehmer.get(externTeilnehmerSelected.toString()).get('name');
            const existingExternalTeilnehmerStelle = this.externeTeilnehmerForm.teilnehmer.get(externTeilnehmerSelected.toString()).get('stelle');
            existingExternalTeilnehmerVorname.setValidators(Validators.required);
            existingExternalTeilnehmerName.setValidators(Validators.required);
            existingExternalTeilnehmerStelle.setValidators(Validators.required);
            existingExternalTeilnehmerVorname.updateValueAndValidity();
            existingExternalTeilnehmerName.updateValueAndValidity();
            existingExternalTeilnehmerStelle.updateValueAndValidity();
        }
    }

    resetInterneTeilnehmerSelected() {
        this.interneTeilnehmerForm.cancelTeilnehmerSelected();
        this.resetExterneTeilnehmerValidations();
    }

    reset() {
        this.fehlermeldungenService.closeMessage();

        if (
            this.angabenForm.angabenForm.dirty ||
            this.interneTeilnehmerForm.participantsForm.dirty ||
            this.externeTeilnehmerForm.participantsForm.dirty ||
            this.additionalInfo.dirty
        ) {
            this.facadeService.resetDialogService.reset(() => {
                this.updateForm();
            });
        } else {
            this.updateForm();
        }
    }

    /**
     * collects all information and updates the leiste
     */
    updateInfoleiste() {
        super.updateInfoleistePanel(this.stesInfobarService, this.terminData);
    }

    /**
     * does a reset and applies data if present
     */
    updateForm() {
        this.ngForm.resetForm();
        this.additionalInfo.reset();
        this.angabenForm.resetForm();
        this.interneTeilnehmerForm.resetForm();
        this.externeTeilnehmerForm.resetForm();

        if (this.formNumber === StesFormNumberEnum.TERMIN_BEARBEITEN) {
            this.setBearbeitenData();
        } else if (this.formNumber === StesFormNumberEnum.TERMIN_ERFASSEN) {
            this.setErfassenData();
        }
    }

    canDeactivate(): boolean {
        return (
            this.angabenForm.angabenForm.dirty ||
            this.interneTeilnehmerForm.participantsForm.dirty ||
            this.externeTeilnehmerForm.participantsForm.dirty ||
            this.additionalInfo.dirty
        );
    }

    cancel(): void {
        this.fehlermeldungenService.closeMessage();
        if (this.router.url.includes(this.path)) {
            if (!this.canDeactivate()) {
                this.hideNavItem();
            } else {
                this.checkConfirmationToCancel();
            }
            this.checkConfirmationToCancel();
            this.navigateToTermine();
        } else {
            this.hideNavItem();
        }
    }

    save(): void {
        this.fehlermeldungenService.closeMessage();

        if (this.angabenForm.angabenForm.valid && this.interneTeilnehmerForm.participantsForm.valid && this.externeTeilnehmerForm.participantsForm.valid) {
            this.spinnerService.activate(this.terminChannel);
            this.setTeilnehmerIntern();
            this.setTeilnehmerExtern();
            this.setUpdateParams();
            this.currentInternTeilnehmer = 0;

            if (this.formNumber === StesFormNumberEnum.TERMIN_BEARBEITEN) {
                this.updateTermin();
            } else {
                this.insertTermin();
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    updateTermin(): void {
        this.fehlermeldungenService.closeMessage();

        this.terminRestService
            .updateTermin(this.stesId, this.facadeService.translateService.currentLang, this.updateTerminDTO)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    if (!this.hasResponseWarningDanger(response.warning)) {
                        this.notificationService.success('common.message.datengespeichert');
                        this.terminData = response.data;

                        this.updateInfoleiste();
                        this.updateForm();
                    }
                    this.teilnehmerIntern = [];
                    this.teilnehmerExtern = [];
                    this.restoreView();
                },
                () => {
                    this.spinnerService.deactivate(this.terminChannel);
                }
            );
    }

    insertTermin(): void {
        this.terminRestService
            .insertTermin(this.stesId, this.facadeService.translateService.currentLang, this.updateTerminDTO)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    if (!this.hasResponseWarningDanger(response.warning)) {
                        this.notificationService.success('common.message.datengespeichert');
                        this.terminId = response.data;
                        this.angabenForm.angabenForm.markAsPristine();
                        this.updateForm();
                        // signal do not clear possible errors/warnings on component destroy before navigating
                        this.keepMessages = true;
                        this.router.navigate([buildStesPath(this.stesId, StesTerminePaths.TERMINBEARBEITEN)], { queryParams: { terminId: this.terminId } });
                    }
                    this.teilnehmerIntern = [];
                    this.teilnehmerExtern = [];
                    this.restoreView();
                },
                () => {
                    this.spinnerService.deactivate(this.terminChannel);
                }
            );
    }

    hasResponseWarningDanger(warning: any[]): boolean {
        let hasDanger = false;
        if (warning !== null) {
            warning.forEach(auxWarning => {
                if (auxWarning.key === 'DANGER') {
                    hasDanger = true;
                }
            });
        }
        return hasDanger;
    }

    setUpdateParams(): void {
        this.updateTerminDTO.stesId = this.terminData ? this.terminData.stesId : Number(this.stesId);
        this.updateTerminDTO.ojbVersion = this.terminData ? this.terminData.ojbVersion : null;
        this.updateTerminDTO.betreff = this.angabenForm.betreff;
        this.updateTerminDTO.art = this.angabenForm.artDropDownOptions.filter(_art => _art.codeId === Number(this.angabenForm.art)).shift() as CodeDTO;
        this.updateTerminDTO.ort = this.angabenForm.ort;
        this.updateTerminDTO.teilnehmerInternList = this.teilnehmerIntern;
        this.updateTerminDTO.teilnehmerExternList = this.teilnehmerExtern;
        this.updateTerminDTO.beginn = this.angabenForm.zeitVon ? this.getTime(this.angabenForm.zeitVon) : null;
        this.updateTerminDTO.ende = this.angabenForm.zeitBis ? this.getTime(this.angabenForm.zeitBis) : null;
        this.updateTerminDTO.stesTerminId = this.terminId ? Number(this.terminId) : null;
        this.updateTerminDTO.status = this.angabenForm.statusDropDownOptions.filter(_status => _status.codeId === Number(this.angabenForm.status)).shift() as CodeDTO;
        this.updateTerminDTO.angaben = typeof this.additionalInfo.value !== 'string' ? null : this.additionalInfo.value;
    }

    getTime(time: string): any {
        time = this.facadeService.formUtilsService.addColonToTimeString(time);

        return this.facadeService.formUtilsService.transformDateAndTimeToTimestampsNgx(this.angabenForm.datum, {
            _hh: time.split(':', 2)[0],
            _mm: time.split(':', 2)[1]
        });
    }

    setTeilnehmerIntern(): void {
        const teilnehmerList = this.interneTeilnehmerForm.getTeilnehmerArray() as Array<any>;
        teilnehmerList.forEach((teilnehmer, index) => {
            if (teilnehmer.controls.personalberater.value) {
                const existingTeilnehmer = this.terminData ? this.findInternTeilnehmerById(teilnehmer) : null;
                this.teilnehmerIntern.push({
                    ojbVersion: existingTeilnehmer ? existingTeilnehmer.ojbVersion : null,
                    stesTeilnehmerInternId: existingTeilnehmer ? existingTeilnehmer.stesTeilnehmerInternId : null,
                    stesTerminId: this.terminId ? Number(this.terminId) : null,
                    kontaktperson: this.interneTeilnehmerForm.kontaktperson[index],
                    benutzerDetailId: teilnehmer.controls.personalberater['benutzerObject'].benutzerDetailId,
                    benutzerDetail: teilnehmer.controls.personalberater['benutzerObject']
                });
            }
        });
    }

    findInternTeilnehmerById(teilnehmer: FormGroup): StesTerminTeilnehmerInternDTO {
        return this.terminData.teilnehmerInternList.filter(participant => participant.benutzerDetailId === teilnehmer.controls.personalberater.value.benutzerDetailId).shift();
    }

    checkExternValidity(teilnehmer) {
        return teilnehmer.valid && (teilnehmer.value.name || teilnehmer.value.vorname || teilnehmer.value.stelle);
    }

    setTeilnehmerExtern(): void {
        const teilnehmerList = this.externeTeilnehmerForm.getTeilnehmerArray() as Array<any>;
        teilnehmerList.forEach((teilnehmer, index) => {
            if (this.checkExternValidity(teilnehmer)) {
                const existingTeilnehmer = this.terminData ? this.findExternTeilnehmerById(teilnehmer) : null;

                this.teilnehmerExtern.push({
                    ojbVersion: existingTeilnehmer ? existingTeilnehmer.ojbVersion : null,
                    stesTeilnehmerExternId: existingTeilnehmer ? existingTeilnehmer.stesTeilnehmerExternId : null,
                    stesTerminId: this.terminId ? Number(this.terminId) : null,
                    kontaktperson: this.externeTeilnehmerForm.kontaktperson[index],
                    name: teilnehmer.controls.name ? teilnehmer.controls.name.value : null,
                    vorname: teilnehmer.controls.vorname ? teilnehmer.controls.vorname.value : null,
                    stelle: teilnehmer.controls.stelle.value
                });
            }
        });
    }

    findExternTeilnehmerById(teilnehmer: FormGroup): StesTerminTeilnehmerExternDTO {
        return this.terminData.teilnehmerExternList.filter(participant => participant.name === teilnehmer.controls.name.value).shift();
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideNavItem();
            }
        });
    }

    private hideNavItem(): void {
        if (this.isBearbeiten) {
            this.facadeService.navigationService.hideNavigationTreeRoute(StesTerminePaths.TERMINBEARBEITEN);
        } else {
            this.facadeService.navigationService.hideNavigationTreeRoute(StesTerminePaths.TERMINERFASSEN);
        }
        this.closeSideNav.unsubscribe();
    }

    private navigateToTermine(): void {
        this.router.navigate([`stes/details/${this.stesId}/termine`]);
    }

    private restoreView() {
        this.spinnerService.deactivate(this.terminChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    private initOptions() {
        this.terminArtOptions = this.terminArtOptions.filter(
            terminCode => terminCode.codeId !== Number(this.facadeService.formUtilsService.getCodeIdByCode(this.terminArtOptions, TerminArtCodeEnum.INFOTAG))
        );
        if (!this.isBearbeiten || (this.terminData && this.terminData.art.code !== TerminArtCodeEnum.TELEFONGESPRAECH)) {
            this.terminArtOptions = this.terminArtOptions.filter(
                terminCode => terminCode.codeId !== Number(this.facadeService.formUtilsService.getCodeIdByCode(this.terminArtOptions, TerminArtCodeEnum.TELEFONGESPRAECH))
            );
        }
        this.angabenForm.artDropDownOptions = this.facadeService.formUtilsService.mapDropdownKurztext(this.terminArtOptions);
        this.angabenForm.statusDropDownOptions = this.facadeService.formUtilsService.mapDropdownKurztext(this.terminStatusOptions);
    }
}

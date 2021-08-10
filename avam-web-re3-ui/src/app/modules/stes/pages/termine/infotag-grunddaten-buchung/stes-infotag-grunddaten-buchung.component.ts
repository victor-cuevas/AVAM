import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { FormBuilder, FormArray, FormControl } from '@angular/forms';
import { SpinnerService } from 'oblique-reactive';
import { StesTerminePaths } from '@shared/enums/stes-navigation-paths.enum';
import { forkJoin, Subscription } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { first, takeUntil } from 'rxjs/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InfotagRestService } from '@core/http/infotag-rest.service';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@shared/services/toolbox.service';
import { buildStesPath } from '@shared/services/build-route-path.function';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { InfotagZuweisungSaveDTO } from '@shared/models/dtos-generated/infotagZuweisungSaveDTO';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { DmsRestService } from '@core/http/dms-rest.service';
import { DmsContextSensitiveDossierDTO } from '@shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';

import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { StesTermineLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-infotag-grunddaten-buchung',
    templateUrl: './stes-infotag-grunddaten-buchung.component.html',
    styleUrls: ['./stes-infotag-grunddaten-buchung.component.scss']
})
export class StesInfotagGrunddatenBuchungComponent extends AbstractBaseForm implements AfterViewInit, OnInit, OnDestroy {
    @Input() stesId: string;
    @Input() dfeId: string;
    @Input() isBuchung = true;
    @Input() showOwnFooter = true;
    @Input() updateInfobar = true;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter();

    gfId: string;
    massnahmeId: string;
    buchungStatusOptions: any[] = [];
    verfuegbarkeitOptions: CodeDTO[] = [];
    praesenzStatusOptions: any[] = [];
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    permissions: typeof Permissions = Permissions;
    responseData: any;

    private channel = 'infotagGrunddaten';

    private geschaeftsfallID: number;
    private navigationPaths: string[] = [
        StesTerminePaths.INFOTAG,
        StesTerminePaths.INFOTAGGRUNDDATENBUCHUNG,
        StesTerminePaths.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT,
        StesTerminePaths.INFOTAGTEILNEHMERLISTE
    ];
    private letzteAktualisierung: any = {};

    private languageSubscription: Subscription;
    private observeClickActionSub: Subscription;

    constructor(
        private infotagRestService: InfotagRestService,
        private stesDataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private formBuilder: FormBuilder,
        modalService: NgbModal,
        private router: Router,
        private dmsRestService: DmsRestService,
        private stesInfobarService: AvamStesInfoBarService,
        private interactionService: StesComponentInteractionService
    ) {
        super('infotagGrunddaten', modalService, facade.spinnerService, facade.messageBus, facade.toolboxService, facade.fehlermeldungenService);
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.facade.spinnerService.activate(this.channel);
        this.initForm();
        if (!this.isAngebotsdaten()) {
            this.route.parent.data.subscribe(
                () => {
                    this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
                        this.stesId = params['stesId'];
                    });
                    this.route.queryParamMap.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
                        this.dfeId = params.get('dfeId');
                    });
                    this.route.queryParamMap.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
                        this.gfId = params.get('gfId');
                    });
                    this.facade.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
        }
        this.languageSubscription = this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.changeLanguage();
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

    closeComponent(message) {
        if (
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAG) ||
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAGGRUNDDATENBUCHUNG) ||
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT) ||
            message.data.label === this.facade.dbTranslateService.instant(StesTermineLabels.INFOTAGTEILNEHMERLISTE)
        ) {
            if (!this.canDeactivate()) {
                this.facade.navigationService.hideNavigationTreeRoute(StesTerminePaths.INFOTAG);
            } else {
                this.checkConfirmationToCancel();
            }
            this.cancel();
        }
    }

    cancel() {
        if (this.router.url.includes(StesTerminePaths.INFOTAG)) {
            this.navigateToTermine();
        }
    }

    ngAfterViewInit(): void {
        this.getData();
    }

    ngOnDestroy(): void {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.updateInfobar) {
            this.stesInfobarService.sendLastUpdate({}, true);
        }

        if (!this.isAngebotsdaten()) {
            this.facade.toolboxService.resetConfiguration();
        }
        this.facade.authenticationService.removeOwnerPermissionContext();
        // always call destroy of parent-parent: Unsubscribable
        super.ngOnDestroy();
    }

    bspEngine(duchfuehrungVon: Date) {
        this.mainForm.disable();
        this.mainForm.controls.buchungStatusId.enable();

        let von = new Date(duchfuehrungVon);
        let heute = new Date();
        if (heute < von) {
            // event not started yet
            this.mainForm.controls.praesenzStatusId.disable();
        } else {
            this.mainForm.controls.praesenzStatusId.enable();
        }
    }

    bspBuchungStatus() {
        // BSP5 on RE2: things are done AFTER save (on the server). Advantage: praesenzStatus is not lost before save
    }

    getData() {
        forkJoin(
            this.stesDataRestService.getCode(DomainEnum.TLN_PRAESENZ_STATUS), //NOSONAR
            this.stesDataRestService.getCode(DomainEnum.AMM_INFOTAG_BUCHUNG_STATUS),
            this.infotagRestService.getGrunddaten(this.isBuchung, this.stesId, this.isBuchung ? this.gfId : this.dfeId, this.facade.dbTranslateService.getCurrentLang())
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([praesenzStatusList, infotagBuchungStatusList, response]) => {
                    this.praesenzStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(praesenzStatusList);
                    this.buchungStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(infotagBuchungStatusList);

                    if (response.data) {
                        this.verfuegbarkeitOptions.push(response.data.zeitplanDTO.verfuegbarkeitObject);
                        this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdownKurztext(this.verfuegbarkeitOptions);
                    }

                    this.updateForm(response.data);
                    this.setTitle();
                    this.gfId = response.data.geschaeftsfallId;
                    this.massnahmeId = response.data.massnahmeId;
                    if (!this.isAngebotsdaten()) {
                        this.facade.authenticationService.setOwnerPermissionContext(response.data.stesId, response.data.ownerId);
                        this.responseData = response.data;
                        this.dfeId = response.data.durchfuehrungsNr;
                        this.configureToolbox(
                            this.channel,
                            ToolboxConfig.getStesInfotagGrunddatenBuchungConfig(),
                            ToolboxDataHelper.createForInfotag(this.dfeId, response.data.geschaeftsfallId)
                        );
                    }
                },
                () => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
    }

    updateForm(data: any, onSave?: boolean): void {
        const isDataPresent = !!data;
        if (isDataPresent) {
            this.letzteAktualisierung = data;

            this.mainForm.reset();
            this.mapToForm(data);
        }

        this.bspEngine(data.duchfuehrungVon);

        if (this.updateInfobar) {
            this.updateInfoleistePanel(this.stesInfobarService, this.letzteAktualisierung);
        }
        this.facade.spinnerService.deactivate(this.channel);
    }

    /**
     * whether the BO is present
     */
    isBoPresent(): boolean {
        return !!this.letzteAktualisierung.buchungId;
    }

    /**
     * map to form DIRECTLY
     */
    mapToForm(data: any) {
        // server can provide: 'praesenz' without 'statusObject'
        const praesenzCodeGiven = !!data.praesenz && !!data.praesenz.statusObject;

        this.mainForm.controls.ergaenzendeAngaben.setValue(this.facade.dbTranslateService.translateWithOrder(data, 'ergaenzendeAngaben'));
        this.mainForm.controls.durchfuehrungsNr.setValue(data.durchfuehrungsNr);
        this.mainForm.controls.teilnehmer.setValue(data.anzahlTeilnehmer);
        this.mainForm.controls.teilnehmerMax.setValue(data.anzahlTeilnehmerMax);
        this.mainForm.controls.ueberbuchung.setValue(data.anzahlUeberbuchungen);
        this.mainForm.controls.ueberbuchungMax.setValue(data.anzahlUeberbuchungMax | 0);
        this.mainForm.controls.anbieter.setValue(data.anbieter);
        this.mainForm.controls.verantwortung.setValue(data.massnahmeverantwortung);
        // Zeitplan und ff
        this.mainForm.controls.durchfuehrungVon.setValue(new Date(data.duchfuehrungVon));
        this.mainForm.controls.durchfuehrungBis.setValue(new Date(data.duchfuehrungBis));
        this.mainForm.controls.kurstage.setValue(data.anzahlKurstage);

        this.mainForm.controls.kurszeiten.setValue(this.facade.dbTranslateService.translateWithOrder(data.zeitplanDTO, 'arbeitszeit'));

        this.mainForm.controls.bearbeitung.setValue(data.bearbeitung);
        this.mainForm.controls.buchungsNr.setValue(data.buchungsNr);
        if (data.buchungStatus) {
            this.mainForm.controls.buchungStatusId.setValue(data.buchungStatus.codeId);
        }
        this.mainForm.controls.praesenzStatusId.setValue(praesenzCodeGiven ? data.praesenz.statusObject.codeId : null);
        this.mapToFormVerfuegbarkeit(data);

        let screenTitle = this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesTermine.grunddatenbuchung');
        screenTitle = this.facade.dbTranslateService.translateWithOrder(data, 'titel') + ` - ${screenTitle}`;
        this.facade.messageBus.buildAndSend('stes-details-content-ueberschrift', { ueberschrift: screenTitle });

        this.geschaeftsfallID = data.geschaeftsfallId;
        if (!this.isAngebotsdaten()) {
            this.configureToolbox(this.channel, ToolboxConfig.getStesInfotagGrunddatenBuchungConfig(), ToolboxDataHelper.createForInfotag(this.dfeId, this.geschaeftsfallID));
            this.updateNavigation();
        } else {
            this.eventEmitter.emit(data);
        }
    }

    mapToFormVerfuegbarkeit(data: any) {
        //verfuegbarkeitsDropdown
        this.mainForm.controls.verfuegbarkeit.setValue(data.zeitplanDTO.verfuegbarkeitObject.codeId.toString());
        this.mainForm.controls.vormittags.setValue([
            data.zeitplanDTO.moV,
            data.zeitplanDTO.diV,
            data.zeitplanDTO.miV,
            data.zeitplanDTO.doV,
            data.zeitplanDTO.frV,
            data.zeitplanDTO.saV,
            data.zeitplanDTO.soV
        ]);
        this.mainForm.controls.nachmittags.setValue([
            data.zeitplanDTO.moN,
            data.zeitplanDTO.diN,
            data.zeitplanDTO.miN,
            data.zeitplanDTO.doN,
            data.zeitplanDTO.frN,
            data.zeitplanDTO.saN,
            data.zeitplanDTO.soN
        ]);
    }

    mapToDtoForUpdate(): InfotagZuweisungSaveDTO {
        const optionalPraesenzStatusId = this.mainForm.controls.praesenzStatusId.value;
        const praesenz = this.letzteAktualisierung.praesenz;

        return {
            ojbVersion: this.letzteAktualisierung.ojbVersion,
            language: this.facade.dbTranslateService.getCurrentLang(),
            stesId: this.letzteAktualisierung.stesId,
            sessionId: this.letzteAktualisierung.durchfuehrungsNr,

            buchungsstatusId: this.mainForm.controls.buchungStatusId.value,
            geschaeftsfallId: this.letzteAktualisierung.geschaeftsfallId,
            originalStesId: this.letzteAktualisierung.stesId,
            praesenzStatusId: optionalPraesenzStatusId ? parseInt(optionalPraesenzStatusId) : 0,

            ojbVersionPraesenzStatus: praesenz ? praesenz.ojbVersion : 0
        };
    }

    /**
     * updates the buchung
     *
     * RE2 allows switching from annuliert to gebucht even teilnehmer is too much (0 overbooking)
     */
    save() {
        this.facade.spinnerService.activate(this.channel);
        this.facade.fehlermeldungenService.closeMessage();

        this.infotagRestService
            .updateBuchung(this.mapToDtoForUpdate())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.updateForm(response.data);
                    this.facade.notificationService.success(this.facade.dbTranslateService.instant('common.message.datengespeichert'));
                    this.responseData = response.data;
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
    }

    reset() {
        if (this.mainForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.updateForm(this.letzteAktualisierung, false);
            });
        }
    }

    defineToolboxActions(): void {
        if (!this.isAngebotsdaten()) {
            this.observeClickActionSub = this.facade.toolboxService
                .observeClickAction(ToolboxService.CHANNEL, this.observeClickActionSub)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((action: any) => {
                    if (action.message.action === ToolboxActionEnum.PRINT) {
                        PrintHelper.print();
                    } else if (action.message.action === ToolboxActionEnum.COPY) {
                        this.openDmsCopyModal();
                    } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                        this.openHistoryModal(this.letzteAktualisierung.buchungId, AvamCommonValueObjectsEnum.T_AMM_BUCHUNGSESSION);
                    }
                });
        }
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_INFOTAG_BUCHUNG;
        comp.id = String(this.geschaeftsfallID);
        comp.language = this.facade.dbTranslateService.getCurrentLang();
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    deleteNow() {
        this.facade.spinnerService.activate(this.channel);
        this.mainForm.reset();
        this.infotagRestService
            .loeschen(this.gfId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    if (!response.warning || !response.warning.find(w => w.key === 'DANGER')) {
                        this.facade.notificationService.success('common.message.datengeloescht');
                        this.router.navigate([buildStesPath(this.stesId, StesTerminePaths.TERMINEANZEIGEN)]);
                    } else {
                        this.facade.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    }
                },
                () => {
                    this.facade.spinnerService.deactivate(this.channel);
                }
            );
    }

    isAngebotsdaten(): boolean {
        return !this.route.parent;
    }

    onDMSClick() {
        this.facade.fehlermeldungenService.closeMessage();
        const reqDto: DmsContextSensitiveDossierDTO = {
            geschaeftsfallId: Number(this.massnahmeId),
            stesId: Number(this.stesId),
            language: this.facade.dbTranslateService.getCurrentLang()
        };
        this.dmsRestService
            .getDmsURL(reqDto)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                if (!response.warning || !response.warning.find(w => w.key === 'DANGER')) {
                    window.open(response.data, '_blank', 'height=580,width=1000,top=150,left=150,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
                }
            });
    }

    changeLanguage(): void {
        this.mainForm.controls.kurszeiten.setValue(this.facade.dbTranslateService.translateWithOrder(this.letzteAktualisierung.zeitplanDTO, 'arbeitszeit'));
        this.mainForm.controls.ergaenzendeAngaben.setValue(this.facade.dbTranslateService.translateWithOrder(this.letzteAktualisierung, 'ergaenzendeAngaben'));
        this.setTitle();
    }

    setTitle() {
        if (this.updateInfobar) {
            const screenTitle = this.facade.dbTranslateService.instant('stes.subnavmenuitem.stesTermine.grunddatenbuchung');
            const infoTag = this.facade.dbTranslateService.instant('amm.infotag.subnavmenuitem.infotag');
            const title = this.facade.dbTranslateService.translateWithOrder(this.letzteAktualisierung, 'titel');
            this.stesInfobarService.sendDataToInfobar({ title: `${infoTag} ${title} - ${screenTitle}` });
        }
    }

    deleteBuchung() {
        const modalRef = this.openModal(GenericConfirmComponent);
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

    private updateNavigation(): void {
        const queryParams: any = { dfeId: this.dfeId, gfId: this.geschaeftsfallID };
        this.navigationPaths.forEach(path => {
            this.facade.navigationService.showNavigationTreeRoute(path, queryParams);
        });
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.facade.navigationService.hideNavigationTreeRoute(StesTerminePaths.INFOTAG);
            }
        });
    }

    private navigateToTermine(): void {
        this.router.navigate([`stes/details/${this.stesId}/termine`]);
    }

    /**
     * verfuegbarkeit: wochenplan, unterschiedlich etc
     * kurszeiten: string mit umbruechen
     * statusId: gebucht oder annuliert
     * praesenzStatusId: teilgenommen, ferngeblieben *
     */
    private initForm() {
        this.mainForm = this.formBuilder.group({
            ergaenzendeAngaben: null,
            durchfuehrungsNr: null,
            teilnehmer: null,
            teilnehmerMax: null,
            ueberbuchung: null,
            ueberbuchungMax: null,
            anbieter: null, // naming?
            verantwortung: null, // naming?
            // Zeitplan und ff
            durchfuehrungVon: null,
            durchfuehrungBis: null,
            kurstage: null, // naming / berechnen??
            verfuegbarkeit: null,
            vormittags: new FormArray([
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false)
            ]),
            nachmittags: new FormArray([
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false),
                new FormControl(false)
            ]),
            kurszeiten: null,
            bearbeitung: null, // naming
            buchungsNr: null, // naming
            buchungStatusId: null, // naming
            praesenzStatusId: null
        });
    }
}

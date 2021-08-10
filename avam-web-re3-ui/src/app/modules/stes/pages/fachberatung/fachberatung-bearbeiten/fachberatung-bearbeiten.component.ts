import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FormUtilsService, GenericConfirmComponent, ToolboxService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FachberatungsangebotDetails } from '@app/shared/components/detail-fachberatungsangebot-modal/detail-fachberatungsangebot-modal.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@app/shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { FachberatungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { BaseResponseWrapperZuwFachberatungDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperZuwFachberatungDTOWarningMessages';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { FachberatungParamDTO } from '@app/shared/models/dtos-generated/fachberatungParamDTO';
import { FachberatungsangebotDTO } from '@app/shared/models/dtos-generated/fachberatungsangebotDTO';
import { WarningMessages } from '@app/shared/models/dtos-generated/warningMessages';
import { ZuweisungFachberatungParamDTO } from '@app/shared/models/dtos-generated/zuweisungFachberatungParamDTO';
import { ZuwFachberatungDTO } from '@app/shared/models/dtos-generated/zuwFachberatungDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { TwoFieldsAutosuggestValidator } from '@app/shared/validators/two-fields-autosuggest-validator';
import { StaatDTO } from '@dtos/staatDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FachberatungLabels } from '@shared/enums/stes-routing-labels.enum';
import { MessageBus } from '@shared/services/message-bus';
import * as moment from 'moment';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { FacadeService } from '@shared/services/facade.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'avam-fachberatung-bearbeiten',
    templateUrl: './fachberatung-bearbeiten.component.html',
    styleUrls: ['./fachberatung-bearbeiten-component.scss']
})
export class FachberatungBearbeitenComponent extends Unsubscribable implements OnInit, OnDestroy {
    fachberatungBearbeitenForm: FormGroup;
    fachberatungChannel = 'fachberatung-bearbeiten-channel';
    fachberatungToolboxChannel = 'fachberatung-bearbeiten-channel';
    unternehmenId: number = null;
    anredeOptions = [];
    zuweisungsStatusOptions = [];
    fachberatungsangebot: FachberatungsangebotDTO;
    zuweisungFbData: ZuwFachberatungDTO;
    isSchweiz: boolean;
    schweizId: number;
    vermittlungsverantwortungSuchenTokens: {} = {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('fachberatungsangebotDetailModal') fachberatungsangebotDetailModal: ElementRef;
    @ViewChild('vermittlungsverantwortung') vermittlungsverantwortung: AvamPersonalberaterAutosuggestComponent;

    permissions: typeof Permissions = Permissions;

    private fachberatungId: string;
    private stesId: string;
    private langChangeSubscription: Subscription;
    private toolboxActionSub: Subscription;
    private authSub: Subscription;

    constructor(
        private readonly navigationService: NavigationService,
        private readonly route: ActivatedRoute,
        private readonly formBuilder: FormBuilder,
        private readonly dataService: StesDataRestService,
        private readonly dbTranslateSerivce: DbTranslateService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private dbTranslateService: DbTranslateService,
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private router: Router,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private toolboxService: ToolboxService,
        private resetDialogService: ResetDialogService,
        private facade: FacadeService,
        private obliqueHelper: ObliqueHelperService,
        private messageBus: MessageBus,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super();
        SpinnerService.CHANNEL = this.fachberatungChannel;
        ToolboxService.CHANNEL = this.fachberatungToolboxChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.vermittlung' });
        this.setRouteParams();
        this.setSideNav();
        this.configureToolbox();
        this.createForm();
        this.loadData();
        this.subscribeToLangChange();
        this.toolboxActionSub = this.subscribeToToolbox();
        this.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(FachberatungLabels.VERMITTLUNG)) {
            this.cancel();
        }
    }

    canDeactivate(): boolean {
        return this.fachberatungBearbeitenForm.dirty;
    }

    configureToolbox() {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.STESVERMITTLUNGFACHBERATUNG,
            vorlagenKategorien: [VorlagenKategorie.Vermittlung_Fachberatung],
            entityIDsMapping: { ZUWEISUNG_ID_FB: +this.fachberatungId }
        };

        this.authSub = this.authenticationService.buttonsPermissionSubject.subscribe(
            permissions => {
                const toolboxConfig = this.getDefaultToolboxConfig();
                if (this.authenticationService.hasAllPermissions([Permissions.STES_VM_ZUWEISUNG_FB_SUCHEN], permissions)) {
                    toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
                }
                this.toolboxService.sendConfiguration(toolboxConfig, this.fachberatungToolboxChannel, toolboxData);
            },
            () => {
                const toolboxConfig = this.getDefaultToolboxConfig();
                this.toolboxService.sendConfiguration(toolboxConfig, this.fachberatungToolboxChannel, toolboxData);
            }
        );
    }

    getDefaultToolboxConfig(): ToolboxConfiguration[] {
        return [
            new ToolboxConfiguration(ToolboxActionEnum.HISTORY, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.fachberatungToolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.fachberatungId, AvamCommonValueObjectsEnum.T_ZUWEISUNG_STES_FACHBERATUNG);
            } else if (action.message.action === ToolboxActionEnum.COPY) {
                this.openDmsCopyModal();
            }
        });
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });

        const comp = modalRef.componentInstance as HistorisierungComponent;

        comp.id = objId;
        comp.type = objType;
    }

    openDmsCopyModal() {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;

        comp.context = DmsMetadatenContext.DMS_CONTEXT_ZUWEISUNG_FACHBERATUNG;
        comp.id = this.fachberatungId;
    }

    openDetails() {
        this.openModal(this.fachberatungsangebotDetailModal, 'modal-md');
    }

    openDeleteDialog() {
        this.openModal(GenericConfirmComponent, 'modal-basic-title');
    }

    openModal(content, windowClass) {
        const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass, backdrop: 'static' });
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

    getFachberatungsangebotDetails(): FachberatungsangebotDetails {
        return {
            fachberatungsbereichObject: this.fachberatungsangebot.fachberatungsbereichObject,
            bezeichnung: this.fachberatungsangebot.bezeichnung,
            angebotsNr: this.fachberatungsangebot.angebotNr,
            zielpublikum: this.fachberatungsangebot.zielpublikum,
            initialisierung: this.fachberatungsangebot.initialisierung,
            leistung: this.fachberatungsangebot.leistung
        };
    }

    delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.fachberatungChannel);

        this.dataService.deleteZuweisungFachberatung(this.fachberatungId).subscribe(
            response => {
                if (!response.warning) {
                    this.fachberatungBearbeitenForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                    this.navigationService.hideNavigationTreeRoute(FachberatungPaths.FACHBERATUNG_BEARBEITEN);
                    this.cancel();
                }
                this.spinnerService.deactivate(this.fachberatungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.handleError('common.message.datennichtgeloescht');
            }
        );
    }

    cancel() {
        if (this.router.url.includes(FachberatungPaths.FACHBERATUNG_BEARBEITEN)) {
            this.router.navigate([`stes/details/${this.stesId}/${FachberatungPaths.FACHBERATUNGEN}`]);
            this.navigationService.hideNavigationTreeRoute(FachberatungPaths.FACHBERATUNG_BEARBEITEN, {
                fachberatungId: this.fachberatungId
            });
        }
    }

    reset() {
        if (this.fachberatungBearbeitenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.fachberatungBearbeitenForm.reset(this.mapToForm(this.zuweisungFbData));
            });
        }
    }

    save() {
        this.fehlermeldungenService.closeMessage();

        if (!this.fachberatungBearbeitenForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.spinnerService.activate(this.fachberatungChannel);

        this.dataService.updateZuweisungFachberatung(this.mapToDTO(), this.translateService.currentLang).subscribe(
            response => {
                if (response.data) {
                    this.zuweisungFbData = response.data;
                    this.fachberatungsangebot = response.data.fachberatungsangebotObject;

                    this.authenticationService.setOwnerPermissionContext(this.zuweisungFbData.stesId, this.zuweisungFbData.ownerId);

                    //check if staat is schweiz and set flag
                    this.isSchweiz = this.zuweisungFbData.staatObject && this.schweizId === this.zuweisungFbData.staatObject.staatId;

                    //check if durchfuehrungsort is different from fachberatung's durchfuehrungsort
                    this.checkDurchfuehrungsort(this.zuweisungFbData, this.isSchweiz);

                    this.fachberatungBearbeitenForm.reset(this.mapToForm(this.zuweisungFbData));

                    this.fachberatungBearbeitenForm.controls.land['landAutosuggestObject'] = this.zuweisungFbData.staatObject;
                    this.fachberatungBearbeitenForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                }
                this.spinnerService.deactivate(this.fachberatungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.handleError('common.message.datennichtgespeichert');
            }
        );
    }

    handleError(message: string) {
        this.notificationService.error(this.translateService.instant(message));
        this.spinnerService.deactivate(this.fachberatungChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    ngOnDestroy() {
        this.authenticationService.removeOwnerPermissionContext();
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        this.fehlermeldungenService.closeMessage();
        if (this.toolboxActionSub) {
            this.toolboxActionSub.unsubscribe();
        }
        if (this.authSub) {
            this.authSub.unsubscribe();
        }
        this.toolboxService.resetConfiguration();
        super.ngOnDestroy();
    }

    private setSideNav() {
        this.navigationService.showNavigationTreeRoute(FachberatungPaths.FACHBERATUNG_BEARBEITEN, {
            fachberatungId: this.fachberatungId
        });
    }

    private setRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.fachberatungId = params.get('fachberatungId');
        });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    private createForm() {
        this.fachberatungBearbeitenForm = this.formBuilder.group({
            zuweisungDatumVom: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            zuweisungNr: null,
            zuweisungsStatus: null,
            vermittler: [null, Validators.required],
            fachberatungsbereich: null,
            bezeichnung: null,
            terminDatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            terminZeit: [null, [DateValidator.val250, DateValidator.val251]],
            ergaenzendeAngaben: null,
            unternehmenName1: [null, Validators.required],
            unternehmenName2: null,
            unternehmenName3: null,
            unternehmenStrasse: null,
            unternehmenStrasseNummer: null,
            postleitzahl: [null, [TwoFieldsAutosuggestValidator.autosuggestRequired('postleitzahl')]],
            ort: [null, TwoFieldsAutosuggestValidator.autosuggestRequired('ortDe')],
            land: [null, Validators.required],
            kontaktpersonForm: this.formBuilder.group({
                kontaktpersonAnredeId: null,
                kontaktpersonName: null,
                kontaktpersonVorname: null,
                kontaktpersonTelefonNr: [null, PhoneValidator.isValidFormatWarning],
                kontaktpersonEmail: [null, EmailValidator.isValidFormat]
            })
        });
    }

    private loadData() {
        this.spinnerService.activate(this.fachberatungChannel);
        forkJoin<CodeDTO[], CodeDTO[], BaseResponseWrapperZuwFachberatungDTOWarningMessages, StaatDTO>([
            this.dataService.getCode(DomainEnum.STATUS_ZUWEISUNG_FB),
            this.dataService.getCode(DomainEnum.ANREDE),
            this.dataService.getZuwFachberatung(this.fachberatungId, this.translateService.currentLang),
            this.dataService.getStaatSwiss()
        ]).subscribe(
            ([zuweisungsStatusOptions, anredeOptions, zuwFachberatungDTOWarn, schweizDTO]) => {
                this.zuweisungsStatusOptions = this.facade.formUtilsService.mapDropdownKurztext(zuweisungsStatusOptions);
                this.anredeOptions = this.facade.formUtilsService.mapDropdownKurztext(anredeOptions);
                this.zuweisungFbData = zuwFachberatungDTOWarn.data;
                this.schweizId = schweizDTO.staatId;
                if (this.zuweisungFbData) {
                    this.authenticationService.setOwnerPermissionContext(this.zuweisungFbData.stesId, this.zuweisungFbData.ownerId);

                    //check if staat is schweiz and set flag
                    this.isSchweiz = this.zuweisungFbData.staatObject && schweizDTO.staatId === this.zuweisungFbData.staatObject.staatId;

                    //check if durchfuehrungsort is different from fachberatung's durchfuehrungsort
                    this.checkDurchfuehrungsort(this.zuweisungFbData, this.isSchweiz);

                    this.fachberatungBearbeitenForm.reset(this.mapToForm(this.zuweisungFbData));
                    this.fachberatungBearbeitenForm.controls.land['landAutosuggestObject'] = this.zuweisungFbData.staatObject;
                    this.fachberatungsangebot = this.zuweisungFbData.fachberatungsangebotObject;
                    this.unternehmenId = this.fachberatungsangebot.unternehmenId;
                }

                this.spinnerService.deactivate(this.fachberatungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.fachberatungChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    private mapToForm(data: ZuwFachberatungDTO) {
        if (!data) {
            return {};
        }

        const fachberatungParam = data.fachberatungParam;
        const unternehmen = this.getUnternehmen(data);
        const kontaktperson = this.getKontaktperson(data);
        const plz = this.getPlz(data, fachberatungParam);

        return {
            zuweisungDatumVom: this.facade.formUtilsService.parseDate(data.zuweisungDatumVom),
            zuweisungNr: data.zuweisungNr,
            zuweisungsStatus: data.zuweisungsStatusId,
            vermittler: this.getVermittler(data),
            fachberatungsbereich: this.getFachberatungsbereichText(fachberatungParam),
            bezeichnung: this.getBezeichnung(fachberatungParam),
            terminDatum: this.facade.formUtilsService.parseDate(data.terminDatum),
            terminZeit: data.terminZeit ? moment(data.terminZeit).format('HH:mm') : null,
            ergaenzendeAngaben: data.ergaenzendeAngaben,
            unternehmenName1: unternehmen.unternehmenName1,
            unternehmenName2: unternehmen.unternehmenName2,
            unternehmenName3: unternehmen.unternehmenName3,
            unternehmenStrasse: unternehmen.unternehmenStrasse,
            unternehmenStrasseNummer: unternehmen.unternehmenStrasseNummer,
            postleitzahl: this.isSchweiz ? plz.plzObject : plz.plzAusland,
            ort: this.isSchweiz ? plz.plzObject : plz.postleitortAusland,
            land: data.unternehmenName1 ? data.staatObject : fachberatungParam.staat,
            kontaktpersonForm: {
                kontaktpersonAnredeId: kontaktperson.kontaktpersonAnredeId,
                kontaktpersonName: kontaktperson.kontaktpersonName,
                kontaktpersonVorname: kontaktperson.kontaktpersonVorname,
                kontaktpersonTelefonNr: kontaktperson.kontaktpersonTelefonNr,
                kontaktpersonEmail: kontaktperson.kontaktpersonEmail
            }
        };
    }

    private mapToDTO(): ZuweisungFachberatungParamDTO {
        const formControls = this.fachberatungBearbeitenForm.controls;
        const kontaktpersonForm = this.fachberatungBearbeitenForm.controls.kontaktpersonForm as FormGroup;
        const kontaktpersonControls = kontaktpersonForm.controls;

        return {
            ojbVersion: this.zuweisungFbData.ojbVersion,
            stesId: +this.stesId,
            fachberatungsangebotId: this.fachberatungsangebot.fachberatungsangebotId,
            fachberatungId: this.fachberatungsangebot.fachberatungsangebotId,
            zuweisungStesFachberatungId: this.zuweisungFbData.zuweisungStesFachberatungId,
            zuweisungVonDatum: this.facade.formUtilsService.parseDate(formControls.zuweisungDatumVom.value),
            zuweisungsNummer: +formControls.zuweisungNr.value,
            zuweisungsStatusId: +formControls.zuweisungsStatus.value ? +formControls.zuweisungsStatus.value : null,
            terminDatum: this.facade.formUtilsService.parseDate(formControls.terminDatum.value),
            terminZeit: this.mapTimeToDTO(formControls.terminZeit.value),
            ergaenzendeAngaben: formControls.ergaenzendeAngaben.value,
            unternehmenName1: formControls.unternehmenName1.value,
            unternehmenName2: formControls.unternehmenName2.value,
            unternehmenName3: formControls.unternehmenName3.value,
            unternehmenStrasse: formControls.unternehmenStrasse.value,
            unternehmenStrassenNummer: formControls.unternehmenStrasseNummer.value,
            kontaktpersonAnredeId: kontaktpersonControls.kontaktpersonAnredeId.value,
            kontaktpersonName: kontaktpersonControls.kontaktpersonName.value,
            kontaktpersonVorname: kontaktpersonControls.kontaktpersonVorname.value,
            kontaktpersonEMail: kontaktpersonControls.kontaktpersonEmail.value,
            kontaktpersonTelefonNr: kontaktpersonControls.kontaktpersonTelefonNr.value,
            vermittlerDetailObject: formControls.vermittler['benutzerObject'] ? formControls.vermittler['benutzerObject'] : formControls.vermittler.value,
            plzObject: this.fachberatungBearbeitenForm['plzWohnAdresseObject'],
            plzAusland: this.fachberatungBearbeitenForm['plzWohnAdresseObject'].plzWohnadresseAusland,
            postleitOrtAusland: this.fachberatungBearbeitenForm['plzWohnAdresseObject'].ortWohnadresseAusland,
            staatObject: formControls.land['landAutosuggestObject']
        };
    }

    private mapTimeToDTO(value: string): Date {
        if (value) {
            const time = this.facade.formUtilsService.addColonToTimeString(value).split(':', 2);
            const hh = time[0];
            const mm = time[1];
            return moment({ hour: +hh, minute: +mm }).toDate();
        }
        return null;
    }

    private getUnternehmen(data: ZuwFachberatungDTO) {
        if (data.unternehmenName1) {
            return {
                unternehmenName1: data.unternehmenName1,
                unternehmenName2: data.unternehmenName2,
                unternehmenName3: data.unternehmenName3,
                unternehmenStrasse: data.unternehmenStrasse,
                unternehmenStrasseNummer: data.unternehmenStrasseNr
            };
        }

        const fachberatungParam = data.fachberatungParam;

        return {
            unternehmenName1: fachberatungParam.name1,
            unternehmenName2: fachberatungParam.name2,
            unternehmenName3: fachberatungParam.name3,
            unternehmenStrasse: fachberatungParam.strasse,
            unternehmenStrasseNummer: fachberatungParam.hausNr
        };
    }

    private getKontaktperson(data: ZuwFachberatungDTO) {
        const kontaktpersonObject = data.anredeKontaktpersonObject;
        const fachberatungParam = data.fachberatungParam;
        const result = {
            kontaktpersonAnredeId: kontaktpersonObject && kontaktpersonObject.codeId && kontaktpersonObject.codeId > 0 ? kontaktpersonObject.codeId : null,
            kontaktpersonName: data.kontaktpersonName,
            kontaktpersonVorname: data.kontaktpersonVorname,
            kontaktpersonTelefonNr: data.kontaktpersonTelefonNr,
            kontaktpersonEmail: data.kontaktpersonEmail
        };

        return Object.keys(result).find(key => result[key])
            ? result
            : {
                  kontaktpersonAnredeId: fachberatungParam.kpAnredeId,
                  kontaktpersonName: fachberatungParam.kpName,
                  kontaktpersonVorname: fachberatungParam.kpVorname,
                  kontaktpersonTelefonNr: fachberatungParam.kpTelefon,
                  kontaktpersonEmail: fachberatungParam.kpEmail
              };
    }

    private getVermittler(dto: ZuwFachberatungDTO): any {
        return dto.benutzerDetailObject || this.authenticationService.getLoggedUser() || null;
    }

    private subscribeToLangChange(): void {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.fehlermeldungenService.closeMessage();
            this.loadData();
        });
    }

    private getFachberatungsbereichText(fParam: FachberatungParamDTO): string {
        if (fParam && fParam.fachberatungsbereichObject) {
            return this.dbTranslateSerivce.translate(fParam.fachberatungsbereichObject, 'kurzText').trim();
        } else {
            return null;
        }
    }

    private getBezeichnung(fParam: FachberatungParamDTO): string {
        return fParam && fParam.bezeichnung ? fParam.bezeichnung : null;
    }

    private getPlz(zuweisung: ZuwFachberatungDTO, fachberatungParam: FachberatungParamDTO) {
        if (zuweisung.unternehmenName1) {
            return {
                plzObject: zuweisung.plzObject,
                plzAusland: zuweisung.plzAusland,
                postleitortAusland: zuweisung.postleitortAusland
            };
        }

        return {
            plzObject: fachberatungParam.plz,
            plzAusland: fachberatungParam.plzAusland,
            postleitortAusland: fachberatungParam.plzAusland
        };
    }

    private checkDurchfuehrungsort(zuweisungFachberatung: ZuwFachberatungDTO, isSchweiz: boolean) {
        const fachberatungParam: FachberatungParamDTO = zuweisungFachberatung.fachberatungParam;

        const name1Different = zuweisungFachberatung.unternehmenName1 !== fachberatungParam.name1;
        const name2Different = zuweisungFachberatung.unternehmenName2 !== fachberatungParam.name2;
        const name3Different = zuweisungFachberatung.unternehmenName3 !== fachberatungParam.name3;
        const adresseDifferent = zuweisungFachberatung.unternehmenStrasse !== fachberatungParam.strasse || zuweisungFachberatung.unternehmenStrasseNr !== fachberatungParam.hausNr;

        let ortDifferent = false;
        if (isSchweiz) {
            ortDifferent = zuweisungFachberatung.plzObject.plzId !== fachberatungParam.plz.plzId;
        } else {
            ortDifferent = zuweisungFachberatung.plzAusland !== fachberatungParam.plzAusland || zuweisungFachberatung.postleitortAusland !== fachberatungParam.ortAusland;
        }

        if (
            name1Different ||
            name2Different ||
            name3Different ||
            adresseDifferent ||
            ortDifferent ||
            this.checkLandDifferent(zuweisungFachberatung.staatObject, fachberatungParam.staat)
        ) {
            this.fehlermeldungenService.showMessage('stes.alttext.vermittlung.durchfuehrungsortnichtidentisch', WarningMessages.KeyEnum.INFO.toLowerCase());
        }
    }

    private checkLandDifferent(zuwStaat: StaatDTO, fbStaat: StaatDTO): boolean {
        if (zuwStaat && fbStaat) {
            return zuwStaat.staatId !== fbStaat.staatId;
        } else if (!zuwStaat && !fbStaat) {
            return false;
        }
        return true;
    }
}

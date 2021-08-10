import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { forkJoin, Subscription } from 'rxjs';
import { SchnellzuweisungDTO } from '@dtos/schnellzuweisungDTO';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NavigationService } from '@shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { SchnellzuweisungFormHandler } from '@stes/pages/arbeitsvermittlungen/schnellzuweisungen/schnellzuweisung-form-handler';
import { FormUtilsService, GenericConfirmComponent, ToolboxService } from '@app/shared';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '@core/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { MessageBus } from '@shared/services/message-bus';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { SchnellzuweisungLabels } from '@shared/enums/stes-routing-labels.enum';
import { DomainEnum } from '@shared/enums/domain.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { BaseResponseWrapperSchnellzuweisungDTOWarningMessages } from '@dtos/baseResponseWrapperSchnellzuweisungDTOWarningMessages';
import { SchnellzuweisungCodeEnum } from '@shared/enums/domain-code/schnellzuweisung-code.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesArbeitsvermittlungPaths } from '@shared/enums/stes-navigation-paths.enum';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@dtos/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@shared/enums/vorlagen-kategorie.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { AvamUnternehmenAutosuggestComponent } from '../../../library/wrappers/form/autosuggests/avam-unternehmen-autosuggest/avam-unternehmen-autosuggest.component';
import { FacadeService } from '@shared/services/facade.service';

const schnellzuweisungBearbeitenChannel = 'schnellzuweisungBearbeiten';
const schnellzuweisungBearbeitenToolbox = 'schnellzuweisungBearbeiten';

@Component({
    selector: 'avam-schnellzuweisungen-bearbeiten',
    templateUrl: './schnellzuweisungen-bearbeiten.component.html',
    styleUrls: ['./schnellzuweisungen-bearbeiten.component.scss'],
    providers: [ObliqueHelperService, SchnellzuweisungFormHandler]
})
export class SchnellzuweisungenBearbeitenComponent implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('vermittlung') vermittlung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('unternehmenAS') unternehmenAS: AvamUnternehmenAutosuggestComponent;
    vermittlungSuchenTokens: {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    zuweisungId: string;
    stesId: string;
    zuweisungPendentCodeId: string;

    editMode = true;
    unternehmenId: number = null;
    anredeOptions = [];
    vermittlungsergebnisOptions = [];
    vermittlungsstatusOptions = [];
    editPermissions = [Permissions.STES_SCHNELLZUWEISUNG_BEARBEITEN];
    toolboxActionSub: Subscription;
    authSub: Subscription;
    schnellzuweisungForm: FormGroup;
    checkboxForm: FormGroup;
    schnellzuweisungData: SchnellzuweisungDTO;

    shouldShowPrompt: boolean[] = [true];

    schnellzuweisungChannel = schnellzuweisungBearbeitenChannel;
    schnellzuweisungToolboxId = schnellzuweisungBearbeitenToolbox;
    shouldDisableModal: boolean;

    constructor(
        private resetDialogService: ResetDialogService,
        private obliqueHelper: ObliqueHelperService,
        private navigationService: NavigationService,
        private route: ActivatedRoute,
        private router: Router,
        private fehlermeldungenService: FehlermeldungenService,
        private schnellzuweisungFormHandler: SchnellzuweisungFormHandler,
        private infopanelService: AmmInfopanelService,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private dataService: StesDataRestService,
        private facade: FacadeService,
        private readonly modalService: NgbModal,
        private authService: AuthenticationService,
        private translateService: TranslateService,
        private notificationService: NotificationService,
        private dbTranslateService: DbTranslateService,
        private messageBus: MessageBus,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        ToolboxService.CHANNEL = this.schnellzuweisungToolboxId;
        SpinnerService.CHANNEL = this.schnellzuweisungChannel;
    }

    ngOnInit() {
        this.infopanelService.updateInformation({ subtitle: 'stes.subnavmenuitem.stellenvermittlungschnellzuweisung' });
        this.obliqueHelper.ngForm = this.ngForm;
        this.getRouteParams();
        this.setSideNav();
        this.toolboxActionSub = this.subscribeToToolbox();
        this.schnellzuweisungForm = this.schnellzuweisungFormHandler.createForm(this.editMode);
        this.checkboxForm = this.schnellzuweisungFormHandler.defineFormGroups(this.schnellzuweisungForm);
        this.schnellzuweisungFormHandler.setAdditionalValidators(this.checkboxForm, this.schnellzuweisungForm);
        this.schnellzuweisungForm.valueChanges.subscribe(val => {
            this.unternehmenId = val.unternehmenId !== -1 ? val.unternehmenId : null;
            this.shouldDisableModal = this.isArbeitgeberDirty();
        });
        this.loadData();
        this.initVermittlungSuchenToken();
        this.configureToolbox();
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.schnellzuweisungBearbeiten' });
    }

    isArbeitgeberDirty() {
        return this.schnellzuweisungFormHandler.isArbeitgeberDirty(this.schnellzuweisungForm, this.unternehmenId);
    }

    closeComponent(message) {
        if (message.data.label === this.translateService.instant(SchnellzuweisungLabels.SCHNELLZUWEISUNG_BEARBEITEN)) {
            this.cancel();
        }
    }

    initVermittlungSuchenToken() {
        const currentUser = this.authService.getLoggedUser();

        if (currentUser) {
            this.vermittlungSuchenTokens = {
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    loadData() {
        this.spinnerService.activate(this.schnellzuweisungChannel);
        forkJoin<CodeDTO[], CodeDTO[], CodeDTO[], BaseResponseWrapperSchnellzuweisungDTOWarningMessages>([
            this.dataService.getCode(DomainEnum.STESSTATUSZUWEISUNG),
            this.dataService.getCode(DomainEnum.ANREDE),
            this.dataService.getCode(DomainEnum.VERMITTLUNGSSTAND),
            this.dataService.getSchnellzuweisung(this.zuweisungId)
        ]).subscribe(
            ([statusOptions, anredeOptions, ergebnisOptions, schnellzuweisung]) => {
                if (statusOptions) {
                    this.zuweisungPendentCodeId = this.facade.formUtilsService.getCodeIdByCode(statusOptions, SchnellzuweisungCodeEnum.PENDENT);
                    this.vermittlungsstatusOptions = this.facade.formUtilsService
                        .mapDropdown(statusOptions)
                        .filter(status => status.code === SchnellzuweisungCodeEnum.PENDENT || status.code === SchnellzuweisungCodeEnum.ERLEDIGT);
                }
                if (anredeOptions) {
                    this.anredeOptions = this.facade.formUtilsService.mapDropdownKurztext(anredeOptions);
                }
                if (ergebnisOptions) {
                    this.vermittlungsergebnisOptions = this.facade.formUtilsService
                        .mapDropdownKurztext(ergebnisOptions)
                        .filter(ergebnis => ergebnis.code !== SchnellzuweisungCodeEnum.VERMITTLUNGSERGEBNIS_NICHT_GEEIGNET);
                }
                if (schnellzuweisung && schnellzuweisung.data) {
                    this.schnellzuweisungData = schnellzuweisung.data;
                    this.authService.setOwnerPermissionContext(this.schnellzuweisungData.stesId, this.schnellzuweisungData.ownerId);
                    this.schnellzuweisungForm.reset(this.mapToForm(this.schnellzuweisungData));
                    this.schnellzuweisungForm.controls.land['landAutosuggestObject'] = this.schnellzuweisungData.ugStaatObject;
                    this.checkboxForm.reset(this.mapCheckboxToForm(this.schnellzuweisungData));
                }
                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    mapToForm(schnellzuweisungData: SchnellzuweisungDTO) {
        return {
            schnellzuweisungVom: this.facade.formUtilsService.parseDate(schnellzuweisungData.schnellzuweisungVom),
            vermittlungsNr: schnellzuweisungData.schnellzuweisungNr,
            bewerbungBis: this.facade.formUtilsService.parseDate(schnellzuweisungData.bewerbungBis),
            status: schnellzuweisungData.schnellzuweisungStatusId,
            vermittlung: schnellzuweisungData.vermittlerDetailObject,
            unternehmenId: schnellzuweisungData.unternehmenId,
            arbeitgeberName1: this.getArbeitgeberName1(schnellzuweisungData),
            arbeitgeberName2: schnellzuweisungData.unternehmenName2,
            arbeitgeberName3: schnellzuweisungData.unternehmenName3,
            arbeitgeberStrasse: schnellzuweisungData.unternehmenStrasse,
            arbeitgeberStrasseNr: schnellzuweisungData.unternehmenHausNr,
            plz: this.getPlz(schnellzuweisungData),
            unternehmenPostfach: schnellzuweisungData.unternehmenPostfach,
            postfach: this.getPostfach(schnellzuweisungData),
            land: schnellzuweisungData.ugStaatObject,
            kontaktpersonForm: this.getKontaktpersonForm(schnellzuweisungData),
            stellenbezeichnung: schnellzuweisungData.stellenbezeichnung,
            berufTaetigkeit: schnellzuweisungData.berufObject,
            vermittlungsGrad: schnellzuweisungData.beschaeftigungsgrad === 0 ? '' : schnellzuweisungData.beschaeftigungsgrad,
            email: schnellzuweisungData.bewerUnternehmenEmail,
            onlineFormular: schnellzuweisungData.bewerUnternehmenUrl,
            telefon: schnellzuweisungData.bewerUnternehmenTelefon,
            ojbVersion: schnellzuweisungData.ojbVersion,
            vermittlungsergebnis: schnellzuweisungData.vermittlungsstandId,
            ergaenzendeAngaben: schnellzuweisungData.ergaenzendeAngaben,
            rueckmeldungStes: schnellzuweisungData.rueckmeldungStes,
            rueckmeldungArbeitgeber: schnellzuweisungData.rueckmeldungArbeitgeber
        };
    }

    onPersonalEmailClick() {
        this.shouldShowPrompt = [false];
    }

    private getArbeitgeberName1(schnellzuweisungData: SchnellzuweisungDTO) {
        return schnellzuweisungData.unternehmenId
            ? { unternehmenId: schnellzuweisungData.unternehmenId, name1: schnellzuweisungData.unternehmenName1 }
            : schnellzuweisungData.unternehmenName1;
    }

    private getPlz(schnellzuweisungData: SchnellzuweisungDTO) {
        return {
            postleitzahl: schnellzuweisungData.ugPlzObject ? schnellzuweisungData.ugPlzObject : schnellzuweisungData.ugAuslPlz || '',
            ort: schnellzuweisungData.ugPlzObject ? schnellzuweisungData.ugPlzObject : schnellzuweisungData.ugAuslPostleitort || ''
        };
    }

    private getPostfach(schnellzuweisungData: SchnellzuweisungDTO) {
        return {
            postleitzahl: schnellzuweisungData.ugPostfachPlzObject ? schnellzuweisungData.ugPostfachPlzObject : schnellzuweisungData.ugAuslPostfachPlz || '',
            ort: schnellzuweisungData.ugPostfachPlzObject ? schnellzuweisungData.ugPostfachPlzObject : schnellzuweisungData.ugAuslPostfachOrt || ''
        };
    }

    private getKontaktpersonForm(schnellzuweisungData: SchnellzuweisungDTO) {
        return {
            kontaktpersonName: schnellzuweisungData.kontaktpersonName,
            kontaktpersonVorname: schnellzuweisungData.kontaktpersonVorname,
            anrede: schnellzuweisungData.kontaktpersonAnredeId,
            kontaktpersonTelefon: schnellzuweisungData.kontaktpersonTelefon,
            kontaktpersonEmail: schnellzuweisungData.kontaktpersonEmail
        };
    }

    mapCheckboxToForm(schnellzuweisungData: SchnellzuweisungDTO) {
        const map = {
            schriftlich: schnellzuweisungData.schriftlich,
            persoenlich: schnellzuweisungData.persoenlich,
            elektronisch: schnellzuweisungData.elektronisch,
            telefonisch: schnellzuweisungData.telefonisch
        };

        return map;
    }

    setSideNav() {
        this.navigationService.showNavigationTreeRoute(StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_BEARBEITEN, { zuweisungId: this.zuweisungId });
    }

    getRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.zuweisungId = params.get('zuweisungId');
        });
    }

    configureToolbox() {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.SCHNELLZUWEISUNG,
            vorlagenKategorien: [VorlagenKategorie.Vermittlung_Schnellzuweisung],
            entityIDsMapping: { SCHNELLZUWEISUNG_ID: +this.zuweisungId }
        };

        this.authSub = this.authService.buttonsPermissionSubject.subscribe(buttonPermissions => {
            const toolboxConfig = ToolboxConfig.getDefaultConfig();
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.COPY, true, true));
            if (this.authService.hasAllPermissions(this.editPermissions, buttonPermissions)) {
                toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.WORD, true, true));
            }
            this.toolboxService.sendConfiguration(toolboxConfig, this.schnellzuweisungToolboxId, toolboxData);
        });
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                window.print();
            } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.zuweisungId, AvamCommonValueObjectsEnum.T_SCHNELLZUWEISUNG);
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

        comp.context = DmsMetadatenContext.DMS_CONTEXT_SCHNELLZUWEISUNG;
        comp.id = this.zuweisungId;
    }

    checkVermittlungsErgebnis(): boolean {
        if (
            this.schnellzuweisungForm.controls.vermittlungsergebnis.value &&
            this.schnellzuweisungForm.controls.vermittlungsergebnis.value !== '' &&
            this.schnellzuweisungForm.controls.status.value === +this.zuweisungPendentCodeId
        ) {
            this.fehlermeldungenService.showMessage('stes.vermittlung.feedback.mutierenauferledigt', 'danger');
            return true;
        } else {
            return false;
        }
    }

    onKontaktpersonSelected(kontaktperson: KontakteViewDTO) {
        this.schnellzuweisungFormHandler.onKontaktpersonSelected(kontaktperson, this.schnellzuweisungForm);
    }

    onKontaktpersonClear() {
        this.schnellzuweisungFormHandler.onKontaktpersonClear(this.schnellzuweisungForm);
    }

    selectedItem(data) {
        if (data) {
            this.schnellzuweisungFormHandler.mapSelectedUnternehmenToForm(data, this.schnellzuweisungForm, this.schnellzuweisungChannel);
        }
    }

    onUnternehmenInput() {
        this.schnellzuweisungForm.controls.unternehmenId.setValue(-1);
    }

    cancel() {
        if (this.router.url.includes(StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_BEARBEITEN)) {
            this.router.navigate([`./${StesArbeitsvermittlungPaths.ARBEITSVERMITTLUNGEN_ANZEIGEN}`], { relativeTo: this.route.parent });
            this.navigationService.hideNavigationTreeRoute(StesArbeitsvermittlungPaths.SCHNELLZUWEISUNG_BEARBEITEN, { zuweisungId: this.zuweisungId });
        } else if (this.router.url.includes('arbeitgeber/details')) {
            this.router.navigate([`./schnellzuweisungen`], { relativeTo: this.route.parent });
            this.navigationService.hideNavigationTreeRoute('./schnellzuweisungen/bearbeiten');
        }
    }

    reset() {
        if (this.schnellzuweisungForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.schnellzuweisungForm.reset(this.mapToForm(this.schnellzuweisungData));
                this.checkboxForm.reset(this.mapCheckboxToForm(this.schnellzuweisungData));
            });
        }
    }

    openDeleteDialog() {
        this.openModal(GenericConfirmComponent, 'modal-basic-title');
    }

    openModal(content, windowClass) {
        const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass, backdrop: 'static' });
        modalRef.result.then(
            result => {
                if (result) {
                    this.delete();
                }
            },
            reason => {
                ToolboxService.CHANNEL = this.schnellzuweisungChannel;
            }
        );
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    delete() {
        this.fehlermeldungenService.closeMessage();
        this.spinnerService.activate(this.schnellzuweisungChannel);
        this.dataService.deleteSchnellzuweisung(this.mapToDTO()).subscribe(
            response => {
                if (!response.warning) {
                    this.schnellzuweisungForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengeloescht'));
                    this.cancel();
                }

                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.handleError('common.message.datennichtgeloescht');
            }
        );
    }

    mapToDTO() {
        const kontaktpersonForm = this.schnellzuweisungForm.controls.kontaktpersonForm as FormGroup;
        const kontaktpersonCtrls = kontaktpersonForm.controls;
        return {
            schnellzuweisungId: +this.zuweisungId,
            ojbVersion: this.schnellzuweisungForm.controls.ojbVersion.value,
            stesId: +this.stesId,
            schnellzuweisungVom: this.facade.formUtilsService.parseDate(this.schnellzuweisungForm.controls.schnellzuweisungVom.value),
            schnellzuweisungNr: this.schnellzuweisungForm.controls.vermittlungsNr.value,
            bewerbungBis: this.facade.formUtilsService.parseDate(this.schnellzuweisungForm.controls.bewerbungBis.value),
            schnellzuweisungStatusId: this.schnellzuweisungForm.controls.status.value,
            vermittlerDetailObject: this.schnellzuweisungForm.controls.vermittlung['benutzerObject']
                ? this.schnellzuweisungForm.controls.vermittlung['benutzerObject']
                : this.schnellzuweisungForm.controls.vermittlung.value,
            unternehmenId: this.mapUnternehmenId(),
            unternehmenName1: this.mapUnternehmenName1(),
            unternehmenName2: this.schnellzuweisungForm.controls.arbeitgeberName2.value,
            unternehmenName3: this.schnellzuweisungForm.controls.arbeitgeberName3.value,
            unternehmenStrasse: this.schnellzuweisungForm.controls.arbeitgeberStrasse.value,
            unternehmenHausNr: this.schnellzuweisungForm.controls.arbeitgeberStrasseNr.value,
            unternehmenPostfach: this.schnellzuweisungForm.controls.unternehmenPostfach.value,
            ugStaatObject: this.schnellzuweisungForm.controls.land['landAutosuggestObject'],
            ugPlzObject: this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'] ? this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'] : null,
            ugAuslPlz: this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'] ? this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'].plzWohnadresseAusland : null,
            ugAuslPostleitort: this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject']
                ? this.schnellzuweisungForm.controls.plz['plzWohnAdresseObject'].ortWohnadresseAusland
                : null,
            ugPostfachPlzObject: this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject'] ? this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject'] : null,
            ugAuslPostfachPlz: this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject']
                ? this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject'].plzWohnadresseAusland
                : null,
            ugAuslPostfachOrt: this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject']
                ? this.schnellzuweisungForm.controls.postfach['plzWohnAdresseObject'].ortWohnadresseAusland
                : null,
            kontaktpersonAnredeId: +kontaktpersonCtrls.anrede.value,
            kontaktpersonName: kontaktpersonCtrls.kontaktpersonName.value ? kontaktpersonCtrls.kontaktpersonName.value : '',
            kontaktpersonVorname: kontaktpersonCtrls.kontaktpersonVorname.value,
            kontaktpersonTelefon: kontaktpersonCtrls.kontaktpersonTelefon.value,
            kontaktpersonEmail: kontaktpersonCtrls.kontaktpersonEmail.value,
            stellenbezeichnung: this.schnellzuweisungForm.controls.stellenbezeichnung.value,
            berufObject: this.schnellzuweisungForm.controls.berufTaetigkeit['berufAutosuggestObject'],
            beschaeftigungsgrad: +this.schnellzuweisungForm.controls.vermittlungsGrad.value,
            schriftlich: this.checkboxForm.controls.schriftlich.value,
            elektronisch: this.checkboxForm.controls.elektronisch.value,
            telefonisch: this.checkboxForm.controls.telefonisch.value,
            persoenlich: this.checkboxForm.controls.persoenlich.value,
            bewerUnternehmenEmail: this.schnellzuweisungForm.controls.email.value,
            bewerUnternehmenTelefon: this.schnellzuweisungForm.controls.telefon.value,
            bewerUnternehmenUrl: this.schnellzuweisungFormHandler.mapOnlineFormularToDTO(this.schnellzuweisungForm.controls.onlineFormular.value),
            vermittlungsstandId: this.schnellzuweisungForm.controls.vermittlungsergebnis.value,
            ergaenzendeAngaben: this.schnellzuweisungForm.controls.ergaenzendeAngaben.value,
            rueckmeldungStes: this.schnellzuweisungForm.controls.rueckmeldungStes.value,
            rueckmeldungArbeitgeber: this.schnellzuweisungForm.controls.rueckmeldungArbeitgeber.value
        };
    }

    mapUnternehmenId() {
        const unternehmenId = this.schnellzuweisungForm.controls.arbeitgeberName1['unternehmenAutosuggestObject'].unternehmenId;
        if (unternehmenId > 0) {
            return unternehmenId;
        } else if (!this.checkIfArbeitgeberChanged()) {
            return this.schnellzuweisungData.unternehmenId;
        }
        return null;
    }

    mapUnternehmenName1() {
        const unternehmenId = this.schnellzuweisungForm.controls.arbeitgeberName1['unternehmenAutosuggestObject'].unternehmenId;
        return unternehmenId && unternehmenId !== -1
            ? this.schnellzuweisungForm.controls.arbeitgeberName1['unternehmenAutosuggestObject'].name1
            : this.schnellzuweisungForm.controls.arbeitgeberName1.value;
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        if (this.checkVermittlungsErgebnis()) {
            return;
        }
        if (!this.schnellzuweisungForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.spinnerService.activate(this.schnellzuweisungChannel);

        this.dataService.updateSchnellzuweisung(this.mapToDTO(), this.translateService.currentLang).subscribe(
            schnellzuweisung => {
                if (schnellzuweisung.data !== null) {
                    this.schnellzuweisungData = schnellzuweisung.data;
                    this.unternehmenAS.clearInfoIconDetails();
                    this.unternehmenId = null;
                    this.schnellzuweisungForm.reset(this.mapToForm(this.schnellzuweisungData));
                    this.schnellzuweisungForm.controls.land['landAutosuggestObject'] = this.schnellzuweisungData.ugStaatObject;
                    this.checkboxForm.reset(this.mapCheckboxToForm(this.schnellzuweisungData));

                    this.schnellzuweisungForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                }
                this.spinnerService.deactivate(this.schnellzuweisungChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.handleError('common.message.datennichtgespeichert');
            }
        );
    }

    handleError(message: string) {
        this.notificationService.error(this.translateService.instant(message));
        this.spinnerService.deactivate(this.schnellzuweisungChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    canDeactivate(): boolean {
        return this.schnellzuweisungForm.dirty;
    }

    ngOnDestroy() {
        this.authService.removeOwnerPermissionContext();
        this.toolboxService.sendConfiguration([]);
        this.toolboxActionSub.unsubscribe();
        this.fehlermeldungenService.closeMessage();
        if (this.authSub) {
            this.authSub.unsubscribe();
        }
    }

    private checkIfArbeitgeberChanged(): boolean {
        return (
            this.schnellzuweisungForm.controls.arbeitgeberName1.dirty ||
            this.schnellzuweisungForm.controls.arbeitgeberName2.dirty ||
            this.schnellzuweisungForm.controls.arbeitgeberName3.dirty ||
            this.schnellzuweisungForm.controls.arbeitgeberStrasse.dirty ||
            this.schnellzuweisungForm.controls.arbeitgeberStrasseNr.dirty ||
            this.schnellzuweisungForm.controls.unternehmenPostfach.dirty
        );
    }
}

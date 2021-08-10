import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { KontakteViewDTO } from '@dtos/kontakteViewDTO';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { FachberatungsangebotService } from '@shared/services/fachberatungsangebot.service';
import { first, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute } from '@angular/router';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { forkJoin, Subscription } from 'rxjs';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { FachberatungParamDTO } from '@dtos/fachberatungParamDTO';
import { StaatDTO } from '@dtos/staatDTO';
import { PhoneValidator } from '@shared/validators/phone-validator';
import { EmailValidator } from '@shared/validators/email-validator';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { FbStatusCodeEnum } from '@shared/enums/domain-code/fb-status-code.enum';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { FacadeService } from '@shared/services/facade.service';
import { BaseResponseWrapperFachberatungParamDTOWarningMessages } from '@dtos/baseResponseWrapperFachberatungParamDTOWarningMessages';

@Component({
    selector: 'avam-fachberatungsangebot-erfassen',
    templateUrl: './fachberatungsangebot-erfassen.component.html',
    styleUrls: ['./fachberatungsangebot-erfassen.component.scss']
})
export class FachberatungsangebotErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('angebotsverantwortung') angebotsverantwortung: AvamPersonalberaterAutosuggestComponent;

    fbBeratungsbereichOptions: any[] = [];
    anredeOptions: DropdownOption[] = [];
    statusOptions: DropdownOption[] = [];
    unternehmenId: number;
    isBearbeiten = false;
    formDisabled = false;
    fachberatungsangebotForm: FormGroup;
    permissions: typeof Permissions = Permissions;
    readonly textMaxlength = 255;
    readonly angebotsverantwortungType = BenutzerAutosuggestType.BENUTZER_ALLE;
    readonly channel = 'fachberatungsangebot-erfassen';

    private static readonly SIDE_NAVI_ITEM = './fachberatungsangebote';
    private static readonly SIDE_NAV_ITEM_PATH_ERFASSEN = './fachberatungsangebote/erfassen';
    private static readonly SIDE_NAV_ITEM_PATH_BEARBEITEN = './fachberatungsangebote/bearbeiten';
    private static readonly ERSTELLEN_TITLE = 'stes.label.fachberatungsangebotErfassen';
    private static readonly BEARBEITEN_TITLE = 'stes.label.fachberatungsangebotBearbeiten';
    private static readonly DATEN_GESPEICHERT = 'common.message.datengespeichert';
    private static readonly INFO_STANDORTADRESSE_DIFFERENT = 'stes.alttext.fachberatung.uadressedifferent';
    private static readonly DATEN_GELOESCHT = 'common.message.datengeloescht';
    private static readonly LOESCHEN_TITLE = 'i18n.common.delete';
    private static readonly DATEN_WIRKLICHL_LOESCHEN = 'common.label.datenWirklichLoeschen';
    private static readonly JA_LOESCHEN = 'common.button.jaLoeschen';
    private static readonly LOESCHEN_ABBRECHEN = 'common.button.loeschenabbrechen';

    private schweiz: StaatDTO;
    private fachberatungsangebotId: number;
    private loadedAngebot: FachberatungParamDTO;
    private angebotCreated = false;

    constructor(
        private fachberatungsangebotService: FachberatungsangebotService,
        private formBuilder: FormBuilder,
        private obliqueHelper: ObliqueHelperService,
        private route: ActivatedRoute,
        private stesRestService: StesDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private interactionService: StesComponentInteractionService,
        private elementRef: ElementRef,
        private facadeService: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.setSubscriptions();
        this.createForm();
    }

    ngOnDestroy() {
        this.facadeService.toolboxService.resetConfiguration();
        if (!this.angebotCreated) {
            this.facadeService.fehlermeldungenService.closeMessage();
        }
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return this.fachberatungsangebotForm.dirty;
    }

    save(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.fachberatungsangebotForm.valid) {
            if (this.isBearbeiten) {
                this.updateAngebot();
            } else {
                this.createAngebot();
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    cancel(): void {
        const visible = !!this.elementRef.nativeElement.offsetParent;
        if (visible && this.canDeactivate()) {
            this.checkConfirmationToCancel();
        } else {
            this.hideNavItem();
        }
        this.fachberatungsangebotService.navigateToFachberatungsangebote(this.route);
    }

    reset(): void {
        if (this.fachberatungsangebotForm.dirty) {
            this.facadeService.resetDialogService.reset(() => {
                if (this.isBearbeiten && this.loadedAngebot) {
                    this.mapToForm(this.loadedAngebot);
                } else {
                    this.fachberatungsangebotForm.reset();
                    this.initFormWithDefaults();
                }
            });
        }
    }

    openDeleteModal(): void {
        const modalRef = this.facadeService.openModalFensterService.openModal(GenericConfirmComponent);
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
        modalRef.componentInstance.titleLabel = FachberatungsangebotErfassenComponent.LOESCHEN_TITLE;
        modalRef.componentInstance.promptLabel = FachberatungsangebotErfassenComponent.DATEN_WIRKLICHL_LOESCHEN;
        modalRef.componentInstance.primaryButton = FachberatungsangebotErfassenComponent.JA_LOESCHEN;
        modalRef.componentInstance.secondaryButton = FachberatungsangebotErfassenComponent.LOESCHEN_ABBRECHEN;
    }

    delete(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.fachberatungsangebotService
            .deleteAngebot(this.fachberatungsangebotId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                if (!(response && response.warning)) {
                    this.facadeService.notificationService.success(FachberatungsangebotErfassenComponent.DATEN_GELOESCHT);
                    this.hideNavItem();
                    this.facadeService.navigationService.showNavigationTreeRoute(FachberatungsangebotErfassenComponent.SIDE_NAVI_ITEM);
                    this.fachberatungsangebotService.navigateToFachberatungsangebote(this.route);
                }
            });
    }

    onKontaktpersonSelected(kontaktperson: KontakteViewDTO): void {
        const form = {
            kpAnrede: kontaktperson.anredeId,
            kpName: kontaktperson.name,
            kpVorname: kontaktperson.vorname,
            kpTelefon: kontaktperson.telefonNr,
            kpEmail: kontaktperson.email
        };
        this.fachberatungsangebotForm.markAsDirty();
        this.fachberatungsangebotForm.patchValue(form);
    }

    setAnredeValidation(event: any): void {
        const kpName = event && event.target ? event.target.value : event;
        if (kpName) {
            this.fachberatungsangebotForm.controls.kpAnrede.setValidators(Validators.required);
        } else {
            this.fachberatungsangebotForm.controls.kpAnrede.clearValidators();
        }
        this.fachberatungsangebotForm.controls.kpAnrede.updateValueAndValidity();
    }

    private createAngebot(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.fachberatungsangebotService
            .createAngebot(this.mapToDTO(), this.facadeService.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                value => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (value.data) {
                        this.angebotCreated = true;
                        this.facadeService.notificationService.success(FachberatungsangebotErfassenComponent.DATEN_GESPEICHERT);
                        this.facadeService.navigationService.hideNavigationTreeRoute(FachberatungsangebotErfassenComponent.SIDE_NAV_ITEM_PATH_ERFASSEN);
                        this.fachberatungsangebotService.resetCloseErfassenSubscription();
                        this.fachberatungsangebotForm.reset();
                        this.fachberatungsangebotService.navigateToFachberatungsangebotBearbeitenAfterCreate(this.route, value.data);
                    }
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    private checkConfirmationToCancel(): void {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideNavItem();
            }
        });
    }

    private setTitle(): void {
        if (this.isBearbeiten) {
            this.fachberatungsangebotService.updateTitle({ subtitle: FachberatungsangebotErfassenComponent.BEARBEITEN_TITLE });
        } else {
            this.fachberatungsangebotService.updateTitle({ subtitle: FachberatungsangebotErfassenComponent.ERSTELLEN_TITLE });
        }
    }

    private showNavigationTreeRoute(): void {
        if (this.isBearbeiten) {
            this.facadeService.navigationService.showNavigationTreeRoute(FachberatungsangebotErfassenComponent.SIDE_NAV_ITEM_PATH_BEARBEITEN, {
                fachberatungsangebotId: this.fachberatungsangebotId
            });
        } else {
            this.facadeService.navigationService.showNavigationTreeRoute(FachberatungsangebotErfassenComponent.SIDE_NAV_ITEM_PATH_ERFASSEN);
        }
    }

    private createForm(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.fachberatungsangebotForm = this.formBuilder.group({
            angebotsNr: null,
            fbBeratungsbereich: [null, [Validators.required]],
            bezeichnung: [null, [Validators.required]],
            zielpublikum: [null, [Validators.required]],
            initialisierung: [null, [Validators.required]],
            leistung: [null, [Validators.required]],
            angebotsverantwortung: [null, [Validators.required]],
            status: null,
            name1: [null, [Validators.required]],
            name2: null,
            name3: null,
            strasse: null,
            hausNr: null,
            plzOrt: this.formBuilder.group({
                plz: [null, [Validators.required]],
                ort: [null, [Validators.required]]
            }),
            land: [null, [Validators.required]],
            kontaktperson: null,
            kpAnrede: null,
            kpName: null,
            kpVorname: null,
            kpTelefon: [null, [PhoneValidator.isValidFormatWarning]],
            kpEmail: [null, [EmailValidator.isValidFormat]]
        });
    }

    private configureErfassenToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getFachberatungsangebotErfassenConfig(), this.channel);
    }

    private configureBearbeitenToolbox(): void {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.FACHBERATUNGANGEBOT,
            vorlagenKategorien: [VorlagenKategorie.FACHBERATUNG_ANGEBOT],
            entityIDsMapping: { FACHBERATUNGSANGEBOT_ID: this.fachberatungsangebotId, GF_ID: this.fachberatungsangebotId }
        };
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getFachberatungsangebotBearbeitenConfig(), this.channel, toolboxData);
    }

    private setSubscriptions(): void {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
        });
        this.route.queryParamMap.subscribe(params => {
            this.fachberatungsangebotId = Number(params.get('fachberatungsangebotId'));
        });

        this.route.data.subscribe(data => {
            this.isBearbeiten = data.formNumber === StesFormNumberEnum.FACHBERATUNGSANGEBOT_BEARBEITEN;
            this.showNavigationTreeRoute();
            forkJoin([
                this.stesRestService.getCode(DomainEnum.BERATUNGSBEREICH),
                this.stesRestService.getCode(DomainEnum.ANREDE),
                this.stesRestService.getCode(DomainEnum.STATUS_FB),
                this.stesRestService.getStaatSwiss()
            ]).subscribe(([beratungsbereich, zustaendigkeitsbereich, statusfb, staat]) => {
                this.fbBeratungsbereichOptions = this.facadeService.formUtilsService.mapDropdownKurztext(beratungsbereich);
                this.anredeOptions = this.facadeService.formUtilsService.mapDropdownKurztext(zustaendigkeitsbereich);
                this.statusOptions = this.facadeService.formUtilsService.mapDropdownKurztext(statusfb);
                this.schweiz = staat;
                this.setTitle();

                if (this.isBearbeiten) {
                    this.fachberatungsangebotService.resetCloseBearbeitenSubscription();
                    this.fachberatungsangebotService.closeBearbeitenNavItemSubscription = this.subscribeOnCloseNavItem();
                    this.loadAngebot();
                } else {
                    this.fachberatungsangebotService.resetCloseErfassenSubscription();
                    this.fachberatungsangebotService.closeErfassenNavItemSubscription = this.subscribeOnCloseNavItem();
                    this.initFormWithDefaults();
                    this.configureErfassenToolbox();
                }
            });
        });

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: { channel: any; message: ToolboxEvent }) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal();
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });
    }

    private getUpdatedDTO(): FachberatungParamDTO {
        return { ...this.loadedAngebot, ...this.mapToDTO() };
    }

    private mapToDTO(): FachberatungParamDTO {
        let dto: FachberatungParamDTO = {
            angebotsNr: +this.fachberatungsangebotForm.controls.angebotsNr.value,
            fachberatungsbereichObject: {
                codeId: this.fachberatungsangebotForm.controls.fbBeratungsbereich.value
            },
            unternehmenId: +this.unternehmenId,
            bezeichnung: this.fachberatungsangebotForm.controls.bezeichnung.value,
            zielpublikum: this.fachberatungsangebotForm.controls.zielpublikum.value,
            initialisierung: this.fachberatungsangebotForm.controls.initialisierung.value,
            leistung: this.fachberatungsangebotForm.controls.leistung.value,
            statusId: this.isBearbeiten ? +this.fachberatungsangebotForm.controls.status.value : +this.getInitialStatus(),
            name1: this.fachberatungsangebotForm.controls.name1.value,
            name2: this.fachberatungsangebotForm.controls.name2.value,
            name3: this.fachberatungsangebotForm.controls.name3.value,
            strasse: this.fachberatungsangebotForm.controls.strasse.value,
            hausNr: this.fachberatungsangebotForm.controls.hausNr.value,
            staat: this.fachberatungsangebotForm.controls.land['landAutosuggestObject'],
            kpKontaktId: this.fachberatungsangebotForm.controls.kontaktperson['kontaktpersonObject']
                ? this.fachberatungsangebotForm.controls.kontaktperson['kontaktpersonObject'].kontaktId
                : null,
            kpAnredeId: this.fachberatungsangebotForm.controls.kpAnrede.value ? +this.fachberatungsangebotForm.controls.kpAnrede.value : null,
            kpName: this.fachberatungsangebotForm.controls.kpName.value,
            kpVorname: this.fachberatungsangebotForm.controls.kpVorname.value,
            kpTelefon: this.fachberatungsangebotForm.controls.kpTelefon.value,
            kpEmail: this.fachberatungsangebotForm.controls.kpEmail.value
        };
        dto = this.addAngebotsverantwortungData(dto);
        this.fillPlzObj(dto);
        return dto;
    }

    private addAngebotsverantwortungData(dto: FachberatungParamDTO): any {
        const angebotsverantwortungFields = {
            benutzerDetailId: +this.fachberatungsangebotForm.controls.angebotsverantwortung['benutzerObject'].benutzerDetailId,
            benutzerLogin: this.fachberatungsangebotForm.controls.angebotsverantwortung['benutzerObject'].benutzerLogin,
            benutzerName: this.fachberatungsangebotForm.controls.angebotsverantwortung['benutzerObject'].nachname,
            benutzerVorname: this.fachberatungsangebotForm.controls.angebotsverantwortung['benutzerObject'].vorname
        };
        return { ...dto, ...angebotsverantwortungFields };
    }

    private fillPlzObj(dto: FachberatungParamDTO): void {
        if (this.isSchweiz(dto.staat)) {
            dto.plz = this.fachberatungsangebotForm.controls.plzOrt['plzWohnAdresseObject'];
        } else {
            dto.plzAusland = this.fachberatungsangebotForm.controls.plzOrt['plzWohnAdresseObject'].plzWohnadresseAusland;
            dto.ortAusland = this.fachberatungsangebotForm.controls.plzOrt['plzWohnAdresseObject'].ortWohnadresseAusland;
        }
    }

    private isSchweiz(staatObject: StaatDTO): boolean {
        return staatObject && staatObject.staatId === this.schweiz.staatId;
    }

    private initFormWithDefaults(): void {
        this.unternehmenRestService
            .getUnternehmenDataById(String(this.unternehmenId))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                if (response.data) {
                    const unternehmenData: UnternehmenResponseDTO = response.data;
                    const form = {
                        name1: unternehmenData.name1,
                        name2: unternehmenData.name2,
                        name3: unternehmenData.name3,
                        strasse: unternehmenData.strasse,
                        hausNr: unternehmenData.strasseNr,
                        land: unternehmenData.land
                    };
                    this.fillPlzFieldsOfUnternehmen(form, unternehmenData);
                    this.fachberatungsangebotForm.reset(form);
                    this.angebotsverantwortung.appendCurrentUser();
                }
            });
    }

    private fillPlzFieldsOfUnternehmen(form: any, unternehmenData: UnternehmenResponseDTO): void {
        if (this.isSchweiz(unternehmenData.land)) {
            form.plzOrt = {
                plz: unternehmenData.plzOrt ? unternehmenData.plzOrt : null,
                ort: unternehmenData.plzOrt ? unternehmenData.plzOrt : null
            };
        } else {
            form.plzOrt = {
                plz: unternehmenData.plzAusland,
                ort: unternehmenData.ortAusland
            };
        }
    }

    private getInitialStatus(): string {
        return this.facadeService.formUtilsService.getCodeIdByCode(this.statusOptions, FbStatusCodeEnum.FB_STATUS_AKTIV);
    }

    private loadAngebot(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.fachberatungsangebotService
            .getAngebot(String(this.unternehmenId), this.fachberatungsangebotId, this.facadeService.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((angebot: BaseResponseWrapperFachberatungParamDTOWarningMessages) => {
                this.loadedAngebot = angebot.data;
                this.mapToForm(angebot.data);
                this.facadeService.spinnerService.deactivate(this.channel);
                this.configureBearbeitenToolbox();
            });
    }

    private mapToForm(angebot: FachberatungParamDTO): void {
        const form = {
            angebotsNr: angebot.angebotsNr,
            fbBeratungsbereich: angebot.fachberatungsbereichObject.codeId,
            bezeichnung: angebot.bezeichnung,
            zielpublikum: angebot.zielpublikum,
            initialisierung: angebot.initialisierung,
            leistung: angebot.leistung,
            angebotsverantwortung: angebot.benutzerDetailDto,
            status: angebot.statusId,
            name1: angebot.name1,
            name2: angebot.name2,
            name3: angebot.name3,
            strasse: angebot.strasse,
            hausNr: angebot.hausNr,
            land: angebot.staat,
            kpAnrede: angebot.kpAnredeId,
            kpName: angebot.kpName,
            kpVorname: angebot.kpVorname,
            kpTelefon: angebot.kpTelefon,
            kpEmail: angebot.kpEmail
        };
        this.fillPlzFields(form, angebot);
        this.setKontaktpersonField(form, angebot);
        this.fachberatungsangebotForm.reset(form);
        this.setAnredeValidation(angebot.kpName);
        this.formDisabled = this.fachberatungsangebotService.isStatusInaktiv(this.statusOptions, angebot.statusId);
        this.infoDurchfuehrungsortDataChanged(angebot);
    }

    private fillPlzFields(form: any, angebot: FachberatungParamDTO) {
        if (this.isSchweiz(angebot.staat)) {
            form.plzOrt = {
                plz: angebot.plz ? angebot.plz : null,
                ort: angebot.plz ? angebot.plz : null
            };
        } else {
            form.plzOrt = {
                plz: angebot.plzAusland,
                ort: angebot.ortAusland
            };
        }
    }

    private setKontaktpersonField(form: any, angebot: FachberatungParamDTO): void {
        if (angebot.kpKontaktId) {
            form.kontaktperson = {
                kontaktpersonId: angebot.kpKontaktId,
                kontaktId: angebot.kpKontaktId,
                name: angebot.kpName,
                vorname: angebot.kpVorname
            };
        }
    }

    private hideNavItem(): void {
        if (this.isBearbeiten) {
            this.facadeService.navigationService.hideNavigationTreeRoute(FachberatungsangebotErfassenComponent.SIDE_NAV_ITEM_PATH_BEARBEITEN);
            this.fachberatungsangebotService.resetCloseBearbeitenSubscription();
        } else {
            this.facadeService.navigationService.hideNavigationTreeRoute(FachberatungsangebotErfassenComponent.SIDE_NAV_ITEM_PATH_ERFASSEN);
            this.fachberatungsangebotService.resetCloseErfassenSubscription();
        }
    }

    private openHistoryModal(): void {
        this.facadeService.openModalFensterService.openHistoryModal(this.fachberatungsangebotId.toString(), AvamCommonValueObjectsEnum.T_FACHBERATUNGS_ANGEBOT);
    }

    private openDmsCopyModal(): void {
        this.facadeService.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_STES_FACHBERATUNGSANGEBOT, this.fachberatungsangebotId.toString());
    }

    private updateAngebot(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.fachberatungsangebotService
            .updateAngebot(this.getUpdatedDTO(), this.facadeService.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (value: BaseResponseWrapperFachberatungParamDTOWarningMessages) => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (value.data) {
                        this.facadeService.notificationService.success(FachberatungsangebotErfassenComponent.DATEN_GESPEICHERT);
                        this.loadedAngebot = value.data;
                        this.mapToForm(value.data);
                    }
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    private infoDurchfuehrungsortDataChanged(angebot: FachberatungParamDTO): void {
        const anyDifference =
            angebot.name1Different || angebot.name2Different || angebot.name3Different || angebot.adresseDifferent || angebot.ortDifferent || angebot.landDifferent;
        if (anyDifference) {
            this.facadeService.fehlermeldungenService.showMessage(FachberatungsangebotErfassenComponent.INFO_STANDORTADRESSE_DIFFERENT, 'info');
        }
    }

    private subscribeOnCloseNavItem(): Subscription {
        return this.facadeService.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.onCancelPageSideNavigation(message);
            }
        });
    }

    private onCancelPageSideNavigation(message): void {
        if (
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE_ERFASSEN) && !this.isBearbeiten) ||
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE_BEARBEITEN) && this.isBearbeiten)
        ) {
            this.cancel();
        }
    }
}

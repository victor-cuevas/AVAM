import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { GenericConfirmComponent, KontaktpersonService, ToolboxService } from '@app/shared';
import { first, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { KontaktpersonDTO } from '@dtos/kontaktpersonDTO';
import { KontaktDTO } from '@dtos/kontaktDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { forkJoin, Subscription } from 'rxjs';
import { KontaktpersonFunktionDTO } from '@dtos/kontaktpersonFunktionDTO';
import { KontaktpersonBenutzerDTO } from '@dtos/kontaktpersonBenutzerDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { KontaktpersonStatusCode } from '@shared/enums/domain-code/kontakptperson-status-code.enum';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { DateValidator } from '@shared/validators/date-validator';
import { NumberValidator } from '@shared/validators/number-validator';
import { EmailValidator } from '@shared/validators/email-validator';
import { PhoneValidator } from '@shared/validators/phone-validator';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { TranslateService } from '@ngx-translate/core';
import { StaatDTO } from '@dtos/staatDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { UserDto } from '@dtos/userDto';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-kontakt-person-erfassen',
    templateUrl: './kontakt-person-erfassen.component.html',
    styleUrls: ['./kontakt-person-erfassen.component.scss']
})
export class KontaktPersonErfassenComponent extends Unsubscribable implements OnInit, DeactivationGuarded, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    kontaktpersonErfassenForm: FormGroup;
    kontaktPersonErfassenSpinner = 'kontaktPersonErfassenSpinner';
    anredeOptions: any[] = [];
    statusDropdownOptions: any[] = [];
    korrespondenzspracheOptions: any[] = [];
    isBearbeiten = false;
    formDisabled = false;
    permissions: typeof Permissions = Permissions;
    currentUser: UserDto;
    readonly channel = 'kontaktperson-erfassen';
    private static readonly SIDE_NAVI_ITEM = './kontaktpersonen';
    private static readonly SIDE_NAVI_ITEM_PATH_ERFASSEN = './kontaktpersonen/erfassen';
    private static readonly SIDE_NAVI_ITEM_PATH_BEARBEITEN = './kontaktpersonen/bearbeiten';
    private static readonly DATEN_GESPEICHERT = 'common.message.datengespeichert';
    private static readonly DATEN_GELOESCHT = 'common.message.datengeloescht';
    private unternehmenId: number;
    private kontaktpersonId: string;
    private kontaktId: number;
    private loadedKontakt: KontaktDTO;
    private schweiz: StaatDTO;
    private unternehmenData: UnternehmenResponseDTO;

    constructor(
        private kontaktpersonService: KontaktpersonService,
        private route: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private dataService: StesDataRestService,
        private infopanelService: AmmInfopanelService,
        private translateService: TranslateService,
        private unternehmenRestService: UnternehmenRestService,
        private interactionService: StesComponentInteractionService,
        private facade: FacadeService,
        private elementRef: ElementRef
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.currentUser = this.facade.authenticationService.getLoggedUser();
        this.createKontaktpersonForm();
        this.setSubscriptions();
    }

    ngOnDestroy(): void {
        this.facade.toolboxService.resetConfiguration();
        this.hideNavItemForErfassen();
        this.facade.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    save(): void {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.kontaktpersonErfassenForm.valid) {
            if (this.isBearbeiten) {
                this.updateKontaktperson();
            } else {
                this.createKontaktperson();
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    cancel(): void {
        const visible = !!this.elementRef.nativeElement.offsetParent;
        if (visible && this.canDeactivate()) {
            this.checkConfirmationToCancel();
        } else {
            this.hideNavItem();
        }
        this.kontaktpersonService.navigateToKontaktpersonen(this.route);
    }

    reset(): void {
        this.facade.resetDialogService.resetIfDirty(this.kontaktpersonErfassenForm, () => this.resetForm());
    }

    openDeleteModal(): void {
        const modalRef = this.kontaktpersonService.openModal(GenericConfirmComponent);
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

    delete(): void {
        this.kontaktpersonService
            .deleteKontaktpersonByKontaktId(this.kontaktId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperLongWarningMessages) => {
                if (response.data) {
                    this.facade.notificationService.success(KontaktPersonErfassenComponent.DATEN_GELOESCHT);
                    this.facade.navigationService.showNavigationTreeRoute(KontaktPersonErfassenComponent.SIDE_NAVI_ITEM);
                    this.kontaktpersonService.navigateToKontaktpersonen(this.route);
                }
            });
    }

    canDeactivate(): boolean {
        return this.kontaktpersonErfassenForm.dirty;
    }

    private createKontaktperson() {
        this.kontaktpersonService.savedKontaktpersonSubject.pipe(takeUntil(this.unsubscribe)).subscribe((value: number) => {
            if (value) {
                this.facade.notificationService.success(KontaktPersonErfassenComponent.DATEN_GESPEICHERT);
                this.facade.navigationService.hideNavigationTreeRoute(KontaktPersonErfassenComponent.SIDE_NAVI_ITEM_PATH_ERFASSEN);
                this.kontaktpersonService.resetCloseErfassenSubscription();
                this.kontaktpersonErfassenForm.reset();
                this.kontaktpersonService.navigateToKontaktpersonBearbeitenAfterCreate(this.unternehmenId, value, this.route);
            }
        });
        this.kontaktpersonService.createKontaktperson(this.mapToDTO(), this.kontaktPersonErfassenSpinner);
    }

    private updateKontaktperson() {
        this.facade.spinnerService.activate(this.kontaktPersonErfassenSpinner);
        this.kontaktpersonService
            .updateKontaktperson(this.mapToKontaktDTO())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                value => {
                    this.facade.spinnerService.deactivate(this.kontaktPersonErfassenSpinner);
                    if (value.data) {
                        this.facade.notificationService.success(KontaktPersonErfassenComponent.DATEN_GESPEICHERT);
                        this.kontaktId = value.data;
                        this.loadKontaktFromDB();
                    }
                },
                () => {
                    this.facade.spinnerService.deactivate(this.kontaktPersonErfassenSpinner);
                }
            );
    }

    private disableFormByStatus() {
        if (this.kontaktpersonErfassenForm.controls.status.value) {
            this.formDisabled =
                +this.facade.formUtilsService.getCodeIdByCode(this.statusDropdownOptions, KontaktpersonStatusCode.INACTIVE) ===
                +this.kontaktpersonErfassenForm.controls.status.value;
        }
    }

    private configureBearbeitenToolbox(kontaktId: number, kontaktpersonId: number): void {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KONTAKTPERSONBEARBEITEN,
            vorlagenKategorien: [VorlagenKategorie.KONTAKTPERSON],
            entityIDsMapping: {
                KONTAKT_ID: kontaktId,
                KONTAKTPERSON_ID: kontaktpersonId // needed only by the DMS Dossier button
            }
        };

        this.facade.toolboxService.sendConfiguration(ToolboxConfig.getKontaktpersonBearbeitenConfig(), this.channel, toolboxData);
    }

    private configureErfassenToolbox(): void {
        this.facade.toolboxService.sendConfiguration(ToolboxConfig.getKontaktpersonErfassenConfig(), this.channel, null);
    }

    private resetForm(): void {
        this.facade.fehlermeldungenService.closeMessage();
        if (this.loadedKontakt) {
            this.mapToForm(this.loadedKontakt);
        } else {
            this.kontaktpersonErfassenForm.reset();
            this.initFormWithDefaults();
        }
    }

    private mapToDTO(): KontaktpersonDTO {
        const dto: KontaktpersonDTO = {
            anredeId: this.kontaktpersonErfassenForm.controls.anredeId.value,
            name: this.kontaktpersonErfassenForm.controls.name.value,
            unternehmenId: this.unternehmenId,
            vorname: this.kontaktpersonErfassenForm.controls.vorname.value,
            geburtsdatum: this.kontaktpersonErfassenForm.controls.geburtsdatum.value,
            weitereAngaben: this.kontaktpersonErfassenForm.controls.ergaenzendeAngaben.value,
            korrespondenzSpracheId: this.kontaktpersonErfassenForm.controls.korrespondenzspracheId.value,
            bewerberBulletin: this.kontaktpersonErfassenForm.controls.bewerberbulletinJa.value,
            bewerberBulletinEmail: this.kontaktpersonErfassenForm.controls.bewerberbulletinPerEmail.value,
            strasse: this.kontaktpersonErfassenForm.controls.strasse.value,
            strasseNr: this.kontaktpersonErfassenForm.controls.strasseNr.value,
            postfach: this.kontaktpersonErfassenForm.controls.postfach.value,
            staatId: this.kontaktpersonErfassenForm.controls.land['landAutosuggestObject'] ? this.kontaktpersonErfassenForm.controls.land['landAutosuggestObject'].staatId : null,
            staatObject: this.kontaktpersonErfassenForm.controls.land['landAutosuggestObject'],
            statusId: +this.facade.formUtilsService.getCodeIdByCode(this.statusDropdownOptions, KontaktpersonStatusCode.ACTIVE),
            kontaktList: [
                {
                    telefonNr: this.kontaktpersonErfassenForm.controls.telefon.value,
                    telefonNrIndex: this.kontaktpersonErfassenForm.controls.telefon.value,
                    mobileNr: this.kontaktpersonErfassenForm.controls.mobile.value,
                    mobileNrIndex: this.kontaktpersonErfassenForm.controls.mobile.value,
                    telefaxNr: this.kontaktpersonErfassenForm.controls.fax.value,
                    email: this.kontaktpersonErfassenForm.controls.email.value
                } as KontaktDTO
            ],
            funktionList: this.getFunktionList(),
            kundenberatungList: this.getKundenberatungList()
        };
        this.fillPlzObjects(dto);
        return dto;
    }

    private fillPlzObjects(kontaktperson: KontaktpersonDTO) {
        if (kontaktperson.staatObject) {
            if (this.isSchweiz(kontaktperson.staatObject)) {
                kontaktperson.plzId = this.kontaktpersonErfassenForm.controls.plz.value ? this.kontaktpersonErfassenForm.controls.plz['plzWohnAdresseObject'].plzId : null;
                kontaktperson.plzObject = this.kontaktpersonErfassenForm.controls.plz['plzWohnAdresseObject'];
                kontaktperson.postfachPlzId = this.kontaktpersonErfassenForm.controls.postfachPlz['plzWohnAdresseObject']
                    ? this.kontaktpersonErfassenForm.controls.postfachPlz['plzWohnAdresseObject'].plzId
                    : null;
                kontaktperson.postfachPlzObject = this.kontaktpersonErfassenForm.controls.postfachPlz['plzWohnAdresseObject'];
            } else {
                kontaktperson.plzAusland = this.kontaktpersonErfassenForm.controls.plz['plzWohnAdresseObject'].plzWohnadresseAusland;
                kontaktperson.postleitortAusland = this.kontaktpersonErfassenForm.controls.plz['plzWohnAdresseObject'].ortWohnadresseAusland;
                kontaktperson.postfachPlzAusland = this.kontaktpersonErfassenForm.controls.postfachPlz['plzWohnAdresseObject'].plzWohnadresseAusland;
                kontaktperson.postfachPostleitortAusland = this.kontaktpersonErfassenForm.controls.postfachPlz['plzWohnAdresseObject'].ortWohnadresseAusland;
            }
        }
    }

    private fillPlzFields(form: any, kontaktperson: KontaktpersonDTO) {
        if (this.isSchweiz(kontaktperson.staatObject)) {
            form.plz = {
                postleitzahl: kontaktperson.plzObject ? kontaktperson.plzObject : null,
                ort: kontaktperson.plzObject ? kontaktperson.plzObject : null
            };
            form.postfachPlz = {
                postleitzahl: kontaktperson.postfachPlzObject ? kontaktperson.postfachPlzObject : null,
                ort: kontaktperson.postfachPlzObject ? kontaktperson.postfachPlzObject : null
            };
        } else {
            form.plz = {
                postleitzahl: kontaktperson.plzAusland,
                ort: kontaktperson.postleitortAusland
            };
            form.postfachPlz = {
                postleitzahl: kontaktperson.postfachPlzAusland,
                ort: kontaktperson.postfachPostleitortAusland
            };
        }
    }

    private fillDefaultPlzFields(form: any): void {
        if (this.isSchweiz(this.unternehmenData.land)) {
            form.plz = {
                postleitzahl: this.unternehmenData.plzOrt ? this.unternehmenData.plzOrt : null,
                ort: this.unternehmenData.plzOrt ? this.unternehmenData.plzOrt : null
            };
            form.postfachPlz = {
                postleitzahl: this.unternehmenData.plzOrtPostfach ? this.unternehmenData.plzOrtPostfach : null,
                ort: this.unternehmenData.plzOrtPostfach ? this.unternehmenData.plzOrtPostfach : null
            };
        } else {
            form.plz = {
                postleitzahl: this.unternehmenData.plzAusland,
                ort: this.unternehmenData.ortAusland
            };
            form.postfachPlz = {
                postleitzahl: this.unternehmenData.postfachPlzAusland,
                ort: this.unternehmenData.postfachOrtAusland
            };
        }
    }

    private isSchweiz(staatObject: StaatDTO) {
        return staatObject && staatObject.staatId === this.schweiz.staatId;
    }

    private mapToKontaktDTO(): KontaktDTO {
        const dto: KontaktDTO = {
            kontaktId: this.kontaktId,
            kontaktpersonId: +this.kontaktpersonId,
            kontaktpersonObject: {
                kontaktpersonId: +this.kontaktpersonId,
                anredeId: this.kontaktpersonErfassenForm.controls.anredeId.value,
                name: this.kontaktpersonErfassenForm.controls.name.value,
                unternehmenId: this.unternehmenId,
                vorname: this.kontaktpersonErfassenForm.controls.vorname.value,
                geburtsdatum: this.kontaktpersonErfassenForm.controls.geburtsdatum.value,
                weitereAngaben: this.kontaktpersonErfassenForm.controls.ergaenzendeAngaben.value,
                korrespondenzSpracheId: this.kontaktpersonErfassenForm.controls.korrespondenzspracheId.value,
                bewerberBulletin: this.kontaktpersonErfassenForm.controls.bewerberbulletinJa.value,
                bewerberBulletinEmail: this.kontaktpersonErfassenForm.controls.bewerberbulletinPerEmail.value,
                strasse: this.kontaktpersonErfassenForm.controls.strasse.value,
                strasseNr: this.kontaktpersonErfassenForm.controls.strasseNr.value,
                postfach: this.kontaktpersonErfassenForm.controls.postfach.value,
                staatId: this.kontaktpersonErfassenForm.controls.land['landAutosuggestObject']
                    ? this.kontaktpersonErfassenForm.controls.land['landAutosuggestObject'].staatId
                    : null,
                staatObject: this.kontaktpersonErfassenForm.controls.land['landAutosuggestObject'],
                statusId: this.kontaktpersonErfassenForm.controls.status.value,
                funktionList: this.getFunktionList(),
                kundenberatungList: this.getKundenberatungList(),
                ojbVersion: this.loadedKontakt && this.loadedKontakt.kontaktpersonObject.ojbVersion ? this.loadedKontakt.kontaktpersonObject.ojbVersion : 0
            } as KontaktpersonDTO,
            telefonNr: this.kontaktpersonErfassenForm.controls.telefon.value,
            telefonNrIndex: this.kontaktpersonErfassenForm.controls.telefon.value,
            mobileNr: this.kontaktpersonErfassenForm.controls.mobile.value,
            mobileNrIndex: this.kontaktpersonErfassenForm.controls.mobile.value,
            telefaxNr: this.kontaktpersonErfassenForm.controls.fax.value,
            email: this.kontaktpersonErfassenForm.controls.email.value,
            ojbVersion: this.loadedKontakt && this.loadedKontakt.ojbVersion ? this.loadedKontakt.ojbVersion : 0
        };
        this.fillPlzObjects(dto.kontaktpersonObject);
        return dto;
    }

    private getFunktionList(): KontaktpersonFunktionDTO[] {
        const funktionList: KontaktpersonFunktionDTO[] = [];
        for (const entry of this.kontaktpersonErfassenForm.controls.inputGroup.value) {
            if (entry.inputControl && entry.inputControl !== '') {
                funktionList.push({ funktion: entry.inputControl } as KontaktpersonFunktionDTO);
            }
        }
        return funktionList;
    }

    private fillFunktionList(kontaktperson: KontaktpersonDTO): FormArray {
        if (kontaktperson.funktionList && kontaktperson.funktionList.length > 0) {
            this.kontaktpersonErfassenForm.setControl(
                'inputGroup',
                this.formBuilder.array(kontaktperson.funktionList.map(f => this.formBuilder.group({ inputControl: [f.funktion] })))
            );
        }
        return null;
    }

    private getKundenberatungList(): KontaktpersonBenutzerDTO[] {
        const kundenberatungList: KontaktpersonBenutzerDTO[] = [];
        const controls = (this.kontaktpersonErfassenForm.controls.personalberatern as FormArray).controls as FormGroup[];
        controls
            .filter(cntrl => cntrl.controls['personalberater']['benutzerObject'])
            .filter(cntrl => !this.isBeraterEmpty(cntrl.controls['personalberater']['benutzerObject']))
            .forEach(c => {
                const b: KontaktpersonBenutzerDTO = {
                    benutzerDetailId: null,
                    benutzerDetailObject: {}
                };
                b.benutzerDetailId = +c.controls['personalberater']['benutzerObject'].benutzerDetailId;
                b.benutzerDetailObject.benutzerDetailId = b.benutzerDetailId;
                b.benutzerDetailObject.benutzerLogin = c.controls['personalberater']['benutzerObject'].benutzerLogin;
                b.benutzerDetailObject.vorname = c.controls['personalberater']['benutzerObject'].vorname;
                b.benutzerDetailObject.nachname = c.controls['personalberater']['benutzerObject'].nachname;
                let existingKundenberater: KontaktpersonBenutzerDTO = null;
                if (this.loadedKontakt && this.loadedKontakt.kontaktpersonObject && this.loadedKontakt.kontaktpersonObject.kundenberatungList) {
                    existingKundenberater = this.loadedKontakt.kontaktpersonObject.kundenberatungList.find(function(k) {
                        return k.benutzerDetailId === b.benutzerDetailId;
                    });
                }
                existingKundenberater ? kundenberatungList.push(existingKundenberater) : kundenberatungList.push(b);
            });
        return kundenberatungList;
    }

    private isBeraterEmpty(benutzerObject: any): boolean {
        return (
            (benutzerObject.benutzerDetailId == null || benutzerObject.benutzerDetailId <= 0) &&
            !benutzerObject.benutzerLogin &&
            !benutzerObject.vorname &&
            !benutzerObject.nachname
        );
    }

    private fillKundenberatungList(kontaktperson: KontaktpersonDTO): void {
        if (kontaktperson.kundenberatungList && kontaktperson.kundenberatungList.length > 0) {
            this.kontaktpersonErfassenForm.setControl(
                'personalberatern',
                this.formBuilder.array(
                    kontaktperson.kundenberatungList.map(f =>
                        this.formBuilder.group({
                            personalberater: [
                                {
                                    benutzerId: f.benutzerDetailObject.benutzerId,
                                    benutzerDetailId: f.benutzerDetailObject.benutzerDetailId ? f.benutzerDetailObject.benutzerDetailId.toString() : null,
                                    benutzerLogin: f.benutzerDetailObject.benutzerLogin,
                                    nachname: f.benutzerDetailObject.nachname,
                                    vorname: f.benutzerDetailObject.vorname,
                                    benuStelleCode: f.benutzerDetailObject.benuStelleCode,
                                    benutzerstelleId: f.benutzerDetailObject.benutzerstelleId
                                }
                            ]
                        })
                    )
                )
            );
        }
    }

    private loadKontaktperson(): void {
        this.kontaktpersonService
            .getKontakteByKontaktpersonId(+this.kontaktpersonId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(kontakte => {
                if (kontakte.data && kontakte.data.length > 0) {
                    this.kontaktId = kontakte.data[0].kontaktId;
                    // this call is needed to get the KontaktDTO fully loaded,
                    // the objects like functions, plz etc. are currently missing in the kontakte.data[0]
                    this.loadKontaktFromDB();
                    this.configureBearbeitenToolbox(this.kontaktId, +this.kontaktpersonId);
                }
            });
    }

    private loadKontaktFromDB() {
        this.kontaktpersonService
            .getByKontaktId(this.kontaktId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(kontakt => {
                this.loadedKontakt = kontakt.data;
                this.mapToForm(kontakt.data);
                this.updateSubtitleForBearbeiten(kontakt.data.kontaktpersonObject);
            });
    }

    private updateSubtitleForBearbeiten(kontaktperson: KontaktpersonDTO): void {
        const label: string = this.translateService.instant('unternehmen.label.kontaktperson');
        if (!kontaktperson.vorname) {
            this.infopanelService.updateInformation({ subtitle: `${label} ${kontaktperson.name}` });
        } else {
            this.infopanelService.updateInformation({ subtitle: `${label} ${kontaktperson.name}, ${kontaktperson.vorname}` });
        }
    }

    private mapToForm(kontakt: KontaktDTO): void {
        const kontaktperson = kontakt.kontaktpersonObject;
        const form = {
            status: kontaktperson.statusId,
            anredeId: kontaktperson.anredeId,
            name: kontaktperson.name,
            vorname: kontaktperson.vorname,
            geburtsdatum: kontaktperson.geburtsdatum ? new Date(kontaktperson.geburtsdatum) : null,
            ergaenzendeAngaben: kontaktperson.weitereAngaben,
            korrespondenzspracheId: kontaktperson.korrespondenzSpracheId,
            bewerberbulletinJa: kontaktperson.bewerberBulletin,
            bewerberbulletinPerEmail: kontaktperson.bewerberBulletinEmail,
            telefon: kontakt.telefonNr,
            mobile: kontakt.mobileNr,
            fax: kontakt.telefaxNr,
            email: kontakt.email,
            strasse: kontaktperson.strasse,
            strasseNr: kontaktperson.strasseNr,
            postfach: kontaktperson.postfach,
            land: kontaktperson.staatObject
        };
        this.fillPlzFields(form, kontaktperson);
        this.kontaktpersonErfassenForm.reset(form);
        this.fillFunktionList(kontaktperson);
        this.fillKundenberatungList(kontaktperson);
        this.disableFormByStatus();
    }

    private createKontaktpersonForm(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.kontaktpersonErfassenForm = this.formBuilder.group({
            status: null,
            anredeId: [null, Validators.required],
            name: [null, Validators.required],
            vorname: null,
            geburtsdatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.dateRangeBiggerCenturyNgx]],
            inputGroup: null,
            ergaenzendeAngaben: null,
            korrespondenzspracheId: null,
            bewerberbulletinJa: null,
            bewerberbulletinPerEmail: null,
            telefon: [null, [PhoneValidator.isValidFormatWarning]],
            mobile: [null, [PhoneValidator.isValidFormatWarning]],
            fax: [null, [PhoneValidator.isValidFormatWarning]],
            email: [null, [EmailValidator.isValidFormat]],
            strasse: null,
            strasseNr: null,
            plz: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            postfach: [null, [NumberValidator.isPositiveInteger, Validators.maxLength(6)]],
            postfachPlz: this.formBuilder.group({
                postleitzahl: null,
                ort: null
            }),
            land: [null, Validators.required],
            personalberatern: []
        });
        this.kontaktpersonErfassenForm.setControl(
            'inputGroup',
            this.formBuilder.array([
                this.formBuilder.group({
                    inputControl: []
                })
            ])
        );
        this.kontaktpersonErfassenForm.setControl(
            'personalberatern',
            this.formBuilder.array([
                this.formBuilder.group({
                    personalberater: []
                })
            ])
        );
    }

    private getCurrentUser(): any {
        if (this.currentUser && !this.isBearbeiten) {
            return [
                {
                    benutzerId: this.currentUser.benutzerId,
                    benutzerDetailId: this.currentUser.benutzerDetailId,
                    benutzerLogin: this.currentUser.benutzerLogin,
                    nachname: this.currentUser.name,
                    vorname: this.currentUser.vorname,
                    benuStelleCode: this.currentUser.benutzerstelleCode,
                    benutzerstelleId: this.currentUser.benutzerstelleId
                }
            ];
        } else {
            return [];
        }
    }

    private setSubscriptions(): void {
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            if (this.loadedKontakt && this.loadedKontakt.kontaktpersonObject) {
                this.updateSubtitleForBearbeiten(this.loadedKontakt.kontaktpersonObject);
            }
        });
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
        });
        this.route.data.subscribe(data => {
            this.isBearbeiten = data.formNumber === StesFormNumberEnum.KONTAKTPERSON_BEARBEITEN;
            forkJoin([
                this.dataService.getCode(DomainEnum.ANREDE),
                this.dataService.getCode(DomainEnum.SPRACHE),
                this.dataService.getCode(DomainEnum.KONTAKTPERSON_STATUS),
                this.dataService.getStaatSwiss()
            ])
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(([anredeOptions, korrespondenzspracheOptions, statusOptions, staat]) => {
                    this.anredeOptions = this.facade.formUtilsService.mapDropdownKurztext(anredeOptions);
                    this.korrespondenzspracheOptions = this.facade.formUtilsService.mapDropdownKurztext(korrespondenzspracheOptions);
                    this.statusDropdownOptions = this.facade.formUtilsService.mapDropdownKurztext(statusOptions);
                    this.schweiz = staat;
                    this.loadPageData();
                });
        });
        this.facade.toolboxService
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

    private openHistoryModal(): void {
        const modalRef = this.kontaktpersonService.openBigModal(HistorisierungComponent);
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = this.kontaktpersonId;
        comp.type = AvamCommonValueObjectsEnum.T_KONTAKTPERSON;
    }

    private openDmsCopyModal(): void {
        const modalRef = this.kontaktpersonService.openModal(DmsMetadatenKopierenModalComponent);
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.id = this.kontaktpersonId;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_KONTAKTPERSON;
    }

    private loadPageData(): void {
        if (this.isBearbeiten) {
            this.kontaktpersonService.resetCloseBearbeitenSubscription();
            this.kontaktpersonService.closeBearbeitenNavItemSubscription = this.subscribeOnCloseNavItem();
            this.loadBearbeitenData();
        } else {
            this.kontaktpersonService.resetCloseErfassenSubscription();
            this.kontaktpersonService.closeErfassenNavItemSubscription = this.subscribeOnCloseNavItem();
            this.loadErfassenData();
        }
    }

    private loadBearbeitenData(): void {
        this.route.queryParamMap.subscribe(params => {
            this.kontaktpersonId = params.get('kontaktpersonId');
            this.loadKontaktperson();
            this.facade.navigationService.showNavigationTreeRoute(KontaktPersonErfassenComponent.SIDE_NAVI_ITEM_PATH_BEARBEITEN, { kontaktpersonId: this.kontaktpersonId });
        });
    }

    private loadErfassenData(): void {
        this.infopanelService.updateInformation({ subtitle: 'unternehmen.label.kontaktpersonerfassen' });
        this.loadUnternehmenData();
        this.facade.navigationService.showNavigationTreeRoute(KontaktPersonErfassenComponent.SIDE_NAVI_ITEM_PATH_ERFASSEN);
        this.configureErfassenToolbox();
    }

    private initFormWithDefaults(): void {
        const form = {
            strasse: this.unternehmenData.strasse,
            strasseNr: this.unternehmenData.strasseNr,
            postfach: this.unternehmenData.postfach,
            land: this.unternehmenData.land,
            telefon: this.unternehmenData.telefonNr,
            fax: this.unternehmenData.telefaxNr,
            email: this.unternehmenData.email,
            korrespondenzspracheId: this.korrespondenzspracheOptions.find(k => k.code.toLowerCase() === this.translateService.currentLang.toLowerCase()).value,
            bewerberbulletinJa: false,
            bewerberbulletinPerEmail: false
        };
        this.fillDefaultPlzFields(form);
        this.kontaktpersonErfassenForm.reset(form);
        this.setDefaultKundenberatung();
    }

    private setDefaultKundenberatung() {
        this.kontaktpersonErfassenForm.setControl(
            'personalberatern',
            this.formBuilder.array([
                this.formBuilder.group({
                    personalberater: this.getCurrentUser()
                })
            ])
        );
    }

    private loadUnternehmenData(): void {
        this.unternehmenRestService
            .getUnternehmenDataById(String(this.unternehmenId))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(unternehmenData => {
                if (unternehmenData) {
                    this.unternehmenData = unternehmenData.data;
                    this.initFormWithDefaults();
                }
            });
    }

    private subscribeOnCloseNavItem(): Subscription {
        return this.facade.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.onCancelPageSideNavigation(message);
            }
        });
    }

    private onCancelPageSideNavigation(message): void {
        if (
            (message.data.label === this.translateService.instant(UnternehmenSideNavLabels.KONTAKTPERSON_ERFASSEN) && !this.isBearbeiten) ||
            (message.data.label === this.translateService.instant(UnternehmenSideNavLabels.KONTAKTPERSON_BEARBEITEN) && this.isBearbeiten)
        ) {
            this.cancel();
        }
    }

    private checkConfirmationToCancel() {
        this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
            if (okClicked) {
                this.hideNavItem();
            }
        });
    }

    private hideNavItem() {
        if (this.isBearbeiten) {
            this.facade.navigationService.hideNavigationTreeRoute(KontaktPersonErfassenComponent.SIDE_NAVI_ITEM_PATH_BEARBEITEN, {
                kontaktpersonId: this.kontaktpersonId
            });
            this.kontaktpersonService.resetCloseBearbeitenSubscription();
        } else {
            this.hideNavItemForErfassen();
        }
    }

    private hideNavItemForErfassen(): void {
        this.facade.navigationService.hideNavigationTreeRoute(KontaktPersonErfassenComponent.SIDE_NAVI_ITEM_PATH_ERFASSEN);
        this.kontaktpersonService.resetCloseErfassenSubscription();
    }
}

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KontaktService } from '@shared/services/kontakt.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DateValidator } from '@shared/validators/date-validator';
import { forkJoin, Subscription } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { first, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { CodeDTO } from '@dtos/codeDTO';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { UserDto } from '@dtos/userDto';
import { ActivatedRoute } from '@angular/router';
import { SchlagwortDTO } from '@dtos/schlagwortDTO';
import { CoreMultiselectInterface } from '@app/library/core/core-multiselect/core-multiselect.interface';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { UnternehmenTerminDTO } from '@dtos/unternehmenTerminDTO';
import { UnternehmenTerminKontaktpersonDTO } from '@dtos/unternehmenTerminKontaktpersonDTO';
import { UnternehmenTerminSchlagwortDTO } from '@dtos/unternehmenTerminSchlagwortDTO';
import { UnternehmenTerminKundenberaterDTO } from '@dtos/unternehmenTerminKundenberaterDTO';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import * as moment from 'moment';
import { TerminUebertragenComponent } from '@shared/components/termin-uebertragen/termin-uebertragen.component';
import { HttpResponse } from '@angular/common/http';
import { HttpResponseHelper } from '@shared/helpers/http-response.helper';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlageToolboxData } from '@app/shared/models/dokument-vorlage-toolbox-data.model';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AutosuggestTypesEnum } from '@shared/enums/autosuggest-types.enum';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { FacadeService } from '@shared/services/facade.service';
import { CoreInfoBarPanelService } from '@app/library/core/core-info-bar/core-info-bar-panel/core-info-bar-panel.service';

@Component({
    selector: 'avam-kontakt-erfassen',
    templateUrl: './kontakt-erfassen.component.html',
    styleUrls: ['./kontakt-erfassen.component.scss']
})
export class KontaktErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('modalTerminUebertragen') modalTerminUebertragen: TerminUebertragenComponent;

    kontaktErfassenForm: FormGroup;
    kontaktGrundOptions: DropdownOption[] = [];
    kontaktArtOptions: DropdownOption[] = [];
    statusOptions: DropdownOption[] = [];
    schlagworteOptions: CoreMultiselectInterface[] = [];
    isBearbeiten = false;
    formDisabled = false;
    permissions: typeof Permissions = Permissions;
    unternehmenId: number;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    autosuggestType = AutosuggestTypesEnum.PERSONALBERATER;

    readonly kontaktErfassenSpinner = 'kontakt-erfassen';
    readonly angabenMaxLength = 255;

    readonly angabenFullWith = true;
    private static readonly ERSTELLEN_SUB_TITLE = 'unternehmen.label.kontakterfassen';
    private static readonly BEARBEITEN_SUB_TITLE = 'unternehmen.label.kontakbearbeiten';
    private static readonly SIDE_NAVI_ITEM = './kontakte';
    private static readonly SIDE_NAVI_ITEM_PATH_ERFASSEN = './kontakte/erfassen';
    private static readonly SIDE_NAVI_ITEM_PATH_BEARBEITEN = './kontakte/bearbeiten';
    private static readonly STATUS_GEPLANT = '1';
    private static readonly DATEN_GESPEICHERT = 'common.message.datengespeichert';
    private static readonly DATEN_GELOESCHT = 'common.message.datengeloescht';
    private readonly channel = 'kontakt-erfassen';
    private kontaktId: number;
    private currentUser: UserDto;
    private termin: UnternehmenTerminDTO;
    private schlagWorteCode: SchlagwortDTO[];
    private formInitalValue: any;

    constructor(
        private kontaktService: KontaktService,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private interactionService: StesComponentInteractionService,
        private elementRef: ElementRef,
        private route: ActivatedRoute,
        private facadeService: FacadeService,
        private infoBarPanelService: CoreInfoBarPanelService
    ) {
        super();
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.currentUser = this.facadeService.authenticationService.getLoggedUser();
        this.checkPermissions();
        this.initForm();
        this.setSubscriptions();
    }

    cancel(): void {
        const visible = !!this.elementRef.nativeElement.offsetParent;
        if (visible && this.canDeactivate()) {
            this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((res: boolean) => {
                if (res) {
                    this.hideNavigationTreeRoute();
                }
            });
        } else {
            this.hideNavigationTreeRoute();
        }
        this.kontaktService.navigateToKontakte(this.route);
    }

    reset(): void {
        this.facadeService.resetDialogService.resetIfDirty(this.kontaktErfassenForm, () => this.resetForm());
    }

    save(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.kontaktErfassenForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        if (this.kontaktErfassenForm.valid) {
            if (this.isBearbeiten) {
                this.updateKontakt();
            } else {
                this.createKontakt();
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    ngOnDestroy(): void {
        this.facadeService.toolboxService.resetConfiguration();
        this.hideNavItemForErfassen();
        this.infoBarPanelService.sendLastUpdate(null);
        if (!this.isBearbeiten) {
            this.hideNavigationTreeRoute();
        }
        super.ngOnDestroy();
    }

    openDeleteModal(): void {
        const modalRef = this.facadeService.openModalFensterService.openModal(GenericConfirmComponent);
        modalRef.result.then(result => {
            if (result) {
                this.deleteKontakt();
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    deleteKontakt(): void {
        this.kontaktService
            .deleteKontakt(this.kontaktId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperLongWarningMessages) => {
                if (response.data) {
                    this.facadeService.notificationService.success(KontaktErfassenComponent.DATEN_GELOESCHT);
                    this.facadeService.navigationService.showNavigationTreeRoute(KontaktErfassenComponent.SIDE_NAVI_ITEM);
                    this.kontaktService.navigateToKontakte(this.route);
                }
            });
    }

    formatTime(control: any): void {
        if (control.valid) {
            control.setValue(this.facadeService.formUtilsService.addColonToTimeString(control.value));
        }
    }

    terminUebertragen(): void {
        if (this.currentUser && this.currentUser.terminUebertragenIcsDownload) {
            this.kontaktService
                .getICSfile(this.unternehmenId, Number(this.kontaktId))
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((resp: HttpResponse<Blob>) => HttpResponseHelper.openBlob(resp, 'text/calendar'));
        } else {
            this.kontaktService.openEmailformModal(this.modalTerminUebertragen);
        }
    }

    canDeactivate(): boolean {
        if (this.isBearbeiten) {
            return this.kontaktErfassenForm.dirty || this.kundenberaterList.dirty;
        }
        return this.hasFormValueChanged();
    }

    get kundenberaterList(): FormArray {
        return this.kontaktErfassenForm.controls.kundenberaterList as FormArray;
    }

    get kontaktpersonList(): FormArray {
        return this.kontaktErfassenForm.controls.kontaktpersonList as FormArray;
    }

    private static schlagwortMapper(element: SchlagwortDTO): CoreMultiselectInterface {
        return {
            value: false,
            id: String(element.schlagwortId),
            textFr: element.schlagwortFr,
            textIt: element.schlagwortIt,
            textDe: element.schlagwortDe
        } as CoreMultiselectInterface;
    }

    private mapMultiSelect(kontaktSchlagwortList: UnternehmenTerminSchlagwortDTO[]): any {
        const mappedOptions = this.schlagworteOptions;
        mappedOptions.forEach(element => {
            if (kontaktSchlagwortList.some(el => el.schlagwortId === +element.id)) {
                element.value = true;
            }
        });
        this.addInaktivSchlagworte(kontaktSchlagwortList, mappedOptions);
        return mappedOptions;
    }

    private addInaktivSchlagworte(kontaktSchlagwortList: UnternehmenTerminSchlagwortDTO[], mappedOptions): void {
        kontaktSchlagwortList.forEach(kontaktSchlagwort => {
            if (kontaktSchlagwort.schlagwortObject && !kontaktSchlagwort.schlagwortObject.valid) {
                mappedOptions.push({
                    id: kontaktSchlagwort.schlagwortObject.schlagwortId,
                    textDe: kontaktSchlagwort.schlagwortObject.schlagwortDe,
                    textIt: kontaktSchlagwort.schlagwortObject.schlagwortIt,
                    textFr: kontaktSchlagwort.schlagwortObject.schlagwortFr,
                    value: true
                });
            }
        });
    }

    private updateKontakt(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.kontaktService
            .updateKontakt(this.mapToDTO())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                value => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (value.data) {
                        this.facadeService.notificationService.success(KontaktErfassenComponent.DATEN_GESPEICHERT);
                        this.loadKontakt();
                    }
                },
                () => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
    }

    private createKontakt(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.kontaktService
            .createKontakt(this.mapToDTO())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                value => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (value.data) {
                        this.facadeService.notificationService.success(KontaktErfassenComponent.DATEN_GESPEICHERT);
                        this.facadeService.navigationService.hideNavigationTreeRoute(KontaktErfassenComponent.SIDE_NAVI_ITEM_PATH_ERFASSEN);
                        this.kontaktService.resetCloseErfassenSubscription();
                        this.kontaktErfassenForm.reset();
                        this.kontaktService.navigateToKontaktBearbeitenAfterCreate(this.unternehmenId, value.data, this.route);
                    }
                },
                () => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                }
            );
    }

    private setSubscriptions(): void {
        this.route.parent.params.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
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
        this.route.queryParamMap.subscribe(params => {
            this.kontaktId = Number(params.get('kontaktId'));
        });
        this.route.data.subscribe(data => {
            this.isBearbeiten = data.formNumber === StesFormNumberEnum.KONTAKT_BEARBEITEN;
            this.showNavigationTreeRoute();
            if (this.isBearbeiten) {
                this.kontaktService.resetCloseBearbeitenSubscription();
                this.kontaktService.closeBearbeitenNavItemSubscription = this.subscribeOnCloseNavItem();
            } else {
                this.kontaktService.resetCloseErfassenSubscription();
                this.kontaktService.closeErfassenNavItemSubscription = this.subscribeOnCloseNavItem();
            }
            forkJoin([
                this.kontaktService.getCode(DomainEnum.KONTAKTGRUND),
                this.kontaktService.getCode(DomainEnum.KONTAKTART),
                this.kontaktService.getCode(DomainEnum.TERMIN_UNTERN),
                this.kontaktService.getAktivSchlagworte()
            ])
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(([kontaktGrund, kontaktArt, status, schlagworte]) => {
                    this.kontaktGrundOptions = this.facadeService.formUtilsService.mapDropdownKurztext(kontaktGrund);
                    this.kontaktArtOptions = this.facadeService.formUtilsService.mapDropdownKurztext(kontaktArt);
                    this.statusOptions = this.facadeService.formUtilsService.mapDropdownKurztext(status);
                    this.schlagWorteCode = schlagworte;
                    this.schlagworteOptions = this.getSchlagworteOptions(schlagworte);
                    this.setSubtitle();
                    if (this.isBearbeiten) {
                        this.loadKontakt();
                    } else {
                        this.initFormWithDefaults();
                        this.configureToolbox();
                    }
                });
        });
    }
    private openHistoryModal(): void {
        this.facadeService.openModalFensterService.openHistoryModal(String(this.kontaktId), AvamCommonValueObjectsEnum.T_UNTERNEHMEN_TERMIN);
    }

    private openDmsCopyModal(): void {
        this.facadeService.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_KONTAKT, String(this.kontaktId));
    }

    private getSchlagworteOptions(schlagworte: SchlagwortDTO[]) {
        return schlagworte.map((c: any) => KontaktErfassenComponent.schlagwortMapper(c));
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
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.KONTAKT_ERFASSEN) && !this.isBearbeiten) ||
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.KONTAKT_BEARBEITEN) && this.isBearbeiten)
        ) {
            this.cancel();
        }
    }

    private configureToolbox(): void {
        if (this.isBearbeiten) {
            this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getKontaktBearbeitenConfig(), this.channel, this.getBearbeitenToolboxData());
            this.infoBarPanelService.sendLastUpdate(this.termin);
        } else {
            this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getKontaktErfassenConfig(), this.channel);
        }
    }

    private getBearbeitenToolboxData(): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.KONTAKT,
            vorlagenKategorien: [VorlagenKategorie.KONTAKTPFLEGE],
            entityIDsMapping: { UNTERNEHMEN_TERMIN_ID: this.termin.unternehmenTerminID }
        };
    }

    private setSubtitle(): void {
        if (this.isBearbeiten) {
            this.setBearbeitenSubtitle();
        } else {
            this.kontaktService.updateInformation({ subtitle: KontaktErfassenComponent.ERSTELLEN_SUB_TITLE });
        }
    }

    private showNavigationTreeRoute(): void {
        if (this.isBearbeiten) {
            this.facadeService.navigationService.showNavigationTreeRoute(KontaktErfassenComponent.SIDE_NAVI_ITEM_PATH_BEARBEITEN, { kontaktId: this.kontaktId });
        } else {
            this.facadeService.navigationService.showNavigationTreeRoute(KontaktErfassenComponent.SIDE_NAVI_ITEM_PATH_ERFASSEN);
        }
    }

    private hideNavigationTreeRoute(): void {
        if (this.isBearbeiten) {
            this.facadeService.navigationService.hideNavigationTreeRoute(KontaktErfassenComponent.SIDE_NAVI_ITEM_PATH_BEARBEITEN);
            this.kontaktService.resetCloseBearbeitenSubscription();
        } else {
            this.hideNavItemForErfassen();
        }
    }

    private hideNavItemForErfassen(): void {
        this.facadeService.navigationService.hideNavigationTreeRoute(KontaktErfassenComponent.SIDE_NAVI_ITEM_PATH_ERFASSEN);
        this.kontaktService.resetCloseErfassenSubscription();
    }

    private initFormWithDefaults(): void {
        this.kontaktErfassenForm.controls.statusID.setValue(this.facadeService.formUtilsService.getCodeIdByCode(this.statusOptions, KontaktErfassenComponent.STATUS_GEPLANT));
        if (this.currentUser) {
            const currentUser = {
                benutzerId: this.currentUser.benutzerId,
                benutzerDetailId: this.currentUser.benutzerDetailId,
                benutzerLogin: this.currentUser.benutzerLogin,
                nachname: this.currentUser.name,
                vorname: this.currentUser.vorname,
                benuStelleCode: this.currentUser.benutzerstelleCode,
                benutzerstelleId: this.currentUser.benutzerstelleId
            };
            this.kundenberaterList.setControl(
                0,
                new FormGroup({
                    kundenberater: new FormControl(currentUser, [Validators.required])
                })
            );
            this.kontaktpersonList.setControl(
                0,
                new FormGroup({
                    kontaktperson: new FormControl(null, [Validators.required])
                })
            );
        }
        setTimeout(() => {
            this.formInitalValue = this.kontaktErfassenForm.value;
        }, 1000);
    }

    private initForm(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.kontaktErfassenForm = this.formBuilder.group(
            {
                datum: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.val067]],
                zeitVon: [null, [DateValidator.val250, DateValidator.val251]],
                zeitBis: [null, [DateValidator.val250, DateValidator.val251]],
                ort: null,
                kontaktGrundID: [null, Validators.required],
                kontaktArtID: [null, Validators.required],
                schlagwortList: null,
                statusID: null,
                kontaktpersonList: this.formBuilder.array([]),
                angaben: null,
                kundenberaterList: this.formBuilder.array([])
            },
            { validators: [DateValidator.val006, DateValidator.zeitVonBisBoth] }
        );
        this.kontaktErfassenForm.controls.kundenberaterList = new FormArray([new FormGroup({ kundenberater: new FormControl(null) })]);
        this.kontaktErfassenForm.controls.kontaktpersonList = new FormArray([new FormGroup({ kontaktperson: new FormControl(null) })]);
    }

    private mapToForm(kontakt: UnternehmenTerminDTO): void {
        const form = {
            datum: this.facadeService.formUtilsService.parseDate(kontakt.datum),
            zeitVon: kontakt.zeitVon,
            zeitBis: kontakt.zeitBis,
            ort: kontakt.ort,
            kontaktGrundID: kontakt.kontaktGrundID,
            kontaktArtID: kontakt.kontaktArtID,
            schlagwortList: kontakt.schlagwortList ? this.mapMultiSelect(kontakt.schlagwortList) : null,
            statusID: kontakt.statusID,
            angaben: kontakt.angaben
        };
        this.kontaktErfassenForm.reset(form);
        this.fillKundenberaterList(kontakt.kundenberaterList);
        this.fillKontaktpersonList(kontakt.kontaktpersonList);
    }

    private fillKundenberaterList(kundenberaterList: UnternehmenTerminKundenberaterDTO[]): void {
        if (kundenberaterList && kundenberaterList.length > 0) {
            kundenberaterList.forEach((element, index) =>
                this.kundenberaterList.setControl(
                    index,
                    new FormGroup({
                        kundenberater: new FormControl(element.benutzerDetailObject)
                    })
                )
            );
        }
        this.setKundenberaterValidation();
    }

    private fillKontaktpersonList(kontaktpersonList: UnternehmenTerminKontaktpersonDTO[]): void {
        if (kontaktpersonList && kontaktpersonList.length > 0) {
            kontaktpersonList.forEach((element, index) =>
                this.kontaktpersonList.setControl(
                    index,
                    new FormGroup({
                        kontaktperson: new FormControl(element.kontaktpersonObject)
                    })
                )
            );
        }
        this.setKontaktpersonvalidation();
    }

    private setKundenberaterValidation(): void {
        (this.kundenberaterList.at(0) as FormGroup).controls.kundenberater.setValidators(Validators.required);
    }

    private setKontaktpersonvalidation(): void {
        (this.kontaktpersonList.at(0) as FormGroup).controls.kontaktperson.setValidators(Validators.required);
    }

    private checkPermissions(): void {
        this.formDisabled = !(this.currentUser && this.kontaktService.hasAnyPermission([Permissions.ARBEITGEBER_KONTAKTE_BEARBEITEN], this.currentUser.permissions));
    }

    private resetForm(): void {
        this.schlagworteOptions = this.getSchlagworteOptions(this.schlagWorteCode);
        if (this.isBearbeiten && this.termin) {
            this.mapToForm(this.termin);
        } else {
            this.kontaktErfassenForm.reset();
            this.initFormWithDefaults();
        }
    }

    private loadKontakt(): void {
        this.kontaktService.kontaktSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dto: UnternehmenTerminDTO) => {
            this.termin = dto;
            this.configureToolbox();
            this.mapToForm(dto);
        });
        this.kontaktService.getKontakt(Number(this.kontaktId), this.channel);
    }

    private setBearbeitenSubtitle(): void {
        this.kontaktService.kontaktSubject.subscribe((kontakt: UnternehmenTerminDTO) => {
            const date: string = moment(new Date(kontakt.datum)).format('DD.MM.YYYY');
            const sub: string = this.facadeService.translateService.instant(KontaktErfassenComponent.BEARBEITEN_SUB_TITLE, { 0: date });
            this.kontaktService.updateInformation({ subtitle: sub });
        });
    }

    private mapToDTO(): UnternehmenTerminDTO {
        const dto: UnternehmenTerminDTO = {
            unternehmenID: +this.unternehmenId,
            kontaktGrundID: +this.kontaktErfassenForm.controls.kontaktGrundID.value,
            kontaktArtID: +this.kontaktErfassenForm.controls.kontaktArtID.value,
            statusID: +this.kontaktErfassenForm.controls.statusID.value,
            ort: this.kontaktErfassenForm.controls.ort.value,
            angaben: this.kontaktErfassenForm.controls.angaben.value,
            datum: this.kontaktErfassenForm.controls.datum.value,
            zeitVon: this.mapNullToEmptyString(this.kontaktErfassenForm.controls.zeitVon.value),
            zeitBis: this.mapNullToEmptyString(this.kontaktErfassenForm.controls.zeitBis.value),
            schlagwortList: this.mapSchlagworteToDto(),
            kontaktpersonList: this.mapKontaktpersonen(),
            kundenberaterList: this.mapKundenberatern(),
            ojbVersion: this.termin && this.termin.ojbVersion ? this.termin.ojbVersion : 0
        };
        if (this.isBearbeiten) {
            dto.unternehmenTerminID = this.kontaktId;
        }
        return dto;
    }

    private mapNullToEmptyString(value: string): string {
        if (value == null) {
            return '';
        }
        return value;
    }

    private mapKundenberatern(): UnternehmenTerminKundenberaterDTO[] {
        const beratern: UnternehmenTerminKundenberaterDTO[] = [];
        const controls = this.kundenberaterList.controls as FormGroup[];
        controls
            .filter(cntrl => cntrl.controls['kundenberater']['benutzerObject'])
            .forEach(c => {
                const b: UnternehmenTerminKundenberaterDTO = {
                    unternehmenTerminID: null
                };
                if (c.controls['kundenberater']['benutzerObject'].benutzerLogin) {
                    b.benutzerDetailId = +c.controls['kundenberater']['benutzerObject'].benutzerDetailId;
                    b.benutzerDetailObject = c.controls['kundenberater']['benutzerObject'];
                    beratern.push(b);
                }
            });
        return beratern;
    }

    private mapKontaktpersonen(): UnternehmenTerminKontaktpersonDTO[] {
        const kontaktpersonen: UnternehmenTerminKontaktpersonDTO[] = [];
        const controls = this.kontaktpersonList.controls as FormGroup[];
        controls
            .filter(cntrl => cntrl.controls['kontaktperson']['kontaktpersonObject'])
            .forEach(c => {
                const kp: UnternehmenTerminKontaktpersonDTO = {
                    unternehmenTerminID: null
                };
                kp.kontaktpersonId = +c.controls['kontaktperson']['kontaktpersonObject'].kontaktpersonId;
                kontaktpersonen.push(kp);
            });
        return kontaktpersonen;
    }

    private mapSchlagworteToDto(): UnternehmenTerminSchlagwortDTO[] {
        const schlagworte: UnternehmenTerminSchlagwortDTO[] = [];
        const values = this.kontaktErfassenForm.controls.schlagwortList.value as CoreMultiselectInterface[];
        if (values) {
            values
                .filter(val => val.value)
                .forEach(element => {
                    const s: UnternehmenTerminSchlagwortDTO = {
                        unternehmenTerminID: null
                    };
                    s.schlagwortId = +element.id;
                    s.schlagwortObject = {
                        schlagwortId: +element.id,
                        schlagwortDe: element.textDe,
                        schlagwortFr: element.textFr,
                        schlagwortIt: element.textIt
                    };
                    schlagworte.push(s);
                });
        }
        return schlagworte;
    }

    private hasFormValueChanged(): boolean {
        const currentValue = this.kontaktErfassenForm.value;
        return Object.keys(currentValue).some(key => {
            if (this.formInitalValue.hasOwnProperty(key)) {
                return this.formInitalValue[key] !== currentValue[key];
            }
        });
    }
}

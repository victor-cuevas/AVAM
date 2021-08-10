import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { FormUtilsService, GenericConfirmComponent, ToolboxService } from '@shared/index';
import { AbmeldenFormbuilder } from '@shared/formbuilders/abmelden.formbuilder';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared//services/db-translate.service';
import { ArbeitsvermittlungRestService } from '@core/http/arbeitsvermittlung-rest.service';
import { VermittlungDto } from '@shared/models/dtos/vermittlung-dto.interface';
import { UnternehmenDataService } from '@shared/services/unternehmen-data.service';
import { MessageBus } from '@shared/services/message-bus';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { ArbeitsvermittlungDataDTO } from '@app/shared/models/dtos-generated/arbeitsvermittlungDataDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import PrintHelper from '@shared/helpers/print.helper';
import { StesAbmeldenDTO } from '@shared/models/dtos-generated/stesAbmeldenDTO';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { StesStoreService } from '@stes/stes-store.service';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-abmeldung',
    templateUrl: './stes-abmeldung.component.html',
    styleUrls: ['./stes-abmeldung.component.scss'],
    providers: [ObliqueHelperService]
})
export class StesAbmeldungComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('personalberater') personalberater: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('abmeldedatum', { read: ElementRef }) abmeldedatum: ElementRef;

    abmeldenForm: FormGroup;

    abmeldeAngabenForm: FormGroup;
    neuerArbeitgeberForm: FormGroup;

    abmeldenFormBuilder: AbmeldenFormbuilder;

    unternehmenName;
    unternehmenInfo1;
    unternehmenInfo2;

    unternehmenPlzOrt;
    unternehmenLand;
    unternehmenBur;

    abmeldungChannel = 'abmeldung';
    relevantAbmeldegrundOptions: any[] = [];
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    benutzerSuchenTokens: {} = {};
    currentUnternehmen: UnternehmenDTO;
    istZustaendig: boolean;
    arbeigeberSuchePlusEnabled = false;
    wholeScreenReadyOnly: boolean;

    private letzteAktualisierung: any = {};

    // the bundle to be passed to the formbuilder
    private formBundle = {
        stesId: null,
        vermittlungGuiEntry: null,
        unternehmenDTO: null
    };

    private arbeitsamtWechsel = 1637;
    private oldCbxStellegefunden;
    private oldAbmeldegrund;

    private abmeldegrundOptions: any[] = [];
    private abmeldegrundOhneStelleOptions: any[] = [];
    private defaultAlkState: CodeDTO;

    private dataSubscription: Subscription;
    private unternehmenSubscription: Subscription;
    private observeClickActionSub: Subscription;
    private observeLanguageChangeSub: Subscription;

    constructor(
        modalService: NgbModal,
        spinnerService: SpinnerService,
        private formBuilder: FormBuilder,
        fehlermeldungenService: FehlermeldungenService,
        private dataService: StesDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private arbeitsvermittlungRestService: ArbeitsvermittlungRestService,
        private route: ActivatedRoute,
        private facade: FacadeService,
        private readonly notificationService: NotificationService,
        private interactionService: StesComponentInteractionService,
        private readonly unternehmenDataService: UnternehmenDataService,
        private translateService: TranslateService,
        readonly messageBus: MessageBus,
        private dbTranslateService: DbTranslateService,
        toolboxService: ToolboxService,
        private resetDialogService: ResetDialogService,
        private authService: AuthenticationService,
        private obliqueHelper: ObliqueHelperService,
        private stesStore: StesStoreService,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super('abmeldung', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
        SpinnerService.CHANNEL = this.abmeldungChannel;
        ToolboxService.CHANNEL = this.abmeldungChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesabmeldung' });
        this.abmeldenFormBuilder = new AbmeldenFormbuilder(this.formBuilder, this.facade.formUtilsService, this.messageBus, this.dbTranslateService);
        this.abmeldenForm = this.abmeldenFormBuilder.initForm();

        this.spinnerService.activate(this.abmeldungChannel);

        this.setSubscriptions();
        this.getData();
        this.defineFormGroups();
        this.benutzerSuchenTokens = this.getBenutzerSuchenTokens();
        this.translateService.onLangChange.subscribe(() => {
            if (this.currentUnternehmen) {
                this.setUnternehmen(this.currentUnternehmen);
            }
        });
    }

    ngAfterViewInit() {
        this.checkDefaultFocus();
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        if (this.observeLanguageChangeSub) {
            this.observeLanguageChangeSub.unsubscribe();
        }

        this.unternehmenSubscription.unsubscribe();

        this.toolboxService.resetConfiguration();
        this.fehlermeldungenService.closeMessage();

        this.abmeldenFormBuilder.updateStesDetailContent(null);

        this.authService.removeOwnerPermissionContext();

        this.stesInfobarService.sendLastUpdate({}, true);

        super.ngOnDestroy();
    }

    isDirty(): boolean {
        let result = this.abmeldenForm.dirty;

        // empty form
        if (!this.letzteAktualisierung.personalberater) {
            this.abmeldenFormBuilder.disablePersonal(true);
            result = this.abmeldenForm.dirty;
            this.abmeldenFormBuilder.disablePersonal(false);
        }

        return result;
    }

    setSubscriptions() {
        this.route.parent.params.subscribe(params => {
            this.formBundle.stesId = params['stesId'];
        });

        // AVB-6956 unternehmenEvent.data.dto will contain the right DTO, delete unflatBadDto()
        this.unternehmenSubscription = this.unternehmenDataService.getData().subscribe(unternehmenEvent => {
            this.setUnternehmen(this.unflatBadDto(unternehmenEvent.data.flatenedBadDto));
        });
    }

    defineToolboxActions(): void {
        this.observeClickActionSub = this.toolboxService.observeClickAction(this.abmeldungChannel, this.observeClickActionSub).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.HISTORY && this.formBundle) {
                this.openHistoryModal(this.letzteAktualisierung.stesAbmeldungId, AvamCommonValueObjectsEnum.T_STES_ABMELDUNG);
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
        });
    }

    defineFormGroups() {
        this.abmeldeAngabenForm = this.abmeldenForm.get('abmeldeAngabenForm') as FormGroup;
        this.neuerArbeitgeberForm = this.abmeldenForm.get('neuerArbeitgeberForm') as FormGroup;
    }

    getData() {
        forkJoin(
            this.dataService.getCode(DomainEnum.ABMELDEGRUND), //NOSONAR
            this.dataService.getCode(DomainEnum.ABMELDEGRUNDOHNESTELLE),
            this.dataService.getCode(DomainEnum.TRANSFER_ALK),
            this.dataService.getAbmeldung(this.formBundle.stesId, this.translateService.currentLang)
        )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([abmeldegrundList, abmeldegrundOhneStelleListe, alkStates, response]) => {
                    //Set owner permission context only if you have abmeldung bearbeiten
                    this.abmeldegrundOptions = abmeldegrundList;
                    this.abmeldegrundOhneStelleOptions = this.removeSystemCodes(abmeldegrundOhneStelleListe, response.data.stesAbmeldenDTO);
                    this.defaultAlkState = alkStates.find(item => item.code === '0');
                    this.updateForm(response.data.stesAbmeldenDTO, response.data.istZustaendig);
                },
                () => this.spinnerService.deactivate(this.screenName)
            );
    }

    /**
     * @param data the data from server or component member field
     * @param istZustaendig to update
     */
    updateForm(data: any, istZustaendig: boolean): boolean {
        this.ngForm.resetForm();

        const isDataPresent = data !== null && data.personalberater;
        let abmeldegrund: number = null;
        if (isDataPresent) {
            this.configureToolbox(this.abmeldungChannel, ToolboxConfig.getStesAbmeldungBearbeitenConfig(), ToolboxDataHelper.createForStellensuchende(this.formBundle.stesId));
            this.letzteAktualisierung = data;
            this.abmeldenForm.reset(this.abmeldenFormBuilder.mapToForm(this.letzteAktualisierung, this.formBundle));
            abmeldegrund = this.letzteAktualisierung.abmeldegrund ? this.letzteAktualisierung.abmeldegrund.codeId : null;
            this.authService.setOwnerPermissionContext(this.formBundle.stesId, data.ownerId);
        } else {
            // no data received
            this.letzteAktualisierung = {};
            this.configureToolbox(this.abmeldungChannel, ToolboxConfig.getStesAbmeldungConfig());
            this.authService.setStesPermissionContext(this.formBundle.stesId);
        }
        this.setAlkText();
        this.subscribeToLangChangeForAlkText();

        const title = this.dbTranslateService.instant(this.letzteAktualisierung.abmeldeDatum ? 'stes.label.abmeldung' : 'stes.label.abmeldung.erfassen');
        this.messageBus.sendData({ type: 'stes-details-content-ueberschrift', data: { ueberschrift: title } });

        this.updateScreen(this.letzteAktualisierung.abmeldeDatum, istZustaendig);
        this.updateFormNumber(this.letzteAktualisierung.stesAbmeldungId);
        this.newAbmeldung();

        // in rare case: no change on branche is expected (neither by bspEngine nor setUnternehmen)
        const keepBranche = this.neuerArbeitgeberForm.controls.branche.value;
        this.bspEngine(null, abmeldegrund);
        this.setUnternehmen(this.letzteAktualisierung.neuerArbeitgeber);
        if (!this.letzteAktualisierung.neuerArbeitgeber) {
            this.neuerArbeitgeberForm.controls.branche.setValue(keepBranche);
            this.neuerArbeitgeberForm.controls.unternehmensname.setErrors(null);
        }

        // update header an its blue info icon
        this.interactionService.updateDetailsHeader(this.formBundle.stesId);
        this.updateInfoleistePanel(this.stesInfobarService, this.letzteAktualisierung);

        this.updateInfoBar();

        this.checkDefaultFocus();

        this.spinnerService.deactivate(this.abmeldungChannel);

        return isDataPresent;
    }

    /**
     * whether the BO is present
     */
    isBoPresent(): boolean {
        return !!this.letzteAktualisierung.stesAbmeldungId;
    }

    setVermittlung(vermittGuiEntry: VermittlungDto) {
        this.abmeldeAngabenForm.controls.vermittlungsnummer.setValue(vermittGuiEntry.nr);
        this.formBundle.vermittlungGuiEntry = vermittGuiEntry;

        this.arbeitsvermittlungRestService.getData(vermittGuiEntry.id, vermittGuiEntry.schnellFlag).subscribe((data: ArbeitsvermittlungDataDTO) => {
            this.setUnternehmen(data);
            this.setBerufTaetigkeit(data);
        });
    }

    /**
     * does abmelden and speichern action
     */
    save() {
        this.fehlermeldungenService.closeMessage();

        if (this.abmeldenForm.valid) {
            if (this.letzteAktualisierung.stesAbmeldungId) {
                // no further confirmation
                this.jetztAbmelden();
            } else {
                const titleLabel = 'common.label.stesWirklichAbmeldenTitle';
                const promtLabel = 'common.label.stesWirklichAbmelden';
                const primaryButton = 'common.button.jaAbmelden';
                this.openConfirmationModal(titleLabel, promtLabel, primaryButton, 'jetztAbmelden');
            }
        } else {
            const datumFormControl = (this.abmeldenForm.get('abmeldeAngabenForm') as FormGroup).get('abmeldedatum');
            const makePristine = datumFormControl.pristine;
            datumFormControl.markAsDirty();
            datumFormControl.updateValueAndValidity();

            if (makePristine) {
                datumFormControl.markAsPristine();
            }

            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    jetztAbmelden() {
        this.spinnerService.activate(this.abmeldungChannel);
        this.dataSubscription = this.dataService
            .createAbmeldung(this.formBundle.stesId, this.translateService.currentLang, this.abmeldenFormBuilder.mapToDTO(this.letzteAktualisierung, this.formBundle))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    if (this.updateForm(response.data, true)) {
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    }
                    this.spinnerService.deactivate(this.abmeldungChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => this.spinnerService.deactivate(this.abmeldungChannel)
            );
    }

    delete() {
        this.fehlermeldungenService.closeMessage();
        const titleLabel = 'i18n.common.delete';
        const promtLabel = 'common.label.datenWirklichLoeschen';
        const primaryButton = 'common.button.jaLoeschen';
        this.openConfirmationModal(titleLabel, promtLabel, primaryButton, 'deleteNow');
    }

    deleteNow() {
        this.spinnerService.activate(this.abmeldungChannel);
        this.dataService.deleteAbmeldung(this.formBundle.stesId, this.translateService.currentLang, this.letzteAktualisierung.stesAbmeldungId).subscribe(
            () => {
                // apply non-null value to trigger update of form
                this.abmeldenFormBuilder.updateStesDetailContent(null);
                this.updateForm(null, true);
                OrColumnLayoutUtils.scrollTop();
            },
            () => this.spinnerService.deactivate(this.abmeldungChannel)
        );
    }

    reset() {
        if (this.abmeldenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();

                this.updateForm(this.letzteAktualisierung, true);

                if (!this.letzteAktualisierung.stesAbmeldungId) {
                    this.configureToolbox(this.abmeldungChannel, ToolboxConfig.getStesAbmeldungConfig());
                }
            });
        }
    }

    setBerufTaetigkeit(data: ArbeitsvermittlungDataDTO) {
        const berufTaetigkeit = this.abmeldeAngabenForm.get('berufTaetigkeit');
        if (data.berufsqualifikationDto.berufDto) {
            berufTaetigkeit.setValue(data.berufsqualifikationDto.berufDto);
        } else {
            berufTaetigkeit.setValue(null);
        }
    }
    formatPlzOrt(unternehmen: UnternehmenDTO) {
        const plz = unternehmen.plz ? unternehmen.plz.postleitzahl : unternehmen.plzAusland ? unternehmen.plzAusland : '';
        const ort = unternehmen.plz ? this.dbTranslateService.translate(unternehmen.plz, 'ort') : unternehmen.ortAusland ? unternehmen.ortAusland : '';

        return `${plz} ${ort}`;
    }

    setUnternehmen(unternehmen: UnternehmenDTO) {
        this.currentUnternehmen = unternehmen;
        this.formBundle.unternehmenDTO = unternehmen;

        if (unternehmen) {
            this.unternehmenName = unternehmen.name1;
            this.unternehmenInfo1 = unternehmen.name2;
            this.unternehmenInfo2 = unternehmen.name3;

            this.unternehmenPlzOrt = this.formatPlzOrt(unternehmen);
            this.unternehmenLand = unternehmen.staat ? this.dbTranslateService.translate(unternehmen.staat, 'name') : null;
            this.unternehmenBur = unternehmen.burNummer ? unternehmen.burNummer : null;

            this.neuerArbeitgeberForm.controls.unternehmensname.setValue(unternehmen);
            this.neuerArbeitgeberForm.controls.branche.setValue(unternehmen.nogaDTO);
        } else {
            this.clearUnternehmen();
        }
    }

    clearUnternehmen() {
        this.unternehmenName = null;
        this.unternehmenInfo1 = null;
        this.unternehmenInfo2 = null;

        this.unternehmenPlzOrt = null;
        this.unternehmenLand = null;
        this.unternehmenBur = null;

        this.neuerArbeitgeberForm.controls.unternehmensname.setValue(null);
        this.neuerArbeitgeberForm.controls.branche.setValue(null);
    }

    /**
     * apply rules based on 'stelle gefunden' and further
     *
     * @param event the event received from html
     * @param abmeldegrund the grund needed for 2nd and manual apply to the form (only provided on new form data e.g. updateForm)
     */
    bspEngine(event: any, abmeldegrund: number) {
        const cbxStellegefunden: boolean = this.abmeldeAngabenForm.controls.stellegefunden.value;

        // only apply other values to select box
        if (cbxStellegefunden !== this.oldCbxStellegefunden) {
            const relevantOptions = cbxStellegefunden ? this.abmeldegrundOptions : this.abmeldegrundOhneStelleOptions;
            this.relevantAbmeldegrundOptions = this.facade.formUtilsService.mapDropdownKurztext(relevantOptions);

            if (this.oldCbxStellegefunden !== undefined) {
                // always wipe, except onLoad
                this.abmeldeAngabenForm.controls.abmeldegrund.setValue(null);
            }

            // extra handling of branche - EIN
            if (cbxStellegefunden) {
                this.neuerArbeitgeberForm.controls.branche.enable();
            }

            // last operation
            this.oldCbxStellegefunden = cbxStellegefunden;
        }

        // since options change, bulk-applying of value might fail
        if (abmeldegrund) {
            this.abmeldeAngabenForm.controls.abmeldegrund.setValue(abmeldegrund);
        }

        if (this.wholeScreenReadyOnly) {
            this.abmeldenForm.disable();
        } else {
            this.bspAbmeldegrund(!!abmeldegrund);
        }
    }

    getAbmeldeGrund(): number {
        const grundTemp = this.abmeldeAngabenForm.controls.abmeldegrund.value;

        // CONVERT: existing components don't provide numbers yet
        return AbmeldenFormbuilder.parseIntSave(grundTemp);
    }

    // apply rules based on 'abmeldegrund'
    bspAbmeldegrund(keepValues: boolean) {
        const vermitteltDurchRAV = 1,
            vermitteltPrivateAvMitRAV = 5,
            leistungsimportVermitteltDurchRAV = 7;

        const grund = this.getAbmeldeGrund();

        // on these 3 reasons the cbx must be on, but not enforced
        const doEnable = grund === vermitteltDurchRAV || grund === vermitteltPrivateAvMitRAV || grund === leistungsimportVermitteltDurchRAV;
        const hasChanged = grund !== this.oldAbmeldegrund;
        this.oldAbmeldegrund = grund;

        if (doEnable) {
            this.abmeldeAngabenForm.controls.aufgrundvermittlung.enable();
            if (hasChanged && !keepValues) {
                this.abmeldeAngabenForm.controls.aufgrundvermittlung.setValue(true);
            }
        } else {
            if (this.abmeldeAngabenForm.controls.aufgrundvermittlung.enabled) {
                StesAbmeldungComponent.disableCheckbox(this.abmeldeAngabenForm.controls.aufgrundvermittlung);
            }
        }

        this.bspCbxAufgrundvermittlung(keepValues);
    }

    // apply rules based on cbx cbx 'aufgrundvermittlung'
    bspCbxAufgrundvermittlung(keepValues: boolean) {
        const cbxAufgrundvermittlung: boolean = this.abmeldeAngabenForm.controls.aufgrundvermittlung.value;

        if (cbxAufgrundvermittlung && !StesAbmeldungComponent.isPresent(this.abmeldeAngabenForm.controls.vermittlungsnummer)) {
            // EIN schalten
            this.abmeldeAngabenForm.controls.vermittlungsnummer.enable();
            this.abmeldeAngabenForm.controls.berufTaetigkeit.disable();
            if (!keepValues) {
                this.abmeldeAngabenForm.controls.berufTaetigkeit.setValue(null);
            }
            this.setUnternehmen(null);
        } else if (!cbxAufgrundvermittlung && StesAbmeldungComponent.isPresent(this.abmeldeAngabenForm.controls.vermittlungsnummer)) {
            // AUS schalten
            StesAbmeldungComponent.disbleField(this.abmeldeAngabenForm.controls.vermittlungsnummer);
            this.formBundle.vermittlungGuiEntry = null;
            this.abmeldeAngabenForm.controls.berufTaetigkeit.enable();
            if (!keepValues) {
                this.abmeldeAngabenForm.controls.berufTaetigkeit.setValue(null);
            }
            this.setUnternehmen(null);
        } else if (cbxAufgrundvermittlung && keepValues) {
            // disable berufTaetigkeit on page load
            this.abmeldeAngabenForm.controls.berufTaetigkeit.disable();
        }

        this.bspCbxNeuerArbeitgeber();
    }

    /**
     * enabling the checkbox
     */
    bspCbxNeuerArbeitgeber() {
        const cbxStellegefunden: boolean = this.abmeldeAngabenForm.controls.stellegefunden.value;
        const cbxAufgrundvermittlung: boolean = this.abmeldeAngabenForm.controls.aufgrundvermittlung.value;

        const lockCbxNeuerArbeitgeber = !cbxStellegefunden || cbxAufgrundvermittlung;

        // handle enabling
        if (lockCbxNeuerArbeitgeber) {
            this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.disable();
        } else {
            this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.enable();
        }

        // handle value
        if (!cbxStellegefunden && this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.value) {
            // aus
            this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.setValue(false);
        } else if (cbxAufgrundvermittlung && !this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.value) {
            // ein
            this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.setValue(true);
        }

        this.bspNeuerArbeitgeber();
    }

    bspNeuerArbeitgeber() {
        const cbxNeuerarbeitgeberbekannt: boolean = this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.value;

        // Neuer arbeitgeber bekannt EIN
        if (cbxNeuerarbeitgeberbekannt && !this.arbeigeberSuchePlusEnabled) {
            this.arbeigeberSuchePlusEnabled = true;

            this.neuerArbeitgeberForm.controls.unternehmensname.setErrors({ required: true });

            this.neuerArbeitgeberForm.controls.branche.disable();

            this.neuerArbeitgeberForm.controls.branche.setValue(null);
        }
        // Neuer arbeitgeber bekannt AUS
        if (!cbxNeuerarbeitgeberbekannt && this.arbeigeberSuchePlusEnabled) {
            this.setUnternehmen(null);
            this.neuerArbeitgeberForm.controls.unternehmensname.setErrors(null);

            this.arbeigeberSuchePlusEnabled = false;

            this.neuerArbeitgeberForm.controls.branche.enable();

            this.neuerArbeitgeberForm.controls.branche.setValue(null);
        }

        this.bspCleaning();
    }

    bspCleaning() {
        const cbxAufgrundvermittlung: boolean = this.abmeldeAngabenForm.controls.aufgrundvermittlung.value;
        if (cbxAufgrundvermittlung) {
            // lock both, values are changed above
            this.arbeigeberSuchePlusEnabled = false;
            this.neuerArbeitgeberForm.controls.unternehmensname.setErrors(null);
            this.neuerArbeitgeberForm.controls.branche.disable();
        }

        // extra handling of branche - AUS
        const cbxStellegefunden: boolean = this.abmeldeAngabenForm.controls.stellegefunden.value;
        const cbxNeuerarbeitgeberbekannt: boolean = this.neuerArbeitgeberForm.controls.neuerarbeitgeberbekannt.value;
        if (!cbxStellegefunden || cbxNeuerarbeitgeberbekannt) {
            this.neuerArbeitgeberForm.controls.branche.disable();
        }
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    selectedArbeitgeber(selected) {
        this.spinnerService.activate(this.abmeldungChannel);
        if (selected.hasOwnProperty('unternehmenId')) {
            this.unternehmenRestService.getUnternehmenById(selected.unternehmenId).subscribe(
                unternehmen => {
                    this.setUnternehmen(unternehmen);
                    this.spinnerService.deactivate(this.abmeldungChannel);
                },
                () => {
                    this.spinnerService.deactivate(this.abmeldungChannel);
                }
            );
        } else {
            this.dataService.getBurOrtEinheitById(selected.burOrtEinheitId).subscribe(
                response => {
                    let unternehmenDto = null;
                    if (response.data) {
                        unternehmenDto = {
                            burNummer: +response.data.letzterAGBurNummer,
                            unternehmenId: null,
                            name1: response.data.letzterAGName1,
                            name2: response.data.letzterAGName2,
                            name3: response.data.letzterAGName3,
                            staat: response.data.letzterAGLand,
                            burOrtEinheitId: response.data.burOrtEinheitId,
                            plz: response.data.letzterAGPlzDTO
                        };
                        this.setUnternehmen(unternehmenDto);
                    }

                    this.spinnerService.deactivate(this.abmeldungChannel);
                },
                () => {
                    this.spinnerService.deactivate(this.abmeldungChannel);
                }
            );
        }
    }

    private openConfirmationModal(titleLabel: string, promptLabel: string, primaryButton: string, method: string) {
        const modalRef = this.openModal(GenericConfirmComponent);
        modalRef.result.then(result => {
            if (result) {
                this[method]();
            }
        });
        modalRef.componentInstance.titleLabel = titleLabel;
        modalRef.componentInstance.promtLabel = promptLabel;
        modalRef.componentInstance.primaryButton = primaryButton;
    }

    private static isPresent(aControl: AbstractControl): boolean {
        return aControl.value === true || aControl.enabled;
    }

    private static disableCheckbox(cbx: AbstractControl) {
        cbx.disable();
        cbx.setValue(false);
    }

    private static disbleField(field: AbstractControl) {
        field.disable();
        field.setValue(null);
    }

    private unflatBadDto(badDto: any): UnternehmenDTO {
        const unternehmenDTO = this.copySimpleFields(badDto);

        unternehmenDTO.plz = badDto.plz
            ? {
                  postleitzahl: badDto.plz,
                  ortDe: badDto.ortDe,
                  ortFr: badDto.ortFr,
                  ortIt: badDto.ortIt
              }
            : null;

        unternehmenDTO.staat = {
            nameDe: badDto.staatDe,
            nameFr: badDto.staatFr,
            nameIt: badDto.staatIt
        };

        unternehmenDTO.nogaDTO = {
            nogaId: badDto.nogaId,
            nogaCodeUp: badDto.nogaCode,
            textlangDe: badDto.nogaDe,
            textlangFr: badDto.nogaFr,
            textlangIt: badDto.nogaIt
        };

        unternehmenDTO.burNummer = badDto.burNr;

        return unternehmenDTO;
    }

    private copySimpleFields(badDto: any): UnternehmenDTO {
        const unternehmenDTO: UnternehmenDTO = {};
        unternehmenDTO.unternehmenId = badDto.unternehmenId;
        unternehmenDTO.burOrtEinheitId = badDto.burOrtEinheitId;
        unternehmenDTO.name3 = badDto.name3;
        unternehmenDTO.name1 = badDto.name1;
        unternehmenDTO.name2 = badDto.name2;
        unternehmenDTO.burNummer = badDto.burNr;

        return unternehmenDTO;
    }

    /**
     * removes default focus from the abmeldung date field if the screen is readonly
     * (fix for FF that doesn't remove the focus on a disabled field)
     */
    private checkDefaultFocus() {
        if (this.wholeScreenReadyOnly) {
            const elements = this.abmeldedatum.nativeElement.querySelectorAll(['input']);
            for (const key in elements) {
                if (elements.hasOwnProperty(key)) {
                    const element = elements[key];
                    element.blur();
                }
            }
        }
    }

    private subscribeToLangChangeForAlkText() {
        if (!this.observeLanguageChangeSub) {
            this.observeLanguageChangeSub = this.dbTranslateService.getEventEmitter().subscribe(() => {
                this.setAlkText();
            });
        }
    }

    private setAlkText() {
        let alkText;
        if (!!this.letzteAktualisierung.transferAlkCode) {
            alkText = this.dbTranslateService.translate(this.letzteAktualisierung.transferAlkCode, 'text');
        } else {
            alkText = this.dbTranslateService.translate(this.defaultAlkState, 'text');
        }
        if (this.letzteAktualisierung.datumTransferALK) {
            alkText = alkText + ` ${this.facade.formUtilsService.getGuiStringDateFromIsoString(this.letzteAktualisierung.datumTransferALK)}`;
        }
        this.neuerArbeitgeberForm.controls.transferanalk.setValue(alkText);
    }

    private isBearbeitung(): boolean {
        return !!this.letzteAktualisierung.stesAbmeldungId;
    }

    /**
     * @param rawAbmeldeDatum the date string e.g "2019-05-10"
     * @param istZuestaendig to update
     */
    private updateScreen(rawAbmeldeDatum: string, istZuestaendig: boolean) {
        const abmeldeDatum = new Date(rawAbmeldeDatum);

        // once the screen is read-only it STAYS read-only
        if (abmeldeDatum && abmeldeDatum <= new Date()) {
            this.istZustaendig = false;
            this.wholeScreenReadyOnly = true;

            return;
        } else {
            this.istZustaendig = true;
        }

        if (istZuestaendig) {
            this.istZustaendig = true;
        } else {
            this.istZustaendig = false;
        }
    }

    private newAbmeldung() {
        if (!this.isBearbeitung()) {
            this.personalberater.appendCurrentUser();
        }
    }

    private updateFormNumber(stesAbmeldungId: number) {
        const num = stesAbmeldungId ? StesFormNumberEnum.ABMELDUNG_BEARBEITEN : StesFormNumberEnum.ABMELDUNG_ERFASSEN;
        this.messageBus.buildAndSend('footer-infos.formNumber', { formNumber: num });
    }

    private removeSystemCodes(codeList: any[], data: StesAbmeldenDTO): any[] {
        const result: any[] = [];

        for (const code of codeList) {
            if (code.codeId === this.arbeitsamtWechsel && !this.isArbeitsamtswechselGrund(data)) {
                continue;
            }
            result.push(code);
        }
        return result;
    }

    private isArbeitsamtswechselGrund(data: StesAbmeldenDTO) {
        return data && data.abmeldegrund && data.abmeldegrund.codeId === this.arbeitsamtWechsel;
    }

    private getBenutzerSuchenTokens() {
        const currentUser = this.authService.getLoggedUser();

        if (currentUser) {
            return {
                berechtigung: Permissions.STES_ANMELDEN_BEARBEITEN,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };
        }

        return null;
    }

    private updateInfoBar() {
        this.dataService.getStesHeader(this.formBundle.stesId, this.translateService.currentLang).subscribe((stesData: StesHeaderDTO) => {
            this.stesStore.addStes(stesData);
        });
    }
}

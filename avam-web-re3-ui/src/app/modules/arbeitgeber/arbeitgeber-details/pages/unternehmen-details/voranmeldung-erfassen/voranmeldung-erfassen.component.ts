import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { filter, finalize, map, takeUntil } from 'rxjs/operators';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, ValidatorFn, Validators } from '@angular/forms';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { VoranmeldungService } from '@modules/arbeitgeber/services/voranmeldung.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { CodeDTO } from '@dtos/codeDTO';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxAction, ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { BaseResponseWrapperVoranmeldungKaeDTOWarningMessages } from '@dtos/baseResponseWrapperVoranmeldungKaeDTOWarningMessages';
import { VoranmeldungKaeDTO } from '@dtos/voranmeldungKaeDTO';
import * as moment from 'moment';
import { VoranmeldungKaePropertyDTO } from '@dtos/voranmeldungKaePropertyDTO';
import { DateValidator } from '@shared/validators/date-validator';
import { UnternehmenDetailsDTO } from '@dtos/unternehmenDetailsDTO';
import { TransferanalkCodeEnum } from '@shared/enums/domain-code/transferanalk-code.enum';
import {
    VoranmeldungButton,
    VoranmeldungButtonAction,
    VoranmeldungButtonEnum,
    VoranmeldungButtonUtil
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/voranmeldung-erfassen/voranmeldung-button.util';
import { UnternehmenStatusCodeEnum } from '@shared/enums/domain-code/unternehmen-status-code.enum';
import { VoranmeldungErfassenConstant } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/voranmeldung-erfassen/voranmeldung-erfassen.constant';
import { KurzarbeitStatusEnum } from '@shared/enums/domain-code/kurzarbeit-status.enum';
import { VoranmeldungKaeAction } from '@core/http/voranmeldung-kae-rest.service';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { FacadeService } from '@shared/services/facade.service';
import { NumberValidator } from '@shared/validators/number-validator';
import { AvamLabelDropdownComponent } from '@app/library/wrappers/form/avam-label-dropdown/avam-label-dropdown.component';
import { KaeSweConstant } from '@modules/arbeitgeber/shared/enums/kaeswe.enums';
import { KaeSweErfassenAbstractComponent } from '@modules/arbeitgeber/shared/components/kae-swe-erfassen-abstract-component';
import { ReferencedKaeSweObject } from '@modules/arbeitgeber/shared/services/kaeswe.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { DropdownOption } from '@shared/services/forms/form-utils.service';

@Component({
    selector: 'avam-voranmeldung-erfassen',
    templateUrl: './voranmeldung-erfassen.component.html'
})
export class VoranmeldungErfassenComponent extends KaeSweErfassenAbstractComponent implements OnInit, OnDestroy, AfterViewInit, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('entscheidDurch') entscheidDurch: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('modalZahlstelleSuchen') modalZahlstelleSuchen: ElementRef;
    @ViewChild('status') status: AvamLabelDropdownComponent;
    voranmeldungErfassenForm: FormGroup;
    kategorieOptions: any[] = [];
    begruendungkurzarbeitOptions: any[] = [];
    entscheidkurzarbeitOptions: any[] = [];
    languageSubscription: Subscription;
    voranmeldungKaeDTO: VoranmeldungKaeDTO;
    buttons: VoranmeldungButton[] = [];
    readonly channel = VoranmeldungErfassenConstant.CHANNEL;

    private static readonly AVAILABLE_STATUSES_IN_EDIT: string[] = [
        KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG,
        KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT,
        KurzarbeitStatusEnum.KAE_STATUS_PENDENT
    ];

    private static readonly AVAILABLE_STATUSES_IN_INUEBERARBEITUNG: string[] = [
        KurzarbeitStatusEnum.KAE_STATUS_INUEBERARBEITUNG,
        KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT,
        KurzarbeitStatusEnum.KAE_STATUS_PENDENT
    ];

    private static readonly FIELDS_EDITABLE_STATUSES: KurzarbeitStatusEnum[] = [
        KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG,
        KurzarbeitStatusEnum.KAE_STATUS_INUEBERARBEITUNG,
        KurzarbeitStatusEnum.KAE_STATUS_PENDENT
    ];

    private readonly actions: VoranmeldungButtonAction[] = [
        { key: VoranmeldungButtonEnum.SPEICHERN, action: () => this.updateVoranmeldung() } as VoranmeldungButtonAction,
        { key: VoranmeldungButtonEnum.ZURUECKSETZEN, action: () => this.zuruecksetzen() } as VoranmeldungButtonAction,
        { key: VoranmeldungButtonEnum.ABBRECHEN, action: () => this.cancel() } as VoranmeldungButtonAction,
        { key: VoranmeldungButtonEnum.KOPIEREN, action: () => this.kopieren() } as VoranmeldungButtonAction,
        { key: VoranmeldungButtonEnum.LOESCHEN, action: () => this.loeschen() } as VoranmeldungButtonAction,
        {
            key: VoranmeldungButtonEnum.ZURUECKNEHMEN,
            action: () => this.call(VoranmeldungKaeAction.ZURUECKNEHMEN, KaeSweConstant.DATEN_GESPEICHERT)
        } as VoranmeldungButtonAction,
        { key: VoranmeldungButtonEnum.ERSETZEN, action: () => this.ersetzen() } as VoranmeldungButtonAction,
        {
            key: VoranmeldungButtonEnum.UEBERARBEITEN,
            action: () => this.call(VoranmeldungKaeAction.UEBERARBEITEN, KaeSweConstant.DATEN_GESPEICHERT)
        } as VoranmeldungButtonAction,
        {
            key: VoranmeldungButtonEnum.FREIGEBEN,
            action: () => this.call(VoranmeldungKaeAction.FREIGEBEN, KaeSweConstant.ENTSCHEIDFREIGEGEBEN, { ...this.voranmeldungKaeDTO, ...this.mapFormToDTO() })
        } as VoranmeldungButtonAction
    ];
    private voranmeldungKaeId: number;
    private property: VoranmeldungKaePropertyDTO;
    private nextFreeEntscheidNr: number;
    private allPossibleStatus: CodeDTO[] = [];
    private kurzarbeitVonSubscription: Subscription;
    private alkSubscription: Subscription;
    private zahlstelleSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private voranmeldungService: VoranmeldungService,
        private elementRef: ElementRef,
        private stesRestService: StesDataRestService,
        interactionService: StesComponentInteractionService,
        facadeService: FacadeService
    ) {
        super(facadeService, interactionService);
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.initForm();
        this.observeRoute();
        this.subscribeToData();
        this.facadeService.translateService.onLangChange.subscribe(() => this.onLangChange());
        this.setTokens();
    }

    ngOnDestroy(): void {
        this.facadeService.toolboxService.resetConfiguration();
        this.facadeService.fehlermeldungenService.closeMessage();
        this.kurzarbeitVonSubscription.unsubscribe();
        this.alkSubscription.unsubscribe();
        this.zahlstelleSubscription.unsubscribe();
        super.ngOnDestroy();
    }

    cancel(): void {
        this.onCancel(this.elementRef, () => this.voranmeldungService.redirectToParent(this.route));
    }

    reset(): void {
        if (this.canDeactivate()) {
            this.facadeService.resetDialogService.reset(() => {
                if (!this.isBearbeiten) {
                    const nr = this.voranmeldungErfassenForm.controls.entscheidnr.value;
                    this.voranmeldungErfassenForm.reset();
                    this.initFormWithDefaults();
                    this.voranmeldungErfassenForm.controls.entscheidnr.setValue(nr);
                }
            });
        }
    }

    save(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.voranmeldungErfassenForm.valid) {
            if (this.isBearbeiten) {
                this.updateVoranmeldung();
            } else {
                this.createVoranmeldung();
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage(KaeSweConstant.PFLICHTFELDER, 'danger');
        }
    }

    canDeactivate(): boolean {
        return this.voranmeldungErfassenForm.dirty;
    }

    openZahlstelleSuchen(): void {
        this.facadeService.openModalFensterService.openXLModal(this.modalZahlstelleSuchen);
    }

    onAbteilungChange(event): void {
        this.setAlvAnerkanntValue(this.voranmeldungErfassenForm.controls.alvanerkannt, +event);
    }

    onStatusChange(event): void {
        const statusCode = this.facadeService.formUtilsService.getCodeByCodeId(this.allPossibleStatus, event);
        this.setMandatoryFieldsByStatus(statusCode);
        if (statusCode !== KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG) {
            this.voranmeldungErfassenForm.controls.mahnfristende.setValue(null);
        }
    }

    isReadOnly(): boolean {
        if (!this.isBearbeiten) {
            return false;
        }

        if (!this.voranmeldungKaeDTO) {
            return false;
        }
        const status: string = this.voranmeldungKaeDTO.statusObject.code;
        return !this.includes(VoranmeldungErfassenComponent.FIELDS_EDITABLE_STATUSES, status);
    }

    getKurzarbeitVonBisReadOnlyState(): string {
        return this.isReadOnly() ? 'all' : '';
    }

    isFreigabeDurchReadOnly(): boolean {
        if (!this.isReadOnly()) {
            return false;
        }

        const status: string = this.voranmeldungKaeDTO.statusObject.code;
        return status !== KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT.toString();
    }

    isMahnfristendeReadOnly(): boolean {
        const status = this.allPossibleStatus.find(a => a.codeId === +this.voranmeldungErfassenForm.controls.status.value);
        return !status || status.code !== KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG.toString();
    }

    onEntscheidkurzarbeitChange(event): void {
        if (
            this.facadeService.formUtilsService.getCodeByCodeId(this.allPossibleStatus, this.voranmeldungErfassenForm.controls.status.value) ===
            KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT
        ) {
            this.setMandatoryField(this.voranmeldungErfassenForm.controls.kurzarbeitVon, this.isEntscheidKeinOrTeil(event), [
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.dateRangeBiggerCenturyNgx
            ]);
            this.setMandatoryField(this.voranmeldungErfassenForm.controls.kurzarbeitBis, this.isEntscheidKeinOrTeil(event), [
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.dateRangeBiggerCenturyNgx
            ]);
            this.voranmeldungErfassenForm.controls.kurzarbeitVon.updateValueAndValidity();
            this.voranmeldungErfassenForm.controls.kurzarbeitBis.updateValueAndValidity();
        }
    }

    protected onChanges(): void {
        this.kurzarbeitVonSubscription = this.observe(this.voranmeldungErfassenForm, 'kurzarbeitVon', (von: any) => {
            if (this.voranmeldungErfassenForm.get('kurzarbeitVon').valid) {
                this.checkBSP6(von);
            }
        });
        this.alkSubscription = this.observeAlk(this.voranmeldungErfassenForm);
        this.zahlstelleSubscription = this.observeZahlstelle(this.voranmeldungErfassenForm);
    }

    protected redirectToMeldung(): void {
        this.voranmeldungService.redirectToVoranmeldung(this.route, this.voranmeldungKaeDTO.verweiserVorgaenger);
    }

    protected hideNavigationTreeRoute(): void {
        if (this.isBearbeiten) {
            this.facadeService.navigationService.hideNavigationTreeRoute(VoranmeldungErfassenConstant.SIDE_NAV_ITEM_PATH_BEARBEITEN);
            this.voranmeldungService.resetCloseBearbeitenSubscription();
        } else {
            this.facadeService.navigationService.hideNavigationTreeRoute(VoranmeldungErfassenConstant.SIDE_NAV_ITEM_PATH_ERFASSEN);
            this.voranmeldungService.resetCloseErfassenSubscription();
        }
    }

    protected isStatusFreigabebereit(): boolean {
        return this.getStatusCode(this.voranmeldungErfassenForm.get('status').value) === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT;
    }

    protected setMandatoryAlkZahlstelleByStatusOnChanges(isFreigabebereit: boolean, alk, zahlstelle): void {
        const isMandatory = isFreigabebereit && !alk && !zahlstelle;
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.alkControl, isMandatory);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.zahlstelleControl, isMandatory);
    }

    private static addMonths(date: Date, numberOfMonths: number): Date {
        return moment(date)
            .add(numberOfMonths, 'month')
            .subtract(1, 'day')
            .toDate();
    }

    private getStatusCode(codeId: string): string | undefined {
        return codeId ? this.facadeService.formUtilsService.getCodeByCodeId(this.allPossibleStatus, codeId) : undefined;
    }

    private includes(array: KurzarbeitStatusEnum[], status: string): boolean {
        return array.some(e => e.toString() === status);
    }

    private isEntscheidKeinOrTeil(codeId: any): boolean {
        const entscheidCode = this.facadeService.formUtilsService.getCodeByCodeId(this.entscheidkurzarbeitOptions, codeId);
        return entscheidCode === VoranmeldungErfassenConstant.ENTSCHEID_KEIN_EINSPRUCH || entscheidCode === VoranmeldungErfassenConstant.ENTSCHEID_TEILWEISE_EINSPRUCH;
    }

    private setMandatoryFieldsByStatus(statusCode: string): void {
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.freigabedurch, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGEGEBEN);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.kategorie, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.personalbestand, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, [
            NumberValidator.isPositiveIntegerWithMaxLength(10) as ValidatorFn
        ]);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.betroffene, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, [
            NumberValidator.isPositiveIntegerWithMaxLength(10) as ValidatorFn
        ]);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.dauerVon, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, [Validators.maxLength(50)]);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.dauerBis, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, [Validators.maxLength(50)]);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.arbeitsausfall, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, [
            NumberValidator.checkValueBetween1and100
        ]);

        const isMandatory = this.isAlkZahlstelleMandatory(statusCode);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.alkControl, isMandatory);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.zahlstelleControl, isMandatory);

        this.setMandatoryField(this.voranmeldungErfassenForm.controls.begruendungkurzarbeit, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.entscheidkurzarbeit, statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT);

        const checkVonBis = this.isEntscheidKeinOrTeil(this.voranmeldungErfassenForm.controls.entscheidkurzarbeit.value);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.kurzarbeitVon, checkVonBis && statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, [
            DateValidator.dateFormatNgx,
            DateValidator.dateValidNgx,
            DateValidator.dateRangeBiggerCenturyNgx
        ]);
        this.setMandatoryField(this.voranmeldungErfassenForm.controls.kurzarbeitBis, checkVonBis && statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, [
            DateValidator.dateFormatNgx,
            DateValidator.dateValidNgx,
            DateValidator.dateRangeBiggerCenturyNgx
        ]);

        this.setMandatoryField(this.voranmeldungErfassenForm.controls.mahnfristende, statusCode === KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG);
    }

    private isAlkZahlstelleMandatory(statusCode: string): boolean {
        return (
            statusCode === KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT &&
            !this.voranmeldungErfassenForm.controls.alkControl.value &&
            !this.voranmeldungErfassenForm.controls.zahlstelleControl.value
        );
    }

    private setMandatoryField(control: AbstractControl, mandatory: boolean, defaultValidators?: ValidatorFn[]): void {
        if (!control) {
            return;
        }
        if (mandatory) {
            this.marksAsMandatoryField(control, defaultValidators);
        } else {
            this.markAsNotMandatoryField(control, defaultValidators);
        }
        control.updateValueAndValidity();
    }

    private marksAsMandatoryField(control: AbstractControl, defaultValidators: ValidatorFn[]): void {
        if (!control) {
            return;
        }
        if (defaultValidators) {
            control.setValidators([...defaultValidators, Validators.required]);
        } else {
            control.setValidators([Validators.required]);
        }
    }

    private markAsNotMandatoryField(control: AbstractControl, defaultValidators: ValidatorFn[]): void {
        if (!control) {
            return;
        }
        if (defaultValidators) {
            control.setValidators(defaultValidators);
        } else {
            control.clearValidators();
        }
    }

    private createVoranmeldung(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.voranmeldungService
            .createVoranmeldung(this.mapFormToDTO())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                value => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (value.data) {
                        this.facadeService.notificationService.success(KaeSweConstant.DATEN_GESPEICHERT);
                        this.facadeService.navigationService.hideNavigationTreeRoute(VoranmeldungErfassenConstant.SIDE_NAV_ITEM_PATH_ERFASSEN);
                        this.voranmeldungService.resetCloseErfassenSubscription();
                        this.voranmeldungErfassenForm.reset();
                        this.voranmeldungService.redirectToBearbeitenAfterCreate(this.route, value.data);
                    }
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    private mapFormToDTO(): VoranmeldungKaeDTO {
        return {
            entscheidNr: +this.voranmeldungErfassenForm.controls.entscheidnr.value,
            betriebsabteilungId: +this.voranmeldungErfassenForm.controls.betriebsabteilung.value,
            betriebsabteilungObject: this.betriebsabteilungDTOs.find(a => a.betriebsabteilungId === +this.voranmeldungErfassenForm.controls.betriebsabteilung.value),
            entscheiderDetailId: this.getBenutzerDetailId(this.voranmeldungErfassenForm.controls.entscheiddurch['benutzerObject'].benutzerDetailId),
            entscheiderDetailObject: this.getBenutzer(this.voranmeldungErfassenForm.controls.entscheiddurch['benutzerObject']),
            unterzeichnerDetailId: this.getBenutzerDetailId(this.voranmeldungErfassenForm.controls.freigabedurch['benutzerObject'].benutzerDetailId),
            unterzeichnerDetailObject: this.getBenutzer(this.voranmeldungErfassenForm.controls.freigabedurch['benutzerObject']),
            voranmeldungDatum: this.voranmeldungErfassenForm.controls.voranmeldedatum.value,
            kategorieId: +this.voranmeldungErfassenForm.controls.kategorie.value,
            kategorieObject: this.kategorieOptions.find(a => a.codeId === +this.voranmeldungErfassenForm.controls.kategorie.value, null),
            kurzarbeitVon: this.voranmeldungErfassenForm.controls.kurzarbeitVon.value,
            kurzarbeitBis: this.voranmeldungErfassenForm.controls.kurzarbeitBis.value,
            statusId: +this.voranmeldungErfassenForm.controls.status.value,
            statusObject: this.allPossibleStatus.find(a => a.codeId === +this.voranmeldungErfassenForm.controls.status.value, null),
            verweiserNachfolger: this.nachfolger.id,
            verweiserVorgaenger: this.vorgaenger.id,
            voraussichtlichBetroffene: this.facadeService.formUtilsService.asNumber(this.voranmeldungErfassenForm.controls.betroffene.value),
            voraussichtlichKurzarbeitVon: this.voranmeldungErfassenForm.controls.dauerVon.value,
            voraussichtlichKurzarbeitBis: this.voranmeldungErfassenForm.controls.dauerBis.value,
            voraussichtlichArbeitsausfall: this.facadeService.formUtilsService.asNumber(this.voranmeldungErfassenForm.controls.arbeitsausfall.value),
            transferAsal: this.getTransferAnAlk(),
            transferAsalDatum: this.voranmeldungErfassenForm.controls.freigabedatum.value,
            personalBestand: this.facadeService.formUtilsService.asNumber(this.voranmeldungErfassenForm.controls.personalbestand.value),
            mahnfristEndeDatum: this.voranmeldungErfassenForm.controls.mahnfristende.value,
            zahlstelleId: this.getALKZahlstelleId(this.voranmeldungErfassenForm.controls),
            zahlstelleObject: this.getALKZahlstelleDto(this.voranmeldungErfassenForm.controls),
            alvAnerkannt: this.voranmeldungErfassenForm.controls.alvanerkannt.value,
            begruendungId: this.voranmeldungErfassenForm.controls.begruendungkurzarbeit.value,
            begruendungObject: this.begruendungkurzarbeitOptions.find(a => a.codeId === +this.voranmeldungErfassenForm.controls.begruendungkurzarbeit.value, null),
            entscheidKaeId: this.voranmeldungErfassenForm.controls.entscheidkurzarbeit.value,
            entscheidKaeObject: this.entscheidkurzarbeitOptions.find(a => a.codeId === +this.voranmeldungErfassenForm.controls.entscheidkurzarbeit.value, null),
            benutzerstelleId: this.facadeService.authenticationService.getLoggedUser().benutzerstelleId
        };
    }

    private getBenutzerDetailId(benutzerDetailId: any): any {
        return benutzerDetailId === -1 ? null : +benutzerDetailId;
    }

    private getBenutzer(benutzerObject: any): any {
        return benutzerObject.benutzerLogin ? benutzerObject : null;
    }

    private setTokens(): void {
        const currentUser = this.facadeService.authenticationService.getLoggedUser();
        this.entscheiddurchSuchenTokens = {
            berechtigung: Permissions.ARBEITGEBER_KAE_VORANMELDUNG_BEARBEITEN,
            benutzerstelleId: `${currentUser.benutzerstelleId}`,
            myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
            filterBenutzerstelleCode: currentUser.benutzerstelleCode ? `${currentUser.benutzerstelleCode.substring(0, 2)}*` : null
        };

        this.freigabedurchSuchenTokens = {
            berechtigung: Permissions.ARBEITGEBER_KAE_VORANMELDUNG_FREIGEBEN,
            benutzerstelleId: `${currentUser.benutzerstelleId}`,
            myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
            filterBenutzerstelleCode: currentUser.benutzerstelleCode ? `${currentUser.benutzerstelleCode.substring(0, 2)}*` : null
        };
    }

    private setTitle(): void {
        if (this.isBearbeiten) {
            this.voranmeldungService.updateTitle({ subtitle: VoranmeldungErfassenConstant.BEARBEITEN_TITLE });
        } else {
            this.voranmeldungService.updateTitle({ subtitle: VoranmeldungErfassenConstant.ERSTELLEN_TITLE });
        }
    }

    private configureErfassenToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getVoranmeldungErfassenConfig(), this.channel);
    }

    private configureBearbeitenToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(
            ToolboxConfig.getVoranmeldungBearbeitenConfig(),
            this.channel,
            ToolboxDataHelper.createForVoranmeldungBearbeiten(+this.voranmeldungKaeId)
        );
    }

    private checkBSP19(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (!this.isBearbeiten && !this.isUnternehmenAktiv() && (!isNaN(this.unternehmenDetailsDTO.nachfolgerId) && this.unternehmenDetailsDTO.nachfolgerId > 0)) {
            this.facadeService.fehlermeldungenService.showMessage(VoranmeldungErfassenConstant.UNTERNEHMENNICHTAKTIV, 'danger');
        }
    }

    // BSP6 in Erfassen = BSP10 in Bearbeiten
    private checkBSP6(von: any): void {
        if (von && von instanceof Date && this.property) {
            const kurzarbeitBis: AbstractControl = this.voranmeldungErfassenForm.get('kurzarbeitBis');
            if (!kurzarbeitBis.value) {
                const vonDate: Date = von as Date;
                const numberOfMonthToAdd: number = vonDate < this.property.checkDate ? this.property.maxOld : this.property.maxNew;
                const bis: Date = VoranmeldungErfassenComponent.addMonths(vonDate, numberOfMonthToAdd);
                kurzarbeitBis.setValue(bis);
            }
        }
    }

    private observeRoute(): void {
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params[KaeSweConstant.UNTERNEHMEN_ID];
            this.voranmeldungService.getUnternehmen(this.unternehmenId).subscribe((unternehmenDetailsDTO: UnternehmenDetailsDTO) => {
                this.unternehmenDetailsDTO = unternehmenDetailsDTO;
                this.checkBSP19();
            });
            this.route.data.subscribe(data => {
                this.isBearbeiten = data.formNumber === StesFormNumberEnum.VORANMELDUNGEN_BEARBEITEN;
                this.showNavigationTreeRoute();
                forkJoin([
                    this.stesRestService.getCode(DomainEnum.KURZARBEIT_KATEGORIE),
                    this.stesRestService.getCode(DomainEnum.KURZARBEIT_ENTSCHEID),
                    this.stesRestService.getCode(DomainEnum.KURZARBEIT_STATUS),
                    this.stesRestService.getCode(DomainEnum.KURZARBEIT_BEGRUENDUNG),
                    this.stesRestService.getCode(DomainEnum.TRANSFER_ALK),
                    this.voranmeldungService.getBetriebsAbteilungen(this.unternehmenId),
                    this.voranmeldungService.getProperty(),
                    this.voranmeldungService.getCodeBy(DomainEnum.UNTERNEHMEN_STATUS, UnternehmenStatusCodeEnum.STATUS_AKTIV)
                ] as Array<Observable<any>>).subscribe(([kategorie, entscheidKa, status, begruendung, transferAlk, abteilungen, property, aktivCode]) => {
                    this.kategorieOptions = this.facadeService.formUtilsService.mapDropdownKurztext(kategorie);
                    this.begruendungkurzarbeitOptions = this.facadeService.formUtilsService.mapDropdownKurztext(begruendung);
                    this.entscheidkurzarbeitOptions = this.facadeService.formUtilsService.mapDropdownKurztext(entscheidKa);
                    this.allPossibleStatus = status;
                    this.transferAlkCodes = transferAlk;
                    this.property = property;
                    this.aktivStatusCodeId = aktivCode.codeId;
                    if (abteilungen.data) {
                        this.betriebsabteilungDTOs = abteilungen.data;
                        this.betriebsabteilungOptions = abteilungen.data.map(this.voranmeldungService.abteilungenMapper);
                    }
                    this.setTitle();
                    if (this.isBearbeiten) {
                        this.voranmeldungService.resetCloseBearbeitenSubscription();
                        this.voranmeldungService.closeBearbeitenNavItemSubscription = this.subscribeOnCloseNavItem();
                    } else {
                        this.voranmeldungService.resetCloseErfassenSubscription();
                        this.voranmeldungService.closeErfassenNavItemSubscription = this.subscribeOnCloseNavItem();
                        this.initFormWithDefaults();
                        this.setNextFreeEntscheidNr();
                        this.configureErfassenToolbox();
                    }
                    this.fillForm();
                });
            });
        });
    }

    private subscribeToData(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter((action: ToolboxAction) => this.isPrintAction(action) || this.isHistoryAction(action) || this.isCopyAction(action)))
            .pipe(map((action: ToolboxAction) => action.message.action))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: ToolboxActionEnum) => this.apply(action));
        this.facadeService.openModalFensterService
            .getModalFensterToOpen()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.openZahlstelleSuchen());
    }

    private apply(action: ToolboxActionEnum): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        const id = this.voranmeldungKaeId.toString();
        switch (action) {
            case ToolboxActionEnum.PRINT:
                PrintHelper.print();
                break;
            case ToolboxActionEnum.HISTORY:
                this.facadeService.openModalFensterService.openHistoryModal(id, AvamCommonValueObjectsEnum.T_VORANMELDUNGKAE);
                break;
            case ToolboxActionEnum.COPY:
                this.facadeService.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_VORANMELDUNG_KAE, id);
                break;
            default:
                break;
        }
    }

    private setNextFreeEntscheidNr(): void {
        this.voranmeldungService.getNextFreeEntscheidNr().subscribe(nr => {
            this.nextFreeEntscheidNr = nr.data;
            this.voranmeldungErfassenForm.controls.entscheidnr.setValue(nr.data);
        });
    }

    private showNavigationTreeRoute(): void {
        if (!this.isBearbeiten) {
            this.facadeService.navigationService.showNavigationTreeRoute(VoranmeldungErfassenConstant.SIDE_NAV_ITEM_PATH_ERFASSEN);
        }
    }

    private fillForm(): void {
        this.route.queryParamMap.pipe(map(params => Number(params.get(VoranmeldungErfassenConstant.VORANMELDUNG_KAE_ID)))).subscribe(voranmeldungKaeId => {
            this.voranmeldungKaeId = voranmeldungKaeId;
            if (this.voranmeldungKaeId) {
                if (this.isBearbeiten) {
                    this.facadeService.navigationService.showNavigationTreeRoute(VoranmeldungErfassenConstant.SIDE_NAV_ITEM_PATH_BEARBEITEN, {
                        voranmeldungKaeId: this.voranmeldungKaeId
                    });
                }
                this.loadVoranmeldung(this.voranmeldungKaeId);
            }
        });
    }

    private loadVoranmeldung(voranmeldungKaeId: number): void {
        this.voranmeldungService
            .getVoranmeldungById(voranmeldungKaeId)
            .pipe(map((response: BaseResponseWrapperVoranmeldungKaeDTOWarningMessages) => response.data))
            .subscribe(dto => {
                this.mapDTOToForm(dto);
                this.configureBearbeitenToolbox();
            });
    }

    private fillStatusOptionsForEfassen(): void {
        this.filterStatusOptions([KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG, KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT, KurzarbeitStatusEnum.KAE_STATUS_PENDENT]);
    }

    private mapDTOToForm = (dto: VoranmeldungKaeDTO): void => {
        this.voranmeldungKaeDTO = dto;
        if (!this.isBearbeiten) {
            this.resetVoranmeldungToCopy();
        }
        this.fillStatusOptionsBasedOnVoranmeldung(dto);
        this.voranmeldungErfassenForm.setValue({
            kategorie: dto.kategorieId,
            voranmeldedatum: this.voranmeldungService.asDate(dto.voranmeldungDatum),
            betriebsabteilung: dto.betriebsabteilungId,
            alvanerkannt: this.getAlvAnerkanntValue(dto.betriebsabteilungId),
            personalbestand: dto.personalBestand,
            betroffene: dto.voraussichtlichBetroffene,
            dauerVon: dto.voraussichtlichKurzarbeitVon,
            dauerBis: dto.voraussichtlichKurzarbeitBis,
            arbeitsausfall: dto.voraussichtlichArbeitsausfall,
            entscheiddurch: dto.entscheiderDetailObject,
            freigabedurch: dto.unterzeichnerDetailObject,
            entscheidnr: dto.entscheidNr,
            alkControl: dto.zahlstelleObject,
            zahlstelleControl: dto.zahlstelleObject,
            begruendungkurzarbeit: dto.begruendungId,
            entscheidkurzarbeit: dto.entscheidKaeId,
            kurzarbeitVon: this.voranmeldungService.asDate(dto.kurzarbeitVon),
            kurzarbeitBis: this.voranmeldungService.asDate(dto.kurzarbeitBis),
            status: dto.statusId,
            mahnfristende: this.voranmeldungService.asDate(dto.mahnfristEndeDatum),
            freigabedatum: this.voranmeldungService.formatted(this.voranmeldungService.asDate(dto.entscheidDatum)),
            transferanalk: this.getMessageForTransferAlk(dto)
        });

        this.vorgaenger.id = dto.verweiserVorgaenger;
        this.nachfolger.id = dto.verweiserNachfolger;
        this.setVorgaengerNachfolger(dto.verweiserVorgaenger, this.vorgaenger);
        this.setVorgaengerNachfolger(dto.verweiserNachfolger, this.nachfolger);
        this.buttons = new VoranmeldungButtonUtil(dto, this.aktivStatusCodeId, this.unternehmenDetailsDTO.nachfolgerId).initButtons(this.actions);
        this.voranmeldungErfassenForm.markAsPristine();
        if (!this.isBearbeiten) {
            this.facadeService.notificationService.success(VoranmeldungErfassenConstant.DATEN_KOPIERT);
        }
    };

    private fillStatusOptionsBasedOnVoranmeldung(dto: VoranmeldungKaeDTO): void {
        switch (dto.statusObject.code) {
            case KurzarbeitStatusEnum.KAE_STATUS_MAHNUNG:
            case KurzarbeitStatusEnum.KAE_STATUS_PENDENT:
            case KurzarbeitStatusEnum.KAE_STATUS_FREIGABEBEREIT:
                this.filterStatusOptions(VoranmeldungErfassenComponent.AVAILABLE_STATUSES_IN_EDIT);
                break;

            case KurzarbeitStatusEnum.KAE_STATUS_INUEBERARBEITUNG:
                this.filterStatusOptions(VoranmeldungErfassenComponent.AVAILABLE_STATUSES_IN_INUEBERARBEITUNG);
                break;

            default:
                this.status.options = this.facadeService.formUtilsService.mapDropdownKurztext(this.allPossibleStatus);
        }
    }

    private filterStatusOptions(allowedStates: string[]): void {
        this.status.options = this.facadeService.formUtilsService
            .mapDropdownKurztext(this.allPossibleStatus)
            .filter((status: DropdownOption) => allowedStates.indexOf(status.code) !== -1);
    }

    private setVorgaengerNachfolger(id: number, target: ReferencedKaeSweObject): void {
        if (id && id > 0) {
            this.voranmeldungService
                .getVoranmeldungById(id)
                .pipe(map((response: BaseResponseWrapperVoranmeldungKaeDTOWarningMessages) => response.data))
                .subscribe(data => {
                    if (data) {
                        target.entscheidNr = data.entscheidNr;
                        target.statusCode = data.statusObject.code;
                    }
                });
        }
    }

    private getMessageForTransferAlk(dto: VoranmeldungKaeDTO): string {
        return this.voranmeldungService.getMessageForTransferAlk(dto, this.transferAlkCodes);
    }

    private initForm(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.voranmeldungErfassenForm = this.formBuilder.group(
            {
                kategorie: null,
                voranmeldedatum: [null, [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                betriebsabteilung: [null, [Validators.required]],
                alvanerkannt: null,
                personalbestand: [null, [NumberValidator.isPositiveIntegerWithMaxLength(10)]],
                betroffene: [null, [NumberValidator.isPositiveIntegerWithMaxLength(10)]],
                dauerVon: [null, [Validators.maxLength(50)]],
                dauerBis: [null, [Validators.maxLength(50)]],
                arbeitsausfall: [null, [NumberValidator.checkValueBetween1and100]],
                entscheiddurch: [null, [Validators.required]],
                freigabedurch: null,
                entscheidnr: null,
                alkControl: null,
                zahlstelleControl: null,
                begruendungkurzarbeit: null,
                entscheidkurzarbeit: null,
                kurzarbeitVon: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.dateRangeBiggerCenturyNgx]],
                kurzarbeitBis: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.dateRangeBiggerCenturyNgx]],
                status: [null, [Validators.required]],
                mahnfristende: null,
                freigabedatum: null,
                transferanalk: null
            },
            {
                validator: [DateValidator.rangeBetweenDates('kurzarbeitVon', 'kurzarbeitBis', 'val202', false, true)]
            }
        );
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
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.VORANMELDUNG_ERFASSEN) && !this.isBearbeiten) ||
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.VORANMELDUNG_BEARBEITEN) && this.isBearbeiten)
        ) {
            this.cancel();
        }
    }

    private initFormWithDefaults(): void {
        this.fillStatusOptionsForEfassen();
        this.entscheidDurch.appendCurrentUser();
        this.voranmeldungErfassenForm.controls.kategorie.setValue(
            this.facadeService.formUtilsService.getCodeIdByCode(this.kategorieOptions, VoranmeldungErfassenConstant.KATEGORIE_KURZARBEIT)
        );
        if (this.betriebsabteilungOptions.length > 0) {
            const defaultValue = this.betriebsabteilungOptions[0].codeId;
            this.voranmeldungErfassenForm.controls.betriebsabteilung.setValue(defaultValue);
            this.setAlvAnerkanntValue(this.voranmeldungErfassenForm.controls.alvanerkannt, defaultValue);
        }
        const pendent = this.facadeService.formUtilsService.getCodeIdByCode(this.allPossibleStatus, KurzarbeitStatusEnum.KAE_STATUS_PENDENT);
        this.voranmeldungErfassenForm.controls.status.setValue(pendent);
        this.setTransferAlkField();
        this.voranmeldungErfassenForm.controls.voranmeldedatum.setValue(new Date());
    }

    private setTransferAlkField(): void {
        this.voranmeldungErfassenForm.controls.transferanalk.setValue(this.getAlkDescription(KaeSweConstant.TRANSFER_ALK_DATEN_NICHTUEBERMITTELT));
    }

    private getAlkDescription(code: string): string {
        return this.voranmeldungService.getAlkDescription(code, this.transferAlkCodes);
    }

    private getTransferAnAlk(): boolean {
        return (
            this.facadeService.formUtilsService.getCodeIdByCode(this.transferAlkCodes, TransferanalkCodeEnum.DATEN_UEBERMITTELT_AM) ===
            this.voranmeldungErfassenForm.controls.transferanalk.value
        );
    }

    private onLangChange(): void {
        if (!this.isBearbeiten) {
            this.setTransferAlkField();
        } else {
            this.voranmeldungErfassenForm.controls.transferanalk.setValue(this.getMessageForTransferAlk(this.voranmeldungKaeDTO));
        }
    }

    private updateVoranmeldung(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.voranmeldungErfassenForm.valid) {
            this.call(VoranmeldungKaeAction.UPDATE, KaeSweConstant.DATEN_GESPEICHERT, { ...this.voranmeldungKaeDTO, ...this.mapFormToDTO() });
        } else {
            this.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage(VoranmeldungErfassenConstant.PFLICHTFELDER, 'danger');
        }
    }

    private zuruecksetzen(): void {
        this.mapDTOToForm(this.voranmeldungKaeDTO);
    }

    private kopieren(): void {
        this.hideNavigationTreeRoute();
        this.voranmeldungService.redirectToCopy(this.route, this.unternehmenId, this.voranmeldungKaeId);
    }

    private resetVoranmeldungToCopy(): void {
        const pendent: CodeDTO = this.allPossibleStatus.find(status => status.code === KurzarbeitStatusEnum.KAE_STATUS_PENDENT);
        this.voranmeldungKaeDTO.voranmeldungDatum = new Date();
        this.voranmeldungKaeDTO.voraussichtlichKurzarbeitVon = null;
        this.voranmeldungKaeDTO.voraussichtlichKurzarbeitBis = null;
        this.voranmeldungKaeDTO.entscheidKaeId = null;
        this.voranmeldungKaeDTO.kurzarbeitVon = null;
        this.voranmeldungKaeDTO.kurzarbeitBis = null;
        this.voranmeldungKaeDTO.statusId = pendent.codeId;
        this.voranmeldungKaeDTO.statusObject = pendent;
        this.voranmeldungKaeDTO.mahnfristEndeDatum = null;
        this.voranmeldungKaeDTO.entscheidDatum = null;
        this.voranmeldungKaeDTO.transferAsal = null;
        this.voranmeldungKaeDTO.unterzeichnerDetailObject = null;
        this.voranmeldungKaeDTO.entscheidNr = this.nextFreeEntscheidNr;
    }

    private loeschen(): void {
        this.genericConfirm(VoranmeldungErfassenConstant.DATENWIRKLICHLOESCHEN, VoranmeldungErfassenConstant.JA_LOESCHEN, VoranmeldungErfassenConstant.LOESCHENABBRECHEN, () => {
            this.facadeService.spinnerService.activate(this.channel);
            this.voranmeldungService.delete(this.voranmeldungKaeId).subscribe(
                () => {
                    this.facadeService.notificationService.success(KaeSweConstant.DATEN_GELOESCHT);
                    this.hideNavigationTreeRoute();
                    this.voranmeldungService.redirectToParent(this.route);
                    this.facadeService.spinnerService.deactivate(this.channel);
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
        });
    }

    private ersetzen(): void {
        this.genericConfirm(
            VoranmeldungErfassenConstant.VORANMELDUNGERSETZENBESTAETIGEN,
            VoranmeldungErfassenConstant.JA_ERSETZEN,
            VoranmeldungErfassenConstant.NICHT_ERSETZEN,
            () => this.checkBSP7(VoranmeldungKaeAction.ERSETZEN, VoranmeldungErfassenConstant.VORANMELDUNGERSETZT)
        );
    }

    private genericConfirm(promptLabel: string, primaryButton: string, secondaryButton: string, action: any): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        const modalRef = this.facadeService.openModalFensterService.openModal(GenericConfirmComponent);
        const instance: GenericConfirmComponent = modalRef.componentInstance;
        if (VoranmeldungErfassenConstant.DATENWIRKLICHLOESCHEN === promptLabel) {
            instance.titleLabel = 'i18n.common.delete';
        }
        instance.promptLabel = promptLabel;
        instance.primaryButton = primaryButton;
        instance.secondaryButton = secondaryButton;
        modalRef.result.then((result: any) => {
            if (result && action) {
                action();
            }
        });
    }

    private call(action: VoranmeldungKaeAction, successMsg: string, voranmeldungKaeDTO?: VoranmeldungKaeDTO): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.voranmeldungService
            .call(voranmeldungKaeDTO ? voranmeldungKaeDTO : this.voranmeldungKaeDTO, action)
            .pipe(
                map(response => response.data),
                filter(data => data !== null),
                finalize(() => this.facadeService.spinnerService.deactivate(this.channel))
            )
            .subscribe((data: VoranmeldungKaeDTO) => {
                this.hanldeResponse(action, data, successMsg);
            });
    }

    private hanldeResponse(action: VoranmeldungKaeAction, data: VoranmeldungKaeDTO, successMsg: string): void {
        this.facadeService.notificationService.success(successMsg);
        if (VoranmeldungKaeAction.ERSETZEN === action) {
            // ERSETZEN generates a new voranmeldungKaeId
            this.voranmeldungService.redirectToBearbeitenAfterCreate(this.route, data.voranmeldungKaeId);
        } else {
            this.mapDTOToForm(data);
        }
    }

    private checkBSP7(action: VoranmeldungKaeAction, successMsg: string) {
        if (VoranmeldungKaeAction.ERSETZEN === action && this.nachfolger.statusCode && KurzarbeitStatusEnum.KAE_STATUS_FREIGEGEBEN !== this.nachfolger.statusCode) {
            this.voranmeldungService.redirectToVoranmeldung(this.route, this.nachfolger.id);
        } else {
            this.call(action, successMsg);
        }
    }
}

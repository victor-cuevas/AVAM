import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormGroupDirective, ValidatorFn, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ActivatedRoute } from '@angular/router';
import { FacadeService } from '@shared/services/facade.service';
import { SweMeldungErfassenConstant } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/swe-meldung-erfassen/swe-meldung-erfassen.constant';
import { SweMeldungService } from '@modules/arbeitgeber/services/swe-meldung.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { filter, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { AvamPersonalberaterAutosuggestComponent } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { Permissions } from '@shared/enums/permissions.enum';
import { GenericConfirmComponent, ToolboxService } from '@app/shared';
import { MeldungSweDTO } from '@dtos/meldungSweDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { UnternehmenStatusCodeEnum } from '@shared/enums/domain-code/unternehmen-status-code.enum';
import { UnternehmenDetailsDTO } from '@dtos/unternehmenDetailsDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DateValidator } from '@shared/validators/date-validator';
import { SweStatusEnum } from '@shared/enums/domain-code/swe-status.enum';
import { TransferanalkCodeEnum } from '@shared/enums/domain-code/transferanalk-code.enum';
import { ArbeitsstelleSweDTO } from '@dtos/arbeitsstelleSweDTO';
import { BaseResponseWrapperMeldungSweDTOWarningMessages } from '@dtos/baseResponseWrapperMeldungSweDTOWarningMessages';
import { KaeSweConstant } from '@modules/arbeitgeber/shared/enums/kaeswe.enums';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxAction, ToolboxActionEnum } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { KaeSweErfassenAbstractComponent } from '@modules/arbeitgeber/shared/components/kae-swe-erfassen-abstract-component';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { getSweMeldungBearbeitenButtons, getSweMeldungErfassenButtons, SweMeldungActionButton } from './swe-meldung-erfassen.buttons';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { DmsMetadatenContext } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { ReferencedKaeSweObject } from '@modules/arbeitgeber/shared/services/kaeswe.service';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { VorlagenKategorie } from '@app/shared/enums/vorlagen-kategorie.enum';
import { SweMeldungArbeitsstellenTableComponent } from './swe-meldung-arbeitsstellen-table.component';
import { AvamLabelDropdownComponent } from '@app/library/wrappers/form/avam-label-dropdown/avam-label-dropdown.component';
import { PermissionContextService } from '@shared/services/permission.context.service';

@Component({
    selector: 'avam-swe-meldung-erfassen',
    templateUrl: './swe-meldung-erfassen.component.html',
    providers: [PermissionContextService]
})
export class SweMeldungErfassenComponent extends KaeSweErfassenAbstractComponent implements OnInit, AfterViewInit, OnDestroy, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('entscheidDurch') entscheidDurch: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('modalZahlstelleSuchen') modalZahlstelleSuchen: ElementRef;
    @ViewChild('arbeitsstellenTable') arbeitsstellenTable: SweMeldungArbeitsstellenTableComponent;
    @ViewChild('status') status: AvamLabelDropdownComponent;
    sweMeldungErfassenForm: FormGroup;
    entscheidSweOptions: DropdownOption[] = [];
    arbeitsstellenList: ArbeitsstelleSweDTO[];
    actionButtons: SweMeldungActionButton[] = [];
    loadedMeldung: MeldungSweDTO;
    isArbeitsstellenMandatory = false;
    sweMeldungId: number;
    readonly channel = SweMeldungErfassenConstant.CHANNEL;
    readonly tableChannel = SweMeldungErfassenConstant.TABLE_CHANNEL;
    private allPossibleStatus: DropdownOption[] = [];
    private alkSubscription: Subscription;
    private zahlstelleSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private sweMeldungService: SweMeldungService,
        private elementRef: ElementRef,
        private stesRestService: StesDataRestService,
        private permissionContextService: PermissionContextService,
        interactionService: StesComponentInteractionService,
        facadeService: FacadeService
    ) {
        super(facadeService, interactionService);
        ToolboxService.CHANNEL = this.channel;
        this.resetTableToDefault();
    }

    ngOnInit(): void {
        this.initForm();
        this.observeRoute();
        this.subscribeToData();
        this.facadeService.translateService.onLangChange.subscribe(() => this.onLangChange());
        this.setTokens();
        this.setSubscriptions();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.facadeService.toolboxService.resetConfiguration();
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.alkSubscription) {
            this.alkSubscription.unsubscribe();
        }
        if (this.zahlstelleSubscription) {
            this.zahlstelleSubscription.unsubscribe();
        }
    }

    canDeactivate(): boolean {
        return this.sweMeldungErfassenForm.dirty;
    }

    abbrechen(): void {
        this.onCancel(this.elementRef, () => this.sweMeldungService.redirectToParent(this.route));
    }

    zuruecksetzen(): void {
        if (this.canDeactivate()) {
            this.facadeService.resetDialogService.reset(() => {
                this.facadeService.fehlermeldungenService.closeMessage();
                if (!this.isBearbeiten) {
                    this.setFormDefaults();
                } else {
                    this.mapDTOToForm(this.loadedMeldung);
                }
            });
        }
    }

    save(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.sweMeldungErfassenForm.valid) {
            this.arbeitsstellenList = this.copyFromTable();
            // refresh the arbeitsstellenList from the one stored in the table object internally
            // this.arbeitsstellenList = this.arbeitsstellenTable.arbeitsstellenList;
            if (this.isBearbeiten) {
                this.updateMeldung();
            } else {
                this.createMeldung();
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.arbeitsstellenTable.ngForm.onSubmit(undefined);
            this.facadeService.fehlermeldungenService.showMessage(KaeSweConstant.PFLICHTFELDER, 'danger');
        }
    }

    private copyFromTable(): ArbeitsstelleSweDTO[] {
        const arbeitsstellen: ArbeitsstelleSweDTO[] = [];
        const rowsFormGroups = (this.sweMeldungErfassenForm.controls.arbeitsstellen as FormArray).controls;
        rowsFormGroups.forEach((row: FormGroup) => {
            const arbeitsstelle = this.getArbeitsstelleById(row.controls.arbeitsstelleSweId.value);
            arbeitsstelle.meldungSweId = this.sweMeldungId;
            arbeitsstelle.arbeitsstelleSweId = row.controls.arbeitsstelleSweId.value;
            arbeitsstelle.anmeldeDatum = row.controls.anmeldeDatum.value;
            arbeitsstelle.arbeitsstelle = row.controls.arbeitsstelle.value;
            arbeitsstelle.anzahlBetroffene = row.controls.anzahlBetroffene.value;
            arbeitsstelle.entscheidSweId = row.controls.entscheidSweId.value;
            arbeitsstellen.push(arbeitsstelle);
        });

        return arbeitsstellen;
    }

    private getArbeitsstelleById(id: number): ArbeitsstelleSweDTO {
        const stelle = this.arbeitsstellenList.find(s => s.arbeitsstelleSweId === id);
        return stelle ? stelle : {};
    }

    onAbteilungChange(event): void {
        this.setAlvAnerkanntValue(this.sweMeldungErfassenForm.controls.alvanerkannt, +event);
    }

    isReadOnly(): boolean {
        if (!this.loadedMeldung) {
            return false;
        }

        return this.anyOf(this.loadedMeldung.statusObject.code, SweStatusEnum.SWE_STATUS_FREIGABEBEREIT, SweStatusEnum.SWE_STATUS_FREIGEGEBEN, SweStatusEnum.SWE_STATUS_ERSETZT);
    }

    isFreigabeDurchReadOnly(): boolean {
        if (!this.loadedMeldung) {
            return false;
        }

        return this.anyOf(this.loadedMeldung.statusObject.code, SweStatusEnum.SWE_STATUS_FREIGEGEBEN, SweStatusEnum.SWE_STATUS_ERSETZT);
    }

    isMahnfristendeReadOnly(): boolean {
        const statusCode: string = this.asStatusCode(this.sweMeldungErfassenForm.controls.status.value);
        return !this.anyOf(statusCode, SweStatusEnum.SWE_STATUS_MAHNUNG);
    }

    onStatusChange(codeId: string): void {
        const statusCode: string = this.asStatusCode(codeId);

        this.setMandatory(statusCode === SweStatusEnum.SWE_STATUS_MAHNUNG, this.sweMeldungErfassenForm.controls.mahnfristende, [
            DateValidator.dateFormatNgx,
            DateValidator.dateValidNgx
        ]);
        if (statusCode !== SweStatusEnum.SWE_STATUS_MAHNUNG) {
            this.sweMeldungErfassenForm.controls.mahnfristende.setValue(null);
        }

        const isMandatory = this.isAlkZahlstelleMandatory(statusCode);
        this.setMandatory(isMandatory, this.sweMeldungErfassenForm.controls.alkControl);
        this.setMandatory(isMandatory, this.sweMeldungErfassenForm.controls.zahlstelleControl);
        this.isArbeitsstellenMandatory = statusCode === SweStatusEnum.SWE_STATUS_FREIGABEBEREIT;
    }

    openDeleteModal() {
        const modal = this.facadeService.openModalFensterService.openDeleteModal();
        modal.result.then(result => {
            if (result) {
                this.deleteMeldung();
            }
        });
        modal.componentInstance.titleLabel = 'i18n.common.delete';
        modal.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modal.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modal.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    copy() {
        this.hideNavigationTreeRoute();
        this.sweMeldungService.redirectToCopy(this.route, this.unternehmenId, this.sweMeldungId);
    }

    freigeben() {
        this.handleResponse(this.sweMeldungService.freigeben(this.mapFormToDto()), KaeSweConstant.ENTSCHEIDFREIGEGEBEN);
    }

    widerruf() {
        this.handleResponse(this.sweMeldungService.widerrufen(this.mapFormToDto()), SweMeldungErfassenConstant.MELDUNG_WIDERRUF);
    }

    ersetzen() {
        const modal = this.facadeService.openModalFensterService.openModal(GenericConfirmComponent);
        if (this.unternehmenDetailsDTO.statusObject.code === UnternehmenStatusCodeEnum.STATUS_AKTIV) {
            modal.componentInstance.promptLabel = 'kaeswe.message.meldungersetzenbestaetigen';
            modal.componentInstance.primaryButton = 'common.button.jaErsetzen';
            modal.componentInstance.secondaryButton = 'common.button.nichtErsetzen';
        } else {
            modal.componentInstance.promptLabel = 'kaeswe.message.entscheidbeiinaktivemunternehmen';
            modal.componentInstance.secondaryButton = 'common.button.neinAbbrechen';
            modal.componentInstance.primaryButton = 'common.button.JaEntscheidErfassen';
        }
        modal.result.then(result => {
            if (result) {
                this.doErsetzen();
            }
        });
    }

    ueberarbeiten() {
        this.handleResponse(this.sweMeldungService.ueberarbeiten(this.mapFormToDto()));
    }

    handleResponse(response: Observable<BaseResponseWrapperMeldungSweDTOWarningMessages>, successMessage?: string): void {
        this.facadeService.spinnerService.activate(this.channel);
        response.pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel))).subscribe((data: BaseResponseWrapperMeldungSweDTOWarningMessages) => {
            if (data.data) {
                if (successMessage !== undefined) {
                    this.facadeService.notificationService.success(successMessage);
                }
                this.loadedMeldung = data.data;
                this.mapDTOToForm(data.data);
                this.setupButtonsForBearbeiten(data.data.ownerId);
            }
        });
    }

    zuruecknehmen() {
        this.handleResponse(this.sweMeldungService.zuruecknehmen(this.mapFormToDto()), KaeSweConstant.DATEN_GESPEICHERT);
    }

    isSweMeldungUngueltig(): boolean {
        const ungueltigeEntscheidung = parseInt(
            this.facadeService.formUtilsService.getCodeIdByCode(this.entscheidSweOptions, SweMeldungErfassenConstant.ENTSCHEID_SWE_UNGUELTIG),
            10
        );
        if (!this.arbeitsstellenList || this.arbeitsstellenList.length === 0) {
            return true;
        }

        const arbeitstelleWithGueltigeEntscheidung = this.arbeitsstellenList.find(arbeitstelle => arbeitstelle.entscheidSweId !== ungueltigeEntscheidung);
        return arbeitstelleWithGueltigeEntscheidung === undefined;
    }

    handleCopy(): void {
        this.route.queryParamMap
            .pipe(
                map(params => params.get(SweMeldungErfassenConstant.SWE_MELDUNG_ID)),
                filter(sweMeldungId => sweMeldungId !== null),
                map(sweMeldungId => Number(sweMeldungId)),
                switchMap(sweMeldungId => this.sweMeldungService.getBySweMeldungId(sweMeldungId)),
                map((response: BaseResponseWrapperMeldungSweDTOWarningMessages) => response.data)
            )
            .subscribe(meldung => {
                this.mapDTOToForm(meldung);
                this.sweMeldungErfassenForm.controls.ausfallDatum.setValue(new Date());
                this.entscheidDurch.appendCurrentUser();
                this.sweMeldungErfassenForm.controls.status.setValue(this.getPendentCodeId());
                const description = this.getAlkDescription(KaeSweConstant.TRANSFER_ALK_DATEN_NICHTUEBERMITTELT);
                this.sweMeldungErfassenForm.controls.transferanalk.setValue(description);
                this.sweMeldungErfassenForm.updateValueAndValidity();
            });
    }

    resetToCopy(dto: MeldungSweDTO): MeldungSweDTO {
        dto.ausfallMonat = null;
        dto.ausfallJahr = null;
        // a new entscheidNr can already be loaded asynchronously,
        // if not yet then it will be assigned later on load
        dto.entscheidNr = this.sweMeldungErfassenForm.controls.entscheidnr.value;
        dto.entscheiderDetailId = null;
        dto.entscheiderDetailObject = null;
        dto.statusId = null;
        dto.statusObject = null;
        dto.unterzeichnerDetailId = null;
        dto.unterzeichnerDetailObject = null;
        dto.meldungSweId = null;
        dto.ojbVersion = null;
        dto.mahnfristEndeDatum = null;
        dto.entscheidDatum = null;
        return dto;
    }

    protected redirectToMeldung(): void {
        this.sweMeldungService.redirectToSweMeldung(this.route, this.loadedMeldung.verweiserVorgaenger);
    }

    protected hideNavigationTreeRoute(): void {
        if (this.isBearbeiten) {
            this.facadeService.navigationService.hideNavigationTreeRoute(SweMeldungErfassenConstant.SIDE_NAV_ITEM_PATH_BEARBEITEN);
            this.sweMeldungService.resetCloseBearbeitenSubscription();
        } else {
            this.facadeService.navigationService.hideNavigationTreeRoute(SweMeldungErfassenConstant.SIDE_NAV_ITEM_PATH_ERFASSEN);
            this.sweMeldungService.resetCloseErfassenSubscription();
        }
    }

    protected onChanges(): void {
        this.alkSubscription = this.observeAlk(this.sweMeldungErfassenForm);
        this.zahlstelleSubscription = this.observeZahlstelle(this.sweMeldungErfassenForm);
    }

    protected isStatusFreigabebereit(): boolean {
        return this.getStatusCode(this.sweMeldungErfassenForm.get('status').value) === SweStatusEnum.SWE_STATUS_FREIGABEBEREIT;
    }

    protected setMandatoryAlkZahlstelleByStatusOnChanges(isFreigabebereit: boolean, alk, zahlstelle): void {
        const isMandatory = isFreigabebereit && !alk && !zahlstelle;
        this.setMandatory(isMandatory, this.sweMeldungErfassenForm.controls.alkControl);
        this.setMandatory(isMandatory, this.sweMeldungErfassenForm.controls.zahlstelleControl);
    }

    private getStatusCode(codeId: string): string | undefined {
        return codeId ? this.facadeService.formUtilsService.getCodeByCodeId(this.allPossibleStatus, codeId) : undefined;
    }

    private isAlkZahlstelleMandatory(statusCode: string): boolean {
        return (
            statusCode === SweStatusEnum.SWE_STATUS_FREIGABEBEREIT &&
            !this.sweMeldungErfassenForm.controls.alkControl.value &&
            !this.sweMeldungErfassenForm.controls.zahlstelleControl.value
        );
    }

    private doErsetzen(): void {
        if (this.nachfolger.statusCode && SweStatusEnum.SWE_STATUS_FREIGEGEBEN !== this.nachfolger.statusCode) {
            this.sweMeldungService.redirectToSweMeldung(this.route, this.nachfolger.id);
        } else {
            this.callErsezten();
        }
    }

    private callErsezten(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.sweMeldungService.ersetzen(this.loadedMeldung).subscribe(
            (value: BaseResponseWrapperMeldungSweDTOWarningMessages) => {
                this.facadeService.spinnerService.deactivate(this.channel);
                if (value.data) {
                    this.facadeService.notificationService.success(SweMeldungErfassenConstant.MELDUNG_ERSETZT);
                    this.sweMeldungService.redirectToBearbeitenAfterCreate(this.route, value.data.meldungSweId);
                }
            },
            () => this.facadeService.spinnerService.deactivate(this.channel)
        );
    }

    private anyOf(status: string, ...inStatuses: SweStatusEnum[]): boolean {
        return inStatuses.indexOf(status as SweStatusEnum) !== -1;
    }

    private deleteMeldung() {
        this.facadeService.spinnerService.activate(this.channel);
        this.sweMeldungService
            .deleteMeldung(this.loadedMeldung.meldungSweId)
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(this.channel)))
            .subscribe(() => {
                this.facadeService.notificationService.success('common.message.datengeloescht');
                this.sweMeldungErfassenForm.reset();
                this.sweMeldungService.redirectToParent(this.route);
                this.hideNavigationTreeRoute();
            });
    }

    private openZahlstelleSuchen(): void {
        this.facadeService.openModalFensterService.openXLModal(this.modalZahlstelleSuchen);
    }

    private setSubscriptions() {
        this.facadeService.openModalFensterService
            .getModalFensterToOpen()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => this.openZahlstelleSuchen());
    }

    private setMandatory(mandatory: boolean, control: AbstractControl, defaultValidators: ValidatorFn[] = []) {
        if (mandatory) {
            this.marksAsMandatoryField(control, defaultValidators);
        } else {
            control.setValidators(defaultValidators);
        }
        control.updateValueAndValidity();
    }

    private marksAsMandatoryField(control: AbstractControl, defaultValidators: ValidatorFn[]): void {
        if (defaultValidators) {
            control.setValidators([...defaultValidators, Validators.required]);
        } else {
            control.setValidators([Validators.required]);
        }
    }

    private asStatusCode(codeId: string): string {
        const codes: DropdownOption[] = this.allPossibleStatus.filter(option => option.codeId === parseInt(codeId, 10));
        if (codes === undefined || codes.length === 0) {
            return '';
        }
        return codes[0].code;
    }

    private initForm(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.sweMeldungErfassenForm = this.formBuilder.group(
            {
                ausfallDatum: [null, [Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
                betriebsabteilung: [null, [Validators.required]],
                alvanerkannt: null,
                entscheiddurch: [null, [Validators.required]],
                freigabedurch: null,
                entscheidnr: null,
                alkControl: null,
                zahlstelleControl: null,
                status: [null, [Validators.required]],
                mahnfristende: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
                freigabedatum: null,
                transferanalk: null
            },
            {}
        );
    }

    private createMeldung(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.sweMeldungService
            .createMeldungSwe(this.mapFormToDto())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (value: BaseResponseWrapperLongWarningMessages) => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (value.data) {
                        this.facadeService.notificationService.success(KaeSweConstant.DATEN_GESPEICHERT);
                        this.facadeService.navigationService.hideNavigationTreeRoute(SweMeldungErfassenConstant.SIDE_NAV_ITEM_PATH_ERFASSEN);
                        this.sweMeldungService.resetCloseErfassenSubscription();
                        this.sweMeldungErfassenForm.reset();
                        this.sweMeldungService.redirectToBearbeitenAfterCreate(this.route, value.data);
                    }
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    private updateMeldung(): void {
        this.facadeService.spinnerService.activate(this.channel);
        this.sweMeldungService
            .updateMeldungSwe({ ...this.loadedMeldung, ...this.mapFormToDto() })
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (value: BaseResponseWrapperMeldungSweDTOWarningMessages) => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (value.data) {
                        this.facadeService.notificationService.success(KaeSweConstant.DATEN_GESPEICHERT);
                        this.addDefaultRowIfArbeitsstelleIsEmpty(value.data);
                        this.loadedMeldung = value.data;
                        this.mapDTOToForm(this.loadedMeldung);
                        this.setupButtonsForBearbeiten(value.data.ownerId);
                    }
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    private mapFormToDto(): MeldungSweDTO {
        return {
            ausfallMonat: (this.sweMeldungErfassenForm.value.ausfallDatum as Date).getMonth() + 1,
            ausfallJahr: (this.sweMeldungErfassenForm.value.ausfallDatum as Date).getFullYear(),
            betriebsabteilungId: +this.sweMeldungErfassenForm.controls.betriebsabteilung.value,
            betriebsabteilungObject: this.betriebsabteilungDTOs.find(a => a.betriebsabteilungId === +this.sweMeldungErfassenForm.controls.betriebsabteilung.value),
            entscheiderDetailId: this.asNumber(this.sweMeldungErfassenForm.controls.entscheiddurch['benutzerObject'].benutzerDetailId),
            entscheiderDetailObject: this.getBenutzer(this.sweMeldungErfassenForm.controls.entscheiddurch['benutzerObject']),
            unterzeichnerDetailId: this.asNumber(this.sweMeldungErfassenForm.controls.freigabedurch['benutzerObject'].benutzerDetailId),
            unterzeichnerDetailObject: this.getBenutzer(this.sweMeldungErfassenForm.controls.freigabedurch['benutzerObject']),
            entscheidNr: +this.sweMeldungErfassenForm.controls.entscheidnr.value,
            zahlstelleId: this.getALKZahlstelleId(this.sweMeldungErfassenForm.controls),
            zahlstelleObject: this.getALKZahlstelleDto(this.sweMeldungErfassenForm.controls),
            statusId: +this.sweMeldungErfassenForm.controls.status.value,
            statusObject: this.allPossibleStatus.find(a => a.codeId === +this.sweMeldungErfassenForm.controls.status.value, null),
            mahnfristEndeDatum: this.sweMeldungErfassenForm.controls.mahnfristende.value,
            transferAsal: this.getTransferAnAlk(),
            arbeitsstelleList: this.arbeitsstellenList,
            benutzerstelleId: this.asNumber(this.sweMeldungErfassenForm.controls.entscheiddurch['benutzerObject'].benutzerstelleId),
            meldungSweId: this.sweMeldungId,
            ojbVersion: this.loadedMeldung ? this.loadedMeldung.ojbVersion : 0,
            ownerId: this.loadedMeldung ? this.loadedMeldung.ownerId : 0
        };
    }

    private asNumber(id: any): null | number {
        return id === -1 ? null : +id;
    }

    private getBenutzer(benutzerObject: any): any {
        return benutzerObject.benutzerLogin ? benutzerObject : null;
    }

    private getTransferAnAlk(): boolean {
        return (
            this.facadeService.formUtilsService.getCodeIdByCode(this.transferAlkCodes, TransferanalkCodeEnum.DATEN_UEBERMITTELT_AM) ===
            this.sweMeldungErfassenForm.controls.transferanalk.value
        );
    }

    private setTokens(): void {
        const currentUser = this.facadeService.authenticationService.getLoggedUser();
        this.entscheiddurchSuchenTokens = {
            berechtigung: Permissions.ARBEITGEBER_SWE_MELDUNG_BEARBEITEN,
            benutzerstelleId: `${currentUser.benutzerstelleId}`,
            myBenutzerstelleId: `${currentUser.benutzerstelleId}`
        };

        this.freigabedurchSuchenTokens = {
            berechtigung: Permissions.ARBEITGEBER_SWE_MELDUNG_FREIGEBEN,
            benutzerstelleId: `${currentUser.benutzerstelleId}`,
            myBenutzerstelleId: `${currentUser.benutzerstelleId}`
        };
    }

    private observeRoute(): void {
        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params[KaeSweConstant.UNTERNEHMEN_ID];
            this.sweMeldungService.getUnternehmen(this.unternehmenId).subscribe((unternehmenDetailsDTO: UnternehmenDetailsDTO) => {
                this.unternehmenDetailsDTO = unternehmenDetailsDTO;
            });

            this.route.data.subscribe(data => {
                this.isBearbeiten = data.formNumber === StesFormNumberEnum.SWE_MELDUNG_BEARBEITEN;
                this.facadeService.spinnerService.activate(this.channel);
                forkJoin([
                    this.stesRestService.getCode(DomainEnum.SCHLECHTWETTER_STATUS),
                    this.stesRestService.getCode(DomainEnum.TRANSFER_ALK),
                    this.sweMeldungService.getBetriebsAbteilungen(this.unternehmenId),
                    this.sweMeldungService.getCodeBy(DomainEnum.UNTERNEHMEN_STATUS, UnternehmenStatusCodeEnum.STATUS_AKTIV),
                    this.stesRestService.getCode(DomainEnum.SCHLECHTWETTER_ENTSCHEID)
                ]).subscribe(
                    ([status, transferAlk, abteilungen, aktivCode, entscheidSwe]) => {
                        this.allPossibleStatus = this.facadeService.formUtilsService.mapDropdownKurztext(status);
                        this.transferAlkCodes = transferAlk;
                        this.aktivStatusCodeId = aktivCode.codeId;
                        this.entscheidSweOptions = this.facadeService.formUtilsService.mapDropdownKurztext(entscheidSwe);
                        if (abteilungen.data) {
                            this.betriebsabteilungDTOs = abteilungen.data;
                            this.betriebsabteilungOptions = abteilungen.data.map(this.sweMeldungService.abteilungenMapper);
                        }
                        if (this.isBearbeiten) {
                            this.sweMeldungService.resetCloseBearbeitenSubscription();
                            this.sweMeldungService.closeBearbeitenNavItemSubscription = this.subscribeOnCloseNavItem();
                            this.fillBearbeitenForm();
                            this.configureBearbeitenToolbox();
                        } else {
                            this.actionButtons = getSweMeldungErfassenButtons(this, this.facadeService.authenticationService);
                            this.sweMeldungService.resetCloseErfassenSubscription();
                            this.sweMeldungService.closeErfassenNavItemSubscription = this.subscribeOnCloseNavItem();
                            this.configureErfassenToolbox();
                            this.filterStatusOptionsForErfassen();
                            this.fillFormWithDefaults();
                            this.handleCopy();
                        }
                        this.facadeService.spinnerService.deactivate(this.channel);
                    },
                    () => this.facadeService.spinnerService.deactivate(this.channel)
                );
            });
        });
    }

    private fillBearbeitenForm(): void {
        this.route.queryParamMap.pipe(map(params => Number(params.get(SweMeldungErfassenConstant.SWE_MELDUNG_ID)))).subscribe(meldungId => {
            this.sweMeldungId = meldungId;
            if (this.sweMeldungId) {
                this.showNavigationTreeRoute();
                this.loadSweMeldung();
            }
        });
    }

    private setBearbeitenTitle(): void {
        this.sweMeldungService.updateTitle({ subtitle: this.getBearbeitenTitle() });
    }

    private getBearbeitenTitle(): string {
        return `${this.facadeService.translateService.instant(SweMeldungErfassenConstant.BEARBEITEN_TITLE)} - ${this.loadedMeldung.entscheidNr}`;
    }

    private getErfassenTitle(): string {
        return `${this.facadeService.translateService.instant(SweMeldungErfassenConstant.ERSTELLEN_TITLE)} - ${this.sweMeldungErfassenForm.controls.entscheidnr.value}`;
    }

    private onLangChange(): void {
        if (!this.isBearbeiten) {
            this.setAlkField();
            this.sweMeldungService.updateTitle({ subtitle: this.getErfassenTitle() });
        } else {
            this.sweMeldungErfassenForm.controls.transferanalk.setValue(this.getMessageForTransferAlk(this.loadedMeldung));
            this.setBearbeitenTitle();
        }
    }

    private setFormDefaults(): void {
        const nr = this.sweMeldungErfassenForm.controls.entscheidnr.value;
        this.sweMeldungErfassenForm.reset();
        this.sweMeldungErfassenForm.controls.ausfallDatum.setValue(new Date());

        const option = this.betriebsabteilungOptions[0];
        this.sweMeldungErfassenForm.controls.betriebsabteilung.setValue(option.codeId);
        const abteilung = this.betriebsabteilungDTOs.find(a => a.betriebsabteilungId === option.codeId);
        if (abteilung) {
            this.sweMeldungErfassenForm.controls.alvanerkannt.setValue(abteilung.alvAnerkannt);
        }

        this.entscheidDurch.appendCurrentUser();

        if (nr) {
            this.sweMeldungErfassenForm.controls.entscheidnr.setValue(nr);
        } else {
            this.sweMeldungService.getNextFreeEntscheidNr().subscribe(response => {
                this.sweMeldungErfassenForm.controls.entscheidnr.setValue(response.data);
                this.sweMeldungService.updateTitle({ subtitle: this.getErfassenTitle() });
            });
        }

        this.sweMeldungErfassenForm.controls.status.setValue(this.getPendentCodeId());

        this.setAlkField();

        this.resetTableToDefault();
        this.getAndFillZahlstelle();

        this.sweMeldungErfassenForm.updateValueAndValidity();
    }

    private setAlkField() {
        const description = this.getAlkDescription(KaeSweConstant.TRANSFER_ALK_DATEN_NICHTUEBERMITTELT);
        this.sweMeldungErfassenForm.controls.transferanalk.setValue(description);
    }

    private resetTableToDefault(): void {
        this.arbeitsstellenList = [
            {
                anmeldeDatum: new Date(),
                arbeitsstelle: null,
                anzahlBetroffene: null,
                entscheidSweObject: null
            }
        ];
    }

    private getAndFillZahlstelle(): void {
        const ausfallDatum = this.sweMeldungErfassenForm.controls.ausfallDatum.value as Date;
        const betriebsabteilungId = parseInt(this.sweMeldungErfassenForm.controls.betriebsabteilung.value, 10);
        this.sweMeldungService.getInitialZahlstelle(betriebsabteilungId, ausfallDatum).subscribe(zahlstelleReturn => {
            if (!zahlstelleReturn.data) {
                return;
            }
            this.sweMeldungErfassenForm.controls.alkControl.setValue(zahlstelleReturn.data);
            this.sweMeldungErfassenForm.controls.zahlstelleControl.setValue(zahlstelleReturn.data);
        });
    }

    private getAlkDescription(code: string): string {
        return this.facadeService.dbTranslateService.translate(this.transferAlkCodes.find(c => c.code === code), 'text');
    }

    private fillFormWithDefaults(): void {
        this.setFormDefaults();
        this.showNavigationTreeRoute();
    }

    private filterStatusOptionsForBearbeiten(): void {
        const statusCode: SweStatusEnum = this.asStatusCode(this.sweMeldungErfassenForm.controls.status.value) as SweStatusEnum;
        if (SweStatusEnum.SWE_STATUS_PENDENT === statusCode || SweStatusEnum.SWE_STATUS_MAHNUNG === statusCode) {
            this.filterStatusOptions([SweStatusEnum.SWE_STATUS_MAHNUNG, SweStatusEnum.SWE_STATUS_FREIGABEBEREIT, SweStatusEnum.SWE_STATUS_PENDENT]);
        } else if (SweStatusEnum.SWE_STATUS_FREIGABEBEREIT === statusCode) {
            this.filterStatusOptions([SweStatusEnum.SWE_STATUS_FREIGABEBEREIT]);
        } else if (SweStatusEnum.SWE_STATUS_INUEBERARBEITUNG === statusCode) {
            this.filterStatusOptions([SweStatusEnum.SWE_STATUS_PENDENT, SweStatusEnum.SWE_STATUS_INUEBERARBEITUNG, SweStatusEnum.SWE_STATUS_FREIGABEBEREIT]);
        } else if (SweStatusEnum.SWE_STATUS_FREIGEGEBEN === statusCode) {
            this.filterStatusOptions([SweStatusEnum.SWE_STATUS_FREIGEGEBEN]);
        } else if (SweStatusEnum.SWE_STATUS_ERSETZT === statusCode) {
            this.filterStatusOptions([SweStatusEnum.SWE_STATUS_ERSETZT]);
        } else {
            this.status.options = this.allPossibleStatus;
        }
    }

    private filterStatusOptionsForErfassen(): void {
        this.filterStatusOptions([SweStatusEnum.SWE_STATUS_MAHNUNG, SweStatusEnum.SWE_STATUS_FREIGABEBEREIT, SweStatusEnum.SWE_STATUS_PENDENT]);
        this.sweMeldungErfassenForm.controls.status.setValue(this.getPendentCodeId());
    }

    private getPendentCodeId(): number {
        return this.allPossibleStatus.filter((s: DropdownOption) => s.code === SweStatusEnum.SWE_STATUS_PENDENT)[0].codeId;
    }

    private filterStatusOptions(allowedStates: string[]): void {
        this.status.options = this.allPossibleStatus.filter((status: DropdownOption) => {
            return allowedStates.some(s => status.code === s);
        });
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
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.MELDUNG_ERFASSEN) && !this.isBearbeiten) ||
            (message.data.label === this.facadeService.translateService.instant(UnternehmenSideNavLabels.MELDUNG_BEARBEITEN) && this.isBearbeiten)
        ) {
            this.abbrechen();
        }
    }

    private showNavigationTreeRoute(): void {
        if (!this.isBearbeiten) {
            this.facadeService.navigationService.showNavigationTreeRoute(SweMeldungErfassenConstant.SIDE_NAV_ITEM_PATH_ERFASSEN);
        } else if (this.sweMeldungId) {
            this.facadeService.navigationService.showNavigationTreeRoute(SweMeldungErfassenConstant.SIDE_NAV_ITEM_PATH_BEARBEITEN, {
                sweMeldungId: this.sweMeldungId
            });
        }
    }

    private configureErfassenToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getSweMeldungErfassenConfig(), this.channel);
    }

    private configureBearbeitenToolbox(): void {
        const toolboxData: DokumentVorlageToolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.MELDUNGSWE,
            vorlagenKategorien: [VorlagenKategorie.MELDUNG_SWE],
            entityIDsMapping: { MELDUNG_SWE_ID: this.sweMeldungId, GF_ID: this.sweMeldungId }
        };
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getSweMeldungBearbeitenConfig(), this.channel, toolboxData);
    }

    private subscribeToData(): void {
        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter((action: ToolboxAction) => this.isPrintAction(action) || this.isHistoryAction(action) || this.isCopyAction(action)))
            .pipe(map((action: ToolboxAction) => action.message.action))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: ToolboxActionEnum) => this.apply(action));
    }

    private apply(action: ToolboxActionEnum): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        const id = this.sweMeldungId ? this.sweMeldungId.toString() : null;
        switch (action) {
            case ToolboxActionEnum.PRINT:
                PrintHelper.print();
                break;
            case ToolboxActionEnum.HISTORY:
                this.facadeService.openModalFensterService.openHistoryModal(id, AvamCommonValueObjectsEnum.T_MELDUNGSWE);
                break;
            case ToolboxActionEnum.COPY:
                this.facadeService.openModalFensterService.openDmsCopyModal(DmsMetadatenContext.DMS_CONTEXT_SWEMELDUNG_BEARBEITEN, id);
                break;
            default:
                break;
        }
    }

    private loadSweMeldung() {
        this.facadeService.spinnerService.activate(this.channel);
        this.sweMeldungService
            .getBySweMeldungId(this.sweMeldungId)
            .pipe(map((response: BaseResponseWrapperMeldungSweDTOWarningMessages) => response.data))
            .subscribe(
                (dto: MeldungSweDTO) => {
                    this.addDefaultRowIfArbeitsstelleIsEmpty(dto);
                    this.loadedMeldung = dto;
                    this.mapDTOToForm(dto);
                    this.setBearbeitenTitle();
                    this.setupButtonsForBearbeiten(dto.ownerId);
                    this.facadeService.spinnerService.deactivate(this.channel);
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    private addDefaultRowIfArbeitsstelleIsEmpty(dto: MeldungSweDTO) {
        if (dto.arbeitsstelleList.length === 0) {
            dto.arbeitsstelleList.push({ anmeldeDatum: new Date() });
        }
    }

    private mapDTOToForm(dto: MeldungSweDTO) {
        if (!this.isBearbeiten) {
            this.facadeService.notificationService.success('kaeswe.feedback.meldungswekopiert');
            dto = this.resetToCopy(dto);
        }
        const form = {
            ausfallDatum: dto.ausfallJahr && dto.ausfallMonat ? new Date(dto.ausfallJahr, dto.ausfallMonat - 1) : null,
            betriebsabteilung: dto.betriebsabteilungId,
            alvanerkannt: this.getAlvAnerkanntValue(dto.betriebsabteilungId),
            entscheiddurch: dto.entscheiderDetailObject,
            freigabedurch: dto.unterzeichnerDetailObject,
            entscheidnr: dto.entscheidNr,
            status: dto.statusId,
            alkControl: dto.zahlstelleObject,
            zahlstelleControl: dto.zahlstelleObject,
            mahnfristende: dto.mahnfristEndeDatum ? new Date(dto.mahnfristEndeDatum) : null,
            freigabedatum: this.sweMeldungService.formatted(dto.entscheidDatum ? new Date(dto.entscheidDatum) : null),
            transferanalk: this.getMessageForTransferAlk(dto),
            arbeitsstellen: this.correctArbeitsstelleList(dto.arbeitsstelleList)
        };
        this.sweMeldungErfassenForm.reset(form);

        this.arbeitsstellenList = this.correctArbeitsstelleList(dto.arbeitsstelleList);
        this.vorgaenger.id = dto.verweiserVorgaenger;
        this.nachfolger.id = dto.verweiserNachfolger;
        this.setVorgaengerNachfolger(dto.verweiserVorgaenger, this.vorgaenger);
        this.setVorgaengerNachfolger(dto.verweiserNachfolger, this.nachfolger);
        this.filterStatusOptionsForBearbeiten();
    }

    private setVorgaengerNachfolger(id: number, target: ReferencedKaeSweObject): void {
        if (id && id > 0) {
            this.sweMeldungService
                .getBySweMeldungId(id)
                .pipe(map(response => response.data))
                .subscribe(data => {
                    if (data) {
                        target.entscheidNr = data.entscheidNr;
                        target.statusCode = data.statusObject.code;
                    }
                });
        }
    }

    private setupButtonsForBearbeiten(ownerId: number): void {
        const statusCode: SweStatusEnum = this.asStatusCode(this.sweMeldungErfassenForm.controls.status.value) as SweStatusEnum;

        this.permissionContextService.permissionSubject.subscribe((contextPermissions: string[]) => {
            this.actionButtons = getSweMeldungBearbeitenButtons(this, statusCode, this.facadeService.authenticationService, contextPermissions);
        });
        this.permissionContextService.getContextPermissions(ownerId);
    }

    private getMessageForTransferAlk(dto: MeldungSweDTO): string {
        return this.sweMeldungService.getMessageForTransferAlk(dto, this.transferAlkCodes);
    }

    private correctArbeitsstelleList(arbeitsstelleList: ArbeitsstelleSweDTO[]) {
        if (!arbeitsstelleList.length) {
            this.resetTableToDefault();
            return [];
        }

        return arbeitsstelleList.map(arbeitsstelle => ({
            ...arbeitsstelle,
            anmeldeDatum: new Date(arbeitsstelle.anmeldeDatum)
        }));
    }
}

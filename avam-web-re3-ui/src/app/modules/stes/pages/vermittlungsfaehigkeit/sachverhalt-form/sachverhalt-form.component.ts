import { Permissions } from '@shared/enums/permissions.enum';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DateValidator } from '@shared/validators/date-validator';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { CodeDTO } from '@dtos/codeDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageBus } from '@shared/services/message-bus';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { ToolboxService } from '@shared/services/toolbox.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { StatusCodeService } from '@stes/pages/vermittlungsfaehigkeit/status-code.service';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { SachverhaltStatusCodeEnum as StatusCode } from '@shared/enums/domain-code/sachverhaltstatus-code.enum';
import { VermittlungsfaehigkeitDTO } from '@dtos/vermittlungsfaehigkeitDTO';
import { StesVermittlungsfaehigkeits } from '@shared/enums/stes-navigation-paths.enum';
import { NavigationService } from '@shared/services/navigation-service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-sachverhalt-form',
    templateUrl: './sachverhalt-form.component.html',
    styleUrls: ['./sachverhalt-form.component.scss'],
    providers: [ObliqueHelperService]
})
export class SachverhaltFormComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy {
    @Input() set sachverhalt(sachverhalt: VermittlungsfaehigkeitDTO) {
        this.mapToForm(sachverhalt);
        this.status = !!this.statusBackup ? this.updateStatusOptions(sachverhalt) : [];
        this.savedSachverhalt = sachverhalt;
        this.benutzerstellenId = sachverhalt.benutzerStelle.benutzerstelleId;
        this.getCurrentUserAndTokens();
    }
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @Input() stesId: string;
    @Input() isDisabled: boolean;
    @Input() isBearbeiten: boolean;
    @Input() sachverhaltId;
    @Output() isUpdated: EventEmitter<VermittlungsfaehigkeitDTO> = new EventEmitter<VermittlungsfaehigkeitDTO>();

    savedSachverhalt: VermittlungsfaehigkeitDTO;

    disableMeldedatum = true;
    disableGrund = true;
    disableUeberpruefung = true;
    disableBenutzerstellenId = true;
    disableBearbeitung = true;

    sachverhaltForm: FormGroup;
    fallbearbeitungForm: FormGroup;
    sachverhaltFormChannel = 'sachverhaltChannel';
    statusBackup: CodeDTO[] = [];
    status: any[] = [];
    benutzerSuchenTokensbearbeitung: {};
    benutzerSuchenTokensfreigabeDurch: {};
    benutzerstelleSuchenTokens: any = {};
    benutzerCode: any;
    benutzerstellenId: any;
    observeTranslateServiceSub: Subscription;

    bearbeitung: any = null;
    freigabedurch: any = null;

    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    constructor(
        private navigationService: NavigationService,
        private formBuilder: FormBuilder,
        private obliqueHelperService: ObliqueHelperService,
        fehlermeldungenService: FehlermeldungenService,
        modalService: NgbModal,
        messageBus: MessageBus,
        toolboxService: ToolboxService,
        spinnerService: SpinnerService,
        private statusCodeService: StatusCodeService,
        private dataService: StesDataRestService,
        private authenticationService: AuthenticationService,
        private translateService: TranslateService,
        private resetDialogService: ResetDialogService,
        private facade: FacadeService,
        private router: Router,
        private readonly notificationService: NotificationService
    ) {
        super('sachverhaltForm', modalService, spinnerService, messageBus, toolboxService, fehlermeldungenService);
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.defineFormGroups();
        this.getData();
        this.getCurrentUserAndTokens();
        this.changeLanguage();
    }

    public ngAfterViewInit(): void {
        // Validity update is a temporary solution for
        // a known problem with these core components
        const grund = this.sachverhaltForm.controls['grund'];
        grund.updateValueAndValidity();
        const benutzerstellenId = this.fallbearbeitungForm.controls['benutzerstellenId'];
        benutzerstellenId.updateValueAndValidity();
        const bearbeitung = this.fallbearbeitungForm.controls['bearbeitung'];
        bearbeitung.updateValueAndValidity();
    }
    statusChanged(codeId: any) {
        if (codeId !== null) {
            const freigabeBereit = this.statusBackup.find(item => item.codeId === +codeId);
            if (freigabeBereit && freigabeBereit.code === StatusCode.STATUS_FREIGABEBEREIT) {
                this.fallbearbeitungForm.controls.freigabeDurch.setValidators([Validators.required]);
            } else {
                this.fallbearbeitungForm.controls.freigabeDurch.clearValidators();
            }
            this.fallbearbeitungForm.controls.freigabeDurch.updateValueAndValidity();
        }
    }
    getCurrentUserAndTokens(): void {
        const currentUser = this.authenticationService.getLoggedUser();
        const benutzerstelleId = this.savedSachverhalt ? this.savedSachverhalt.ownerId : currentUser.benutzerstelleId;

        if (currentUser) {
            this.benutzerSuchenTokensbearbeitung = {
                berechtigung: Permissions.STES_SANKTION_VMF_BEARBEITEN,
                benutzerstelleId,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES
            };
            this.benutzerSuchenTokensfreigabeDurch = {
                berechtigung: Permissions.STES_VMF_ENTSCHEID_FREIGEBEN_UEBERARBEITEN,
                benutzerstelleId,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES
            };
            this.benutzerstelleSuchenTokens = {
                benutzerstelleId,
                vollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    defineFormGroups() {
        this.sachverhaltForm = this.formBuilder.group({
            meldeDatum: [new Date(), [DateValidator.dateFormatNgx, Validators.required, DateValidator.dateValidNgx]],
            grund: [null, [Validators.required]],
            ueberpruefung: [true],
            statusCode: [null],
            entscheidNr: [null],
            entscheidDatum: [null],
            alkTransferDate: [this.setInitialValueAlkTransferDate()],
            ersetztEntscheidNr: [null],
            vorEntscheidObject: null,
            nachEntscheidObject: null
        });

        this.fallbearbeitungForm = this.formBuilder.group({
            benutzerstellenId: [null, Validators.required],
            bearbeitung: [null, Validators.required],
            freigabeDurch: null
        });

        this.fallbearbeitungForm.controls['benutzerstellenId'].valueChanges.pipe(distinctUntilChanged()).subscribe((value: { code: string }) => {
            const bearbeitung = this.fallbearbeitungForm.controls['bearbeitung'];
            if (!!value && !!value.code) {
                bearbeitung.clearValidators();
            } else {
                bearbeitung.setValidators([Validators.required]);
            }
            bearbeitung.updateValueAndValidity();
        });

        this.fallbearbeitungForm.controls['bearbeitung'].valueChanges.pipe(distinctUntilChanged()).subscribe((value: { benutzerLogin: string }) => {
            const benutzerstellenId = this.fallbearbeitungForm.controls['benutzerstellenId'];
            if (!!value && !!value.benutzerLogin) {
                benutzerstellenId.clearValidators();
            } else {
                benutzerstellenId.setValidators([Validators.required]);
            }
            benutzerstellenId.updateValueAndValidity();
        });
    }

    setInitialValueAlkTransferDate(alkTransferDate?: Date): string | undefined {
        const translateService = this.translateService.translations[this.translateService.currentLang];
        let alkTransferValue = '';
        if (!!translateService) {
            if (!alkTransferDate) {
                alkTransferValue = translateService.stes.message.alkTrasferKeineDate;
            } else {
                const alkTransferDatenFormated: string = this.facade.formUtilsService.formatDateNgx(alkTransferDate, 'DD.MM.YYYY');
                alkTransferValue = this.translateService.instant('stes.message.alkTransferDateUebermittelt', { alkTransfer: alkTransferDatenFormated });
            }
        }
        return alkTransferValue;
    }

    changeLanguage() {
        this.observeTranslateServiceSub = this.translateService.onLangChange.subscribe(resp => {
            if (!(this.savedSachverhalt && this.savedSachverhalt.alkTransferDate)) {
                this.sachverhaltForm.controls.alkTransferDate.setValue(resp.translations.stes.message.alkTrasferKeineDate);
            } else {
                this.sachverhaltForm.controls.alkTransferDate.setValue(this.setInitialValueAlkTransferDate(this.savedSachverhalt.alkTransferDate));
            }
        });
    }

    getData(): void {
        this.spinnerService.activate(this.sachverhaltFormChannel);
        this.dataService.getCode(DomainEnum.ENTSCHEID_STATUS).subscribe(
            (stesStatus: CodeDTO[]) => {
                if (stesStatus) {
                    this.statusBackup = stesStatus;
                    this.status = !!this.savedSachverhalt ? this.updateStatusOptions(this.savedSachverhalt) : this.facade.formUtilsService.mapDropdownKurztext(stesStatus);
                    if (!this.isBearbeiten) {
                        this.setStatusToPendent();
                        this.enableStatusCode(false);
                    }
                }
                this.spinnerService.deactivate(this.sachverhaltFormChannel);
            },
            () => {
                this.spinnerService.deactivate(this.sachverhaltFormChannel);
            }
        );
    }

    public enableStatusCode(enable: boolean): void {
        const statusCode = this.sachverhaltForm.get('statusCode');
        enable ? statusCode.enable() : statusCode.disable();
        statusCode.updateValueAndValidity();
    }

    setStatusToPendent() {
        this.sachverhaltForm.controls.statusCode.setValue(this.status.find(statusValue => statusValue.labelDe === 'pendent').value);
    }

    updateBenutzerstellenId(benutzer: any) {
        if (this.bearbeitung) {
            this.benutzerCode = this.bearbeitung.benuStelleCode;
            this.benutzerstellenId = this.bearbeitung.benutzerstelleId;
            this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: this.benutzerCode });
        } else {
            if (typeof benutzer !== 'object' && (typeof benutzer === 'string' && benutzer.length > 1)) {
                this.benutzerCode = benutzer ? benutzer.split(' ')[0] : ' ';
                this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: this.benutzerCode });
            } else if (typeof benutzer === 'object') {
                this.benutzerstellenId = benutzer.benutzerstelleId;
                this.fallbearbeitungForm.controls['benutzerstellenId'].setValue({ code: this.benutzerCode });
            }
        }
    }

    updateBearbeitung(bearbeitung: any) {
        if (typeof bearbeitung === 'string' && bearbeitung === '') {
            this.bearbeitung = null;
        } else if (typeof bearbeitung !== 'string') {
            if (this.checkRecivedObject(bearbeitung)) {
                this.bearbeitung = bearbeitung;
                this.updateBenutzerstellenId(bearbeitung.benuStelleCode);
                this.fallbearbeitungForm.controls['benutzerstellenId'].setValidators(Validators.required);
            } else {
                this.bearbeitung = null;
            }
        }
    }

    updateFreigabeDurch(freigabeDurch: any) {
        if (typeof freigabeDurch === 'string' && freigabeDurch === '') {
            this.freigabedurch = null;
        } else if (typeof freigabeDurch !== 'string') {
            if (this.checkRecivedObject(freigabeDurch)) {
                this.freigabedurch = freigabeDurch;
            } else {
                this.freigabedurch = null;
            }
        }
    }

    public updateBenutzerDetal(benutzerDetail: any) {
        this.benutzerstellenId = benutzerDetail.data.benutzerstelleId;
    }

    public bearbeitungValue(value: any, controlName: string) {
        if (value === ' ' || value === '') {
            this[controlName] = null;
            this.fallbearbeitungForm.controls[controlName].setValue(null);
        }
    }

    reset(): void {
        if (this.sachverhaltForm.dirty || this.fallbearbeitungForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                if (this.isBearbeiten) {
                    this.mapToForm(this.savedSachverhalt);
                } else {
                    this.sachverhaltForm.reset();
                    this.fallbearbeitungForm.reset();
                    this.sachverhaltForm.controls.ueberpruefung.setValue(true);
                    this.sachverhaltForm.controls.meldeDatum.setValue(new Date());
                    this.setStatusToPendent();
                }
            });
        }
    }

    save(): void {
        this.fehlermeldungenService.closeMessage();
        if (this.sachverhaltForm.valid && this.fallbearbeitungForm.valid) {
            const stesVmfSachverhaltDTO = this.mapToDTO();
            this.spinnerService.activate(this.sachverhaltFormChannel);
            if (!this.isBearbeiten) {
                this.createSachverhalt(stesVmfSachverhaltDTO);
            } else {
                this.updateSachverhalt(stesVmfSachverhaltDTO);
                this.status = this.updateStatusOptions(stesVmfSachverhaltDTO);
            }
        } else {
            OrColumnLayoutUtils.scrollTop();
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    ngOnDestroy() {
        this.observeTranslateServiceSub.unsubscribe();
    }

    mapToDTO(): VermittlungsfaehigkeitDTO {
        const control = this.sachverhaltForm.controls;
        return {
            ...this.savedSachverhalt,
            sachverhaltId: this.sachverhaltId,
            stesId: parseInt(this.stesId, 10),
            meldeDatum: control.meldeDatum.value,
            grund: control.grund.value,
            ueberpruefung: control.ueberpruefung.value,
            statusCode: {
                codeId: this.sachverhaltForm.controls.statusCode.value
            },
            benutzerStelle: {
                benutzerstelleId: this.benutzerstellenId,
                code: this.benutzerCode
            },
            vorEntscheidObject: null,
            nachEntscheidObject: null,
            bearbeitung: this.fallbearbeitungForm.controls.bearbeitung['benutzerObject'],
            freigabeDurch: this.fallbearbeitungForm.controls.freigabeDurch['benutzerObject']
        };
    }

    mapToForm(dto: VermittlungsfaehigkeitDTO) {
        const sachverhaltFormValues = {
            meldeDatum: new Date(dto.meldeDatum),
            grund: dto.grund,
            ueberpruefung: dto.ueberpruefung,
            statusCode: dto.statusCode.codeId,
            entscheidNr: dto.entscheidNr,
            entscheidDatum: this.facade.formUtilsService.formatDateNgx(dto.entscheidDatum, 'DD.MM.YYYY'),
            alkTransferDate: this.setInitialValueAlkTransferDate(dto.alkTransferDate),
            ersetztEntscheidNr: !!dto.vorEntscheidObject ? dto.vorEntscheidObject.entscheidNr : null,
            benutzerStelle: dto.benutzerStelle,
            vorEntscheidObject: dto.vorEntscheidObject,
            nachEntscheidObject: dto.nachEntscheidObject
        };
        const fallbearbeitungFormValues = {
            benutzerstellenId: { benutzerstelleId: dto.benutzerStelle.benutzerstelleId, code: dto.benutzerStelle.code },
            bearbeitung: dto.bearbeitung,
            freigabeDurch: dto.freigabeDurch
        };
        this.sachverhaltForm.patchValue(sachverhaltFormValues);
        this.fallbearbeitungForm.patchValue(fallbearbeitungFormValues);
        this.benutzerstellenId = dto.benutzerStelle.benutzerstelleId;
        this.updateBenutzerstellenId(dto.benutzerStelle.code);
        if (dto.bearbeitung) {
            this.updateBearbeitung(dto.bearbeitung);
        }
        if (dto.freigabeDurch) {
            this.updateFreigabeDurch(dto.freigabeDurch);
        }
    }

    private updateStatusOptions(sachverhalt: VermittlungsfaehigkeitDTO): any[] {
        const filteredStatus = this.statusCodeService.filterStatusOptionsByInitialStatus(this.statusBackup, sachverhalt.statusCode.codeId);
        return this.facade.formUtilsService.mapDropdownKurztext(filteredStatus);
    }

    private createSachverhalt(stesVmfSachverhaltDTO: VermittlungsfaehigkeitDTO) {
        this.dataService.createVmfSachverhalt(stesVmfSachverhaltDTO).subscribe(
            result => {
                if (!!result.data) {
                    this.sachverhaltForm.markAsPristine();
                    this.fallbearbeitungForm.markAsPristine();
                    this.router.navigate([`stes/details/${this.stesId}/vermittlungsfaehigkeit/sachverhalt-bearbeiten`], {
                        queryParams: { sachverhaltId: result.data }
                    });
                    this.navigationService.hideNavigationTreeRoute(StesVermittlungsfaehigkeits.SACHVERHALT);
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                }
                this.spinnerService.deactivate(this.sachverhaltFormChannel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.sachverhaltFormChannel);
            }
        );
    }

    private updateSachverhalt(stesVmfSachverhaltDTO: VermittlungsfaehigkeitDTO) {
        this.dataService.updateVmfSachverhalt(stesVmfSachverhaltDTO).subscribe(
            result => {
                if (!!result.data) {
                    this.mapToForm(result.data);
                    this.savedSachverhalt = result.data;
                    this.sachverhaltForm.markAsPristine();
                    this.fallbearbeitungForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    this.isUpdated.emit(result.data);
                }
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.sachverhaltFormChannel);
            },
            () => {
                OrColumnLayoutUtils.scrollTop();
                this.spinnerService.deactivate(this.sachverhaltFormChannel);
            }
        );
    }

    private checkRecivedObject(benutzer: any): boolean {
        return benutzer && benutzer.benuStelleCode && benutzer.benutzerDetailId && benutzer.nachname && benutzer.vorname && benutzer.benuStelleCode;
    }
}

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesAufgabenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { BenutzerstelleAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-benutzerstelle-autosuggest/avam-benutzerstelle-autosuggest.component';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { UserDto } from '@dtos/userDto';
import { SortByPipe, ToolboxService } from '@app/shared';
import { BenutzerstelleSucheParamsModel } from '@stes/pages/details/pages/datenfreigabe/benutzerstelle-suche-params.model';
import { StatusEnum } from '@shared/classes/fixed-codes';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { GekoAufgabenCodes } from '@shared/models/geko-aufgaben-codes.model';
import { CodeDTO } from '@dtos/codeDTO';
import { GeKoAufgabeDetailsDTO } from '@dtos/geKoAufgabeDetailsDTO';
import { Subscription } from 'rxjs';
import { DateValidator } from '@shared/validators/date-validator';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import PrintHelper from '@shared/helpers/print.helper';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { GekoAufgabenLabels } from '@shared/enums/stes-routing-labels.enum';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';

@Component({
    selector: 'avam-stes-aufgaben-erfassen',
    templateUrl: './stes-aufgaben-erfassen.component.html',
    styleUrls: ['./stes-aufgaben-erfassen.component.scss'],
    providers: [ObliqueHelperService]
})
export class StesAufgabenErfassenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('zuestaendig') zuestaendig: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('initialisiertDurch') initialisiertDurch: AvamPersonalberaterAutosuggestComponent;

    stesAufgabErfassenForm: FormGroup;
    benutzerstelleSuchenTokens: any = {};
    benutzerstelleAutosuggestType = BenutzerstelleAutosuggestType.BENUTZERSTELLE_AUS_VOLLZUGSREGION;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    currentUser: UserDto;
    geschaeftsartenOptions: any[] = [];
    prioritaetOptions: any[] = [];
    statusOptions: any[] = [];
    statusOptionsCodeDTO: CodeDTO[] = [];
    benutzerSuchenTokens: any = {};
    benutzerstelleSucheParams: BenutzerstelleSucheParamsModel = {
        benutzerstellentyp: null,
        vollzugsregiontyp: null,
        status: StatusEnum.AKTIV,
        kanton: null
    };
    benutzerstelleField: AbstractControl;
    isBearbeiten = false;

    readonly aufgabenErfSpinnerChannel = 'aufgabenErfSpinnerChannel';

    private static readonly PRIORITY_NIEDRIG = '1';
    private static readonly STATUS_PENDANT = '3';
    private lezteAktualisierung: GeKoAufgabeDetailsDTO = null;
    private stesId: string;
    private formsub: Subscription;
    private aufgabeId: string;
    private toolboxId = 'aufgabeBearbeitenErfassen';
    private toolboxChannel = 'aufgabeBearbeitenErfassenChannel';

    constructor(
        private facade: FacadeService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private gekoAufgabenService: GekoAufgabenService,
        private sortByPipe: SortByPipe,
        private stesInfobarService: AvamStesInfoBarService,
        private dataService: StesDataRestService,
        private obliqueHelperService: ObliqueHelperService,
        private interactionService: StesComponentInteractionService
    ) {
        super();
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    ngOnInit(): void {
        this.currentUser = this.facade.authenticationService.getLoggedUser();
        this.stesId = this.route.parent.snapshot.paramMap.get('stesId');
        this.createAufgabeForm();
        this.getTokens();
        this.setSubscriptions();
    }

    ngAfterViewInit(): void {
        this.gekoAufgabenService.loadErfassenCodes(this.aufgabenErfSpinnerChannel, this.isBearbeiten);
    }

    ngOnDestroy(): void {
        this.gekoAufgabenService.clearMessages();
        if (this.formsub) {
            this.formsub.unsubscribe();
        }
        this.stesInfobarService.sendLastUpdate({}, true);
        if (!this.isBearbeiten) {
            this.hideNavItem();
        }
        super.ngOnDestroy();
    }

    initFormWithDefaults(priorityCodes: Array<CodeDTO>): void {
        this.stesAufgabErfassenForm.controls.prioritaet.setValue(this.facade.formUtilsService.getCodeIdByCode(priorityCodes, StesAufgabenErfassenComponent.PRIORITY_NIEDRIG));
        this.initialisiertDurch.appendCurrentUser();
        if (this.currentUser) {
            this.stesAufgabErfassenForm.controls.benutzerstelle.setValue({
                code: this.currentUser.benutzerstelleCode,
                benutzerstelleId: this.currentUser.benutzerstelleId
            });
        }
        this.setFaelligAmValidators();
    }

    openBenutzerstelleSuche(benutzerstellenSuche: any): void {
        this.facade.openModalFensterService.openXLModal(benutzerstellenSuche);
    }

    reset(): void {
        if (this.stesAufgabErfassenForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                if (this.isBearbeiten) {
                    this.mapToForm();
                } else {
                    this.stesAufgabErfassenForm.reset();
                    this.initFormWithDefaults(this.prioritaetOptions);
                }
            });
        }
    }

    cancel(): void {
        if (!this.canDeactivate()) {
            this.hideNavItem();
        } else {
            this.interactionService.navigateAwayAbbrechen.pipe(takeUntil(this.unsubscribe)).subscribe((okClicked: boolean) => {
                if (okClicked) {
                    this.hideNavItem();
                }
            });
        }
        this.gekoAufgabenService.navigateToAufgabenAnzeigen(this.stesId, this.aufgabenErfSpinnerChannel);
    }

    save(): void {
        if (this.stesAufgabErfassenForm.valid) {
            this.gekoAufgabenService.erfassteAufgabeSubject.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
                if (value) {
                    if (this.isBearbeiten) {
                        this.lezteAktualisierung = value;
                        this.mapToForm();
                    } else {
                        this.stesAufgabErfassenForm.reset();
                        this.gekoAufgabenService.navigateToStesAufgabenBearbeiten(this.stesId, value.aufgabeId, this.aufgabenErfSpinnerChannel);
                    }
                }
                OrColumnLayoutUtils.scrollTop();
            });
            this.gekoAufgabenService.save(this.mapToDto(), this.aufgabenErfSpinnerChannel);
        } else {
            this.facade.fehlermeldungenService.closeMessage();
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
        }
    }

    mapToDto(): GeKoAufgabeDetailsDTO {
        const dto = { ...this.lezteAktualisierung };
        const newVals = {
            zuErledigenBis: this.stesAufgabErfassenForm.controls.faelligAm.value,
            stesId: Number(this.stesId),
            benutzerstelle: this.stesAufgabErfassenForm.controls.benutzerstelle['benutzerstelleObject'],
            zustBenutzerDetail: this.stesAufgabErfassenForm.controls.zuestaendig['benutzerObject'],
            initBenutzerDetail: this.stesAufgabErfassenForm.controls.initialisiertDurch['benutzerObject'],
            geschaeftsart: {
                codeId: this.stesAufgabErfassenForm.controls.geschaeftsart.value
            },
            prioritaet: {
                codeId: this.stesAufgabErfassenForm.controls.prioritaet.value
            },
            aufgabeText: this.stesAufgabErfassenForm.controls.aufgabentext.value,
            geschaeftsbereichCode: GekobereichCodeEnum.GESCHAEFTSBEREICH_STES
        };
        const updatedDto = { ...dto, ...newVals };

        if (this.isBearbeiten) {
            updatedDto.aufgabeId = Number(this.aufgabeId);
            updatedDto.status = {
                codeId: this.stesAufgabErfassenForm.controls.status.value
            };
        }
        return updatedDto;
    }

    updateBenutzerstelleSuche(event: any): void {
        this.stesAufgabErfassenForm.controls.benutzerstelle.setValue({
            code: event.id,
            benutzerstelleId: event.benutzerstelleObj.benutzerstelleId ? event.benutzerstelleObj.benutzerstelleId : null
        });
    }

    updateBenutzerstelle(event: any): void {
        const value = event && event.target ? event.target.value : event;
        if (!value) {
            this.setRequiredField();
        }
    }

    setRequiredField(): void {
        if (!this.zuestaendig.benutzerDetail) {
            this.benutzerstelleField.setValidators(Validators.required);
        } else {
            this.benutzerstelleField.clearValidators();
        }
        this.benutzerstelleField.updateValueAndValidity();
    }

    updateBenutzerZustaendig(value: any): void {
        if (!!value) {
            this.stesAufgabErfassenForm.controls.benutzerstelle.setValue({ code: value.benuStelleCode, benutzerstelleId: value.benutzerstelleId ? value.benutzerstelleId : null });
        }
    }

    onInputBenutzerZustaendig(event: any): void {
        // for IE - onKeyup, for other browsers - onInput
        const value = event && event.target ? event.target.value : event;
        if (!value) {
            this.zuestaendig.benutzerDetail = null;
            this.setRequiredField();
        } else if (value.benuStelleCode) {
            this.stesAufgabErfassenForm.controls.benutzerstelle.setValue({ code: value.benuStelleCode, benutzerstelleId: value.benutzerstelleId ? value.benutzerstelleId : null });
        }
    }

    openDeleteWindow(): void {
        const modalRef = this.facade.openModalFensterService.openDeleteModal();
        modalRef.result.then(result => {
            if (result) {
                this.delete();
            }
        });
    }

    delete(): void {
        this.gekoAufgabenService.clearMessages();
        this.gekoAufgabenService
            .delete([Number(this.aufgabeId)])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(result => {
                if (!result.warning) {
                    this.gekoAufgabenService.success(result.data);
                    this.stesAufgabErfassenForm.reset();
                    this.hideNavItem();
                    this.gekoAufgabenService.navigateToAufgabenAnzeigen(this.stesId, this.aufgabenErfSpinnerChannel);
                } else {
                    OrColumnLayoutUtils.scrollTop();
                }
            });
    }

    canDeactivate(): boolean {
        return this.stesAufgabErfassenForm.dirty;
    }

    private hideNavItem(): void {
        if (this.isBearbeiten) {
            this.facade.navigationService.hideNavigationTreeRoute(StesAufgabenPaths.AUFGABEN_BEARBEITEN);
        } else {
            this.facade.navigationService.hideNavigationTreeRoute(StesAufgabenPaths.AUFGABEN_ERFASSEN);
        }
    }

    private static codeMapper(): any {
        return (code: CodeDTO) => {
            return {
                value: code.codeId,
                labelFr: code.textFr,
                labelIt: code.textIt,
                labelDe: code.textDe,
                code: code.code,
                codeId: code.codeId
            };
        };
    }

    private setSubscriptions(): void {
        this.route.data.subscribe(data => {
            this.isBearbeiten = data.formNumber === StesFormNumberEnum.AUFGABE_BEARBEITEN;
            this.loadInfoBar();
            this.gekoAufgabenService.codesSubject.pipe(takeUntil(this.unsubscribe)).subscribe((codes: GekoAufgabenCodes) => {
                this.geschaeftsarten = codes.geschaeftsarten.filter(code => code.code && code.code.startsWith('S'));
                this.priorities = codes.priorities;
                this.stati = codes.status;

                if (this.isBearbeiten) {
                    this.route.queryParamMap.subscribe(params => {
                        this.aufgabeId = params.get('aufgabeId');
                    });
                    this.loadAufgabe(Number(this.aufgabeId));
                    this.facade.navigationService.showNavigationTreeRoute(StesAufgabenPaths.AUFGABEN_BEARBEITEN, { aufgabeId: String(this.aufgabeId) });
                } else {
                    this.initFormWithDefaults(codes.priorities);
                    this.facade.navigationService.showNavigationTreeRoute(StesAufgabenPaths.AUFGABEN_ERFASSEN);
                }
            });
        });
        this.facade.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => this.onLangChange());
        this.facade.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.onCancelPageSideNavigation(message);
                }
            });
    }

    private loadInfoBar(): void {
        if (this.isBearbeiten) {
            this.setToolboxConfigs(ToolboxConfig.getAufgabeBearbeitenConfig());
            this.stesInfobarService.sendDataToInfobar({ title: GekoAufgabenLabels.AUFGABE_BEARBEITEN });
            this.dataService
                .getStesHeader(this.stesId, this.facade.translateService.currentLang)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((data: StesHeaderDTO) => {
                    this.facade.toolboxService.sendEmailAddress(data.stesBenutzerEmail ? data.stesBenutzerEmail : '');
                });
        } else {
            this.setToolboxConfigs(ToolboxConfig.getAufgabeErfassenConfig());
            this.stesInfobarService.sendDataToInfobar({ title: GekoAufgabenLabels.NEUE_AUFGABE });
        }

        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(filter(action => action.message.action === ToolboxActionEnum.PRINT))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                PrintHelper.print();
            });
    }

    private setToolboxConfigs(configuration: ToolboxConfiguration[]): void {
        this.facade.toolboxService.sendConfiguration(configuration, this.toolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId));
    }

    private loadAufgabe(aufgabeId: number) {
        this.gekoAufgabenService.aufgabeLoadedSubject.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.lezteAktualisierung = value;
            this.mapToForm();
        });
        this.gekoAufgabenService.getAufgabeById(aufgabeId, this.aufgabenErfSpinnerChannel);
    }

    private createAufgabeForm(): void {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.stesAufgabErfassenForm = this.formBuilder.group({
            geschaeftsart: [null, Validators.required],
            prioritaet: [null, Validators.required],
            aufgabentext: [null, Validators.required],
            faelligAm: null,
            benutzerstelle: null,
            zuestaendig: null,
            initialisiertDurch: null,
            status: null
        });
        this.benutzerstelleField = this.stesAufgabErfassenForm.controls.benutzerstelle;
    }

    private getTokens(): void {
        if (this.currentUser) {
            this.benutzerstelleSuchenTokens = {
                benutzerstelleId: `${this.currentUser.benutzerstelleId}`,
                vollzugsregionTyp: DomainEnum.STES
            };
            this.benutzerSuchenTokens = {
                myBenutzerstelleId: `${this.currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    set priorities(value: CodeDTO[]) {
        this.prioritaetOptions = value.map(StesAufgabenErfassenComponent.codeMapper());
    }

    set geschaeftsarten(value: CodeDTO[]) {
        this.geschaeftsartenOptions = this.sortByPipe.transform(value.map(StesAufgabenErfassenComponent.codeMapper()), 'label', false, true);
    }

    set stati(value: CodeDTO[]) {
        this.statusOptions = this.sortByPipe.transform(value.map(StesAufgabenErfassenComponent.codeMapper()), 'label', false, true);
        this.statusOptionsCodeDTO = value;
    }

    private onLangChange(): void {
        // if sorting pipe is used in the HTML, it won't react on language change properly ;(
        this.geschaeftsartenOptions = this.sortByPipe.transform(this.geschaeftsartenOptions, 'label', false, true);
    }

    private mapToForm(): void {
        this.stesAufgabErfassenForm.setValue({
            geschaeftsart: this.lezteAktualisierung.geschaeftsart.codeId,
            prioritaet: this.lezteAktualisierung.prioritaet.codeId,
            aufgabentext: this.lezteAktualisierung.aufgabeText,
            faelligAm: this.lezteAktualisierung.zuErledigenBis ? new Date(this.lezteAktualisierung.zuErledigenBis) : null,
            benutzerstelle: this.lezteAktualisierung.benutzerstelle,
            zuestaendig: this.lezteAktualisierung.zustBenutzerDetail,
            initialisiertDurch: this.lezteAktualisierung.initBenutzerDetail,
            status: this.lezteAktualisierung.status.codeId
        });
        const statusCodeId = this.lezteAktualisierung.status.codeId;
        this.setFaelligAmValidators(statusCodeId);
        this.stesAufgabErfassenForm.markAsPristine();
        this.stesInfobarService.sendLastUpdate({
            geaendertDurch: this.lezteAktualisierung.geaendertDurch,
            geaendertAm: this.lezteAktualisierung.geaendertAm,
            erfasstAm: this.lezteAktualisierung.erfasstAm,
            erfasstDurch: this.lezteAktualisierung.erfasstDurch
        });
    }

    private setFaelligAmValidators(statusCodeId?: number) {
        if (this.isBearbeiten) {
            const pendantCodeId: string = this.facade.formUtilsService.getCodeIdByCode(this.statusOptionsCodeDTO, StesAufgabenErfassenComponent.STATUS_PENDANT);
            if (statusCodeId && statusCodeId.toString() === pendantCodeId) {
                this.stesAufgabErfassenForm.controls.faelligAm.setValidators([DateValidator.val067, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            } else {
                this.stesAufgabErfassenForm.controls.faelligAm.setValidators([DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
            }
            this.stesAufgabErfassenForm.controls.faelligAm.updateValueAndValidity();
        } else {
            this.stesAufgabErfassenForm.controls.faelligAm.setValidators([DateValidator.val083, DateValidator.dateFormatNgx, DateValidator.dateValidNgx]);
        }
    }

    private onCancelPageSideNavigation(message): void {
        if (
            message.data.label === this.facade.translateService.instant(GekoAufgabenLabels.NEUE_AUFGABE) ||
            message.data.label === this.facade.translateService.instant(GekoAufgabenLabels.AUFGABE_BEARBEITEN)
        ) {
            this.cancel();
        }
    }
}

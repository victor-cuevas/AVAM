import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NumberValidator } from '@shared/validators/number-validator';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { AbstractBaseForm } from '@shared/classes/abstract-base-form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { UnternehmenDTO } from '@dtos/unternehmenDTO';
import { AutosuggestValidator } from '@shared/validators/autosuggest-validator';
import { PhoneValidator } from '@shared/validators/phone-validator';
import { EmailValidator } from '@shared/validators/email-validator';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { UnternehmenStatusCodeEnum } from '@shared/enums/domain-code/unternehmen-status-code.enum';
import { forkJoin } from 'rxjs';
import { finalize, pairwise, takeUntil } from 'rxjs/operators';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { UnternehmenTypes } from '@app/shared/enums/unternehmen.enum';
import { WarningMessages } from '@dtos/warningMessages';
import { BaseResponseWrapperUnternehmenResponseDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenResponseDTOWarningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamCommonValueObjectsEnum } from '@shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@shared/components/historisierung/historisierung.component';
import { DmsMetadatenContext, DmsMetadatenKopierenModalComponent } from '@shared/components/dms-metadaten-kopieren-modal/dms-metadaten-kopieren-modal.component';
import { BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages } from '@dtos/baseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages';
import { BaseResponseWrapperUnternehmenBearbeitenDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenBearbeitenDTOWarningMessages';
import { StaatDTO } from '@dtos/staatDTO';
import { FacadeService } from '@shared/services/facade.service';
import { GenericConfirmComponent } from '@app/shared';
import { CommonInfoFieldsComponent } from '@shared/components/unternehmen/common/common-info-fields/common-info-fields.component';
import { ContentService } from '@shared/components/unternehmen/common/content/content.service';
import { PermissionContextService } from '@shared/services/permission.context.service';

@Component({
    selector: 'avam-adressdaten',
    templateUrl: './adressdaten.component.html',
    styleUrls: ['./adressdaten.component.scss'],
    providers: [PermissionContextService]
})
export class UnternehmenAdressdatenComponent extends AbstractBaseForm implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('ngForm') public ngForm: FormGroupDirective;
    @ViewChild('modalBurMutationsantrag') modalBurMutationsantrag: ElementRef;
    @ViewChild('modalBurAdresse') modalBurAdresse: ElementRef;
    @ViewChild('standOrtAdresseFormComponent') standOrtAdresseFormComponent: CommonInfoFieldsComponent;
    @ViewChild('korrespondenzAdresseFormComponent') korrespondenzAdresseFormComponent: CommonInfoFieldsComponent;
    public statusCode = '';
    public isburOrtEinheit = false;
    public permissions: typeof Permissions = Permissions;
    public channel = 'unternehmen-adressdaten';
    public readonly toolboxChannel = 'unternehmen-adressdaten-channel';
    public type: string;
    public standOrtAdresseForm: FormGroup;
    public korrespondenzAdresseForm: FormGroup;
    public kontaktDatenForm: FormGroup;
    public extraInfoForm: FormGroup;
    public statusOptions: any[] = [];
    public statusDomain: any[];
    public unternehmenId;
    public unternehmenData: UnternehmenResponseDTO;
    public updatedDTO: UnternehmenResponseDTO;
    public formsDisabled = false;
    public deleteButtonType: string;
    public wrapperBuradresse: BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages;
    public isInputVisible = true;
    private navigationAddressType: string;
    private readonly SCHWEIZ_ISO2CODE = 'CH';

    constructor(
        public facadeService: FacadeService,
        public activatedRoute: ActivatedRoute,
        private obliqueHelper: ObliqueHelperService,
        private fb: FormBuilder,
        public modalService: NgbModal,
        public toolboxService: ToolboxService,
        private dataRestService: StesDataRestService,
        private unternehmenRestService: UnternehmenRestService,
        private infopanelService: AmmInfopanelService,
        private router: Router,
        private constentService: ContentService,
        private permissionContextService: PermissionContextService
    ) {
        super('unternehmen-adressdaten', modalService, facadeService.spinnerService, facadeService.messageBus, toolboxService, facadeService.fehlermeldungenService);
        ToolboxService.CHANNEL = this.toolboxChannel;
    }

    public ngOnInit(): void {
        this.obliqueHelper.ngForm = this.ngForm;
        this.getRouteData();
        this.generateForm();
        this.setSubscriptions();
        this.applyDeleteButtonType();
        this.infopanelService.updateInformation({ tableCount: undefined, subtitle: 'unternehmen.label.addressdaten' });
        this.initToolBox();
        this.setAdditionalValidation();
    }

    public ngAfterViewInit(): void {
        this.getData();
    }

    public ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
    }

    public getData(): void {
        this.spinnerService.activate(this.channel);
        forkJoin<CodeDTO[], BaseResponseWrapperUnternehmenResponseDTOWarningMessages>([
            this.dataRestService.getCode('Unternehmensstatus'),
            this.unternehmenRestService.getUnternehmenDataById(this.unternehmenId)
        ])
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    OrColumnLayoutUtils.scrollTop();
                    this.spinnerService.deactivate(this.channel);
                })
            )
            .subscribe(([statusData, unternehmenData]) => {
                this.spinnerService.deactivate(this.channel);
                this.statusDomain = statusData;
                this.setStatusOptions(statusData);
                this.updateUnternehmenData(unternehmenData);
                this.permissionContextService.getContextPermissions(this.unternehmenData.ownerId);
            });
    }

    public canDeactivate(): boolean {
        return this.standOrtAdresseForm.dirty || this.korrespondenzAdresseForm.dirty || this.kontaktDatenForm.dirty || this.extraInfoForm.dirty;
    }

    public BSP15(): boolean {
        return this.unternehmenData.nachfolgerId > 0;
    }

    public isZuruecksetzenButtonVisible(): boolean {
        return this.statusCode === UnternehmenStatusCodeEnum.STATUS_AKTIV;
    }

    public isAdresseBurBfsButtonVisible(): boolean {
        return this.isburOrtEinheit && this.statusCode === UnternehmenStatusCodeEnum.STATUS_AKTIV;
    }

    public isSpeichernButtonVisible(): boolean {
        return this.statusCode === UnternehmenStatusCodeEnum.STATUS_AKTIV || this.statusCode === UnternehmenStatusCodeEnum.STATUS_INAKTIV_AVAM;
    }

    public reset(): void {
        if (this.standOrtAdresseForm.dirty || this.korrespondenzAdresseForm.dirty || this.kontaktDatenForm.dirty || this.extraInfoForm.dirty) {
            this.fehlermeldungenService.closeMessage();
            this.facadeService.resetDialogService.reset(() => {
                this.mapToForm(this.unternehmenData);
                this.markAsPristineForms();
            });
        }
    }

    public openDeleteModalConfirmation(): void {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
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

    public delete(): void {
        this.spinnerService.activate(this.channel);

        this.unternehmenRestService
            .deleteUnternehmenById(this.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperUnternehmenResponseDTOWarningMessages) => {
                    if (this.isNotSomeErrorIntoResponse(response.warning)) {
                        this.facadeService.notificationService.success('common.message.datengeloescht');
                        this.router.navigate([this.navigationAddressType]);
                    }
                    this.spinnerService.deactivate(this.channel);
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
    }

    public openAdresseBurModal(): void {
        this.spinnerService.activate(this.channel);
        this.unternehmenData = this.mapToDTO();
        this.unternehmenRestService
            .getBurAdresseUnternehmen(this.unternehmenData.unternehmenId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages) => {
                    this.spinnerService.deactivate(this.channel);
                    if (!!response && !!response.data) {
                        this.wrapperBuradresse = response;
                        this.fehlermeldungenService.closeMessage();
                        this.modalService
                            .open(this.modalBurAdresse, {
                                windowClass: 'modal-md',
                                ariaLabelledBy: 'modal-basic-title',
                                centered: true,
                                backdrop: 'static'
                            })
                            .result.then(
                                result => {},
                                reason => {
                                    if (typeof reason === 'object') {
                                        this.mapToForm(reason);
                                    }
                                }
                            );
                    }
                },

                () => this.spinnerService.deactivate(this.channel)
            );
    }

    public save(): void {
        this.fehlermeldungenService.closeMessage();
        if (this.isFormValid()) {
            this.updatedDTO = this.mapToDTO();
            this.spinnerService.activate(this.channel);
            this.unternehmenRestService
                .updateUnternehmen(this.updatedDTO, this.facadeService.translateService.currentLang)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.spinnerService.deactivate(this.channel);
                        OrColumnLayoutUtils.scrollTop();
                    })
                )
                .subscribe((response: BaseResponseWrapperUnternehmenBearbeitenDTOWarningMessages) => {
                    if (!!response.data) {
                        if (!response.data.relevantBurDataModified) {
                            this.facadeService.notificationService.success('common.message.datengespeichert');
                            this.unternehmenData = response.data.unternehmen;
                            this.updateFormState();
                        } else {
                            this.openBurMutationsantrag();
                        }
                    }
                });
        } else {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.ngForm.onSubmit(undefined);
            this.korrespondenzAdresseForm.controls.name.patchValue(this.korrespondenzAdresseForm.controls.name.value);
            OrColumnLayoutUtils.scrollTop();
        }
    }

    public goToURL() {
        const resultUrl = this.mapOnlineFormularToDTO(this.kontaktDatenForm.get('url').value);
        window.open(resultUrl, '_blank');
    }

    private updateFormState(): void {
        this.mapToForm(this.unternehmenData);
        this.checkStatus(this.unternehmenData.unternehmenStatus.codeId);
        this.isburOrtEinheit = this.unternehmenData.burOrtEinheitObject !== null && this.unternehmenData.burOrtEinheitObject.burOrtEinheitId !== null;
        this.validateBSPs();
    }

    private openBurMutationsantrag(): void {
        this.modalService.open(this.modalBurMutationsantrag, { ariaLabelledBy: 'infotags-basic-title', windowClass: 'modal-md', centered: true, backdrop: 'static' }).result.then(
            () => {
                OrColumnLayoutUtils.scrollTop();
            },
            unternehmenData => {
                OrColumnLayoutUtils.scrollTop();
                if (typeof unternehmenData === 'object') {
                    this.unternehmenData = unternehmenData;
                    this.constentService.getUnternehmen(unternehmenData.unternehmenId);
                    this.markAsPristineForms();
                    this.getData();
                }
            }
        );
    }

    private getRouteData(): void {
        this.type = this.activatedRoute.parent.snapshot.data['type'];
        this.activatedRoute.parent.params.subscribe(parentData => {
            if (parentData && parentData['unternehmenId']) {
                this.unternehmenId = parentData['unternehmenId'];
                this.unternehmenRestService
                    .getUnternehmenDataById(this.unternehmenId)
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(() => this.getData());
            }
        });
    }

    private validateBSPs(): void {
        if (this.BSP6(this.unternehmenData)) {
            this.extraInfoForm.controls.branche.setValue(this.unternehmenData.burOrtEinheitObject.nogaDTO);
            this.extraInfoForm.controls.branche.disable();
        }
        if (this.BSP29()) {
            this.setStatusOptions(this.statusDomain);
            const loeschOption = this.statusDomain.find(item => item.code === UnternehmenStatusCodeEnum.STATUS_GELOESCHT_BFS);
            this.extraInfoForm.controls.status.setValue(loeschOption.codeId);
            this.extraInfoForm.controls.status.disable();
        }
        if (this.BSP9()) {
            this.facadeService.fehlermeldungenService.deleteMessage('arbeitgeber.oste.message.differentBurEinheitAdresseMessage', 'info');
            this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.differentBurEinheitAdresseMessage', 'info');
        }
    }

    private BSP9(): boolean {
        const unternehmenAdress = this.getUnternehmenAdressDataForComparation();
        const burAdress = this.getBurAdressDataForComparation();
        return !Object.keys(burAdress).length ? false : JSON.stringify(unternehmenAdress) !== JSON.stringify(burAdress);
    }

    private getUnternehmenAdressDataForComparation() {
        const unternehmenData = this.unternehmenData;
        const isCH = unternehmenData.land.iso2Code === this.SCHWEIZ_ISO2CODE;
        return {
            land: unternehmenData.land.iso2Code,
            strasse: unternehmenData.strasse || '',
            strasseNr: +unternehmenData.strasseNr,
            postleitzahl: isCH ? (unternehmenData.plzOrt ? unternehmenData.plzOrt.postleitzahl : null) : unternehmenData.plzAusland,
            postfach: unternehmenData.postfach || 0
        };
    }

    private getBurAdressDataForComparation() {
        const burData = this.unternehmenData.burOrtEinheitObject;
        if (!burData) {
            return {};
        }
        const isCH = burData.countryIdISO2 === this.SCHWEIZ_ISO2CODE;
        return {
            land: burData.countryIdISO2,
            strasse: burData.street || '',
            strasseNr: +burData.streetNr,
            postleitzahl: isCH ? burData.letzterAGPlz : burData.foreignZipCode,
            postfach: burData.postfachNr || 0
        };
    }

    private isNotSomeErrorIntoResponse(warning: Array<WarningMessages>): boolean {
        return !warning.length || !warning.filter((warningItem: WarningMessages) => warningItem.key === WarningMessages.KeyEnum.DANGER).length;
    }

    private setSubscriptions(): void {
        this.korrespondenzAdresseForm.valueChanges
            .pipe(
                takeUntil(this.unsubscribe),
                pairwise()
            )
            .subscribe(([prev, next]: [any, any]) => {
                if (this.isFormValueModified(prev, next)) {
                    this.updateValidityOnModifiedForm(next);
                }
            });

        this.extraInfoForm.controls.status.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            if (value && this.statusDomain) {
                this.statusCode = this.facadeService.formUtilsService.getCodeByCodeId(this.statusDomain, value);
            }
        });

        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                } else if (action.message.action === ToolboxActionEnum.HISTORY) {
                    this.openHistoryModal(this.unternehmenId, AvamCommonValueObjectsEnum.T_UNTERNEHMEN);
                } else if (action.message.action === ToolboxActionEnum.COPY) {
                    this.openDmsCopyModal();
                }
            });
    }

    private isFormValueModified(prevForm: any, nextForm: any) {
        return (
            this.isPreviousPartModified(prevForm, nextForm) ||
            this.isPlzAuslandModified(prevForm.plz.ort, nextForm.plz.ort) ||
            this.isPlzAuslandModified(prevForm.plzPostfach.ort, nextForm.plzPostfach.ort) ||
            this.isPlzAuslandModified(prevForm.plz.postleitzahl, nextForm.plz.postleitzahl) ||
            this.isPlzAuslandModified(prevForm.plzPostfach.postleitzahl, nextForm.plzPostfach.postleitzahl)
        );
    }

    private isPreviousPartModified(prevForm: any, nextForm: any) {
        return (
            prevForm.name !== nextForm.name ||
            prevForm.name2 !== nextForm.name2 ||
            prevForm.name3 !== nextForm.name3 ||
            prevForm.strasse !== nextForm.strasse ||
            prevForm.strasseNr !== nextForm.strasseNr ||
            prevForm.postfach !== nextForm.postfach ||
            prevForm.land !== nextForm.land
        );
    }

    private isPlzAuslandModified(prevPlz, nextPlz): boolean {
        let response = false;
        if ((!prevPlz || typeof prevPlz === 'string') && (!nextPlz || typeof nextPlz === 'string')) {
            response = prevPlz !== nextPlz;
        }
        return response;
    }

    private updateValidityOnModifiedForm(formValue: any) {
        if (this.isAnyFieldFilled(formValue)) {
            this.korrespondenzAdresseForm.controls.name.setValidators(Validators.required);
            this.korrespondenzAdresseForm.controls.land.setValidators(Validators.required);
            this.korrespondenzAdresseForm.controls.name.patchValue(this.korrespondenzAdresseForm.controls.name.value, { onlySelf: true });
            setTimeout(() => {
                this.korrespondenzAdresseForm.controls.land.updateValueAndValidity({ onlySelf: true });
            }, 0);

            this.korrespondenzAdresseForm.setValidators(
                TwoFieldsAutosuggestValidator.plzPlzAuslandCrossValidator(
                    'plz',
                    'plzPostfach',
                    'postleitzahl',
                    'ort',
                    'postleitzahl',
                    'ort',
                    this.korrespondenzAdresseFormComponent.plzAutosuggestComponent
                )
            );
        } else {
            this.korrespondenzAdresseForm.setValidators(null);
            this.korrespondenzAdresseForm.controls.name.setValidators(null);
            this.korrespondenzAdresseForm.controls.land.setValidators(null);
            this.updatePlzOrtFieldValidity(this.korrespondenzAdresseForm);
        }
    }

    private updatePlzOrtFieldValidity(form: FormGroup): void {
        form.get('plz')
            .get('postleitzahl')
            .updateValueAndValidity({ onlySelf: true });
        form.get('plz')
            .get('ort')
            .updateValueAndValidity({ onlySelf: true });
        form.get('plzPostfach')
            .get('postleitzahl')
            .updateValueAndValidity({ onlySelf: true });
        form.get('plzPostfach')
            .get('ort')
            .updateValueAndValidity({ onlySelf: true });
        form.get('name').updateValueAndValidity({ emitEvent: false });
        form.get('plz').updateValueAndValidity({ onlySelf: true });
        form.get('plzPostfach').updateValueAndValidity({ onlySelf: true });
        this.korrespondenzAdresseForm.controls.name.patchValue(null, { onlySelf: true });
        setTimeout(() => {
            this.korrespondenzAdresseForm.controls.land.updateValueAndValidity({ onlySelf: true });
            form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }, 0);
    }

    private openHistoryModal(objId: string, objType: string): void {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    private openDmsCopyModal(): void {
        const modalRef = this.modalService.open(DmsMetadatenKopierenModalComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        const comp = modalRef.componentInstance as DmsMetadatenKopierenModalComponent;
        comp.context = DmsMetadatenContext.DMS_CONTEXT_UNTERNEHMENBEARBEITEN;
        comp.id = this.unternehmenId;
    }

    private initToolBox(): void {
        this.toolboxService.sendConfiguration(ToolboxConfig.getUnternehmenBearbeitenConfig(), this.channel, ToolboxDataHelper.createForUnternehmen(this.unternehmenId));
    }

    private checkStatus(value): void {
        const selectedCode = this.facadeService.formUtilsService.getCodeByCodeId(this.statusDomain, value);
        if (selectedCode === UnternehmenStatusCodeEnum.STATUS_INAKTIV_AVAM) {
            this.filterStatusOptions();
            this.setFormsDisabled(true);
            this.isInputVisible = false;
            this.extraInfoForm.controls.status.enable();
        } else if (selectedCode === UnternehmenStatusCodeEnum.STATUS_AKTIV) {
            this.filterStatusOptions();
            this.setFormsDisabled(false);
            this.isInputVisible = true;
        } else {
            this.setFormsDisabled(true);
            this.isInputVisible = false;
        }
    }

    private setFormsDisabled(disabled: boolean): void {
        disabled ? this.standOrtAdresseForm.disable() : this.standOrtAdresseForm.enable();
        disabled ? this.korrespondenzAdresseForm.disable() : this.korrespondenzAdresseForm.enable();
        disabled ? this.kontaktDatenForm.disable() : this.kontaktDatenForm.enable();
        disabled ? this.extraInfoForm.disable() : this.extraInfoForm.enable();
        disabled ? this.extraInfoForm.controls.bfsNummer.disable() : this.extraInfoForm.controls.bfsNummer.enable();
        disabled ? this.extraInfoForm.controls.gemeindeName.disable() : this.extraInfoForm.controls.gemeindeName.enable();
        this.formsDisabled = disabled;
    }

    private filterStatusOptions(): void {
        const visibleOptions = this.statusDomain.filter(
            item => item.code === UnternehmenStatusCodeEnum.STATUS_AKTIV || item.code === UnternehmenStatusCodeEnum.STATUS_INAKTIV_AVAM
        );
        this.setStatusOptions(visibleOptions);
    }

    private setStatusOptions(data: CodeDTO[]): void {
        this.statusOptions = this.facadeService.formUtilsService.mapDropdownKurztext(data);
    }

    private generateForm(): void {
        this.standOrtAdresseForm = this.fb.group(this.generateAdressForm(), {
            validators: TwoFieldsAutosuggestValidator.plzPlzAuslandCrossValidator(
                'plz',
                'plzPostfach',
                'postleitzahl',
                'ort',
                'postleitzahl',
                'ort',
                this.standOrtAdresseFormComponent.plzAutosuggestComponent
            )
        });
        this.korrespondenzAdresseForm = this.fb.group(this.generateAdressForm(false));
        this.kontaktDatenForm = this.fb.group({
            telefon: [null, [PhoneValidator.isValidFormatWarning, Validators.maxLength(50)]],
            fax: [null, PhoneValidator.isValidFormatWarning],
            email: [null, EmailValidator.isValidFormat],
            url: null
        });
        this.extraInfoForm = this.fb.group({
            bfsNummer: [null, [NumberValidator.isPositiveInteger, AutosuggestValidator.valueGemeindeBfsInput({ invalidGemeindeFormat: { valid: false, value: '' } })]],
            gemeindeName: null,
            branche: null,
            status: null
        });
    }

    private generateAdressForm(validateLength = true) {
        const postfachValidator = [NumberValidator.isPositiveInteger];
        if (validateLength) {
            postfachValidator.push(Validators.maxLength(6));
        }
        return {
            name: null,
            name2: [null, validateLength ? Validators.maxLength(32) : null],
            name3: [null, validateLength ? Validators.maxLength(32) : null],
            strasse: [null, validateLength ? Validators.maxLength(50) : null],
            strasseNr: [null, validateLength ? Validators.maxLength(14) : null],
            plz: this.fb.group({
                postleitzahl: null,
                ort: null
            }),
            plzPostfach: this.fb.group({
                postleitzahl: null,
                ort: null
            }),
            land: null,
            postfach: [null, postfachValidator]
        };
    }

    private mapToForm(data: UnternehmenResponseDTO): void {
        this.standOrtAdresseForm.controls.land.reset(data.land);
        this.korrespondenzAdresseForm.controls.land.reset(data.korrespLand);
        this.resetStandOrtForm(data);
        this.resetKorrespondenzForm(data);
        this.kontaktDatenForm.reset({
            telefon: data.telefonNr,
            fax: data.telefaxNr,
            email: data.email,
            url: data.url
        });

        this.extraInfoForm.reset({
            bfsNummer: data.gemeinde ? data.gemeinde.bfsNummer : '',
            gemeindeName: data.gemeinde ? this.facadeService.dbTranslateService.translate(data.gemeinde, 'name') : '',
            branche: data.branche,
            status: data.unternehmenStatus.codeId
        });
    }

    private resetStandOrtForm(data: UnternehmenResponseDTO): void {
        this.standOrtAdresseForm.reset({
            name: data.name1,
            name2: data.name2,
            name3: data.name3,
            strasse: data.strasse,
            strasseNr: data.strasseNr,
            postfach: !!data.postfach ? data.postfach : '',
            land: data.land,
            plz: {
                postleitzahl: data.plzOrt && data.plzOrt.plzId ? data.plzOrt : data.plzAusland,
                ort: data.plzOrt && data.plzOrt.plzId ? data.plzOrt : data.ortAusland
            },
            plzPostfach: {
                postleitzahl: data.plzOrtPostfach && data.plzOrtPostfach.plzId ? data.plzOrtPostfach : data.postfachPlzAusland,
                ort: data.plzOrtPostfach && data.plzOrtPostfach.plzId ? data.plzOrtPostfach : data.postfachOrtAusland
            }
        });
    }

    private resetKorrespondenzForm(data: UnternehmenResponseDTO): void {
        this.korrespondenzAdresseForm.reset({
            name: data.korrespName1,
            name2: data.korrespName2,
            name3: data.korrespName3,
            strasse: data.korrespStrasse,
            strasseNr: data.korrespStrasseNr,
            postfach: !!data.korrespPostfach ? data.korrespPostfach : null,
            land: this.getKorrespLand(data.korrespLand),
            plz: {
                postleitzahl: data.korrespPlzOrt && data.korrespPlzOrt.plzId ? data.korrespPlzOrt : data.korrespPlzAusland,
                ort: data.korrespPlzOrt && data.korrespPlzOrt.plzId ? data.korrespPlzOrt : data.korrespOrtAusland
            },
            plzPostfach: {
                postleitzahl: data.korrespPlzOrtPostfach && data.korrespPlzOrtPostfach.plzId ? data.korrespPlzOrtPostfach : data.korrespPostfachPlzAusland,
                ort: data.korrespPlzOrtPostfach && data.korrespPlzOrtPostfach.plzId ? data.korrespPlzOrtPostfach : data.korrespPostfachOrtAusland
            }
        });
    }

    private getKorrespLand(land: StaatDTO): StaatDTO {
        return !!land && !!land.nameDe ? land : null;
    }

    private mapOnlineFormularToDTO(urlValue: string): string {
        let newUrl = urlValue;
        if (newUrl !== null) {
            newUrl = newUrl.trim();
            if (newUrl !== '' && !newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                newUrl = `http://${newUrl}`;
            }
        }
        return newUrl;
    }

    private mapToDTO(): UnternehmenResponseDTO {
        const standOrtAdresseControl = this.standOrtAdresseForm.controls;
        const korrespondenzAdresseControl = this.korrespondenzAdresseForm.controls;
        const kontaktDatenControl = this.kontaktDatenForm.controls;
        const extraInfoControl = this.extraInfoForm.controls;
        return {
            unternehmenId: !!this.unternehmenData ? this.unternehmenData.unternehmenId : null,
            burOrtEinheitObject: !!this.unternehmenData ? this.unternehmenData.burOrtEinheitObject : null,
            name1: standOrtAdresseControl.name.value,
            name2: standOrtAdresseControl.name2.value,
            name3: standOrtAdresseControl.name3.value,
            strasse: standOrtAdresseControl.strasse.value,
            strasseNr: standOrtAdresseControl.strasseNr.value,
            plzOrt: standOrtAdresseControl.plz['plzWohnAdresseObject'],
            postfach: +standOrtAdresseControl.postfach.value,
            plzOrtPostfach: standOrtAdresseControl.plzPostfach['plzWohnAdresseObject'],
            land: !!standOrtAdresseControl.land ? standOrtAdresseControl.land['landAutosuggestObject'] : null,
            telefonNr: kontaktDatenControl.telefon.value,
            telefaxNr: kontaktDatenControl.fax.value,
            email: kontaktDatenControl.email.value,
            url: this.mapOnlineFormularToDTO(kontaktDatenControl.url.value),
            korrespName1: korrespondenzAdresseControl.name.value,
            korrespName2: korrespondenzAdresseControl.name2.value,
            korrespName3: korrespondenzAdresseControl.name3.value,
            korrespStrasse: korrespondenzAdresseControl.strasse.value,
            korrespStrasseNr: korrespondenzAdresseControl.strasseNr.value,
            korrespPlzOrt: korrespondenzAdresseControl.plz['plzWohnAdresseObject'],
            korrespPostfach: +korrespondenzAdresseControl.postfach.value,
            korrespPlzOrtPostfach: korrespondenzAdresseControl.plzPostfach['plzWohnAdresseObject'],
            korrespLand: !!korrespondenzAdresseControl.land ? korrespondenzAdresseControl.land['landAutosuggestObject'] : null,
            gemeinde: !!extraInfoControl.bfsNummer && !!extraInfoControl.bfsNummer['autosuggestObject'].nameDe ? extraInfoControl.bfsNummer['autosuggestObject'] : null,
            branche: !!extraInfoControl.branche ? extraInfoControl.branche['branchAutosuggestObj'] : null,
            unternehmenStatus: !!extraInfoControl.status ? this.statusDomain.find(item => item.codeId === +extraInfoControl.status.value) : null // PROVISIONAL
        };
    }

    private getUrl(): string {
        const adressPath = `${this.unternehmenData.nachfolgerId}/adressdaten`;
        const pathDataType = this.activatedRoute.snapshot.parent.data.type;
        let url = `${this.activatedRoute.snapshot.parent.data.navPath}/${pathDataType}/${adressPath}`;

        switch (pathDataType) {
            case 'arbeitgeber':
                url = `${pathDataType}/details/${adressPath}`;
                break;
            case 'fachberatung':
                url = `stes/${pathDataType}/${adressPath}`;
                break;
            default:
                break;
        }
        return url;
    }

    private BSP6(unternehmenData: UnternehmenDTO): boolean {
        return !!unternehmenData.burOrtEinheitObject && !!unternehmenData.burOrtEinheitObject.burOrtEinheitId;
    }

    private BSP29(): boolean {
        return !!this.unternehmenData.burOrtEinheitObject ? this.unternehmenData.burOrtEinheitObject.oeGeloescht : false;
    }

    private isFormValid(): boolean {
        const validForms = this.standOrtAdresseForm.valid && this.korrespondenzAdresseForm.valid && this.kontaktDatenForm.valid && this.extraInfoForm.valid;
        return !!this.extraInfoForm.controls.status.value && (validForms || this.formsDisabled);
    }

    private markAsPristineForms(): void {
        this.standOrtAdresseForm.markAsPristine();
        this.korrespondenzAdresseForm.markAsPristine();
        this.kontaktDatenForm.markAsPristine();
        this.extraInfoForm.markAsPristine();
    }

    private applyDeleteButtonType(): void {
        switch (this.type) {
            case UnternehmenTypes.ARBEITGEBER:
                this.deleteButtonType = 'common.button.arbeitgeberLoeschen';
                this.navigationAddressType = 'arbeitgeber/details/suchen';
                break;
            case UnternehmenTypes.FACHBERATUNG:
                this.deleteButtonType = 'common.button.fachberatungLoeschen';
                this.navigationAddressType = 'stes/fachberatung/suchen';
                break;
            default:
                this.deleteButtonType = 'common.button.anbieterLoeschen';
                this.navigationAddressType = 'amm/anbieter/suchen';
        }
    }

    private updateUnternehmenData(unternehmenData: BaseResponseWrapperUnternehmenResponseDTOWarningMessages) {
        if (unternehmenData.data) {
            this.unternehmenData = unternehmenData.data;
            this.updateFormState();
        }
    }

    private setAdditionalValidation() {
        setTimeout(() => {
            this.standOrtAdresseForm.controls.name.setValidators([Validators.required, Validators.maxLength(32)]);
            this.standOrtAdresseForm.controls.plz.get('postleitzahl').setValidators(TwoFieldsAutosuggestValidator.inputMaxLength(15, 'postleitzahl'));
            this.standOrtAdresseForm.controls.plz.get('ort').setValidators(TwoFieldsAutosuggestValidator.inputMaxLength(40, 'ortDe'));
            this.standOrtAdresseForm.controls.plzPostfach.get('postleitzahl').setValidators(TwoFieldsAutosuggestValidator.inputMaxLength(15, 'postleitzahl'));
            this.standOrtAdresseForm.controls.plzPostfach.get('ort').setValidators(TwoFieldsAutosuggestValidator.inputMaxLength(40, 'ortDe'));
        }, 1000);
    }

    private isAnyFieldFilled(values) {
        return (
            values.name ||
            values.name2 ||
            values.name3 ||
            values.strasse ||
            values.strasseNr ||
            values.land ||
            values.postfach ||
            this.isPlzFieldsFilled(values.plz) ||
            this.isPlzFieldsFilled(values.plzPostfach)
        );
    }

    private isPlzFieldsFilled(plz) {
        return plz.postleitzahl || plz.ort;
    }
}

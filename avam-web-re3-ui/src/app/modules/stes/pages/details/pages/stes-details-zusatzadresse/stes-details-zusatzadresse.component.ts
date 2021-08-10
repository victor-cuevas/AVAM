import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs'; //NOSONAR
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ZusatzadresseFormbuilder } from 'src/app/shared/formbuilders/zusatzadresse.formbuilder';
import { BaseFormBuilder, FormUtilsService, ToolboxService, GenericConfirmComponent } from 'src/app/shared';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { takeUntil } from 'rxjs/operators';

import { DeactivationGuarded } from 'src/app/shared/services/can-deactive-guard.service';
import { DbTranslateService } from '../../../../../../shared/services/db-translate.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { AdressentypCode } from '@app/shared/enums/domain-code/adressentyp-code.enum';
import PrintHelper from '@shared/helpers/print.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { TwoFieldsAutosuggestValidator } from '@app/shared/validators/two-fields-autosuggest-validator';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-details-zusatzadresse',
    templateUrl: './stes-details-zusatzadresse.component.html',
    styleUrls: ['./stes-details-zusatzadresse.component.scss']
})
export class StesDetailsZusatzadresseComponent extends Unsubscribable implements OnInit, OnDestroy, BaseFormBuilder, DeactivationGuarded {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    zusatzadresseForm: FormGroup;
    zusatzadressTypen: any[] = [];
    zusatzadresseFormbuilder: ZusatzadresseFormbuilder;
    stesId: string;
    letzteAktualisierung: any;

    aufenthaltsadresse = false;
    zusatzadresseChannel = 'zusatzadresse';
    aufenthaltsadresseID: number;
    isSaveDisabled: boolean;
    permissions: typeof Permissions = Permissions;

    private dataSubscription: Subscription;
    private valueChangesSubscription: Subscription;
    private observeClickActionSub: Subscription;
    private zusatzadresseToolboxId = 'zusatzadresse';

    constructor(
        private formBuilder: FormBuilder,
        private toolboxService: ToolboxService,
        private readonly notificationService: NotificationService,
        private fehlermeldungenService: FehlermeldungenService,
        private dataService: StesDataRestService,
        private route: ActivatedRoute,
        private readonly modalService: NgbModal,
        private spinnerService: SpinnerService,
        private dbTranslateService: DbTranslateService,
        private resetDialogService: ResetDialogService,
        private facade: FacadeService,
        private stesInfobarService: AvamStesInfoBarService,
        private obliqueHelper: ObliqueHelperService
    ) {
        super();
        SpinnerService.CHANNEL = this.zusatzadresseChannel;
        ToolboxService.CHANNEL = this.zusatzadresseChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;

        this.spinnerService.activate('zusatzadresse');
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesZusatzadresse' });

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.zusatzadresseFormbuilder = new ZusatzadresseFormbuilder(this.formBuilder, this.dbTranslateService);
        this.zusatzadresseForm = this.zusatzadresseFormbuilder.initForm();

        this.toolboxService.sendConfiguration(ToolboxConfig.getDefaultConfig(), this.zusatzadresseToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId));

        this.valueChangesSubscription = this.zusatzadresseForm.valueChanges.subscribe(() => {
            this.isSaveDisabled = this.isFormEmpty();
        });

        this.getData();

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.stesId, AvamCommonValueObjectsEnum.T_STES);
            }
        });
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.observeClickActionSub.unsubscribe();
        this.stesInfobarService.sendLastUpdate({}, true);
        this.isSaveDisabled = false;

        super.ngOnDestroy();

        this.fehlermeldungenService.closeMessage();

        if (this.valueChangesSubscription) {
            this.valueChangesSubscription.unsubscribe();
        }

        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }

    openHistoryModal(objId: string, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    canDeactivate(): boolean {
        return this.zusatzadresseForm.dirty;
    }

    reset() {
        if (this.zusatzadresseForm.dirty) {
            this.resetDialogService.reset(() => {
                this.fehlermeldungenService.closeMessage();
                this.zusatzadresseForm.reset(this.zusatzadresseFormbuilder.mapToForm(this.letzteAktualisierung));
                this.checkKorrespondenzadresse();
                this.isSaveDisabled = this.isFormEmpty();
                this.aufenthaltsadresse = this.zusatzadresseForm.controls.zusatzadressenTypID.value === this.aufenthaltsadresseID;
            });
        }
    }

    isFormEmpty(): boolean {
        return this.zusatzadresseFormbuilder.isFormEmpty(this.zusatzadresseForm);
    }

    save() {
        this.fehlermeldungenService.closeMessage();
        if (this.zusatzadresseForm.valid) {
            if (this.validateKorrespondenzAdresse()) {
                this.spinnerService.activate('zusatzadresse');
                this.dataSubscription = this.dataService
                    .createZusatzadresse(this.stesId, this.zusatzadresseFormbuilder.mapToDTO(this.letzteAktualisierung, this.zusatzadresseForm))
                    .pipe(takeUntil(this.unsubscribe))
                    .subscribe(
                        response => {
                            this.aufenthaltsadresse = response.data && response.data.zusatzadressenTypID === this.aufenthaltsadresseID;
                            this.updateForm(response.data, true);
                            OrColumnLayoutUtils.scrollTop();
                            this.stesInfobarService.sendLastUpdate(response.data);
                        },
                        () => {
                            this.spinnerService.deactivate('zusatzadresse');
                            OrColumnLayoutUtils.scrollTop();
                        }
                    );
            }
        } else {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
        }
    }

    getData() {
        forkJoin(this.dataService.getCode(DomainEnum.ADRESSENTYP), this.dataService.getZusatzadresse(this.stesId)) //NOSONAR
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                ([data, response]) => {
                    this.zusatzadressTypen = this.facade.formUtilsService.mapDropdownKurztext(data);
                    this.aufenthaltsadresseID = Number(this.facade.formUtilsService.getCodeIdByCode(this.zusatzadressTypen, AdressentypCode.AUFENTHALTSADRESSE));
                    if (response.data.zusatzadressenTypID === this.aufenthaltsadresseID) {
                        this.aufenthaltsadresse = true;
                    }
                    this.updateForm(response.data, false);
                    this.stesInfobarService.sendLastUpdate(response.data);
                },
                () => this.spinnerService.deactivate('zusatzadresse')
            );
    }

    updateForm(data: any, onSave: boolean) {
        if (data !== null) {
            this.letzteAktualisierung = data;
            this.zusatzadresseForm.reset(this.zusatzadresseFormbuilder.mapToForm(data));
            if (onSave) {
                this.notificationService.success('common.message.datengespeichert');
            }
        }

        this.checkKorrespondenzadresse();
        this.spinnerService.deactivate('zusatzadresse');
    }

    onLoeschen() {
        this.fehlermeldungenService.closeMessage();
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.loeschenBestaetigen();
            } else {
                this.loeschenAbbrechen();
            }
        });
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    onTextClear(name: string) {
        this.zusatzadresseForm.get(name).setValue('');
    }

    closeModal() {
        this.modalService.dismissAll('dismissAll() called');
    }

    loeschenAbbrechen() {
        this.validateKorrespondenzAdresse();
        this.closeModal();
    }

    loeschenBestaetigen() {
        this.spinnerService.activate('zusatzadresse');
        this.dataSubscription = this.dataService
            .createZusatzadresse(this.stesId, this.zusatzadresseFormbuilder.mapToDTO(this.letzteAktualisierung, null))
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.updateForm(response.data, false);
                    this.aufenthaltsadresse = false;
                    this.notificationService.success('common.message.datengeloescht');
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate('zusatzadresse');
                    OrColumnLayoutUtils.scrollTop();
                }
            );
        this.closeModal();
    }

    validateKorrespondenzAdresse() {
        const herkunftsadresseCode = this.facade.formUtilsService.getCodeIdByCode(this.zusatzadressTypen, AdressentypCode.HERKUNFTSADRESSE);
        if (this.zusatzadresseForm.controls.korrespondenzAdresse.value === true && this.zusatzadresseForm.controls.zusatzadressenTypID.value === herkunftsadresseCode) {
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.herkunftsadressenichtkorreadresse', 'warning');
            return false;
        }

        return true;
    }

    onZusatzadresseTypSelect(event) {
        if (String(event) === String(this.aufenthaltsadresseID)) {
            this.spinnerService.activate('zusatzadresse');
            this.aufenthaltsadresse = true;
            this.dataSubscription = this.dataService
                .getPersonalienBearbeiten(this.stesId)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    personalien => {
                        this.zusatzadresseForm.controls.name.setValue(personalien.data.stesPersonalienDTO.nameAVAM);
                        this.zusatzadresseForm.controls.vorname.setValue(personalien.data.stesPersonalienDTO.vornameAVAM);
                        this.spinnerService.deactivate('zusatzadresse');
                    },
                    () => {
                        this.spinnerService.deactivate('zusatzadresse');
                        OrColumnLayoutUtils.scrollTop();
                    }
                );
        } else {
            this.aufenthaltsadresse = false;
            if (this.letzteAktualisierung) {
                this.zusatzadresseForm.controls.name.setValue(this.letzteAktualisierung.name);
                this.zusatzadresseForm.controls.vorname.setValue(this.letzteAktualisierung.vorname);
            }
        }
    }

    checkKorrespondenzadresse() {
        if (this.zusatzadresseForm.controls.korrespondenzAdresse.value) {
            this.korresponzadresseChecked();
        } else {
            this.korresponzadresseUnchecked();
        }
    }

    korresponzadresseChecked() {
        this.zusatzadresseForm.controls.zusatzadressenTypID.setValidators(Validators.required);
        this.zusatzadresseForm.controls.zusatzadressenTypID.updateValueAndValidity();

        this.zusatzadresseForm.controls.name.setValidators(Validators.required);
        this.zusatzadresseForm.controls.name.updateValueAndValidity();

        this.zusatzadresseForm.controls.vorname.setValidators(Validators.required);
        this.zusatzadresseForm.controls.vorname.updateValueAndValidity();

        const plzGroup = this.zusatzadresseForm.controls.plz as FormGroup;
        plzGroup.get('postleitzahl').setValidators(TwoFieldsAutosuggestValidator.autosuggestRequired('postleitzahl'));
        plzGroup.get('ort').setValidators(TwoFieldsAutosuggestValidator.autosuggestRequired('ort'));
        plzGroup.get('postleitzahl').updateValueAndValidity();
        plzGroup.get('ort').updateValueAndValidity();

        this.zusatzadresseForm.controls.staat.setValidators(Validators.required);
        this.zusatzadresseForm.controls.staat.updateValueAndValidity();
    }

    korresponzadresseUnchecked() {
        this.zusatzadresseForm.controls.zusatzadressenTypID.clearValidators();
        this.zusatzadresseForm.controls.zusatzadressenTypID.updateValueAndValidity();

        this.zusatzadresseForm.controls.name.clearValidators();
        this.zusatzadresseForm.controls.name.updateValueAndValidity();

        this.zusatzadresseForm.controls.vorname.clearValidators();
        this.zusatzadresseForm.controls.vorname.updateValueAndValidity();

        const plzGroup = this.zusatzadresseForm.controls.plz as FormGroup;
        plzGroup.get('postleitzahl').clearValidators();
        plzGroup.get('postleitzahl').updateValueAndValidity();
        plzGroup.get('ort').clearValidators();
        plzGroup.get('ort').updateValueAndValidity();

        this.zusatzadresseForm.controls.staat.clearValidators();
        this.zusatzadresseForm.controls.staat.updateValueAndValidity();
    }
}

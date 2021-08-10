import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permissions } from '@shared/enums/permissions.enum';
import { takeUntil } from 'rxjs/operators';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { UnternehmenErfassenDTO } from '@dtos/unternehmenErfassenDTO';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@core/services/authentication.service';
import { BaseResponseWrapperListUnternehmenResultDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenResultDTOWarningMessages';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';

@Component({
    selector: 'avam-bur-daten-modal',
    templateUrl: './bur-daten-modal.component.html',
    styleUrls: ['./bur-daten-modal.component.scss']
})
export class BurDatenModalComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('ngForm') public ngForm: FormGroupDirective;
    @Input() public selectedBurData;
    @Input() public isErfassen = true;
    public burDatenForm: FormGroup;
    public inputValue;
    public permissions: typeof Permissions = Permissions;
    channel = 'bur-daten-modal-channel';
    alertChannel = AlertChannelEnum;
    isBSP2 = false;
    readonly MODAL_NUMMER = StesFormNumberEnum.BUR_DATEN_MODAL;
    private readonly SCHWEIZ_ISO2CODE = 'CH';
    private readonly BUR_UEBERNEHMEN_FEHLER_BEMERKUNG = 'Das Unternehmen konnte nicht fehlerfrei ins AVAM übernommen werden. Die Daten wurden durch den Benutzer korrigiert.';

    constructor(
        private router: Router,
        private obliqueHelper: ObliqueHelperService,
        private dbTranslateService: DbTranslateService,
        private unternehmenRestService: UnternehmenRestService,
        private notificationService: NotificationService,
        private fehlermeldungenService: FehlermeldungenService,
        private spinnerService: SpinnerService,
        private translateService: TranslateService,
        private authService: AuthenticationService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private wizardService: MeldungenVerifizierenWizardService
    ) {
        super();
    }

    public ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.createModalForm(this.selectedBurData);
        this.setBSP2Subscription();
        this.mapToForm();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public submit() {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        if (!this.burDatenForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger', AlertChannelEnum.MODAL);
        } else {
            this.spinnerService.activate(this.channel);

            this.unternehmenRestService
                .createUnternehmen(this.mapToDTO(this.burDatenForm.controls), false, AlertChannelEnum.MODAL)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (response: BaseResponseWrapperListUnternehmenResultDTOWarningMessages) => {
                        this.spinnerService.deactivate(this.channel);
                        if (!!response && !!response.data) {
                            this.notificationService.success('common.message.datengespeichert');
                            this.modalService.dismissAll();
                            if (this.isErfassen) {
                                this.router.navigate([`${this.router.url.split('/', 3).join('/')}/${response.data}`]);
                            } else {
                                this.wizardService.setOsteEgovAnlegenParamDTO(null);
                                this.wizardService.setUnternehmenId(response.data);
                                this.router.navigate(['../uebernehmen'], {
                                    relativeTo: this.route,
                                    queryParams: { osteEgovId: this.wizardService.osteEgovId, unternehmenId: response.data }
                                });
                            }
                        }
                    },
                    () => this.spinnerService.deactivate(this.channel)
                );
        }
    }

    public close() {
        this.modalService.dismissAll();
    }

    isOrtPlzValidForCH(plz) {
        if (!plz || this.selectedBurData.land.iso2Code !== this.SCHWEIZ_ISO2CODE) {
            return true;
        }
        if (this.selectedBurData.land.iso2Code === this.SCHWEIZ_ISO2CODE && plz.plzId > 0) {
            return true;
        }
        return false;
    }

    private mapToDTO(form): UnternehmenErfassenDTO {
        return {
            unternehmen: {
                burOrtEinheitId: form.burOrtEinheitId.value,
                name1: form.name.value,
                name2: form.name2.value,
                name3: form.name3.value,
                strasse: form.strasse.value,
                strasseNr: form.strasseNr.value,
                plzOrt: form.plz.plzWohnAdresseObject ? form.plz.plzWohnAdresseObject : null,
                plzOrtPostfach: form.plzPostfach.plzWohnAdresseObject ? form.plzPostfach.plzWohnAdresseObject : null,
                postfach: form.postfach.value,
                land: form.land.landAutosuggestObject,
                branche: form.branche.branchAutosuggestObj
            },
            mitteilungAnBFS: this.isBSP2 ? this.BUR_UEBERNEHMEN_FEHLER_BEMERKUNG : form.ergaenzendeAngaben && form.ergaenzendeAngaben.value,
            ansprechpersonDetailId: this.getCurrentUserBenutzerDetailId()
        };
    }

    private createModalForm(burData) {
        this.obliqueHelper.ngForm = this.ngForm;
        this.inputValue = this.formatUID(burData.uidOrganisationIdCategorie, burData.uidOrganisationId);
        this.burDatenForm = this.fb.group(
            {
                burOrtEinheitId: null,
                name: [null, Validators.required],
                name2: null,
                name3: null,
                strasse: null,
                strasseNr: null,
                plz: this.fb.group({
                    postleitzahl: null,
                    ort: null
                }),
                plzPostfach: this.fb.group({
                    postleitzahl: null,
                    ort: null
                }),
                land: [null, Validators.required],
                postfach: burData.postfach,
                branche: [null, Validators.required]
            },
            { validators: TwoFieldsAutosuggestValidator.plzCrossValidator('plz', 'plzPostfach', 'postleitzahl', 'ort', 'postleitzahl', 'ort') }
        );
    }

    private mapToForm() {
        this.burDatenForm.reset({
            burOrtEinheitId: this.selectedBurData.burOrtEinheitId,
            name: this.selectedBurData.name1,
            name2: this.selectedBurData.name2,
            name3: this.selectedBurData.name3,
            strasse: this.selectedBurData.strasse,
            strasseNr: this.selectedBurData.strasseNr,
            plz: {
                postleitzahl: this.selectedBurData.plzOrt,
                ort: this.selectedBurData.plzOrt
            },
            plzPostfach: {
                postleitzahl: this.selectedBurData.plzOrtPostfach,
                ort: this.selectedBurData.plzOrtPostfach
            },
            land: this.selectedBurData.land,
            postfach: this.selectedBurData.postfach,
            branche: this.selectedBurData.branche
        });
    }

    private formatUID(category, uid) {
        return category && uid ? `${category}-${uid.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
    }

    private setBSP2Subscription() {
        this.burDatenForm.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
            this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);

            if (
                !value.name ||
                !this.isOrtPlzValidForCH(value.plz.ort) ||
                !this.isOrtPlzValidForCH(value.plzPostfach.ort) ||
                (!(value.plz.postleitzahl && value.plz.ort) && !(value.plzPostfach.postleitzahl && value.plzPostfach.ort)) ||
                !value.land ||
                !value.branche
            ) {
                this.fehlermeldungenService.showMessage('unternehmen.error.fehlende-data-verwendung', 'danger', AlertChannelEnum.MODAL);
                this.isBSP2 = true;
            }
        });
    }

    private getCurrentUserBenutzerDetailId(): number {
        const currentUser = this.authService.getLoggedUser();
        return +currentUser.benutzerDetailId;
    }
}

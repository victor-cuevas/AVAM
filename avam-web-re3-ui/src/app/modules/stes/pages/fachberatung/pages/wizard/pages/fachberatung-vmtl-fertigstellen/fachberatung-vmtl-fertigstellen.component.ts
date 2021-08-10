import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormUtilsService, GenericConfirmComponent, RoboHelpService, ToolboxService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FachberatungsangebotDetails } from '@app/shared/components/detail-fachberatungsangebot-modal/detail-fachberatungsangebot-modal.component';
import { FachberatungWizardService } from '@app/shared/components/new/avam-wizard/fachberatung-wizard.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { FachberatungPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import PrintHelper from '@app/shared/helpers/print.helper';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FachberatungParamDTO } from '@app/shared/models/dtos-generated/fachberatungParamDTO';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { ZuweisungFachberatungParamDTO } from '@app/shared/models/dtos-generated/zuweisungFachberatungParamDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { DateValidator } from '@app/shared/validators/date-validator';
import { EmailValidator } from '@app/shared/validators/email-validator';
import { PhoneValidator } from '@app/shared/validators/phone-validator';
import { TwoFieldsAutosuggestValidator } from '@app/shared/validators/two-fields-autosuggest-validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Subscription } from 'rxjs';
import { FacadeService } from '@shared/services/facade.service';
@Component({
    selector: 'avam-fachberatung-vmtl-fertigstellen',
    templateUrl: './fachberatung-vmtl-fertigstellen.component.html',
    styleUrls: ['./fachberatung-vmtl-fertigstellen.component.scss']
})
export class FachberatungVmtlFertigstellenComponent implements OnInit, OnDestroy, AfterViewInit {
    stesId: any;
    unternehmenId: number = null;
    anredeOptions = [];
    vermittlungsverantwortungSuchenTokens: {} = {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    vermittlungForm: FormGroup;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('fachberatungsangebotDetailModal') fachberatungsangebotDetailModal: ElementRef;
    @ViewChild('vermittlungsverantwortung') vermittlungsverantwortung: AvamPersonalberaterAutosuggestComponent;

    vermittlungFertigstellenChannel = 'fb-vermittlung-fertigstellen';
    fachberatungVmtlToolboxId = 'fachberatung-vmtl-fertigstellen';

    toolboxClickActionSub: Subscription;
    stesHeader: StesHeaderDTO;
    fachberatungsangebot: FachberatungParamDTO;

    masterLayout = null;

    permissions: typeof Permissions = Permissions;
    constructor(
        private wizardService: FachberatungWizardService,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private obliqueHelper: ObliqueHelperService,
        private formBuilder: FormBuilder,
        private toolboxService: ToolboxService,
        private dbTranslateService: DbTranslateService,
        private dataService: StesDataRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private notificationService: NotificationService,
        private router: Router,
        private facade: FacadeService,
        private resetDialogService: ResetDialogService,
        private readonly modalService: NgbModal,
        private changeDetector: ChangeDetectorRef,
        private stesInfobarService: AvamStesInfoBarService,
        private roboHelpService: RoboHelpService,
        private translateService: TranslateService
    ) {
        SpinnerService.CHANNEL = this.vermittlungFertigstellenChannel;
        ToolboxService.CHANNEL = this.fachberatungVmtlToolboxId;
        this.masterLayout = document.querySelectorAll<HTMLElement>('or-column-layout')[0];
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.vermittlung.fertigstellen' });
        this.setStesId();
        this.createForm();
        this.wizardService.selectCurrentStep(2);
        this.configureToolbox();
        this.toolboxClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.FB_VMTL_FERTIGSTELLEN);
            }
        });
        this.setDefaultValues();
        this.loadData();
    }

    ngAfterViewInit() {
        this.vermittlungsverantwortung.appendCurrentUser();
        this.changeDetector.detectChanges();
    }

    setStesId() {
        this.route.parent.params.subscribe(parentData => {
            if (parentData && parentData['stesId']) {
                this.stesId = parentData['stesId'];
            }
        });
    }

    configureToolbox() {
        const toolboxConfig = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)];
        this.toolboxService.sendConfiguration(toolboxConfig, this.fachberatungVmtlToolboxId, null, false);
    }

    loadData() {
        this.spinnerService.activate(this.vermittlungFertigstellenChannel);

        forkJoin<CodeDTO[], StesHeaderDTO>([
            this.dataService.getCode(DomainEnum.ANREDE),
            this.dataService.getStesHeader(this.stesId.toString(), this.translateService.currentLang)
        ]).subscribe(
            ([dropdownOptions, stesHeader]) => {
                this.stesHeader = stesHeader;
                this.anredeOptions = this.facade.formUtilsService.mapDropdownKurztext(dropdownOptions);

                this.spinnerService.deactivate(this.vermittlungFertigstellenChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.vermittlungFertigstellenChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    setDefaultValues() {
        this.fachberatungsangebot = this.wizardService.getFachberatungsangebot();
        if (this.fachberatungsangebot) {
            this.unternehmenId = this.fachberatungsangebot.unternehmenId;
            this.vermittlungForm.reset(this.mapToForm(this.fachberatungsangebot));
            this.vermittlungForm.controls.land['landAutosuggestObject'] = this.fachberatungsangebot.staat;
        }
    }

    createForm() {
        this.vermittlungForm = this.formBuilder.group({
            vermittlungVom: [new Date(), [Validators.required, DateValidator.dateFormatNgx, DateValidator.dateValidNgx, DateValidator.isDateInFutureNgx]],
            vermittlungsverantwortung: [null, Validators.required],
            beratungsbereich: null,
            bezeichnung: null,
            terminDatum: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            uhrzeit: [null, [DateValidator.val250, DateValidator.val251]],
            ergaenzendeAngaben: null,
            unternehmenName1: [null, Validators.required],
            unternehmenName2: null,
            unternehmenName3: null,
            unternehmenStrasse: null,
            unternehmenStrasseNummer: null,
            postleitzahl: [null, [TwoFieldsAutosuggestValidator.autosuggestRequired('postleitzahl')]],
            ort: [null, TwoFieldsAutosuggestValidator.autosuggestRequired('ortDe')],
            land: [null, Validators.required],
            kontaktpersonForm: this.formBuilder.group({
                kontaktpersonAnredeId: null,
                kontaktpersonName: null,
                kontaktpersonVorname: null,
                kontaktpersonTelefonNr: [null, PhoneValidator.isValidFormatWarning],
                kontaktpersonEmail: [null, EmailValidator.isValidFormat]
            })
        });
    }

    mapToDTO(): ZuweisungFachberatungParamDTO {
        const formControls = this.vermittlungForm.controls;

        const kontaktpersonForm = this.vermittlungForm.controls.kontaktpersonForm as FormGroup;
        const kontaktpersonControls = kontaktpersonForm.controls;
        return {
            stesId: +this.stesId,
            fachberatungsangebotId: this.fachberatungsangebot.fachberatungsangebotId,
            fachberatungId: this.fachberatungsangebot.fachberatungsangebotId,
            zuweisungVonDatum: this.facade.formUtilsService.parseDate(formControls.vermittlungVom.value),
            terminDatum: this.facade.formUtilsService.parseDate(formControls.terminDatum.value),
            terminZeit: this.mapTimeToDTO(formControls.uhrzeit.value),
            ergaenzendeAngaben: formControls.ergaenzendeAngaben.value,
            unternehmenName1: formControls.unternehmenName1.value,
            unternehmenName2: formControls.unternehmenName2.value,
            unternehmenName3: formControls.unternehmenName3.value,
            unternehmenStrasse: formControls.unternehmenStrasse.value,
            unternehmenStrassenNummer: formControls.unternehmenStrasseNummer.value,
            vermittlerDetailObject: formControls.vermittlungsverantwortung['benutzerObject'],
            plzObject: this.vermittlungForm['plzWohnAdresseObject'],
            plzAusland: this.vermittlungForm['plzWohnAdresseObject'].plzWohnadresseAusland,
            postleitOrtAusland: this.vermittlungForm['plzWohnAdresseObject'].ortWohnadresseAusland,
            staatObject: formControls.land['landAutosuggestObject'],
            kontaktpersonAnredeId: +kontaktpersonControls.kontaktpersonAnredeId.value,
            kontaktpersonName: kontaktpersonControls.kontaktpersonName.value,
            kontaktpersonVorname: kontaktpersonControls.kontaktpersonVorname.value,
            kontaktpersonEMail: kontaktpersonControls.kontaktpersonEmail.value,
            kontaktpersonTelefonNr: kontaktpersonControls.kontaktpersonTelefonNr.value
        };
    }

    mapTimeToDTO(value: string): Date {
        if (value) {
            const time = this.facade.formUtilsService.addColonToTimeString(value).split(':', 2);
            const hh = time[0];
            const mm = time[1];
            return moment({ hour: +hh, minute: +mm }).toDate();
        }
        return null;
    }

    mapToForm(data: FachberatungParamDTO) {
        let map = {};

        if (data) {
            map = {
                vermittlungVom: new Date(),
                beratungsbereich: this.dbTranslateService.translate(data.fachberatungsbereichObject, 'text'),
                bezeichnung: data.bezeichnung,
                unternehmenName1: data.name1,
                unternehmenName2: data.name2,
                unternehmenName3: data.name3,
                unternehmenStrasse: data.strasse,
                unternehmenStrasseNummer: data.hausNr,
                postleitzahl: data.plz.plzId ? data.plz : data.plzAusland,
                ort: data.plz.plzId ? data.plz : data.ortAusland,
                land: data.staat,
                kontaktpersonForm: {
                    kontaktpersonAnredeId: data.kpAnredeId,
                    kontaktpersonName: data.kpName,
                    kontaktpersonVorname: data.kpVorname,
                    kontaktpersonTelefonNr: data.kpTelefon,
                    kontaktpersonEmail: data.kpEmail
                }
            };
        }

        return map;
    }

    openDetails() {
        this.masterLayout.style.visibility = 'hidden';
        this.modalService
            .open(this.fachberatungsangebotDetailModal, { ariaLabelledBy: 'infotags-basic-title', windowClass: 'modal-md', centered: true, backdrop: 'static' })
            .result.then(
                () => {
                    this.masterLayout.style.visibility = 'visible';
                },
                () => {
                    this.masterLayout.style.visibility = 'visible';
                }
            );
    }

    setLand(value) {
        this.vermittlungForm.get('land').setValue(value);
    }

    getFachberatungsangebotDetails(): FachberatungsangebotDetails {
        return {
            fachberatungsbereichObject: this.fachberatungsangebot.fachberatungsbereichObject,
            bezeichnung: this.fachberatungsangebot.bezeichnung,
            angebotsNr: this.fachberatungsangebot.angebotsNr,
            zielpublikum: this.fachberatungsangebot.zielpublikum,
            initialisierung: this.fachberatungsangebot.initialisierung,
            leistung: this.fachberatungsangebot.leistung
        };
    }

    cancel() {
        this.wizardService.navigateZuwFachberatungen();
    }

    back() {
        this.wizardService.navigateStep2();
    }

    processSave() {
        if (this.wizardService.getIdentischeZuweisungVorhanden()) {
            this.openModal(GenericConfirmComponent, 'modal-basic-title');
            return;
        }

        this.save();
    }

    save() {
        this.fehlermeldungenService.closeMessage();

        if (!this.vermittlungForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }
        this.spinnerService.activate(this.vermittlungFertigstellenChannel);

        this.dataService.createZuweisungFachberatung(this.mapToDTO(), this.dbTranslateService.getCurrentLang()).subscribe(
            response => {
                if (response.data) {
                    this.vermittlungForm.markAsPristine();
                    this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                    const fachberatungId = response.data.zuweisungStesFachberatungId;

                    this.router.navigate([`stes/details/${this.stesId}/${FachberatungPaths.FACHBERATUNG_BEARBEITEN}`], { queryParams: { fachberatungId } });
                }
                this.spinnerService.deactivate(this.vermittlungFertigstellenChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                this.spinnerService.deactivate(this.vermittlungFertigstellenChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    reset() {
        if (this.vermittlungForm.dirty) {
            this.resetDialogService.reset(() => {
                this.vermittlungForm.reset(this.mapToForm(this.fachberatungsangebot));
                this.vermittlungsverantwortung.appendCurrentUser();
            });
        }
    }

    openModal(content, windowClass) {
        const modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass, backdrop: 'static' });
        modalRef.result.then(
            result => {
                if (result) {
                    this.save();
                }
            },
            reason => {
                ToolboxService.CHANNEL = this.fachberatungVmtlToolboxId;
            }
        );
        modalRef.componentInstance.promptLabel = 'stes.message.zuweisungfb.identischezuweisungvorhanden';
        modalRef.componentInstance.primaryButton = 'common.button.ok';
        modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
    }

    canDeactivate() {
        return this.vermittlungForm.dirty;
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.fehlermeldungenService.closeMessage();
        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }
    }
}

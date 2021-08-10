import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DmsService, FormUtilsService, RoboHelpService, ToolboxService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { KollektiveAmmCode } from '@app/shared/enums/domain-code/kollektive-amm-code.enum';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DmsContextSensitiveDossierDTO } from '@app/shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { AmmValidators } from '@app/shared/validators/amm-validators';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { PsakFormHandler } from '../../../psak-bearbeiten/psak-form-handler';
import { takeUntil } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-massnahme-buchen',
    templateUrl: './massnahme-buchen.component.html',
    styleUrls: ['./massnahme-buchen.component.scss'],
    providers: [PsakFormHandler]
})
export class MassnahmeBuchenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    channel = 'massnahme-buchen';
    durchfuehrungsLabel = 'amm.massnahmen.label.durchfuehrungsnr';
    unternehmenLabel = 'amm.massnahmen.label.anbieter';

    clearCheckboxes = true;

    bearbeiterSuchenTokens: {};

    verfuegbarkeitOptions = [];
    verfuegbarkeitDTOs: CodeDTO[];
    statusOptions = [];
    statusDTOs: CodeDTO[];

    buchungParam: AmmBuchungParamDTO;
    massnahmeBuchenForm: FormGroup;
    gfId = 0;
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    buttons: Subject<any[]> = new Subject();

    showAvailabilityWarningMornings = false;
    showAvailabilityWarningAfternoons = false;
    verfuegbarkeitMornings = [];
    verfuegbarkeitAfternoons = [];

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    get stesId() {
        return this.wizardService.getStesId();
    }

    get massnahmeId() {
        return this.wizardService.getMassnahmeId();
    }

    get massnahmeTyp() {
        return this.wizardService.getMassnahmeCode();
    }

    constructor(
        private wizardService: MassnahmeBuchenWizardService,
        private stesDataService: StesDataRestService,
        private ammRestService: AmmRestService,
        private dbTranslateService: DbTranslateService,
        private facade: FacadeService,
        private obliqueHelper: ObliqueHelperService,
        private translateService: TranslateService,
        private toolboxService: ToolboxService,
        private stesInfobarService: AvamStesInfoBarService,
        private roboHelpService: RoboHelpService,
        private resetDialogService: ResetDialogService,
        private fehlermeldungenService: FehlermeldungenService,
        private dmsService: DmsService,
        private router: Router,
        private psakFormHandler: PsakFormHandler,
        private ammHelper: AmmHelper,
        private notificationService: NotificationService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
        ToolboxService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.configureToolbox();
        this.subscribeToToolbox();
        this.massnahmeBuchenForm = this.psakFormHandler.createFormGroup();
        this.subscribeWizardToFormChanges();
        this.getData();
        this.subscribeToLangChange();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.channel, undefined, false);
    }

    subscribeToToolbox() {
        this.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    window.print();
                }
                if (action.message.action === ToolboxActionEnum.HELP) {
                    this.roboHelpService.help(StesFormNumberEnum.MASSNAHME_BUCHEN);
                }
            });
    }

    subscribeToLangChange() {
        this.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            const zeitplanObject = this.ammHelper.getAmmBuchung(this.buchungParam)['zeitplanObject'];
            this.massnahmeBuchenForm.patchValue({
                ergaenzendeAngaben: this.buchungParam.ergaenzendeAngaben ? this.dbTranslateService.translateWithOrder(this.buchungParam.ergaenzendeAngaben, 'name') : null,
                taetigkeit: this.buchungParam.taetigkeit ? this.buchungParam.taetigkeit : null,
                arbeitszeiten: this.buchungParam.zeitplanObject ? this.dbTranslateService.translateWithOrder(this.buchungParam.zeitplanObject, 'arbeitszeit') : null,
                abfederung: this.buchungParam.sozialeAbfederung ? this.dbTranslateService.instant('i18n.common.yes') : this.dbTranslateService.instant('i18n.common.no'),
                arbeitszeitenBuchung: zeitplanObject ? this.dbTranslateService.translateWithOrder(zeitplanObject, 'arbeitszeit') : null
            });
            const ueberschrift = this.getUeberschrift(this.dbTranslateService.translateWithOrder(this.buchungParam.titel, 'name'));
            this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
        });
    }

    getUeberschrift(titel: string): string {
        const massnahmenLabel = this.translateService.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.massnahmeTyp).label);

        return `${this.translateService.instant('amm.massnahmen.label.massnahmeBuchen')} - ${this.translateService.instant(
            'amm.nutzung.label.buchung'
        )} ${massnahmenLabel} ${titel} ${this.translateService.instant('amm.nutzung.alttext.erfassen')}`;
    }

    getData() {
        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        forkJoin(
            this.stesDataService.getCode(DomainEnum.VERFUEGBARKEITAMM),
            this.ammRestService.getBuchungsStati(this.gfId, this.massnahmeTyp),
            this.ammRestService.getAmmBuchungParam(null, this.massnahmeTyp, this.stesId, this.massnahmeId),
            this.ammRestService.getAmmBuchungButtons(this.massnahmeId, this.massnahmeTyp, this.stesId.toString(), this.gfId)
        ).subscribe(
            ([verfuegbarkeit, status, kollektiveBuchung, ammBuchungButtons]) => {
                this.verfuegbarkeitOptions = verfuegbarkeit
                    ? this.facade.formUtilsService.mapDropdownKurztext(verfuegbarkeit).filter(el => el.code !== VerfuegbarkeitAMMCodeEnum.UNTERSCHIEDLICH)
                    : [];
                this.verfuegbarkeitDTOs = verfuegbarkeit;
                this.massnahmeBuchenForm
                    .get('anwesenheitGroup')
                    .setValidators([
                        AmmValidators.requiredWeekDays(
                            'anwesenheitVormittags',
                            'anwesenheitNachmittags',
                            'anwesenheit',
                            this.facade.formUtilsService.getCodeIdByCode(this.verfuegbarkeitOptions, VerfuegbarkeitAMMCodeEnum.WOCHENPLAN)
                        ),
                        AmmValidators.check289and290('anwesenheitVormittags', 'anwesenheitNachmittags', 'beschaeftigungsgrad', 'beschaeftigungsgradMax')
                    ]);
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(status.data);
                this.statusDTOs = status.data;
                if (kollektiveBuchung.data) {
                    this.buchungParam = kollektiveBuchung.data;
                    this.clearCheckboxes = false;
                    this.massnahmeBuchenForm.reset(this.mapToForm(kollektiveBuchung.data));
                    this.validateAvailability();
                    const buchungObject = this.ammHelper.getAmmBuchung(kollektiveBuchung.data);
                    const ownerId = buchungObject ? buchungObject.ownerId : null;
                    this.bearbeiterSuchenTokens = this.psakFormHandler.getBearbeiterSuchenTokens(ownerId);
                    //check BSP1/BSP2
                    if (kollektiveBuchung.data.apkPraktikumsstelleVerwalten) {
                        this.massnahmeBuchenForm.patchValue({ durchfuehrungsnr: kollektiveBuchung.data.beschaeftigungseinheitId });
                        this.durchfuehrungsLabel = kollektiveBuchung.data.ammBuchungArbeitsplatzkategorie
                            ? 'amm.massnahmen.label.arbeitsplatzkategorie.nummer'
                            : 'amm.massnahmen.label.praktikumsstelle.nummer';
                    }
                    //check BSP3
                    this.unternehmenLabel = buchungObject['buchungAufPraktikumsstelle'] ? 'amm.massnahmen.label.arbeitgeber' : this.unternehmenLabel;
                    const ueberschrift = this.getUeberschrift(this.dbTranslateService.translateWithOrder(kollektiveBuchung.data.titel, 'name'));
                    this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
                }
                //set default bearbeitung
                this.bearbeitung.appendCurrentUser();
                this.buttons.next(ammBuchungButtons.data);
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel, false);
            },
            error => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
            }
        );
    }

    mapToForm(kollektiveBuchung: AmmBuchungParamDTO) {
        const buchungObject = this.ammHelper.getAmmBuchung(kollektiveBuchung);

        return {
            ergaenzendeAngaben: kollektiveBuchung.ergaenzendeAngaben ? this.dbTranslateService.translateWithOrder(kollektiveBuchung.ergaenzendeAngaben, 'name') : null,
            taetigkeit: this.buchungParam.taetigkeit ? this.buchungParam.taetigkeit : null,
            durchfuehrungsnr: kollektiveBuchung.durchfuehrungsId,
            verfuegbarkeit: this.psakFormHandler.getVerfugbarkeitId(kollektiveBuchung.zeitplanObject),
            vormittags: this.psakFormHandler.setVormittags(kollektiveBuchung.zeitplanObject),
            nachmittags: this.psakFormHandler.setNachmittags(kollektiveBuchung.zeitplanObject),
            arbeitszeiten: kollektiveBuchung.zeitplanObject ? this.dbTranslateService.translateWithOrder(kollektiveBuchung.zeitplanObject, 'arbeitszeit') : null,
            abfederung: kollektiveBuchung.sozialeAbfederung ? this.dbTranslateService.instant('i18n.common.yes') : this.dbTranslateService.instant('i18n.common.no'),
            vorstellungsgespraech: kollektiveBuchung.vorstellungsgespraechTest,
            anbieter: kollektiveBuchung.unternehmenObject,
            massnahmenverantwortung: kollektiveBuchung.benutzerDetailDTO,
            buchungsnr: this.psakFormHandler.getBuchungsNr(buchungObject),
            //default values
            dateRangeGroup: {
                durchfuehrungVon: this.facade.formUtilsService.parseDate(kollektiveBuchung.gueltigVon),
                durchfuehrungBis: this.facade.formUtilsService.parseDate(kollektiveBuchung.gueltigBis)
            },
            anwesenheitGroup: {
                anwesenheit: this.psakFormHandler.getVerfugbarkeitId(kollektiveBuchung.zeitplanObject),
                anwesenheitVormittags: this.psakFormHandler.setVormittags(kollektiveBuchung.zeitplanObject),
                anwesenheitNachmittags: this.psakFormHandler.setNachmittags(kollektiveBuchung.zeitplanObject),
                beschaeftigungsgrad: kollektiveBuchung.beschaeftigungsgradMax,
                beschaeftigungsgradMax: kollektiveBuchung.beschaeftigungsgradMax
            },
            arbeitszeitenBuchung: kollektiveBuchung.zeitplanObject ? this.dbTranslateService.translateWithOrder(kollektiveBuchung.zeitplanObject, 'arbeitszeit') : null,
            status: this.facade.formUtilsService.getCodeIdByCode(this.statusOptions, KollektiveAmmCode.geprueft)
        };
    }

    onDMSClick() {
        this.fehlermeldungenService.closeMessage();

        const reqDto: DmsContextSensitiveDossierDTO = {
            documentId: this.buchungParam.massnahmeId,
            stesId: this.stesId,
            uiNumber: StesFormNumberEnum.MASSNAHME_BUCHEN,
            language: this.dbTranslateService.getCurrentLang()
        };

        this.dmsService.openDMSWindowWithParams(reqDto);
    }

    cancel() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    onReset() {
        if (this.massnahmeBuchenForm.dirty) {
            this.resetDialogService.reset(() => {
                this.massnahmeBuchenForm.reset(this.mapToForm(this.buchungParam));
                this.bearbeitung.appendCurrentUser();
            });
        }
    }

    back() {
        this.wizardService.movePrev();
    }

    onSave() {
        if (!this.massnahmeBuchenForm.controls.bearbeitung.value) {
            this.bearbeitung.appendCurrentUser();
        }

        this.fehlermeldungenService.closeMessage();

        if (!this.massnahmeBuchenForm.valid) {
            this.ngForm.onSubmit(undefined);
            this.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            OrColumnLayoutUtils.scrollTop();
            return;
        }

        this.wizardService.activateSpinnerAndDisableWizard(this.channel);
        this.ammRestService
            .saveBuchungPsAk(
                this.stesId,
                this.massnahmeTyp,
                this.massnahmeId,
                null,
                this.dbTranslateService.getCurrentLang(),
                this.psakFormHandler.mapToDTO(this.massnahmeBuchenForm, this.buchungParam, this.statusDTOs, this.verfuegbarkeitDTOs)
            )
            .subscribe(
                response => {
                    if (response.data) {
                        this.massnahmeBuchenForm.markAsPristine();
                        this.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
                        this.wizardService.isDirty.buchung = false;

                        const buchungObject = this.ammHelper.getAmmBuchung(response.data);
                        if (buchungObject && buchungObject.ammGeschaeftsfallObject && buchungObject.ammGeschaeftsfallObject.allAmmEntscheid.length) {
                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.PSAK_BUCHUNG.replace(':type', this.massnahmeTyp)}`], {
                                queryParams: {
                                    gfId: buchungObject.ammGeschaeftsfallId,
                                    entscheidId: buchungObject.ammGeschaeftsfallObject.allAmmEntscheid[0].ammEntscheidId
                                },
                                state: { warningMessages: response.warning }
                            });
                        }
                    }

                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                },
                error => {
                    this.wizardService.deactivateSpinnerAndEnableWizard(this.channel);
                    this.notificationService.error(this.translateService.instant('common.message.datennichtgespeichert'));
                }
            );
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.fehlermeldungenService.closeMessage();
        this.toolboxService.sendConfiguration([]);
    }

    private validateAvailability() {
        const anwesenheitGroup = this.massnahmeBuchenForm.get('anwesenheitGroup') as FormGroup;
        this.verfuegbarkeitMornings = this.psakFormHandler.setVormittags(this.buchungParam.zeitplanObject);
        this.verfuegbarkeitAfternoons = this.psakFormHandler.setNachmittags(this.buchungParam.zeitplanObject);
        anwesenheitGroup.get('anwesenheitVormittags').valueChanges.subscribe((value: boolean[]) => {
            this.showAvailabilityWarningMornings = value.some((element, index) => element && !this.verfuegbarkeitMornings[index]);
        });
        anwesenheitGroup.get('anwesenheitNachmittags').valueChanges.subscribe((value: boolean[]) => {
            this.showAvailabilityWarningAfternoons = value.some((element, index) => element && !this.verfuegbarkeitAfternoons[index]);
        });
    }

    private subscribeWizardToFormChanges() {
        this.wizardService.isDirty.buchung = this.massnahmeBuchenForm.dirty;
        this.massnahmeBuchenForm.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.wizardService.isDirty.buchung = this.massnahmeBuchenForm.dirty;
        });
    }
}

import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { DmsService, ToolboxService, RoboHelpService } from '@app/shared';
import { Subscription, Subject, forkJoin } from 'rxjs';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { MassnahmeBuchenWizardService } from '@app/shared/components/new/avam-wizard/massnahme-buchen-wizard.service';
import { DmsContextSensitiveDossierDTO } from '@app/shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { Router } from '@angular/router';
import { AmmButtonsTypeEnum } from '@app/shared/enums/amm-buttons-type.enum';
import { BaseResponseWrapperCollectionIntegerWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperCollectionIntegerWarningMessages';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { BaseResponseWrapperListCodeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListCodeDTOWarningMessages';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { ToolboxDataHelper } from '@app/shared/components/toolbox/toolbox-data.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { KursKollectiveFormHandler } from '../../../kurs-kollektiv-bearbeiten/kurs-kollectiv-form-handler';
import { AMMPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { AmmBuchungSessionDTO } from '@app/shared/models/dtos-generated/ammBuchungSessionDTO';
import { AmmBuchungPraktikumsstelleDTO } from '@app/shared/models/dtos-generated/ammBuchungPraktikumsstelleDTO';
import { AmmBuchungArbeitsplatzkategorieDTO } from '@app/shared/models/dtos-generated/ammBuchungArbeitsplatzkategorieDTO';
import {
    BenutzerAutosuggestType,
    AvamPersonalberaterAutosuggestComponent
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { takeUntil } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-buchung-erfassen',
    templateUrl: './buchung-erfassen.component.html',
    styleUrls: ['./buchung-erfassen.component.scss'],
    providers: [KursKollectiveFormHandler]
})
export class BuchungErfassenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('bearbeitung') bearbeitung: AvamPersonalberaterAutosuggestComponent;

    kollektiveBuchungForm: FormGroup;
    verfuegbarkeitOptions = [];
    clearCheckboxes = true;
    durchfuehrungskriteriumOptions = [];
    bearbeiterSuchenTokens: {};
    statusOptions = [];
    spinnerChannel = 'kollektiveBuchungChannel';
    kollektiveBuchungToolbox = 'kollektiveBuchungToolbox';
    lastData: AmmBuchungParamDTO;
    gfId = 0;
    ammButtonsTypeEnum = AmmButtonsTypeEnum;
    validationSub: Subscription;

    showFertigstellen: boolean;
    statiData: CodeDTO[];

    buttons: Subject<any[]> = new Subject();
    buchungObject: AmmBuchungSessionDTO | AmmBuchungPraktikumsstelleDTO | AmmBuchungArbeitsplatzkategorieDTO;

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
        private ammDataService: AmmRestService,
        private dmsService: DmsService,
        private router: Router,
        private obliqueHelper: ObliqueHelperService,
        private roboHelpService: RoboHelpService,
        private translate: TranslateService,
        private stesInfobarService: AvamStesInfoBarService,
        private formHandler: KursKollectiveFormHandler,
        private ammHelper: AmmHelper,
        private facade: FacadeService
    ) {
        super();
        SpinnerService.CHANNEL = this.spinnerChannel;
        ToolboxService.CHANNEL = this.kollektiveBuchungToolbox;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.kollektiveBuchungForm = this.formHandler.createForm();
        this.formHandler.getBearbeiterSearchTokens();
        this.subscribeWizardToFormChanges();
        this.getData();
        this.configureToolbox();
        this.subscribeToToolbox();
        this.subscribeToLangChange();
        this.validationSub = this.formHandler.subscribeToValGroup(this.kollektiveBuchungForm.controls.validationGroup as FormGroup);
    }

    setUeberschrift(titel: string): string {
        const massnahmenLabel = this.translate.instant(AmmHelper.ammMassnahmenToLabel.find(e => e.code === this.massnahmeTyp).label);

        return `${this.translate.instant('amm.massnahmen.label.massnahmeBuchen')} - ${this.translate.instant('amm.nutzung.label.buchung')}
        ${massnahmenLabel} ${titel} ${this.translate.instant('amm.nutzung.alttext.erfassen')}`;
    }

    subscribeToLangChange() {
        this.translate.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            const ueberschrift = this.setUeberschrift(this.facade.dbTranslateService.translateWithOrder(this.lastData.titel, 'name'));
            this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
        });
    }

    onDMSClick() {
        this.facade.fehlermeldungenService.closeMessage();
        const reqDto: DmsContextSensitiveDossierDTO = {
            documentId: this.lastData.massnahmeId,
            stesId: this.stesId,
            uiNumber: StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_KOLLEKTIV,
            language: this.facade.dbTranslateService.getCurrentLang()
        };

        this.dmsService.openDMSWindowWithParams(reqDto);
    }

    getData() {
        this.wizardService.activateSpinnerAndDisableWizard(this.spinnerChannel);

        forkJoin<BaseResponseWrapperAmmBuchungParamDTOWarningMessages, BaseResponseWrapperListCodeDTOWarningMessages, BaseResponseWrapperCollectionIntegerWarningMessages>([
            this.ammDataService.getAmmBuchungParam(null, this.massnahmeTyp, this.stesId, this.massnahmeId),
            this.ammDataService.getBuchungsStati(this.gfId, this.massnahmeTyp),
            this.ammDataService.getAmmBuchungButtons(this.massnahmeId, this.massnahmeTyp, this.stesId.toString(), this.gfId)
        ]).subscribe(
            ([buchung, stati, buttons]) => {
                const verfuegbarkeit = [buchung.data.zeitplanObject.verfuegbarkeitObject];
                this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdownKurztext(verfuegbarkeit);

                const kriterium = [buchung.data.durchfuehrungskriteriumObject];
                this.durchfuehrungskriteriumOptions = this.facade.formUtilsService.mapDropdownKurztext(kriterium);
                this.lastData = buchung.data;
                this.statiData = stati.data;
                this.statusOptions = this.facade.formUtilsService.mapDropdownKurztext(stati.data);
                this.clearCheckboxes = false;
                this.kollektiveBuchungForm.patchValue(this.formHandler.mapToForm(buchung.data, false));
                this.buchungObject = this.ammHelper.getAmmBuchung(this.lastData);
                this.bearbeiterSuchenTokens = this.formHandler.getBearbeiterSearchTokens(this.buchungObject.ownerId);
                this.bearbeitung.appendCurrentUser();
                this.buttons.next(buttons.data);

                const ueberschrift = this.setUeberschrift(this.facade.dbTranslateService.translateWithOrder(buchung.data.titel, 'name'));
                this.stesInfobarService.sendDataToInfobar({ title: ueberschrift });
                this.showFertigstellen = this.shouldDisplayFertigstellen(buchung.data);

                this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel, false);
            },
            () => {
                this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
            }
        );
    }

    shouldDisplayFertigstellen(data: AmmBuchungParamDTO) {
        const teilnehmer = data.maxTeilnehmer - data.anzahlTeilnehmer;
        const ueberbuchungen = data.maxUeberbuchungen - data.anzahlUeberbuchungen;
        const wartelisteplaetze = data.maxWartelisteplaetze - data.wartelisteplaetze;

        if (teilnehmer + ueberbuchungen + wartelisteplaetze > 0) {
            return true;
        }
        return false;
    }

    subscribeToToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.kollektiveBuchungToolbox)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    window.print();
                }
                if (action.message.action === ToolboxActionEnum.HELP) {
                    this.roboHelpService.help(StesFormNumberEnum.MASSNAHME_BUCHEN_KURS_KOLLEKTIV);
                }
            });
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.kollektiveBuchungToolbox, ToolboxDataHelper.createStesData(null, null, this.stesId.toString()), false);
    }

    movePrevious() {
        this.wizardService.movePrev();
    }

    cancel() {
        this.ammHelper.navigateAmmUebersicht(this.stesId);
    }

    onReset() {
        if (this.kollektiveBuchungForm.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.clearCheckboxes = false;
                this.kollektiveBuchungForm.reset(this.formHandler.mapToForm(this.lastData, false));
                this.bearbeitung.appendCurrentUser();
            });
        }
    }

    onSave() {
        this.wizardService.activateSpinnerAndDisableWizard(this.spinnerChannel);
        this.facade.fehlermeldungenService.closeMessage();

        if (!this.kollektiveBuchungForm.controls.bearbeitung.value) {
            this.bearbeitung.appendCurrentUser();
        }

        if (this.kollektiveBuchungForm.valid) {
            this.ammDataService
                .saveKollektivKurs(
                    this.stesId,
                    this.massnahmeTyp,
                    this.massnahmeId,
                    null,
                    this.facade.dbTranslateService.getCurrentLang(),
                    this.formHandler.mapToDTO(this.kollektiveBuchungForm, this.lastData, this.statiData)
                )
                .subscribe(
                    response => {
                        if (response.data && response.data.ammBuchungSession && response.data.ammBuchungSession.ammGeschaeftsfallObject) {
                            this.kollektiveBuchungForm.markAsPristine();
                            this.facade.notificationService.success(this.translate.instant('common.message.datengespeichert'));
                            this.wizardService.isDirty.buchung = false;

                            this.router.navigate([`stes/details/${this.stesId}/${AMMPaths.KOLLEKTIV_BUCHUNG.replace(':type', this.massnahmeTyp)}`], {
                                queryParams: {
                                    gfId: response.data.ammBuchungSession.ammGeschaeftsfallId,
                                    entscheidId: response.data.ammBuchungSession.ammGeschaeftsfallObject.allAmmEntscheid[0].ammEntscheidId
                                },
                                state: { warnings: response.warning }
                            });
                        }

                        this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
                    },
                    () => {
                        this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
                        this.facade.notificationService.error(this.translate.instant('common.message.datennichtgespeichert'));
                    }
                );
        } else {
            this.ngForm.onSubmit(undefined);
            this.facade.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.wizardService.deactivateSpinnerAndEnableWizard(this.spinnerChannel);
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        if (this.validationSub) {
            this.validationSub.unsubscribe();
        }
        this.facade.toolboxService.sendConfiguration([]);
        this.facade.fehlermeldungenService.closeMessage();
    }

    private subscribeWizardToFormChanges() {
        this.wizardService.isDirty.buchung = this.kollektiveBuchungForm.dirty;
        this.kollektiveBuchungForm.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.wizardService.isDirty.buchung = this.kollektiveBuchungForm.dirty;
        });
    }
}

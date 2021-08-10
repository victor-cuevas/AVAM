import { SessionDTO } from '@dtos/sessionDTO';
import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BewKursGrunddatenHandlerService } from './bew-kurs-grunddaten-handler.service';
import { BewKursGrunddatenReactiveFormsService } from './bew-kurs-grunddaten-reactive-forms.service';
import { BewKursGrunddatenFormModeService } from './bew-kurs-grunddaten-form-mode.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { SessionStatusCodeEnum } from '@app/shared/enums/domain-code/session-status-code.enum';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { DropdownOption } from '@shared/services/forms/form-utils.service';
import { FacadeService } from '@app/shared/services/facade.service';

export interface BewirtschaftungKursGrunddatenData {
    grunddatenDto: SessionDTO;
    erfassungsspracheOptions: CodeDTO[];
    verfuegbarkeitAmmOptions: CodeDTO[];
    durchfuehrungskriteriumOptions: CodeDTO[];
    sessionStatusOptions: CodeDTO[];
    erfassungsspracheIdGrunddatenState?: number;
}

@Component({
    selector: 'avam-bew-kurs-grunddaten-form',
    templateUrl: './bew-kurs-grunddaten-form.component.html',
    providers: [BewKursGrunddatenHandlerService, BewKursGrunddatenReactiveFormsService, BewKursGrunddatenFormModeService, ObliqueHelperService]
})
export class BewKursGrunddatenFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input('grunddatenData') grunddatenData: BewirtschaftungKursGrunddatenData = null;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    modeSubscription: Subscription;
    currentFormMode: FormModeEnum;
    erfassungsspracheOptions: DropdownOption[] = [];
    statusOptions: DropdownOption[] = [];
    verfuegbarkeitOptions: DropdownOption[] = [];
    durchfuehrungskriteriumOptions: DropdownOption[] = [];
    displayGermanElements = false;
    displayFrenchElements = false;
    displayItalianElements = false;
    clearCheckboxes = true;
    isKursInPlanungAkquisitionSichtbarReadonly: boolean;
    isMassnahmeKollektiv = true;
    hasBuchungen: boolean;
    statusBeendetAbgesagtAbgeschlossen: boolean;
    statusLaeuft: boolean;
    statusFreigegebenLaeuft: boolean;
    statusNotPendent: boolean;
    statusAbgeschlossen: boolean;

    constructor(
        private router: ActivatedRoute,
        private reactiveFormsService: BewKursGrunddatenReactiveFormsService,
        private facade: FacadeService,
        public handler: BewKursGrunddatenHandlerService,
        public formMode: BewKursGrunddatenFormModeService,
        private obliqueHelperService: ObliqueHelperService
    ) {
        this.formGroup = handler.reactiveForms.grunddatenForm;
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;

        this.router.data.subscribe(data => {
            this.formMode.changeMode(data.mode);
        });

        this.modeSubscription = this.formMode.mode$.subscribe(currentMode => {
            this.currentFormMode = currentMode;
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.grunddatenData.currentValue && this.grunddatenData.grunddatenDto) {
            this.prepareMask(this.grunddatenData);
            this.clearCheckboxes = false;
            this.formGroup.reset(this.handler.mapToForm(this.grunddatenData));

            if (this.currentFormMode === FormModeEnum.CREATE && !this.grunddatenData.grunddatenDto.durchfuehrungsId) {
                this.reactiveFormsService.setDefaultValues(this.grunddatenData);
            }
        }
    }

    prepareMask(grunddatenData: BewirtschaftungKursGrunddatenData) {
        this.mapData(grunddatenData);
        this.setReadonlyFields(grunddatenData.grunddatenDto);
        this.reactiveFormsService.setValidatorsOnDurchfuehrungVonBis(grunddatenData.grunddatenDto);
        this.reactiveFormsService.setRequiredWeekdays(grunddatenData.verfuegbarkeitAmmOptions);
    }

    mapData(grunddatenData: BewirtschaftungKursGrunddatenData) {
        this.erfassungsspracheOptions = this.facade.formUtilsService.mapDropdown(grunddatenData.erfassungsspracheOptions.filter(item => item.code !== SpracheEnum.RAETOROMANISCH));
        this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdown(grunddatenData.verfuegbarkeitAmmOptions);
        this.durchfuehrungskriteriumOptions = this.facade.formUtilsService.mapDropdown(grunddatenData.durchfuehrungskriteriumOptions);
        this.statusOptions = this.facade.formUtilsService.mapDropdown(
            grunddatenData.sessionStatusOptions.filter(this.filteringPredicate(grunddatenData.grunddatenDto.statusObject.code))
        );
    }

    onLanguageDropdownChange(selectedLangCodeId) {
        if (selectedLangCodeId) {
            const selectedLangCode = this.facade.formUtilsService.getCodeByCodeId(this.erfassungsspracheOptions, selectedLangCodeId);
            this.displayGermanElements = selectedLangCode === SpracheEnum.DEUTSCH;
            this.displayFrenchElements = selectedLangCode === SpracheEnum.FRANZOESISCH;
            this.displayItalianElements = selectedLangCode === SpracheEnum.ITALIENISCH;
        }
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.handler.mapToForm(this.grunddatenData));

                if (this.currentFormMode === FormModeEnum.CREATE && !this.grunddatenData.grunddatenDto.durchfuehrungsId) {
                    this.reactiveFormsService.setDefaultValues(this.grunddatenData);
                }
            });
        }
    }

    mapToDTO(): SessionDTO {
        return this.handler.mapToDTO(
            this.grunddatenData.grunddatenDto,
            this.grunddatenData.verfuegbarkeitAmmOptions,
            this.grunddatenData.sessionStatusOptions,
            this.durchfuehrungskriteriumOptions
        );
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }

    private setReadonlyFields(grunddatenDto: SessionDTO) {
        if (this.currentFormMode === FormModeEnum.CREATE) {
            this.isKursInPlanungAkquisitionSichtbarReadonly = !grunddatenDto.massnahmeObject.inPlanungAkquisitionSichtbar;
        } else if (this.currentFormMode === FormModeEnum.EDIT) {
            this.isMassnahmeKollektiv = grunddatenDto.massnahmeObject.zulassungstypObject.code === AmmZulassungstypCode.KOLLEKTIV;
            this.hasBuchungen = grunddatenDto.anzahlBuchungen > 0;
            this.statusBeendetAbgesagtAbgeschlossen =
                grunddatenDto.statusObject.code === SessionStatusCodeEnum.BEENDET ||
                grunddatenDto.statusObject.code === SessionStatusCodeEnum.ABGESAGT ||
                grunddatenDto.statusObject.code === SessionStatusCodeEnum.ABGESCHLOSSEN;
            this.statusLaeuft = grunddatenDto.statusObject.code === SessionStatusCodeEnum.LAEUFT;
            this.statusFreigegebenLaeuft =
                grunddatenDto.statusObject.code === SessionStatusCodeEnum.ZUR_DURCHFUEHRUNG_FREIGEGEBEN || grunddatenDto.statusObject.code === SessionStatusCodeEnum.LAEUFT;
            this.statusNotPendent = grunddatenDto.statusObject.code !== SessionStatusCodeEnum.PENDENT;
            this.statusAbgeschlossen = grunddatenDto.statusObject.code === SessionStatusCodeEnum.ABGESCHLOSSEN;
        }
    }

    private filteringPredicate = (statusCode: string) => {
        if (this.currentFormMode === FormModeEnum.CREATE || (this.currentFormMode === FormModeEnum.EDIT && statusCode === SessionStatusCodeEnum.PENDENT)) {
            return item => item.code === SessionStatusCodeEnum.PENDENT || item.code === SessionStatusCodeEnum.ZUR_DURCHFUEHRUNG_FREIGEGEBEN;
        } else if (this.currentFormMode === FormModeEnum.EDIT) {
            switch (statusCode) {
                case SessionStatusCodeEnum.DURCHFUEHRUNG_GEFAEHRDET:
                    return item =>
                        item.code === SessionStatusCodeEnum.PENDENT ||
                        item.code === SessionStatusCodeEnum.DURCHFUEHRUNG_GEFAEHRDET ||
                        item.code === SessionStatusCodeEnum.ZUR_DURCHFUEHRUNG_FREIGEGEBEN;

                case SessionStatusCodeEnum.ABGESAGT:
                    return item => item.code === SessionStatusCodeEnum.ABGESAGT || item.code === SessionStatusCodeEnum.ABGESCHLOSSEN;

                case SessionStatusCodeEnum.BEENDET:
                    return item => item.code === SessionStatusCodeEnum.BEENDET || item.code === SessionStatusCodeEnum.ABGESCHLOSSEN;

                case SessionStatusCodeEnum.ABGESCHLOSSEN:
                    return item => item.code === SessionStatusCodeEnum.ABGESCHLOSSEN;
            }
        }

        return item => item;
    };
}

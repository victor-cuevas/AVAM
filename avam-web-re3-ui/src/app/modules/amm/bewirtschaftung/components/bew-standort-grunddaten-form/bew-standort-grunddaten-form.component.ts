import { ArbeitsplatzkategorieDTO } from '@dtos/arbeitsplatzkategorieDTO';
import { PraktikumsstelleDTO } from '@dtos/praktikumsstelleDTO';
import { VerfuegbarkeitAMMCodeEnum } from '@shared/enums/domain-code/verfuegbarkeit-amm-code.enum';
import { StandortDTO } from '@dtos/standortDTO';
import { SpracheEnum } from '@shared/enums/sprache.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { BewStandortGrunddatenHandlerService } from './bew-standort-grunddaten-handler.service';
import { BewStandortGrunddatenReactiveFormsService } from './bew-standort-grunddaten-reactive-forms.service';
import { BewStandortGrunddatenFormModeService } from './bew-standort-grunddaten-form-mode.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { ActivatedRoute } from '@angular/router';
import { SessionStatusCodeEnum } from '@app/shared/enums/domain-code/session-status-code.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';

export interface BewStandortGrunddatenData {
    standortDto: StandortDTO;
    erfassungsspracheOptions: CodeDTO[];
    verfuegbarkeitAmmOptions: CodeDTO[];
    sozialeAbfederungOptions: CodeDTO[];
    sessionStatusOptions: CodeDTO[];
    erfassungsspracheIdGrunddatenState?: number;
    isApBp?: boolean;
}

@Component({
    selector: 'avam-bew-standort-grunddaten-form',
    templateUrl: './bew-standort-grunddaten-form.component.html',
    providers: [BewStandortGrunddatenHandlerService, BewStandortGrunddatenReactiveFormsService, BewStandortGrunddatenFormModeService, ObliqueHelperService]
})
export class BewStandortGrunddatenFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input('grunddatenData') grunddatenData: BewStandortGrunddatenData = null;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    modeSubscription: Subscription;
    currentFormMode: FormModeEnum;
    erfassungsspracheOptions: CodeDTO[] = [];
    statusOptions: CodeDTO[] = [];
    verfuegbarkeitOptions: CodeDTO[] = [];
    sozialeAbfederungOptions: CodeDTO[] = [];
    displayGermanElements = false;
    displayFrenchElements = false;
    displayItalianElements = false;
    clearCheckboxes = true;
    isApBp = false;
    firstBeschaeftigungseinheit: PraktikumsstelleDTO | ArbeitsplatzkategorieDTO;
    apkPraktikumsstelleVerwalten: boolean;
    isKollektiv = true;

    constructor(
        private router: ActivatedRoute,
        private reactiveFormsService: BewStandortGrunddatenReactiveFormsService,
        private facade: FacadeService,
        public handler: BewStandortGrunddatenHandlerService,
        public formMode: BewStandortGrunddatenFormModeService,
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
        if (changes.grunddatenData.currentValue && this.grunddatenData.standortDto) {
            this.prepareMask(this.grunddatenData);
            this.clearCheckboxes = false;
            this.formGroup.reset(this.handler.mapToForm(this.grunddatenData));
        }
    }

    prepareMask(grunddatenData: BewStandortGrunddatenData) {
        if (grunddatenData.standortDto.beschaeftigungseinheiten && this.grunddatenData.standortDto.beschaeftigungseinheiten.length > 0) {
            this.firstBeschaeftigungseinheit = this.grunddatenData.standortDto.beschaeftigungseinheiten[0];
        }

        this.mapData(grunddatenData);
        this.isApBp = grunddatenData.isApBp;
        this.reactiveFormsService.setValidatorsOnDurchfuehrungVonBis(grunddatenData.standortDto);
        this.apkPraktikumsstelleVerwalten = grunddatenData.standortDto.apkPraktikumsstelleVerwalten;

        if (!grunddatenData.standortDto.apkPraktikumsstelleVerwalten) {
            this.reactiveFormsService.setValidatorsOnBeschaeftigungseinheit(this.isApBp);
            this.reactiveFormsService.setRequiredWeekdays(grunddatenData.verfuegbarkeitAmmOptions);
        } else {
            this.reactiveFormsService.setDefaulFormValidators();
            this.reactiveFormsService.removeValidatorsFromBeschaeftigungseinheit(this.isApBp);
        }

        this.setReadonlyFields(grunddatenData.standortDto);
    }

    mapData(grunddatenData: BewStandortGrunddatenData) {
        this.erfassungsspracheOptions = this.facade.formUtilsService.mapDropdown(grunddatenData.erfassungsspracheOptions.filter(item => item.code !== SpracheEnum.RAETOROMANISCH));
        this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdown(
            grunddatenData.verfuegbarkeitAmmOptions.filter(item => item.code !== VerfuegbarkeitAMMCodeEnum.UNTERSCHIEDLICH)
        );
        this.sozialeAbfederungOptions = this.facade.formUtilsService.mapDropdown(grunddatenData.sozialeAbfederungOptions);

        if (!grunddatenData.standortDto.apkPraktikumsstelleVerwalten) {
            this.statusOptions = this.facade.formUtilsService.mapDropdown(
                grunddatenData.sessionStatusOptions.filter(this.filteringPredicate(this.firstBeschaeftigungseinheit ? this.firstBeschaeftigungseinheit.statusObject.code : null))
            );
        }
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
            });
        }
    }

    mapToDTO(): StandortDTO {
        return this.handler.mapToDTO(this.grunddatenData.standortDto, this.grunddatenData.verfuegbarkeitAmmOptions, this.grunddatenData.sessionStatusOptions);
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }

    private filteringPredicate = (statusCode: string) => {
        if (this.currentFormMode === FormModeEnum.CREATE) {
            return item => item.code === SessionStatusCodeEnum.PENDENT || item.code === SessionStatusCodeEnum.LAEUFT;
        } else if (this.currentFormMode === FormModeEnum.EDIT) {
            switch (statusCode) {
                case SessionStatusCodeEnum.PENDENT:
                    return item => item.code === SessionStatusCodeEnum.PENDENT || item.code === SessionStatusCodeEnum.LAEUFT;

                case SessionStatusCodeEnum.LAEUFT:
                    return item => item.code === SessionStatusCodeEnum.LAEUFT || item.code === SessionStatusCodeEnum.ABGESAGT || item.code === SessionStatusCodeEnum.BEENDET;

                case SessionStatusCodeEnum.ABGESAGT:
                    return item => item.code === SessionStatusCodeEnum.ABGESAGT;

                case SessionStatusCodeEnum.BEENDET:
                    return item => item.code === SessionStatusCodeEnum.BEENDET || item.code === SessionStatusCodeEnum.ABGESCHLOSSEN;

                case SessionStatusCodeEnum.ABGESCHLOSSEN:
                    return item => item.code === SessionStatusCodeEnum.ABGESCHLOSSEN;
            }
        }

        return item => item;
    };

    private setReadonlyFields(standortDTO: StandortDTO) {
        if (this.currentFormMode === FormModeEnum.EDIT) {
            this.isKollektiv = standortDTO.massnahmeObject.zulassungstypObject.code === AmmZulassungstypCode.KOLLEKTIV;
        }
    }
}

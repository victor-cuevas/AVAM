import { AmmConstants } from '@app/shared/enums/amm-constants';
import { SessionStatusCodeEnum } from '@shared/enums/domain-code/session-status-code.enum';
import { BeschaeftigungseinheitDTO } from '@dtos/beschaeftigungseinheitDTO';
import { StandortDTO } from '@dtos/standortDTO';
import { SpracheEnum } from '@shared/enums/sprache.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { ActivatedRoute } from '@angular/router';
import { FacadeService } from '@app/shared/services/facade.service';
import { BewBeschaeftigungseinheitGrunddatenHandlerService } from './bew-beschaeftigungseinheit-grunddaten-handler.service';
import { BewBeschaeftigungseinheitGrunddatenReactiveFormsService } from './bew-beschaeftigungseinheit-grunddaten-reactive-forms.service';
import { BewBeschaeftigungseinheitGrunddatenFormModeService } from './bew-beschaeftigungseinheit-grunddaten-form-mode.service';
import { VerfuegbarkeitAMMCodeEnum } from '@app/shared/enums/domain-code/verfuegbarkeit-amm-code.enum';

export interface BewBeschaeftigungseinheitGrunddatenData {
    standortDto: StandortDTO;
    beDto: BeschaeftigungseinheitDTO;
    erfassungsspracheOptions: CodeDTO[];
    verfuegbarkeitAmmOptions: CodeDTO[];
    sessionStatusOptions: CodeDTO[];
    erfassungsspracheIdGrunddatenState?: number;
    isPraktikumsstelle: boolean;
}

@Component({
    selector: 'avam-bew-beschaeftigungseinheit-grunddaten-form',
    templateUrl: './bew-beschaeftigungseinheit-grunddaten-form.component.html',
    providers: [
        BewBeschaeftigungseinheitGrunddatenHandlerService,
        BewBeschaeftigungseinheitGrunddatenReactiveFormsService,
        BewBeschaeftigungseinheitGrunddatenFormModeService,
        ObliqueHelperService
    ]
})
export class BewBeschaeftigungseinheitGrunddatenFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input('beschaeftigungseinheitData') beschaeftigungseinheitData: BewBeschaeftigungseinheitGrunddatenData = null;
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

    constructor(
        public handler: BewBeschaeftigungseinheitGrunddatenHandlerService,
        public formMode: BewBeschaeftigungseinheitGrunddatenFormModeService,
        private router: ActivatedRoute,
        private facade: FacadeService,
        private reactiveFormsService: BewBeschaeftigungseinheitGrunddatenReactiveFormsService,
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
        if (changes.beschaeftigungseinheitData.currentValue && this.beschaeftigungseinheitData.beDto) {
            this.prepareMask(this.beschaeftigungseinheitData);
            this.clearCheckboxes = false;
            this.formGroup.reset(this.handler.mapToForm(this.beschaeftigungseinheitData));
        }
    }

    prepareMask(beschaeftigungseinheitData: BewBeschaeftigungseinheitGrunddatenData) {
        this.mapData(beschaeftigungseinheitData);
        this.reactiveFormsService.setRequiredWeekdays(beschaeftigungseinheitData.verfuegbarkeitAmmOptions);
        this.reactiveFormsService.setValidatorsOnDurchfuehrungVonBis(beschaeftigungseinheitData.standortDto);

        if (beschaeftigungseinheitData.beDto.type === AmmConstants.PRAKTIKUMSSTELLE) {
            this.formGroup.controls.arbeitgeber.setValidators(Validators.required);
        }
    }

    mapData(beschaeftigungseinheitData: BewBeschaeftigungseinheitGrunddatenData) {
        this.erfassungsspracheOptions = this.facade.formUtilsService.mapDropdown(
            beschaeftigungseinheitData.erfassungsspracheOptions.filter(item => item.code !== SpracheEnum.RAETOROMANISCH)
        );
        this.verfuegbarkeitOptions = this.facade.formUtilsService.mapDropdown(
            beschaeftigungseinheitData.verfuegbarkeitAmmOptions.filter(item => item.code !== VerfuegbarkeitAMMCodeEnum.UNTERSCHIEDLICH)
        );
        this.statusOptions = this.facade.formUtilsService.mapDropdown(
            beschaeftigungseinheitData.sessionStatusOptions.filter(
                this.filteringPredicate(this.beschaeftigungseinheitData.beDto ? this.beschaeftigungseinheitData.beDto.statusObject.code : null)
            )
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
                this.formGroup.reset(this.handler.mapToForm(this.beschaeftigungseinheitData));
            });
        }
    }

    mapToDTO() {
        return this.handler.mapToDTO(this.beschaeftigungseinheitData);
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
}

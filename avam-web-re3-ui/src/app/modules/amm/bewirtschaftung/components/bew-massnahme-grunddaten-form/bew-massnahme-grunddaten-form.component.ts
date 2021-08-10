import { RegionDTO } from '@dtos/regionDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { MassnahmeDTO } from '@dtos/massnahmeDTO';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BewMassnahmeGrunddatenHandlerService } from './bew-massnahme-grunddaten-handler.service';
import { BewMassnahmeGrunddatenReactiveFormsService } from './bew-massnahme-grunddaten-reactive-forms.service';
import { BewMassnahmeGrunddatenFormModeService } from './bew-massnahme-grunddaten-form-mode.service';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { DateValidator } from '@app/shared/validators/date-validator';
import { AmmMassnahmenStrukturElCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { UnternehmenStatusCodeEnum } from '@app/shared/enums/domain-code/unternehmen-status-code.enum';
import { CodeDTO } from '@dtos/codeDTO';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-massnahme-grunddaten-form',
    templateUrl: './bew-massnahme-grunddaten-form.component.html',
    providers: [BewMassnahmeGrunddatenHandlerService, BewMassnahmeGrunddatenReactiveFormsService, BewMassnahmeGrunddatenFormModeService, ObliqueHelperService]
})
export class BewMassnahmeGrunddatenFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input('grunddatenData') grunddatenData = null;
    @ViewChild('massnahmenverantwortung') massnahmenverantwortung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    modeSubscription: Subscription;
    currentFormMode: FormModeEnum;
    erfassungsspracheOptions: any[];
    zulassungstypOptions: any[];
    displayGermanElements = false;
    displayFrenchElements = false;
    displayItalianElements = false;
    shouldDisplayCheckboxes: boolean;
    massnahmenverantwortungType = BenutzerAutosuggestType.BENUTZER;
    massnahmenverantwortungTokens;
    isMassnahmeInPlanungAkquisitionSichtbarReadonly: boolean;
    isZulassungstypReadonly: boolean;
    isAnbieterReadonly: boolean;
    durchfuehrungsregionenData: Array<RegionDTO>;
    isIndividuell: boolean;

    constructor(
        private router: ActivatedRoute,
        private formBuilder: FormBuilder,
        private facade: FacadeService,
        public handler: BewMassnahmeGrunddatenHandlerService,
        public formMode: BewMassnahmeGrunddatenFormModeService,
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
            this.prepareMask(this.grunddatenData.grunddatenDto);
            this.formGroup.reset(this.mapToForm(this.grunddatenData.grunddatenDto));
            this.durchfuehrungsregionenData = this.grunddatenData.grunddatenDto.durchfuehrungsregionList;
            this.setValidatorsOnGueltigVonBis();
        }
    }

    setValidatorsOnGueltigVonBis() {
        const gueltigVonProdukt = this.grunddatenData.grunddatenDto.produktObject.gueltigVon;
        const gueltigBisProdukt = this.grunddatenData.grunddatenDto.produktObject.gueltigBis;

        this.formGroup
            .get('gueltigVon')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonProdukt, gueltigBisProdukt, 'val278')
            ]);

        this.formGroup
            .get('gueltigBis')
            .setValidators([
                Validators.required,
                DateValidator.dateFormatNgx,
                DateValidator.dateValidNgx,
                DateValidator.isDateWithinRange(gueltigVonProdukt, gueltigBisProdukt, 'val278')
            ]);
    }

    mapData() {
        this.erfassungsspracheOptions = this.handler.mapSpracheDropdown(this.grunddatenData.erfassungsspracheOptions);
        this.zulassungstypOptions = this.handler.mapZulassungstypDropdown(this.grunddatenData.zulassungstypAmmOptions, this.grunddatenData.grunddatenDto.zulassungstypObject.code);
    }

    mapToForm(grunddatenDto: MassnahmeDTO) {
        return {
            erfassungssprache: this.grunddatenData.erfassungsspracheIdGrunddatenState
                ? this.grunddatenData.erfassungsspracheIdGrunddatenState
                : this.facade.formUtilsService.getCodeIdByCode(this.erfassungsspracheOptions, this.facade.translateService.currentLang.toUpperCase()),
            titelDe: grunddatenDto.titelDe,
            titelFr: grunddatenDto.titelFr,
            titelIt: grunddatenDto.titelIt,
            ergaenzendeAngabenDe: grunddatenDto.bemerkungDe,
            ergaenzendeAngabenFr: grunddatenDto.bemerkungFr,
            ergaenzendeAngabenIt: grunddatenDto.bemerkungIt,
            gueltigVon: this.facade.formUtilsService.parseDate(grunddatenDto.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(grunddatenDto.gueltigBis),
            anbieter: this.setAnbieter(grunddatenDto),
            massnahmenverantwortung: grunddatenDto.verantwortlicherDetailObject,
            inPlanungAkquisitionSichtbar: grunddatenDto.inPlanungAkquisitionSichtbar,
            lamCode: grunddatenDto.lamCode,
            zulassungstyp: grunddatenDto.zulassungstypObject.codeId,
            imAngebotSichtbar: grunddatenDto.imAngebotSichtbar,
            kurseDurchLamZuPruefen: grunddatenDto.pruefenDurchLam,
            regionen: {
                autosuggests: []
            }
        };
    }

    mapToDTO(massnahmeDto: MassnahmeDTO): MassnahmeDTO {
        const massnahmeDtoToSave: MassnahmeDTO = { ...massnahmeDto };

        massnahmeDtoToSave.titelDe = this.formGroup.controls.titelDe.value;
        massnahmeDtoToSave.titelFr = this.formGroup.controls.titelFr.value;
        massnahmeDtoToSave.titelIt = this.formGroup.controls.titelIt.value;
        massnahmeDtoToSave.bemerkungDe = this.formGroup.controls.ergaenzendeAngabenDe.value;
        massnahmeDtoToSave.bemerkungFr = this.formGroup.controls.ergaenzendeAngabenFr.value;
        massnahmeDtoToSave.bemerkungIt = this.formGroup.controls.ergaenzendeAngabenIt.value;
        massnahmeDtoToSave.gueltigVon = this.facade.formUtilsService.parseDate(this.formGroup.controls.gueltigVon.value);
        massnahmeDtoToSave.gueltigBis = this.facade.formUtilsService.parseDate(this.formGroup.controls.gueltigBis.value);
        massnahmeDtoToSave.verantwortlicherDetailObject = this.formGroup.controls.massnahmenverantwortung['benutzerObject'];
        massnahmeDtoToSave.massnahmeId = this.grunddatenData.grunddatenDto.massnahmeId;
        massnahmeDtoToSave.inPlanungAkquisitionSichtbar = this.formGroup.controls.inPlanungAkquisitionSichtbar.value;
        massnahmeDtoToSave.lamCode = this.formGroup.controls.lamCode.value;
        massnahmeDtoToSave.zulassungstypObject = this.zulassungstypOptions.find(option => option.codeId === +this.formGroup.controls.zulassungstyp.value) as CodeDTO;
        massnahmeDtoToSave.pruefenDurchLam = this.formGroup.controls.kurseDurchLamZuPruefen.value;
        massnahmeDtoToSave.imAngebotSichtbar = this.formGroup.controls.imAngebotSichtbar.value;

        if (massnahmeDtoToSave.ammAnbieterObject) {
            massnahmeDtoToSave.ammAnbieterObject.unternehmen.unternehmenId = this.formGroup.controls.anbieter['unternehmenAutosuggestObject'].unternehmenId;
        } else {
            massnahmeDtoToSave.ammAnbieterObject = {
                unternehmen: {
                    unternehmenId: this.formGroup.controls.anbieter['unternehmenAutosuggestObject'].unternehmenId
                }
            };
        }

        massnahmeDtoToSave.durchfuehrungsregionList = (this.formGroup.controls.regionen as FormGroup).controls.autosuggests.value
            .filter(value => value.item) // filters out null items
            .map(value => {
                const region = value.item;
                return {
                    code: region.code ? region.code : -1,
                    kanton: region.kanton ? region.kanton : '',
                    merkmal: region.merkmal ? region.merkmal : '',
                    regionDe: region.regionDe ? region.regionDe : region,
                    regionFr: region.regionFr ? region.regionFr : region,
                    regionId: region.regionId ? region.regionId : -1,
                    regionIt: region.regionIt ? region.regionIt : region
                };
            });

        return massnahmeDtoToSave;
    }

    reset() {
        if (this.formGroup.dirty) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                this.formGroup.reset(this.mapToForm(this.grunddatenData.grunddatenDto));
                this.formGroup.setControl('regionen', this.formBuilder.group({ autosuggests: this.formBuilder.array([]) }));
                this.durchfuehrungsregionenData = this.grunddatenData.grunddatenDto.durchfuehrungsregionList.slice();
            });
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

    // BSP4
    onZulassungstypDropdownChange(selectedZulassungstypCodeId) {
        if (selectedZulassungstypCodeId) {
            const selectedZulassungstypCode = this.facade.formUtilsService.getCodeByCodeId(this.zulassungstypOptions, selectedZulassungstypCodeId);
            const isIndivAbMassnahme = selectedZulassungstypCode === AmmZulassungstypCode.INDIV_AB_MASSNAHME;

            if (this.currentFormMode === FormModeEnum.CREATE) {
                this.formGroup.controls.imAngebotSichtbar.reset(false);
                this.formGroup.controls.kurseDurchLamZuPruefen.reset(false);
                // BSP3, BSP22
            } else if (this.currentFormMode === FormModeEnum.EDIT) {
                if (selectedZulassungstypCode === AmmZulassungstypCode.INDIVIDUELL) {
                    this.formGroup.controls.inPlanungAkquisitionSichtbar.reset(false);
                    this.formGroup.controls.imAngebotSichtbar.reset(false);
                    this.formGroup.controls.kurseDurchLamZuPruefen.reset(true);
                } else {
                    this.formGroup.controls.imAngebotSichtbar.reset(false);
                    this.formGroup.controls.kurseDurchLamZuPruefen.reset(false);
                }
            }

            this.shouldDisplayCheckboxes = isIndivAbMassnahme;
        }
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
    }

    private prepareMask(grunddatenDto: MassnahmeDTO) {
        this.mapData();
        this.initializeBenutzerTokens(grunddatenDto);
        this.setReadonlyFields(grunddatenDto);
        this.formGroup.setControl('regionen', this.formBuilder.group({ autosuggests: this.formBuilder.array([]) }));
    }

    private initializeBenutzerTokens(grunddatenDto: MassnahmeDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = grunddatenDto ? (grunddatenDto.ownerId ? grunddatenDto.ownerId : currentUser.benutzerstelleId) : currentUser.benutzerstelleId;

        if (currentUser) {
            this.massnahmenverantwortungTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_MASSNAHMEN_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId
            };
        }
    }

    private setReadonlyFields(grunddatenDto: MassnahmeDTO) {
        this.isAnbieterReadonly = grunddatenDto.anbieterReadonly;

        if (this.currentFormMode === FormModeEnum.CREATE) {
            this.isMassnahmeInPlanungAkquisitionSichtbarReadonly = !grunddatenDto.produktObject.inPlanungSichtbar;
            this.isZulassungstypReadonly = grunddatenDto.produktObject.strukturelementGesetzObject.elementCode !== AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_KURS_CODE;
        } else if (this.currentFormMode === FormModeEnum.EDIT) {
            this.isIndividuell = grunddatenDto.zulassungstypObject.code === AmmZulassungstypCode.INDIVIDUELL;
            this.isZulassungstypReadonly =
                this.isIndividuell || grunddatenDto.produktObject.strukturelementGesetzObject.elementCode !== AmmMassnahmenStrukturElCode.AMM_MASSNAHMENTYP_KURS_CODE;
            this.isMassnahmeInPlanungAkquisitionSichtbarReadonly = this.isIndividuell || !grunddatenDto.produktObject.inPlanungSichtbar;
        }
    }

    // BSP13
    private setAnbieter(grunddatenDto: MassnahmeDTO) {
        if (grunddatenDto.massnahmeId !== AmmConstants.UNDEFINED_LONG_ID) {
            return grunddatenDto.ammAnbieterObject.unternehmen;
        }

        const filteredAnbieter = grunddatenDto.produktObject.ammAnbieterList.filter(anbieter => anbieter.unternehmen.statusObject.code === UnternehmenStatusCodeEnum.STATUS_AKTIV);

        if (filteredAnbieter.length === 1) {
            return filteredAnbieter[0].unternehmen;
        }

        return null;
    }
}

import { AmmConstants } from '@shared/enums/amm-constants';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { SpracheEnum } from '@shared/enums/sprache.enum';
import { Component, OnInit, Input, OnDestroy, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BewProduktGrunddatenHandlerService } from './bew-produkt-grunddaten-handler.service';
import { BewProduktGrunddatenReactiveFormsService } from './bew-produkt-grunddaten-reactive-forms.service';
import { BewProduktGrunddatenFormModeService } from './bew-produkt-grunddaten-form-mode.service';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { ProduktDTO } from '@app/shared/models/dtos-generated/produktDTO';
import { AmmAnbieterDTO } from '@app/shared/models/dtos-generated/ammAnbieterDTO';
import { FacadeService } from '@app/shared/services/facade.service';

@Component({
    selector: 'avam-bew-produkt-grunddaten-form',
    templateUrl: './bew-produkt-grunddaten-form.component.html',
    providers: [BewProduktGrunddatenHandlerService, BewProduktGrunddatenReactiveFormsService, BewProduktGrunddatenFormModeService, ObliqueHelperService]
})
export class BewProduktGrunddatenFormComponent implements OnInit, OnDestroy, OnChanges {
    @Input('grunddatenData') grunddatenData = null;
    @ViewChild('produktverantwortung') produktverantwortung: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    formGroup: FormGroup;
    modeSubscription: Subscription;
    erfassungsspracheOptions: any[];
    displayGermanElements = false;
    displayFrenchElements = false;
    displayItalianElements = false;
    produktverantwortungType = BenutzerAutosuggestType.BENUTZER;
    produktverantwortungTokens;
    currentFormMode: FormModeEnum;
    langChangeSubscription: Subscription;
    gueltigVonChangeSubscription: Subscription;
    amtsstelleChangeSubscription: Subscription;
    isIndividuelleAmm: boolean;

    constructor(
        private router: ActivatedRoute,
        private facade: FacadeService,
        public handler: BewProduktGrunddatenHandlerService,
        public formMode: BewProduktGrunddatenFormModeService,
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

            switch (currentMode) {
                case FormModeEnum.CREATE:
                    this.handler.reactiveForms.grunddatenForm.reset();
                    break;
                case FormModeEnum.EDIT:
                    // edit
                    break;
                case FormModeEnum.READONLY:
                    // readonly
                    break;
                default:
                    break;
            }
        });

        this.langChangeSubscription = this.facade.translateService.onLangChange.subscribe(() => {
            this.formGroup.controls.amtsstelleText.setValue(
                this.facade.dbTranslateService.translate(this.facade.formUtilsService.extractElementNameFromPath(this.handler.selectedAmtsstellePath), 'name')
            );
            this.formGroup.controls.ausgleichsstelleText.setValue(
                this.facade.dbTranslateService.translate(this.facade.formUtilsService.extractElementNameFromPath(this.handler.selectedAusgleichstellePath), 'name')
            );
        });

        this.gueltigVonChangeSubscription = this.formGroup.controls.gueltigVon.valueChanges.subscribe(value => {
            this.handler.massnahmenAmtsstelleQueryParams.anzeigeDatum = value;
            this.handler.massnahmenAusgleichstelleQueryParams.anzeigeDatum = value;
        });
        this.amtsstelleChangeSubscription = this.formGroup.controls.amtsstelle.valueChanges.subscribe(
            value => (this.handler.massnahmenAusgleichstelleQueryParams.amtsstellenId = value)
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.grunddatenData.currentValue && this.grunddatenData.grunddatenDto) {
            this.prepareMask(this.grunddatenData.grunddatenDto);

            if (this.grunddatenData.grunddatenDto.produktId === AmmConstants.UNDEFINED_LONG_ID) {
                this.setDefaultValues();
            } else {
                this.formGroup.reset(this.mapToForm(this.grunddatenData.grunddatenDto));
                this.setAmtsstelleAusgleichstelle();
            }

            this.formGroup.setControl('ammAnbieterList', this.createAmmAnbieterListFormArray(this.grunddatenData.grunddatenDto.ammAnbieterList));

            if (this.grunddatenData.grunddatenDto.elementkategorieAmtObject) {
                this.handler.massnahmenAmtsstelleQueryParams.elementKategorieId = this.grunddatenData.grunddatenDto.elementkategorieAmtObject.elementkategorieId;
            }
        }
    }

    mapData() {
        this.erfassungsspracheOptions = this.handler.mapDropdown(this.grunddatenData.erfassungsspracheOptions);
    }

    setDefaultValues() {
        this.formGroup.controls.erfassungssprache.setValue(
            this.facade.formUtilsService.getCodeIdByCode(this.erfassungsspracheOptions, this.facade.translateService.currentLang.toUpperCase())
        );
        this.formGroup.controls.gueltigVon.setValue(new Date());
        this.formGroup.controls.inPlanungSichtbar.setValue(true);
        this.produktverantwortung.appendCurrentUser();
    }

    mapToForm(produktDto: ProduktDTO) {
        return {
            erfassungssprache: this.grunddatenData.erfassungsspracheIdGrunddatenState
                ? this.grunddatenData.erfassungsspracheIdGrunddatenState
                : this.facade.formUtilsService.getCodeIdByCode(this.erfassungsspracheOptions, this.facade.translateService.currentLang.toUpperCase()),
            titelDe: produktDto.titelDe,
            titelFr: produktDto.titelFr,
            titelIt: produktDto.titelIt,
            ergaenzendeAngabenDe: produktDto.bemerkungDe,
            ergaenzendeAngabenFr: produktDto.bemerkungFr,
            ergaenzendeAngabenIt: produktDto.bemerkungIt,
            gueltigVon: this.facade.formUtilsService.parseDate(produktDto.gueltigVon),
            gueltigBis: this.facade.formUtilsService.parseDate(produktDto.gueltigBis),
            produktverantwortung:
                produktDto.verantwortlicherDetailObject.benutzerDetailId !== -1 ? produktDto.verantwortlicherDetailObject : this.grunddatenData.produktverantwortung,
            inPlanungSichtbar: produktDto.inPlanungSichtbar,
            lamCode: produktDto.lamCode,
            amtsstelle: produktDto.strukturelementObject.strukturelementId,
            ausgleichsstelle: produktDto.strukturelementAusglObject.strukturelementId,
            ammAnbieterList: []
        };
    }

    mapToDTO(produktDto: ProduktDTO) {
        produktDto.titelDe = this.formGroup.controls.titelDe.value;
        produktDto.titelFr = this.formGroup.controls.titelFr.value;
        produktDto.titelIt = this.formGroup.controls.titelIt.value;
        produktDto.bemerkungDe = this.formGroup.controls.ergaenzendeAngabenDe.value;
        produktDto.bemerkungFr = this.formGroup.controls.ergaenzendeAngabenFr.value;
        produktDto.bemerkungIt = this.formGroup.controls.ergaenzendeAngabenIt.value;
        produktDto.gueltigVon = this.facade.formUtilsService.parseDate(this.formGroup.controls.gueltigVon.value);
        produktDto.gueltigBis = this.facade.formUtilsService.parseDate(this.formGroup.controls.gueltigBis.value);
        produktDto.verantwortlicherDetailObject = this.formGroup.controls.produktverantwortung['benutzerObject'];
        produktDto.produktId = this.grunddatenData.grunddatenDto.produktId;
        produktDto.inPlanungSichtbar = this.formGroup.controls.inPlanungSichtbar.value;
        produktDto.lamCode = this.formGroup.controls.lamCode.value;
        produktDto.strukturelementObject = { strukturelementId: this.formGroup.controls.amtsstelle.value };
        produktDto.strukturelementAusglObject = { strukturelementId: this.formGroup.controls.ausgleichsstelle.value };
        produktDto.ammAnbieterList = (this.formGroup.controls.ammAnbieterList as FormArray).controls
            .map(ammAnbieter => (ammAnbieter as FormGroup).controls.branche['unternehmenAutosuggestObject'])
            .filter(ammAnbieter => ammAnbieter !== undefined);

        return produktDto;
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

                if (!this.grunddatenData.grunddatenDto.produktId) {
                    this.formGroup.reset();
                    this.setDefaultValues();
                } else {
                    this.formGroup.reset(this.mapToForm(this.grunddatenData.grunddatenDto));
                    this.setAmtsstelleAusgleichstelle();
                    this.formGroup.setControl('ammAnbieterList', this.createAmmAnbieterListFormArray(this.grunddatenData.grunddatenDto.ammAnbieterList));
                }
            });
        }
    }

    ngOnDestroy() {
        this.modeSubscription.unsubscribe();
        this.gueltigVonChangeSubscription.unsubscribe();
        this.amtsstelleChangeSubscription.unsubscribe();
    }

    private prepareMask(grunddatenDto: ProduktDTO) {
        this.mapData();
        this.initializeBenutzerTokens(grunddatenDto);
        this.isIndividuelleAmm = grunddatenDto.individuellenAMM;
    }

    private initializeBenutzerTokens(grunddatenDto: ProduktDTO) {
        const currentUser = this.facade.authenticationService.getLoggedUser();
        const benutzerstelleId = grunddatenDto ? (grunddatenDto.ownerId ? grunddatenDto.ownerId : currentUser.benutzerstelleId) : currentUser.benutzerstelleId;

        if (currentUser) {
            this.produktverantwortungTokens = {
                benutzerstelleId,
                berechtigung: Permissions.AMM_MASSNAHMEN_BEARBEITEN,
                myBenutzerstelleId: benutzerstelleId
            };
        }
    }

    private setAmtsstelleAusgleichstelle() {
        this.handler.setSelectedAmtsstelleAusgleichsstelle(this.grunddatenData.amtstellePaths);
        this.handler.setAmtsstelleAusgleichstelleText({
            selectedAmtsstelle: this.handler.selectedAmtsstelleElementName,
            selectedAusgleichstelle: this.handler.selectedAusgleichstelleElementName
        });
    }

    private createAmmAnbieterListFormArray(ammAnbieterList: AmmAnbieterDTO[]) {
        if (ammAnbieterList && ammAnbieterList.length > 0) {
            return new FormArray(
                ammAnbieterList.map(ammAnbieter => {
                    const form = new FormGroup({ branche: new FormControl(null) });
                    form.controls.branche['unternehmenAutosuggestObject'] = ammAnbieter.unternehmen;
                    form.controls.branche.setValue(ammAnbieter.unternehmen);

                    return form;
                })
            );
        } else {
            return new FormArray([new FormGroup({ branche: new FormControl(null) })]);
        }
    }
}

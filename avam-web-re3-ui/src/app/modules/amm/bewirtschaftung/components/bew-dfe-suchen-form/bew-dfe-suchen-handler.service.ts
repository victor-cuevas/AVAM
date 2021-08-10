import { Injectable } from '@angular/core';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { NodeData, MassnahmenQueryParams, StrukturElementType } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { FormUtilsService } from '@app/shared';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { BewDfeSuchenReactiveFormsService } from './bew-dfe-suchen-reactive-forms.service';
import { FormControl } from '@angular/forms';
import { RegionDTO } from '@app/shared/models/dtos-generated/regionDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { DurchfuehrungseinheitSuchenParamDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitSuchenParamDTO';
import { DurchfuehrungseinheitListeViewDTO } from '@app/shared/models/dtos-generated/durchfuehrungseinheitListeViewDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';

@Injectable()
export class BewDfeSuchenHandlerService {
    // The following two properties are used for tooltips in the avam-input-modal component.
    // If they are not initialized, the tooltips are coming up on mouse click but not on mouse hover as expected.
    // If the problem is later solved in the core component, the initialization can be safely removed.
    selectedAmtsstellePath: MultiLanguageParamDTO = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };
    selectedRegion: RegionDTO = { regionDe: ' ', regionFr: ' ', regionIt: ' ' };
    selectedRegionTooltip: RegionDTO = { regionDe: ' ', regionFr: ' ', regionIt: ' ' };
    selectedElement: NodeData;
    massnahmenAmtsstelleQueryParams: MassnahmenQueryParams;
    selectedAmtsstelleElementName: MultiLanguageParamDTO;
    currentYear = new Date().getFullYear();

    constructor(
        public reactiveForms: BewDfeSuchenReactiveFormsService,
        private dbTranslateService: DbTranslateService,
        private ammHelper: AmmHelper,
        private formUtils: FormUtilsService
    ) {
        reactiveForms.searchForm.controls.zeitraumVon.valueChanges.subscribe(value => {
            this.massnahmenAmtsstelleQueryParams = {
                type: StrukturElementType.BERECHTIGTELISTE,
                berechtigungsKey: 'amm_massnahmen_sichten',
                anzeigeDatum: value
            };
        });
    }

    selectMassnahmenart(element: NodeData) {
        this.setSelectedAmtsstelle(element.amtsstellePath);
        this.setAmtsstelleText(element.amtsstellePath);
        this.selectedElement = element;

        element.searchKategorieId
            ? this.reactiveForms.searchForm.controls.elementkategorieId.setValue(element.searchKategorieId)
            : this.reactiveForms.searchForm.controls.elementkategorieId.setValue(element.elementkategorieId);

        this.reactiveForms.searchForm.controls.strukturelementId.setValue(element.strukturelementId);
    }

    clearMassnahmenart() {
        this.selectedElement = undefined;
        this.selectedAmtsstelleElementName = undefined;
        this.selectedAmtsstellePath = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };

        this.reactiveForms.searchForm.controls.strukturelementId.setValue(null);
        this.reactiveForms.searchForm.controls.strukturelementText.setValue(null);
        this.reactiveForms.searchForm.controls.elementkategorieId.setValue(null);

        this.reactiveForms.searchForm.markAsDirty();
    }

    selectDurchfuehrungsregion(event) {
        this.reactiveForms.searchForm.controls.region.setValue(event.data);
        this.reactiveForms.searchForm.controls.regionText.setValue(this.dbTranslateService.translate(event.data, 'region'));
        this.reactiveForms.searchForm.markAsDirty();

        this.selectedRegion = event.data;
    }

    updateSelectionsLanguage() {
        const region = this.reactiveForms.searchForm.controls.region.value;
        this.reactiveForms.searchForm.controls.regionText.setValue(this.dbTranslateService.translate(region, 'region'));
        this.selectedRegionTooltip = region;

        this.setAmtsstelleText(this.selectedAmtsstellePath);
    }

    mapDropdown(items: CodeDTO[]) {
        return items.map(item => {
            return {
                codeId: item.codeId,
                value: item.codeId,
                code: item.code,
                labelFr: item.textFr,
                labelIt: item.textIt,
                labelDe: item.textDe
            };
        });
    }

    mapMultiselect = (element, valueMap: Map<number, boolean>) => {
        return {
            id: element.codeId,
            textDe: element.kurzTextDe,
            textIt: element.kurzTextIt,
            textFr: element.kurzTextFr,
            value: valueMap.get(element.codeId)
        };
    };

    getDefaultValues(): DurchfuehrungseinheitSuchenParamDTO {
        return {
            zeitraumVon: new Date(this.currentYear, 0, 1),
            zeitraumBis: new Date(this.currentYear, 11, 31)
        };
    }

    createRow(responseDTO: DurchfuehrungseinheitListeViewDTO, index: number) {
        return {
            id: index,
            produktId: responseDTO.produktId,
            massnahmeId: responseDTO.massnahmeId,
            durchfuehrungseinheitId: responseDTO.durchfuehrungseinheitId,
            beschaeftigungseinheitId: responseDTO.beschaeftigungseinheitId,
            titel: this.dbTranslateService.translateWithOrder(responseDTO, 'durchfuehrungseinheitTitel'),
            typ: this.dbTranslateService.instant(responseDTO.entryType),
            zulassungsTyp: this.dbTranslateService.translateWithOrder(responseDTO, 'massnahmeZulassungstypKurztext'),
            status: this.dbTranslateService.translateWithOrder(responseDTO, 'statusKurztext'),
            anbieter: this.ammHelper.concatenateUnternehmensnamen(
                responseDTO.massnahmeUnternehmenName1,
                responseDTO.massnahmeUnternehmenName2,
                responseDTO.massnahmeUnternehmenName3
            ),
            gueltigVon: responseDTO.durchfuehrungseinheitGueltigVon ? new Date(responseDTO.durchfuehrungseinheitGueltigVon) : '',
            gueltigBis: responseDTO.durchfuehrungseinheitGueltigBis ? new Date(responseDTO.durchfuehrungseinheitGueltigBis) : '',
            stichtag: responseDTO.sessionStichtagAm ? new Date(responseDTO.sessionStichtagAm) : '',
            minPlaetze: responseDTO.minPlaetze,
            maxPlaetze: responseDTO.maxPlaetze,
            anzBuchungen: responseDTO.anzBuchungen,
            anzWartelistePlaetze: responseDTO.anzWartelistePlaetze,
            durchfuehrungskriteriumErfuellt: responseDTO.durchfuehrungskriteriumErfuellt
        };
    }

    setDefaultValues() {
        const defaultValues = this.getDefaultValues();
        this.reactiveForms.searchForm.controls.zeitraumVon.setValue(defaultValues.zeitraumVon);
        this.reactiveForms.searchForm.controls.zeitraumBis.setValue(defaultValues.zeitraumBis);
    }

    toggleEnabledInputs(number: any, dfeSource: boolean): boolean {
        let disableInputs = false;
        const controls = this.reactiveForms.searchForm.controls;

        if (number) {
            disableInputs = true;
            if (dfeSource) {
                controls.beschaeftigungseinheitId.disable();
            } else {
                controls.durchfuehrungseinheitId.disable();
            }
            controls.taetigkeit.disable();
            controls.titel.disable();
            controls.region.disable();
            controls.zulassungstypId.disable();
            controls.dfeImAngebotSichtbar.disable();
            controls.zeitraum.disable();
            controls.zeitraumVon.disable();
            controls.zeitraumBis.disable();
            controls.platzsituation.disable();
            controls.statusId.disable();
        } else {
            controls.beschaeftigungseinheitId.enable();
            controls.durchfuehrungseinheitId.enable();
            controls.taetigkeit.enable();
            controls.titel.enable();
            controls.region.enable();
            controls.zulassungstypId.enable();
            controls.dfeImAngebotSichtbar.enable();
            controls.zeitraum.enable();
            controls.zeitraumVon.enable();
            controls.zeitraumBis.enable();
            controls.platzsituation.enable();
            controls.statusId.enable();
        }

        return disableInputs;
    }

    private setSelectedAmtsstelle(amtsstellePath: MultiLanguageParamDTO) {
        this.selectedAmtsstellePath = amtsstellePath;
        this.selectedAmtsstelleElementName = this.formUtils.extractElementNameFromPath(amtsstellePath);
    }

    private setAmtsstelleText(selectedAmtsstelle: MultiLanguageParamDTO) {
        const controlAmtsstelleText = this.reactiveForms.searchForm.controls.strukturelementText as FormControl;
        controlAmtsstelleText.setValue(this.dbTranslateService.translate(this.formUtils.extractElementNameFromPath(selectedAmtsstelle), 'name'));
    }
}

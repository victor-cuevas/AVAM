import { Injectable } from '@angular/core';
import { BewMassnahmeSuchenReactiveFormsService } from './bew-massnahme-suchen-reactive-forms.service';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { MassnahmenQueryParams, StrukturElementType, NodeData } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { FormControl } from '@angular/forms';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormUtilsService } from '@app/shared';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { RegionDTO } from '@app/shared/models/dtos-generated/regionDTO';
import { MassnahmeViewDTO } from '@app/shared/models/dtos-generated/massnahmeViewDTO';

@Injectable()
export class BewMassnahmeSuchenHandlerService {
    // The following 2 properties are used for tooltips in the avam-input-modal component.
    // If they not initialized, the tooltips are coming up on mouse click but not on mouse hover as expected.
    // If the problem is later solved in the core component, the initialization can be safely removed.
    selectedAmtsstellePath: MultiLanguageParamDTO = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };
    selectedRegionTooltip: RegionDTO = { regionDe: ' ', regionFr: ' ', regionIt: ' ' };
    selectedRegion: any;
    selectedElement: NodeData;

    massnahmenAmtsstelleQueryParams: MassnahmenQueryParams;

    selectedAmtsstelleElementName: MultiLanguageParamDTO;

    constructor(public reactiveForms: BewMassnahmeSuchenReactiveFormsService, private dbTranslateService: DbTranslateService, private formUtils: FormUtilsService) {
        reactiveForms.searchForm.controls.gueltigVon.valueChanges.subscribe(value => {
            this.massnahmenAmtsstelleQueryParams = {
                type: StrukturElementType.BERECHTIGTELISTE,
                berechtigungsKey: 'amm_massnahmen_sichten',
                anzeigeDatum: value
            };
        });
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

    toggleEnabledInputs(massnahmeNrValue: any): boolean {
        let disableInputs = false;
        const controls = this.reactiveForms.searchForm.controls;

        if (massnahmeNrValue) {
            disableInputs = true;
            controls.titel.disable();
            controls.lamCode.disable();
            controls.zulassungstypId.disable();
            controls.imAngebotSichtbar.disable();
            controls.pruefenDurchLam.disable();
            controls.gueltigVon.disable();
            controls.gueltigBis.disable();
        } else {
            disableInputs = false;
            controls.titel.enable();
            controls.lamCode.enable();
            controls.zulassungstypId.enable();
            controls.imAngebotSichtbar.enable();
            controls.pruefenDurchLam.enable();
            controls.gueltigVon.enable();
            controls.gueltigBis.enable();
        }

        return disableInputs;
    }

    updateSelectionsLanguage() {
        const region = this.reactiveForms.searchForm.controls.region.value;
        this.reactiveForms.searchForm.controls.regionText.setValue(this.dbTranslateService.translate(region, 'region'));
        this.selectedRegionTooltip = region;

        this.setAmtsstelleText(this.selectedAmtsstellePath);
    }

    selectDurchfuehrungsregion(event) {
        this.reactiveForms.searchForm.controls.region.setValue(event.data);
        this.reactiveForms.searchForm.controls.regionText.setValue(this.dbTranslateService.translate(event.data, 'region'));
        this.reactiveForms.searchForm.markAsDirty();

        this.selectedRegionTooltip = event.data;
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

    clearDurchfuehrungsregion() {
        this.reactiveForms.searchForm.controls.region.setValue(null);
        this.reactiveForms.searchForm.controls.regionText.setValue(null);
        this.reactiveForms.searchForm.markAsDirty();

        this.selectedRegionTooltip = null;
    }

    createRow(responseDTO: MassnahmeViewDTO, index: number) {
        const anbieter = this.setBezeichnung(responseDTO);
        return {
            id: index,
            massnahmeId: responseDTO.massnahmeId,
            produktId: responseDTO.produktId,
            titel: this.dbTranslateService.translateWithOrder(responseDTO, 'titel'),
            zulassungstyp: this.dbTranslateService.translateWithOrder(responseDTO, 'zulassungstypText'),
            gueltigVon: responseDTO.gueltigVon ? new Date(responseDTO.gueltigVon) : '',
            gueltigBis: responseDTO.gueltigBis ? new Date(responseDTO.gueltigBis) : '',
            anbieter
        };
    }

    setBezeichnung(element): string {
        return `${element.unternehmenName1}${element.unternehmenName2 ? ' ' + element.unternehmenName2 : ''}${element.unternehmenName3 ? ' ' + element.unternehmenName3 : ''}`;
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

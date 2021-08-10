import { Injectable } from '@angular/core';
import { BewProduktGrunddatenReactiveFormsService } from './bew-produkt-grunddaten-reactive-forms.service';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { StrukturElementType, MassnahmenQueryParams, NodeData } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { FormControl } from '@angular/forms';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormUtilsService } from '@app/shared';

@Injectable()
export class BewProduktGrunddatenHandlerService {
    selectedAmtsstellePath: MultiLanguageParamDTO;
    selectedAusgleichstellePath: MultiLanguageParamDTO;
    massnahmenAmtsstelleQueryParams: MassnahmenQueryParams = { type: StrukturElementType.AMTSSTELLE, elementKategorieId: '0', ausgleichstelleInfo: true };
    massnahmenAusgleichstelleQueryParams: MassnahmenQueryParams = { type: StrukturElementType.AUSGLEICHSSTELLE };
    selectedAmtsstelleElementName: MultiLanguageParamDTO;
    selectedAusgleichstelleElementName: MultiLanguageParamDTO;
    selectedMassnahmenartElement: any;

    constructor(public reactiveForms: BewProduktGrunddatenReactiveFormsService, private formUtils: FormUtilsService, private dbTranslateService: DbTranslateService) {}

    mapDropdown(items) {
        if (items) {
            return items
                .filter(item => item.code !== SpracheEnum.RAETOROMANISCH)
                .map(item => {
                    return { value: item.codeId, code: item.code, codeId: item.codeId, labelFr: item.textFr, labelIt: item.textIt, labelDe: item.textDe };
                });
        }

        return [];
    }

    selectAusgleichsstelle(element: NodeData) {
        this.selectedMassnahmenartElement = element;
        this.selectedAusgleichstellePath = element.amtsstellePath;
        this.setAusgleichstelleId(element.strukturelementId);
        this.setAusgleichstelleText(element.amtsstellePath);

        this.reactiveForms.grunddatenForm.markAsDirty();
    }

    selectMassnahmenart(element: NodeData) {
        this.selectedMassnahmenartElement = element;
        this.setSelectedAmtsstelleAusgleichsstelle({
            amtsstellePath: element.amtsstellePath,
            ausgleichstellePath: element.ausgleichstellePath
        });

        this.setAmtsstelleAusgleichstelleIds({
            strukturelementId: element.strukturelementId,
            mappingAusgleichstelleId: element.mappingAusgleichstelleId
        });

        this.setAmtsstelleAusgleichstelleText({
            selectedAmtsstelle: element.amtsstellePath,
            selectedAusgleichstelle: element.ausgleichstellePath
        });

        this.reactiveForms.grunddatenForm.markAsDirty();
    }

    setAmtsstelleAusgleichstelleIds(data: { strukturelementId: number; mappingAusgleichstelleId: number }) {
        const controlAmtsstelleId = this.reactiveForms.grunddatenForm.controls.amtsstelle as FormControl;
        controlAmtsstelleId.setValue(data.strukturelementId);

        this.setAusgleichstelleId(data.mappingAusgleichstelleId);
    }

    setAusgleichstelleId(data: number) {
        const controlAusgleichsstelleId = this.reactiveForms.grunddatenForm.controls.ausgleichsstelle as FormControl;
        controlAusgleichsstelleId.setValue(data);
    }

    setAmtsstelleAusgleichstelleText(data: { selectedAmtsstelle: MultiLanguageParamDTO; selectedAusgleichstelle: MultiLanguageParamDTO }) {
        const controlAmtsstelleText = this.reactiveForms.grunddatenForm.controls.amtsstelleText as FormControl;
        controlAmtsstelleText.setValue(this.dbTranslateService.translate(this.formUtils.extractElementNameFromPath(data.selectedAmtsstelle), 'name'));

        this.setAusgleichstelleText(data.selectedAusgleichstelle);
    }

    setAusgleichstelleText(data: MultiLanguageParamDTO) {
        const controlAusgleichsstelleText = this.reactiveForms.grunddatenForm.controls.ausgleichsstelleText as FormControl;
        controlAusgleichsstelleText.setValue(this.dbTranslateService.translate(this.formUtils.extractElementNameFromPath(data), 'name'));
    }

    setSelectedAmtsstelleAusgleichsstelle(element: { amtsstellePath: MultiLanguageParamDTO; ausgleichstellePath: MultiLanguageParamDTO }) {
        this.selectedAmtsstellePath = element.amtsstellePath;
        this.selectedAusgleichstellePath = element.ausgleichstellePath;
        this.selectedAmtsstelleElementName = this.formUtils.extractElementNameFromPath(element.amtsstellePath);
        this.selectedAusgleichstelleElementName = this.formUtils.extractElementNameFromPath(element.ausgleichstellePath);
    }
}

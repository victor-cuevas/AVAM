import { Injectable } from '@angular/core';
import { BewProduktSuchenReactiveFormsService } from './bew-produkt-suchen-reactive-forms.service';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { NodeData, MassnahmenQueryParams, StrukturElementType } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { FormControl } from '@angular/forms';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { AmmZulassungstypCode } from '@app/shared/enums/domain-code/amm-zulassungstyp-code.enum';
import { ProduktSuchenParamDTO } from '@app/shared/models/dtos-generated/produktSuchenParamDTO';
import { XProduktDTO } from '@app/shared/models/dtos-generated/xProduktDTO';

@Injectable()
export class BewProduktSuchenHandlerService {
    // The following property is used for tooltips in the avam-input-modal component.
    // If its not initialized, the tooltips are coming up on mouse click but not on mouse hover as expected.
    // If the problem is later solved in the core component, the initialization can be safely removed.
    selectedAmtsstellePath: MultiLanguageParamDTO = { nameDe: ' ', nameFr: ' ', nameIt: ' ' };
    massnahmenAmtsstelleQueryParams: MassnahmenQueryParams;
    selectedAmtsstelleElementName: MultiLanguageParamDTO;
    selectedElement: NodeData;

    currentYear = new Date().getFullYear();

    constructor(public reactiveForms: BewProduktSuchenReactiveFormsService, private dbTranslateService: DbTranslateService, private formUtils: FormUtilsService) {
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

    createRow(responseDTO: XProduktDTO, index: number) {
        return {
            id: index,
            produktId: responseDTO.produktId,
            titel: this.dbTranslateService.translateWithOrder(responseDTO, 'titel'),
            gueltigVon: responseDTO.gueltigVon ? new Date(responseDTO.gueltigVon) : '',
            gueltigBis: responseDTO.gueltigBis ? new Date(responseDTO.gueltigBis) : '',
            anzMassnahmen: responseDTO.anzMassnahmen,
            strkMassn: responseDTO.kuerzel
        };
    }

    setDefaultValues(zulassungstypOptionsUnmapped: any[]) {
        const defaultValues = this.getDefaultValues();
        this.reactiveForms.searchForm.controls.zulassungsTyp.setValue(this.formUtils.getCodeIdByCode(zulassungstypOptionsUnmapped, defaultValues.zulassungsTyp));
        this.reactiveForms.searchForm.controls.gueltigVon.setValue(defaultValues.gueltigVon);
        this.reactiveForms.searchForm.controls.gueltigBis.setValue(defaultValues.gueltigBis);
    }

    getDefaultValues(): ProduktSuchenParamDTO {
        return {
            zulassungsTyp: AmmZulassungstypCode.KOLLEKTIV,
            gueltigVon: new Date(this.currentYear, 0, 1),
            gueltigBis: new Date(this.currentYear, 11, 31)
        };
    }

    selectMassnahmenart(element: NodeData) {
        this.selectedElement = element;
        this.setSelectedAmtsstelle(element.amtsstellePath);
        this.setAmtsstelleText(element.amtsstellePath);

        element.searchKategorieId
            ? this.reactiveForms.searchForm.controls.elementkategorieId.setValue(element.searchKategorieId)
            : this.reactiveForms.searchForm.controls.elementkategorieId.setValue(element.elementkategorieId);

        this.reactiveForms.searchForm.controls.strukturelementId.setValue(element.strukturelementId);

        this.reactiveForms.searchForm.markAsDirty();
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

    toggleEnabledInputs(produktNrValue: any): boolean {
        let disableInputs = false;

        if (produktNrValue) {
            disableInputs = true;
            this.reactiveForms.searchForm.controls.titel.disable();
            this.reactiveForms.searchForm.controls.lamCode.disable();
            this.reactiveForms.searchForm.controls.zulassungsTyp.disable();
            this.reactiveForms.searchForm.controls.gueltigVon.disable();
            this.reactiveForms.searchForm.controls.gueltigBis.disable();
        } else {
            disableInputs = false;
            this.reactiveForms.searchForm.controls.titel.enable();
            this.reactiveForms.searchForm.controls.lamCode.enable();
            this.reactiveForms.searchForm.controls.zulassungsTyp.enable();
            this.reactiveForms.searchForm.controls.gueltigVon.enable();
            this.reactiveForms.searchForm.controls.gueltigBis.enable();
        }

        return disableInputs;
    }

    updateSelectedMassnahmenartLanguage() {
        this.setAmtsstelleText(this.selectedAmtsstellePath);
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

import { Injectable } from '@angular/core';
import { StrukturelementFormService } from './strukturelement-form.service';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { NodeData } from '@app/shared/components/massnahmenart-waehlen-modal/massnahmenart-tree-models';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FormUtilsService } from '@app/shared';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { FormControl } from '@angular/forms';
import { SpracheEnum } from '@app/shared/enums/sprache.enum';
import { ErfassungsspracheEnum } from '@app/shared/enums/erfassungssprache.enum';

@Injectable()
export class StrukturelementHandlerService {
    selectedAusgleichstellePath: MultiLanguageParamDTO;
    selectedAusgleichstelleElementName: MultiLanguageParamDTO;
    spracheMap = {
        [SpracheEnum.DEUTSCH]: ErfassungsspracheEnum.DEUTSCH,
        [SpracheEnum.FRANZOESISCH]: ErfassungsspracheEnum.FRANZOESISCH,
        [SpracheEnum.ITALIENISCH]: ErfassungsspracheEnum.ITALIENISCH
    };

    constructor(public reactiveForm: StrukturelementFormService, private dbTranslateService: DbTranslateService, private formUtils: FormUtilsService) {}

    mapToDTO(strukturelement: StrukturElementDTO): StrukturElementDTO {
        const formControls = this.reactiveForm.formGroup.controls;
        return {
            ...strukturelement,
            elementCode: formControls.elementCode.value,
            elementNameDe: formControls.elementnameDe.value ? formControls.elementnameDe.value : '',
            elementNameFr: formControls.elementnameFr.value ? formControls.elementnameFr.value : '',
            elementNameIt: formControls.elementnameIt.value ? formControls.elementnameIt.value : '',
            beschreibungDe: formControls.beschreibungDe.value ? formControls.beschreibungDe.value : '',
            beschreibungFr: formControls.beschreibungFr.value ? formControls.beschreibungFr.value : '',
            beschreibungIt: formControls.beschreibungIt.value ? formControls.beschreibungIt.value : '',
            sortierSchluessel: formControls.sortierschluessel.value,
            gueltigVon: this.formUtils.parseDate(formControls.gueltigVon.value),
            gueltigBis: this.formUtils.parseDate(formControls.gueltigBis.value),
            mappingAusgleichstelleId: formControls.ausgleichstelleId.value
        };
    }

    mapToForm(data: StrukturElementDTO) {
        const formValues = {
            erfassungssprache: this.spracheMap[this.dbTranslateService.getCurrentLang().toUpperCase()],
            elementCode: data.elementCode,
            elementnameDe: data.elementNameDe,
            elementnameFr: data.elementNameFr,
            elementnameIt: data.elementNameIt,
            beschreibungDe: data.beschreibungDe,
            beschreibungFr: data.beschreibungFr,
            beschreibungIt: data.beschreibungIt,
            sortierschluessel: data.sortierSchluessel,
            gueltigVon: new Date(data.gueltigVon),
            gueltigBis: new Date(data.gueltigBis),
            kbArtAsal: data.kbArtASAL,
            elternElement: data.vorgaengerObject ? this.dbTranslateService.translate(data.vorgaengerObject, 'elementName') : '',
            ausgleichstelleId: data.mappingAusgleichstelleId,
            ausgleichstelle: data.mappingAusgleichstelleObject ? this.dbTranslateService.translate(data.mappingAusgleichstelleObject, 'elementName') : ''
        };
        this.reactiveForm.formGroup.reset(formValues);
    }

    mapOptions(options: CodeDTO[]) {
        return options ? options.map(option => this.customPropertyMapper(option)) : [];
    }

    customPropertyMapper(element: CodeDTO) {
        return {
            value: this.spracheMap[element.code],
            labelDe: element.kurzTextDe,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt
        };
    }

    selectAusgleichsstelle(element: NodeData) {
        this.selectedAusgleichstellePath = element.amtsstellePath;
        this.setAusgleichstelleId(element.strukturelementId);
        this.setAusgleichstelleText(element.amtsstellePath);

        this.reactiveForm.formGroup.markAsDirty();
    }

    setSelectedAusgleichsstellePath(path: MultiLanguageParamDTO) {
        this.selectedAusgleichstellePath = path;
    }

    private setAusgleichstelleId(data: number) {
        const controlAusgleichsstelleId = this.reactiveForm.formGroup.controls.ausgleichstelleId as FormControl;
        controlAusgleichsstelleId.setValue(data);
    }

    private setAusgleichstelleText(data: MultiLanguageParamDTO) {
        const controlAusgleichsstelleText = this.reactiveForm.formGroup.controls.ausgleichstelle as FormControl;
        controlAusgleichsstelleText.setValue(this.dbTranslateService.translate(this.formUtils.extractElementNameFromPath(data), 'name'));
    }
}

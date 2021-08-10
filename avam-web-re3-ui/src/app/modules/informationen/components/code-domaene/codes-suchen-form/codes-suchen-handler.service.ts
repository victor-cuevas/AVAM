import { Injectable } from '@angular/core';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { CodeSuchenParamDTO } from '@app/shared/models/dtos-generated/codeSuchenParamDTO';
import { CodesSuchenReactiveFormService } from './codes-suchen-reactive-form.service';

@Injectable()
export class CodesSuchenHandlerService {
    constructor(private reactiveForms: CodesSuchenReactiveFormService) {}

    mapToDTO(): CodeSuchenParamDTO {
        const controls = this.reactiveForms.codeSuchenForm.controls;

        return {
            gueltigkeit: controls.status.value,
            domain: controls.vollzugsregionType.value ? controls.vollzugsregionType.value['domain'] || controls.vollzugsregionType.value : null,
            kurztext: controls.bezeichnung.value
        };
    }

    mapStateData() {
        const controls = this.reactiveForms.codeSuchenForm.controls;

        return {
            status: controls.status.value,
            vollzugsregionType: controls.vollzugsregionType['domainAutosuggestObject'],
            bezeichnung: controls.bezeichnung.value
        };
    }

    codePropertyMapper(element: CodeDTO) {
        return {
            value: element.code,
            code: element.code,
            codeId: element.codeId,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    }
}

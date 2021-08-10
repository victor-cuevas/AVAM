import { Injectable } from '@angular/core';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { FormGroup } from '@angular/forms';
import { StrukturReactiveFormService } from './struktur-reactive-form.service';
import { StrukturFilterDTO } from './struktur-filter.component';

@Injectable()
export class StrukturHandlerService {
    constructor(public reactiveForm: StrukturReactiveFormService) {}

    mapToDTO(form: FormGroup): StrukturFilterDTO {
        return { elementkategorieId: +form.controls.elementCategory.value, anzeigeDatum: form.controls.date.value };
    }

    mapToForm(data: ElementKategorieDTO[]) {
        const formValues = {
            elementCategory: data[0] ? data[0].elementkategorieId : '',
            date: new Date()
        };
        this.reactiveForm.searchForm.reset(formValues);
    }

    mapOptions(options: ElementKategorieDTO[]) {
        return options ? options.map(option => this.customPropertyMapper(option)) : [];
    }

    customPropertyMapper = (element: ElementKategorieDTO) => {
        return {
            value: element.elementkategorieId,
            labelDe: element.beschreibungDe,
            labelFr: element.beschreibungFr,
            labelIt: element.beschreibungIt
        };
    };
}

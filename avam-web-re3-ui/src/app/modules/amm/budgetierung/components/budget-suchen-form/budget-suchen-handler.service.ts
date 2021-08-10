import { Injectable } from '@angular/core';
import { BudgetSuchenReactiveFormsService } from './budget-suchen-reactive-forms.service';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { BudgetSuchenParamDTO } from '@app/shared/models/dtos-generated/budgetSuchenParamDTO';

@Injectable()
export class BudgetSuchenHandlerService {
    constructor(public reactiveForms: BudgetSuchenReactiveFormsService) {}

    mapToDTO(): BudgetSuchenParamDTO {
        const formControls = this.reactiveForms.budgetSuchenForm.value;
        return {
            jahr: formControls.jahr ? formControls.jahr : null,
            organisation: formControls.organisation ? formControls.organisation : null,
            status: formControls.status ? formControls.status : null,
            version: formControls.version ? formControls.version : null
        };
    }

    mapCategoriesOptions(options: ElementKategorieDTO[]) {
        return options ? options.map(option => this.categoriesPropertyMapper(option)) : [];
    }

    private categoriesPropertyMapper = (element: ElementKategorieDTO) => {
        return {
            value: element.organisation,
            labelDe: element.beschreibungDe,
            labelFr: element.beschreibungFr,
            labelIt: element.beschreibungIt,
            isSelected: element.aktuell
        };
    };
}

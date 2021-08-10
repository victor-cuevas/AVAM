import { Injectable } from '@angular/core';
import { GesamtbudgetReactiveFormsService } from './gesamtbudget-reactive-forms.service';
import { BudgetDTO } from '@app/shared/models/dtos-generated/budgetDTO';
import { FormUtilsService } from '@app/shared';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { FacadeService } from '@shared/services/facade.service';

@Injectable()
export class GesamtbudgetHandlerService {
    constructor(public reactiveForms: GesamtbudgetReactiveFormsService, private facade: FacadeService) {}

    mapToForm(budget: BudgetDTO) {
        return {
            bemerkung: budget.bemerkung ? budget.bemerkung : '',
            bearbeitungDurch: budget.bearbeitungDurchObject,
            status: budget.status.codeId,
            freigabeDurch: budget.freigabeDurchObject,
            freigabeDatum: budget.freigabeDatum ? this.facade.formUtilsService.parseDate(budget.freigabeDatum) : ''
        };
    }

    mapToDTO(budget: BudgetDTO, status: CodeDTO): BudgetDTO {
        const controls = this.reactiveForms.budgetForm.controls;
        return {
            ...budget,
            status,
            bemerkung: controls.bemerkung.value,
            bearbeitungDurchObject: controls.bearbeitungDurch['benutzerObject'],
            freigabeDurchObject: controls.freigabeDurch['benutzerObject']
        };
    }
}

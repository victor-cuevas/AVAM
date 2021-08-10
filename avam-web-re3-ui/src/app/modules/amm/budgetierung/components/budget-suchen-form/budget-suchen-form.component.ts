import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { BudgetSuchenHandlerService } from './budget-suchen-handler.service';
import { BudgetSuchenReactiveFormsService } from './budget-suchen-reactive-forms.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { ElementKategorieDTO } from '@dtos/elementKategorieDTO';
import { CodeDTO } from '@dtos/codeDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { AmmInfopanelService } from '@app/shared/components/amm-infopanel/amm-infopanel.service';
import { BudgetSuchenParamDTO } from '@dtos/budgetSuchenParamDTO';
import { FacadeService } from '@shared/services/facade.service';

export interface BudgetSuchenFormData {
    elementkategorien?: ElementKategorieDTO[];
    statusOptions?: CodeDTO[];
    state?: any;
}
@Component({
    selector: 'avam-budget-suchen-form',
    templateUrl: './budget-suchen-form.component.html',
    styleUrls: ['./budget-suchen-form.component.scss'],
    providers: [BudgetSuchenHandlerService, BudgetSuchenReactiveFormsService]
})
export class BudgetSuchenFormComponent implements OnInit, OnChanges {
    @Input() budgetSuchenFormData: BudgetSuchenFormData;
    @Output() onEnter: EventEmitter<KeyboardEvent> = new EventEmitter();

    @ViewChild('ngForm') ngForm: FormGroupDirective;

    public formGroup: FormGroup;
    categoriesOptions = [];
    statusDropdownLabels = [];
    currentUserStruktur: ElementKategorieDTO;

    constructor(
        private handler: BudgetSuchenHandlerService,
        private reactiveForms: BudgetSuchenReactiveFormsService,
        private obliqueHelper: ObliqueHelperService,
        private facade: FacadeService
    ) {
        this.formGroup = reactiveForms.budgetSuchenForm;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.budgetSuchenFormData.currentValue) {
            this.categoriesOptions = this.handler.mapCategoriesOptions(this.budgetSuchenFormData.elementkategorien);
            this.statusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(this.budgetSuchenFormData.statusOptions);
            this.currentUserStruktur = this.budgetSuchenFormData.elementkategorien.find(struktur => struktur.aktuell);

            if (this.budgetSuchenFormData.state) {
                this.formGroup.setValue(this.budgetSuchenFormData.state);
            } else {
                this.formGroup.patchValue({ organisation: this.currentUserStruktur ? this.currentUserStruktur.organisation : null });
            }
        }
    }

    mapToDTO(): BudgetSuchenParamDTO {
        return this.handler.mapToDTO();
    }

    mapToForm(param: BudgetSuchenParamDTO) {
        this.formGroup.setValue(param);
    }

    reset() {
        this.formGroup.reset({ organisation: this.currentUserStruktur.organisation });
    }
}

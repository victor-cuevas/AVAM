import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BudgetierungRoutingModule } from './budgetierung-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import * as components from './components/index';
import * as pages from './pages/index';
import { AmmBudgetierungRestService } from './services/amm-budgetierung-rest.service';
import { CdkTableModule } from '@angular/cdk/table';
import { BudgetTreeService } from './services/budget-tree.service';
import { BudgetvergleichService } from './services/budgetvergleich.service';

@NgModule({
    declarations: [
        pages.BudgetSuchenComponent,
        pages.BudgetHomeComponent,
        pages.BudgetErfassenComponent,
        pages.GesamtbudgetComponent,
        pages.TeilbudgetsComponent,
        pages.TeilbudgetErfassenComponent,
        pages.TeilbudgetBearbeitenComponent,
        components.BudgetSuchenFormComponent,
        components.BudgetSuchenTableComponent,
        components.BudgetAuswaehlenTableComponent,
        components.GesamtbudgetFormComponent,
        components.TeilbudgetTableComponent,
        components.TeilbudgetAuswaehlenTableComponent,
        components.BudgetvergleichAnzeigenModalComponent,
        components.ListekopieTableComponent,
        components.TeilbudgetTreeTableComponent
    ],
    imports: [CommonModule, BudgetierungRoutingModule, SharedModule, CdkTableModule],
    providers: [AmmBudgetierungRestService, BudgetTreeService, BudgetvergleichService],
    entryComponents: [components.BudgetvergleichAnzeigenModalComponent]
})
export class BudgetierungModule {}

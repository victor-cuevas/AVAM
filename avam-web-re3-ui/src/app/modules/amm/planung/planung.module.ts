import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanungRoutingModule } from './planung-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import * as pages from './pages/index';
import * as components from './components/index';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
    declarations: [
        pages.PlanwertSuchenComponent,
        pages.PlanungAnzeigenComponent,
        components.PlanwertSuchenFormComponent,
        components.PlanwertSuchenTableComponent,
        components.PlanungSuchenFormComponent,
        components.PlanungAnzeigenTreeTableComponent
    ],
    imports: [CommonModule, PlanungRoutingModule, SharedModule, CdkTableModule]
})
export class PlanungModule {}

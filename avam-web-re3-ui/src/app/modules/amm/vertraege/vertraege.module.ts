import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VertraegeRoutingModule } from './vertraege-routing.module';
import * as pages from './pages/index';
import * as components from './components/index';
import { CdkTableModule } from '@angular/cdk/table';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
    declarations: [
        pages.LeistungsvereinbarungSuchenComponent,
        pages.VertragswertSuchenComponent,
        pages.RahmenvertragSuchenComponent,
        components.LeistungsvereinbarungSuchenFormComponent,
        components.VertragswertSuchenFormComponent,
        components.LeistungsvereinbarungSuchenTableComponent,
        components.RahmenvertragSuchenFormComponent,
        components.VertragswertSuchenTableComponent
    ],
    imports: [CommonModule, VertraegeRoutingModule, SharedModule, CdkTableModule]
})
export class VertraegeModule {}

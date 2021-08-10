import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as components from './components/index';
import * as pages from './pages/index';

import { TeilzahlungenRoutingModule } from './teilzahlungen-routing.module';
import { CdkTableModule } from '@angular/cdk/table';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
    declarations: [components.TeilzahlungenSuchenFormComponent, components.TeilzahlungenSuchenTableComponent, pages.TeilzahlungenSuchenComponent],
    imports: [CommonModule, TeilzahlungenRoutingModule, SharedModule, CdkTableModule]
})
export class TeilzahlungenModule {}

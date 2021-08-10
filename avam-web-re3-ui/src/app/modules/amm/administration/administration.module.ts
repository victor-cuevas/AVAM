import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministrationRoutingModule } from './administration-routing.module';
import { StrukturAnzeigenComponent } from './pages/struktur-anzeigen/struktur-anzeigen.component';
import { StrukturFilterComponent } from './components/struktur-filter/struktur-filter.component';
import { SharedModule } from '@app/shared/shared.module';
import { StrukturelementModalComponent } from './components/strukturelement-modal/strukturelement-modal.component';
import { StrukturelementFormComponent } from './components/strukturelement-form/strukturelement-form.component';
@NgModule({
    declarations: [StrukturAnzeigenComponent, StrukturFilterComponent, StrukturelementModalComponent, StrukturelementFormComponent],
    imports: [CommonModule, AdministrationRoutingModule, SharedModule]
})
export class AdministrationModule {}

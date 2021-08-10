import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { AvamGenericTableModule } from '@app/library/wrappers/data/avam-generic-table/avam-generic-table.module';
import { SharedModule } from '@shared/shared.module';
import { KaeSweSuchenTableComponent } from '@modules/arbeitgeber/shared/components/kaeswe-suchen-table/kae-swe-suchen-table.component';

@NgModule({
    declarations: [KaeSweSuchenTableComponent],
    imports: [CommonModule, AvamGenericTableModule, SharedModule, CdkTableModule],
    exports: [KaeSweSuchenTableComponent]
})
export class ArbeitgeberSharedModule {}

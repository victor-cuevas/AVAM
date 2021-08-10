import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CdkTableModule } from '@angular/cdk/table';
import { SweMeldungSuchenComponent } from '@modules/arbeitgeber/schlechtwetter/pages/swe-meldung-suchen/swe-meldung-suchen.component';
import { ArbeitgeberSchlechtwetterRoutingModule } from '@modules/arbeitgeber/schlechtwetter/arbeitgeber-schlechtwetter-routing.module';
import { ArbeitgeberSharedModule } from '@modules/arbeitgeber/shared/arbeitgeber-shared.module';

@NgModule({
    declarations: [SweMeldungSuchenComponent],
    imports: [CommonModule, ReactiveFormsModule, ArbeitgeberSchlechtwetterRoutingModule, FormsModule, SharedModule, CdkTableModule, ArbeitgeberSharedModule],
    providers: []
})
export class ArbeitgeberSchlechtwetterModule {}

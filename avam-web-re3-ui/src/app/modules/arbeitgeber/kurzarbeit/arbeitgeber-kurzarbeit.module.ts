import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { CdkTableModule } from '@angular/cdk/table';
import { VoranmeldungSuchenComponent } from '@modules/arbeitgeber/kurzarbeit/pages/voranmeldung-suchen/voranmeldung-suchen.component';
import { ArbeitgeberKurzarbeitRoutingModule } from '@modules/arbeitgeber/kurzarbeit/arbeitgeber-kurzarbeit-routing.module';
import { ArbeitgeberSharedModule } from '@modules/arbeitgeber/shared/arbeitgeber-shared.module';

@NgModule({
    declarations: [VoranmeldungSuchenComponent],
    imports: [CommonModule, ReactiveFormsModule, ArbeitgeberKurzarbeitRoutingModule, FormsModule, SharedModule, CdkTableModule, ArbeitgeberSharedModule],
    providers: []
})
export class ArbeitgeberKurzarbeitModule {}

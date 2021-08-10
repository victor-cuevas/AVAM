import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { StesVermittlungSearchComponent } from '@modules/arbeitgeber/arbeitsvermittlung/pages/stes-vermittlung-search/stes-vermittlung-search.component';
import { CdkTableModule } from '@angular/cdk/table';
import { ArbeitgeberArbeitsvermittlungRoutingModule } from '@modules/arbeitgeber/arbeitsvermittlung/arbeitgeber-arbeitsvermittlung-routing.module';
import { GeschlechtPipe } from '@app/shared';
// prettier-ignore
import {
    StellenAngeboteMatchingTreffernComponent
} from '@modules/arbeitgeber/arbeitsvermittlung/pages/stellen-angebote-matching-treffern/stellen-angebote-matching-treffern.component';

@NgModule({
    declarations: [StesVermittlungSearchComponent, StellenAngeboteMatchingTreffernComponent],
    imports: [CommonModule, ReactiveFormsModule, ArbeitgeberArbeitsvermittlungRoutingModule, FormsModule, SharedModule, CdkTableModule],
    providers: [GeschlechtPipe]
})
export class ArbeitgeberArbeitsvermittlungModule {}

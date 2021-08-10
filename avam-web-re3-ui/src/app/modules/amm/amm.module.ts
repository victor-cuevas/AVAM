import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { AmmSectionRoutingModule } from '@modules/amm/amm-routing.module';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';

@NgModule({
    declarations: [],
    imports: [CommonModule, AmmSectionRoutingModule],
    providers: [DatePipe, DbTranslatePipe]
})
export class AMMModule {}

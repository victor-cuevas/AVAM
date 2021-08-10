import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnternehmenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { UnternehmenTitles } from '@shared/enums/unternehmen.enum';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { SweMeldungSuchenComponent } from '@modules/arbeitgeber/schlechtwetter/pages/swe-meldung-suchen/swe-meldung-suchen.component';

const arbeitgeberSchlechtwetterRoutes: Routes = [
    {
        path: UnternehmenPaths.SWE_MELDUNG_SUCHEN,
        component: SweMeldungSuchenComponent,
        data: {
            title: UnternehmenTitles.SWE_MELDUNG_SUCHEN,
            formNumber: StesFormNumberEnum.SWE_MELDUNG_SUCHEN,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SWE_MELDUNG_SUCHEN]
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(arbeitgeberSchlechtwetterRoutes)],
    exports: [RouterModule]
})
export class ArbeitgeberSchlechtwetterRoutingModule {}

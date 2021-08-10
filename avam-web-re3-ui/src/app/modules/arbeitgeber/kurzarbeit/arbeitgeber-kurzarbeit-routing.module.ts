import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnternehmenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { UnternehmenTitles } from '@shared/enums/unternehmen.enum';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { VoranmeldungSuchenComponent } from '@modules/arbeitgeber/kurzarbeit/pages/voranmeldung-suchen/voranmeldung-suchen.component';

const arbeitgeberKurzarbeitRoutes: Routes = [
    {
        path: UnternehmenPaths.VORANMELDUNG_SUCHEN,
        component: VoranmeldungSuchenComponent,
        data: {
            title: UnternehmenTitles.VORANMELDUNG_SUCHEN,
            formNumber: StesFormNumberEnum.VORANMELDUNG_SUCHEN,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_SUCHEN]
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(arbeitgeberKurzarbeitRoutes)],
    exports: [RouterModule]
})
export class ArbeitgeberKurzarbeitRoutingModule {}

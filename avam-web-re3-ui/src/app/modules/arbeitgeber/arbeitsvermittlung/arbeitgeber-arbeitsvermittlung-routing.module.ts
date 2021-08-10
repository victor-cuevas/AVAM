import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { UnternehmenPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { UnternehmenTitles } from '@app/shared/enums/unternehmen.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesVermittlungSearchComponent } from '@modules/arbeitgeber/arbeitsvermittlung/pages/stes-vermittlung-search/stes-vermittlung-search.component';
// prettier-ignore
import {
    StellenAngeboteMatchingTreffernComponent
} from '@modules/arbeitgeber/arbeitsvermittlung/pages/stellen-angebote-matching-treffern/stellen-angebote-matching-treffern.component';

const arbeitgeberArbeitsvermittlungRoutes: Routes = [
    {
        path: UnternehmenPaths.STES_ARBEITSVERMITTLUNG_SUCHEN,
        component: StesVermittlungSearchComponent,
        data: {
            title: UnternehmenTitles.STES_VERMITTLUNG_SUCHEN,
            formNumber: StesFormNumberEnum.STES_VERMITTLUNG_SUCHEN,
            permissions: [Permissions.FEATURE_33, Permissions.STES_SUCHEN_SICHTEN]
        }
    },
    {
        path: UnternehmenPaths.STES_ARBEITSVERMITTLUNG_STELLENANGEBOTE_SUCHEN,
        component: StellenAngeboteMatchingTreffernComponent,
        data: {
            title: UnternehmenTitles.STES_STELLENANGEBOTE_SUCHEN,
            formNumber: StesFormNumberEnum.STES_VERMITTLUNG_STELLENANGEBOTE_SUCHEN,
            permissions: [Permissions.FEATURE_33, Permissions.STES_VM_MATCHING]
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(arbeitgeberArbeitsvermittlungRoutes)],
    exports: [RouterModule]
})
export class ArbeitgeberArbeitsvermittlungRoutingModule {}

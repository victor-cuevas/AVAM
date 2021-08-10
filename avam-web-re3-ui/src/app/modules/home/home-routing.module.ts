import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { StartPageComponent } from './pages/start-page/start-page.component';
import { StesFormNumberEnum } from '../../shared/enums/stes-form-number.enum';

const homeRoutes: Routes = [
    { path: '', redirectTo: 'start-page', pathMatch: 'full' },
    { path: 'start-page', component: StartPageComponent, data: { formNumber: StesFormNumberEnum.STARTSEITE } }
];

@NgModule({
    imports: [RouterModule.forChild(homeRoutes)],
    exports: [RouterModule]
})
export class HomeRoutingModule {}

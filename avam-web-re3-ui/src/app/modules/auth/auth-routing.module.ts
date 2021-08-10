import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginComponent } from './pages/login/login.component';
import { StesFormNumberEnum } from '../../shared/enums/stes-form-number.enum';

const routes: Routes = [{ path: '', component: LoginComponent, data: { formNumber: StesFormNumberEnum.ANMELDUNG } }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}

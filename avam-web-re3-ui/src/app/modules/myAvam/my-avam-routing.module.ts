import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { BenutzerstelleAendernComponent } from './components/benutzerstelle-aendern/benutzerstelle-aendern.component';

const myAvamRoutes: Routes = [{ path: 'benutzerstelleaendern', component: BenutzerstelleAendernComponent }];

@NgModule({
    imports: [RouterModule.forChild(myAvamRoutes)],
    exports: [RouterModule]
})
export class MyAvamRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthRoutingModule } from './auth-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ObliqueModule } from 'oblique-reactive';
import { LoginComponent } from './pages/login/login.component';
import { SharedModule } from '../../shared/shared.module';
import { BenutzerstellenComponent } from './pages/login/benutzerstellen/benutzerstellen.component';
import { ChangePasswordComponent } from './pages/login/change-password/change-password.component';
import { BenutzerstelleAendernService } from '../myAvam/services/benutzerstelle-aendern.service';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule, // Keep this order!
        ObliqueModule.forRoot(), // It has only forRoot method
        TranslateModule.forChild(),
        AuthRoutingModule,
        CdkTableModule,
        SharedModule
    ],
    declarations: [LoginComponent, BenutzerstellenComponent, ChangePasswordComponent],
    exports: [BenutzerstellenComponent],
    providers: [BenutzerstelleAendernService]
})
export class AuthModule {}

import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BenutzerstelleAendernComponent } from './components/benutzerstelle-aendern/benutzerstelle-aendern.component';
import { MyAvamRoutingModule } from './my-avam-routing.module';
import { AuthModule } from '@auth/auth.module';
import { BenutzerstelleAendernService } from './services/benutzerstelle-aendern.service';

@NgModule({
    declarations: [BenutzerstelleAendernComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule, // Keep this order!
        ObliqueModule.forRoot(), // It has only forRoot method
        TranslateModule.forChild(),
        MyAvamRoutingModule,
        SharedModule,
        AuthModule
    ],
    providers: [DatePipe, BenutzerstelleAendernService]
})
export class MyAvamModule {
    constructor() {
        /**/
    }
}

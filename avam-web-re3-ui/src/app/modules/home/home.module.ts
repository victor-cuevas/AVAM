import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ObliqueModule } from 'oblique-reactive';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeRoutingModule } from './home-routing.module';
import { AuthModule } from '@auth/auth.module';
import { StartPageComponent } from './pages/start-page/start-page.component';
import { InfoMessageComponent } from './pages/start-page/info-message/info-message.component';

@NgModule({
    declarations: [StartPageComponent, InfoMessageComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule, // Keep this order!
        ObliqueModule.forRoot(), // It has only forRoot method
        TranslateModule.forChild(),
        HomeRoutingModule,
        SharedModule,
        AuthModule
    ],
    providers: [DatePipe]
})
export class HomeModule {
    constructor() {}
}

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientXsrfModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ObliqueModule } from 'oblique-reactive';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// Feature Modules
import { ErrorModule } from './modules/error/error.module';
// Core Modules
import { CoreModule } from './core/core.module';
// Config Service
import { ConfigService } from './config/config.service';
import { WebpackTranslateLoader } from '@app/webpack-translate-loader';
import { CorePreloadStrategy } from './library/core/core-preload-strategy';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'AVAM-Xsrf-Cookie',
            headerName: 'AVAM-Xsrf-Header'
        }),
        NgbModule, // Keep this order!
        ObliqueModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: WebpackTranslateLoader
            }
        }),
        AppRoutingModule,
        CoreModule,
        ErrorModule
    ],
    providers: [CorePreloadStrategy, ConfigService],
    entryComponents: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './pages/404/page-not-found.component';
import { ErrorRoutingModule } from './error-routing.module';

@NgModule({
    imports: [
        CommonModule,
        ErrorRoutingModule
    ],
    declarations: [
        PageNotFoundComponent
    ]
})
export class ErrorModule { }

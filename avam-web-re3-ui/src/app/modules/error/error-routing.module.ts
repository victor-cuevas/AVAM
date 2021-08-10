import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {PageNotFoundComponent} from './pages/404/page-not-found.component';
import {AuthGuard} from '../../core/guards/auth.guard';

const routes: Routes = [
    { path: '**', redirectTo: '/not-found' },
    { path: 'not-found', component: PageNotFoundComponent, canActivate: [AuthGuard]},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ErrorRoutingModule { }

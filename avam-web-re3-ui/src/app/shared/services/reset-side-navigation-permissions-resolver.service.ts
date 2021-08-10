import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '@app/core/services/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class ResetSideNavigationPermissionsResolver implements Resolve<boolean> {
    constructor(private authService: AuthenticationService) {}

    resolve(): Observable<any> | Promise<any> | any {
        this.authService.clearSideNavigationPermissionContext();
        return true;
    }
}

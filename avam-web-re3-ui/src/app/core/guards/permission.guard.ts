import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthenticationService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const permissions: any[] = this.getPermissions(route);

        if (this.authService.hasAllPermissions(permissions)) {
            return true;
        }

        this.router.navigate(['/login']);

        return false;
    }

    private getPermissions(route: ActivatedRouteSnapshot): any[] {
        if (route.data['permissions']) {
            return route.data['permissions'] as Array<any>;
        }

        return [];
    }
}

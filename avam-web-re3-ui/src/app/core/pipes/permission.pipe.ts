import { Pipe, PipeTransform } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

/**
 * This custom pipe has to be used to check the permissions to decide if header menus have to be shown or not
 */
@Pipe({ name: 'permission' })
export class PermissionPipe implements PipeTransform {
    constructor(private authService: AuthenticationService) {}

    transform(navigationMenus: any[]): any[] {
        return this.authService.filter(navigationMenus);
    }
}

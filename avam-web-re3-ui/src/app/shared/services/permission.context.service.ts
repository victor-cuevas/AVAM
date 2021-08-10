import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';

@Injectable()
export class PermissionContextService {
    permissionSubject = new BehaviorSubject<string[]>([]);

    constructor(private authRestService: AuthenticationRestService) {}

    getContextPermissions(benutzerstelleId: number) {
        this.authRestService.getContextPermissionsWithBenutzerstelleId(benutzerstelleId).subscribe(permissionList => this.permissionSubject.next(permissionList));
    }

    getContextPermissionsWithStesId(stesId: number) {
        this.authRestService.getContextPermissionsWithStesId(stesId).subscribe(permissionList => this.permissionSubject.next(permissionList));
    }
}

import { Injectable } from '@angular/core';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { Permissions } from '@shared/enums/permissions.enum';

@Injectable({
    providedIn: 'root'
})
export class HeaderService {
    public permissions: typeof Permissions = Permissions;
    public resultCount;

    constructor(private unternehmenDataService: UnternehmenRestService, private authService: AuthenticationService) {}

    public getJobroomMeldungenCount() {
        const hasPermission = this.authService.hasAllPermissions([Permissions.KEY_AG_OSTE_JOBROOM_SUCHEN, Permissions.FEATURE_33]);
        if (hasPermission) {
            const loggedUser = this.authService.getLoggedUser();
            const dto = {
                abgelehnte: false,
                benutzerstelleVon: loggedUser.benutzerstelleCode,
                benutzerstelleBis: loggedUser.benutzerstelleCode
            };
            this.unternehmenDataService.searchJobroomMeldungen(dto).subscribe(response => {
                this.resultCount = response.data.length;
            });
        }
    }
}

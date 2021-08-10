import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChangePasswordDto } from '@modules/auth/pages/login/login.component';
import { setBaseUrl } from '@shared/services/setBaseUrl.function';
import { LoginDTO } from '@shared/models/dtos-generated/loginDTO';
import { BaseResponseWrapperBooleanWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperBooleanWarningMessages';
import { BaseResponseWrapperJwtDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperJwtDTOWarningMessages';
import { catchError } from 'rxjs/operators';
import { handleError } from '@shared/services/handle-error.function';

@Injectable()
export class AuthenticationRestService {
    constructor(private http: HttpClient) {}

    login(loginDto: LoginDTO): Observable<BaseResponseWrapperJwtDTOWarningMessages> {
        return this.http.post<BaseResponseWrapperJwtDTOWarningMessages>(setBaseUrl('/rest/auth/signin'), loginDto).pipe(catchError(handleError));
    }

    changePassword(changePasswordDto: ChangePasswordDto): Observable<BaseResponseWrapperBooleanWarningMessages> {
        return this.http.post<BaseResponseWrapperBooleanWarningMessages>(setBaseUrl('/rest/user/changepassword'), changePasswordDto).pipe(catchError(handleError));
    }

    logout(): Observable<any> {
        return this.http.get<any>(setBaseUrl('/rest/auth/signout')).pipe(catchError(handleError));
    }

    getContextPermissionsWithBenutzerstelleId(benutzerstelleId: number): Observable<string[]> {
        return this.http.get<string[]>(setBaseUrl(`/rest/user/permissions/benutzerstelle/${benutzerstelleId}`));
    }

    getContextPermissionsWithStesId(stesId: number): Observable<string[]> {
        return this.http.get<string[]>(setBaseUrl(`/rest/user/permissions/stes/${stesId}`));
    }
}

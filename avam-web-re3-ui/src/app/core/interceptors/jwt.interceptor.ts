import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtDTO } from '@shared/models/dtos-generated/jwtDTO';
import { tap } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isOpenRestURL(request.url)) {
            // add authorization header with jwt token if available
            const currentUser: JwtDTO = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.accessToken) {
                request = request.clone({
                    setHeaders: {
                        'Cache-Control': 'no-cache',
                        Pragma: 'no-cache',
                        Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
                        'Content-Type': 'application/json; charset=utf-8',
                        Accept: 'application/json',
                        Authorization: `${currentUser.tokenType} ${currentUser.accessToken}`
                    }
                });
            }
        }

        return next.handle(request).pipe(tap(this.storeToken));
    }

    private isOpenRestURL(reqURL: string): boolean {
        return reqURL.includes('/rest/common/env') || reqURL.includes('/rest/auth/signin') || reqURL.includes('/rest/common/robo-help');
    }

    private storeToken = (event: HttpEvent<any>) => {
        if (!(event instanceof HttpResponseBase)) {
            return;
        }

        const jwtToken: string = event.headers.get('JWT-Token');
        if (!jwtToken) {
            return;
        }

        const stringifiedCurrentUser: string = localStorage.getItem('currentUser');
        if (!stringifiedCurrentUser) {
            return;
        }

        const currentUser: JwtDTO = JSON.parse(stringifiedCurrentUser);

        const currentVersion: number = this.getVersion(currentUser.accessToken);

        const versionInResponseToken: number = this.getVersion(jwtToken);

        if (!this.shouldUpdateToken(currentVersion, versionInResponseToken)) {
            return;
        }

        currentUser.accessToken = jwtToken;

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    };

    private getVersion(jwtToken: string): number {
        const parts: string[] = jwtToken.split('.');

        const payloadString: string = this.tryReadPayload(parts);
        if (!payloadString) {
            return undefined;
        }

        const jwtPayload: any = JSON.parse(payloadString);
        if (typeof jwtPayload.VERSION === 'number') {
            return jwtPayload.VERSION as number;
        }
        return undefined;
    }

    private tryReadPayload(parts: string[]): string {
        const payloadIndex = 1;
        try {
            return atob(parts[payloadIndex]);
        } catch (e) {
            return undefined;
        }
    }

    private shouldUpdateToken(currentVersion: number, versionInResponseToken: number): boolean {
        if (versionInResponseToken === undefined) {
            return false;
        }

        if (currentVersion === undefined) {
            return true;
        }

        return currentVersion <= versionInResponseToken;
    }
}

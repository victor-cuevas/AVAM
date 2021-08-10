import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'oblique-reactive';
import { StringHelper } from '@shared/helpers/string.helper';
import { ALERT_CHANNEL } from '@app/shared/components/alert/alert-constants';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    static readonly NOTIFICATION_EXCEPTION_KEY_PREFIXES = ['stes.schnellsuche.nicht-verfuegbar', 'login.error.', 'dms.error.notconnected.asnotification'];
    constructor(
        private authenticationService: AuthenticationService,
        private fehlermeldungenService: FehlermeldungenService,
        private translate: TranslateService,
        private readonly notificationService: NotificationService,
        private router: Router
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap(
                event => {
                    this.handleSuccess(event, request.params.get(ALERT_CHANNEL));
                },
                error => {
                    this.handleError(error);
                }
            )
        );
    }

    private handleSuccess(event, channel) {
        if (event instanceof HttpResponse) {
            // if 200 response returned from api show warning
            const warnings = event.body ? event.body.warning : null;

            if (warnings) {
                warnings.forEach(warning => {
                    const errorMessage = this.translateElement(warning.values);

                    if (this.mustShowErrorAsNotification(warning.values.key)) {
                        this.showErrorAsNotification(errorMessage, warning.key.toLowerCase());
                    } else {
                        this.fehlermeldungenService.showMessage(errorMessage, warning.key.toLowerCase(), channel);
                    }
                });
            }
        }
    }

    private translateElement(element): string {
        let errorMessageHeader = '';
        let errorMessage = '';

        if (element.key) {
            errorMessageHeader = `${this.translate.instant(element.key)}`;
        }

        if (element.values) {
            errorMessage = StringHelper.stringFormatter(
                errorMessageHeader,
                [...element.values].map(value => {
                    if (value instanceof Array) {
                        let result: string;

                        value.forEach(elemet => {
                            result = `${result ? result + ', ' : ''}${this.translateElement(elemet)}`;
                        });

                        value = result;
                    }

                    try {
                        return this.translate.instant(value);
                    } catch (error) {
                        return value;
                    }
                })
            );
        }

        return errorMessage ? errorMessage : errorMessageHeader;
    }

    private handleError(error) {
        switch (error.status) {
            case 401:
                this.authenticationService.logout();
                this.notificationService.error('login.error.racfError.111');
                break;
            case 403:
                this.router.navigate(['/home']);
                break;
            case 408:
                this.authenticationService.logout();
                this.notificationService.clearAll();
                break;
            default:
                const err = error.error.message || error.statusText;
                this.notificationService.error(err);
                break;
        }
    }

    private mustShowErrorAsNotification(warningKey): boolean {
        for (let currentKey of ErrorInterceptor.NOTIFICATION_EXCEPTION_KEY_PREFIXES) {
            if (warningKey.startsWith(currentKey)) {
                return true;
            }
        }
        return false;
    }

    private showErrorAsNotification(msg: string, type: string): void {
        if ('info' === type) {
            this.notificationService.info(msg);
        } else if ('warning' === type) {
            this.notificationService.warning(msg);
        } else if ('danger' === type) {
            this.notificationService.error(msg);
        } else {
            this.notificationService.default(msg);
        }
    }
}

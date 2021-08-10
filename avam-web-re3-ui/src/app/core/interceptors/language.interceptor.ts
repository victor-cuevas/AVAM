import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
    constructor(private translateService: TranslateService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url.includes('/rest/') && this.translateService.currentLang) {
            request = request.clone({
                setHeaders: {
                    'X-AVAM-Language': this.translateService.currentLang
                }
            });
        }

        return next.handle(request);
    }
}

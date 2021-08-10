import { Injectable } from '@angular/core';
import { DefaultUrl, UrlRestService } from '@core/http/url-rest.service';
import { RoboHelpUrlResponseDTO } from '@shared/models/dtos-generated/roboHelpUrlResponseDTO';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { parseNumber } from '@shared/helpers/parseNumber.helper';
import { HttpResponseHelper } from '@shared/helpers/http-response.helper';
import { setHelpBaseUrl } from '@shared/services/setHelpBaseUrl.function';

@Injectable({
    providedIn: 'root'
})
export class RoboHelpService {
    private static readonly URL: string = 'url';
    private static readonly WINDOW_NAME: string = 'winPop';
    private static readonly WINDOW_FEATURES: string = 'height=580,width=1000,top=150,left=150, toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes';

    constructor(private urlService: UrlRestService, private dbTranslateService: DbTranslateService) {}

    public help(formNumber?: number | string): void {
        if (!formNumber) {
            this.openDefaultUrl();
        } else {
            const num: number = parseNumber(formNumber);
            num ? this.urlService.urlById(DefaultUrl.HELP, num).subscribe((res: RoboHelpUrlResponseDTO) => this.openUrl(res)) : this.openDefaultUrl();
        }
    }

    private openDefaultUrl(): void {
        this.urlService.defaultUrl(DefaultUrl.HELP).subscribe((res: RoboHelpUrlResponseDTO) => this.openUrl(res));
    }

    private openUrl(res: any): void {
        const url = this.dbTranslateService.translate(res, RoboHelpService.URL);
        HttpResponseHelper.openUrl(setHelpBaseUrl(url), RoboHelpService.WINDOW_NAME, RoboHelpService.WINDOW_FEATURES);
    }
}

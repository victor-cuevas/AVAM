import { Injectable, OnDestroy } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { GuidedTourConfigRestService } from '@core/http/guided-tour-config-rest.service';
import { BasicUrlDTO } from '@shared/models/dtos-generated/basicUrlDTO';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { openUrl } from '@shared/helpers/openUrl.helper';

@Injectable({
    providedIn: 'root'
})
export class GuidedTourService extends Unsubscribable implements OnDestroy {
    private static readonly URL: string = 'url';
    private static readonly WINDOW_NAME: string = 'GuidedTourTab';

    constructor(private guidedTourConfigRestService: GuidedTourConfigRestService, private dbTranslateService: DbTranslateService) {
        super();
    }

    public openGuidedTourUrl(): void {
        this.guidedTourConfigRestService
            .getUrls()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((data: BasicUrlDTO) => {
                this.openUrl(data);
            });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    private openUrl(res: BasicUrlDTO): void {
        const tourUrl = this.dbTranslateService.translate(res, GuidedTourService.URL);
        if (tourUrl) {
            openUrl(GuidedTourService.WINDOW_NAME, '', tourUrl);
        }
    }
}

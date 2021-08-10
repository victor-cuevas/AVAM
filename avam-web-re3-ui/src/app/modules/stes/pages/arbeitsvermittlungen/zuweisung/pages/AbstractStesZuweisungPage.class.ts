import { AfterViewInit, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';

export class AbstractStesZuweisungPage extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    spinnerChannel = 'stesProfilVergleichPage';
    stesHeader: StesHeaderDTO;
    stesId: any;

    constructor(public route: ActivatedRoute, public spinnerService: SpinnerService, public dataService: StesDataRestService, public translateService: TranslateService) {
        super();
    }

    ngOnInit() {
        this.getRouteParams();
    }

    ngAfterViewInit() {
        this.getStesHeaderData();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    getRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });
    }

    getStesHeaderData() {
        this.spinnerService.activate(this.spinnerChannel);
        this.dataService
            .getStesHeader(this.stesId, this.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (stesHeader: StesHeaderDTO) => {
                    if (stesHeader) {
                        this.stesHeader = stesHeader;
                    }
                    this.spinnerService.deactivate(this.spinnerChannel);
                    OrColumnLayoutUtils.scrollTop();
                },
                () => {
                    this.spinnerService.deactivate(this.spinnerChannel);
                    OrColumnLayoutUtils.scrollTop();
                }
            );
    }
}

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesSearchFormComponent } from '@modules/geko/components/stes-search-form/stes-search-form.component';
import { StesSearchResultComponent } from '@modules/geko/components/stes-search-result/stes-search-result.component';
import { GekoStesService } from '@shared/services/geko-stes.service';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { GeKoGeschaeftSuchenInitDTO } from '@dtos/geKoGeschaeftSuchenInitDTO';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Subscription } from 'rxjs';
import { ToolboxService } from '@app/shared';

@Component({
    selector: 'avam-geko-stes-search',
    templateUrl: './stes-search.component.html'
})
export class StesSearchComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('gekoSearchForm') gekoSearchForm: StesSearchFormComponent;
    @ViewChild('gekoSearchResult') gekoSearchResult: StesSearchResultComponent;
    private reloadSubscription: Subscription;

    constructor(private gekoStesService: GekoStesService, private route: ActivatedRoute, private router: Router) {
        super();
    }

    ngOnInit(): void {
        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.gekoStesService.clearMessages();
    }

    ngAfterViewInit(): void {
        this.gekoStesService.clearMessages();
        this.gekoStesService
            .initRequest()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((initRequest: GeKoGeschaeftSuchenInitDTO) => {
                this.gekoSearchForm.geschaeftsarten = initRequest.geschaeftarten;
                this.gekoSearchForm.sachstaende = initRequest.sachstaende;
                this.submit();
            });
    }

    ngOnDestroy(): void {
        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }
        this.gekoStesService.clearMessages();
        ToolboxService.GESPEICHERTEN_LISTE_URL = '/geko/stes/search';
        super.ngOnDestroy();
    }

    reset(): void {
        this.gekoSearchForm.reset();
        this.gekoSearchResult.reset();
        this.submit();
    }

    submit(): void {
        this.gekoStesService.clearMessages();
        if (this.gekoSearchForm.isEmpty()) {
            this.gekoStesService.showMessage('geko.error.noSearchCriteria', 'danger');
            return;
        }
        this.gekoSearchForm.submit('gekoSearchResult-modal');
    }

    isSubmitDisabled(): boolean {
        return this.gekoSearchForm.gekoStesSearchFormGroup.invalid;
    }
}

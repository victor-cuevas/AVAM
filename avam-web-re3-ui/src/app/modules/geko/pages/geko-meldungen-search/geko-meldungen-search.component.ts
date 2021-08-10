import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GekoMeldungenSearchFormComponent } from '@modules/geko/components/geko-meldungen-search-form/geko-meldungen-search-form.component';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { Router } from '@angular/router';
import { GekoMeldungenSearchResultComponent } from '@modules/geko/components/geko-meldungen-search-result/geko-meldungen-search-result.component';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Subscription } from 'rxjs';
import { ToolboxService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';

@Component({
    selector: 'avam-geko-meldungen-search',
    templateUrl: './geko-meldungen-search.component.html'
})
export class GekoMeldungenSearchComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('gekoMeldungenSearchForm') gekoMeldungenSearchForm: GekoMeldungenSearchFormComponent;
    @ViewChild('gekoMeldungenSearchResult') gekoMeldungenSearchResult: GekoMeldungenSearchResultComponent;
    geschaeftsbereichCode: typeof GekobereichCodeEnum = GekobereichCodeEnum;
    readonly stateKey = GekoMeldungenSearchResultComponent.STATE_KEY;
    private reloadSubscription: Subscription;

    constructor(private router: Router, private facadeService: FacadeService) {
        super();
    }

    ngOnInit(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        this.subscribeToLangChange();
        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
    }

    ngOnDestroy(): void {
        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }
        ToolboxService.GESPEICHERTEN_LISTE_URL = '/geko/meldung/search';
        super.ngOnDestroy();
    }

    onSubmit(): void {
        this.gekoMeldungenSearchResult.setChecksRestore(null);
        this.gekoMeldungenSearchForm.onSubmit();
    }

    isSubmitDisabled(): boolean {
        return this.gekoMeldungenSearchForm.searchForm.invalid;
    }

    reset(): void {
        this.gekoMeldungenSearchForm.reset();
        this.gekoMeldungenSearchResult.reset();
        this.onSubmit();
    }

    private subscribeToLangChange(): void {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            if (this.gekoMeldungenSearchForm) {
                this.gekoMeldungenSearchForm.onLangChange();
            }
        });
    }
}

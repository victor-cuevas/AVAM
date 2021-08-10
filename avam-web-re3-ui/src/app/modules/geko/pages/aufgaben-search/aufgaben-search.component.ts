import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AufgabenSearchFormComponent } from '@modules/geko/components/aufgaben-search-form/aufgaben-search-form.component';
import { ReloadHelper } from '@shared/helpers/reload.helper';
import { Unsubscribable } from 'oblique-reactive';
import { Router } from '@angular/router';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { takeUntil } from 'rxjs/operators';
import { GekoAufgabenCodes } from '@shared/models/geko-aufgaben-codes.model';
import { GeKoAufgabeDTO } from '@dtos/geKoAufgabeDTO';
import { Subscription } from 'rxjs';
import { AufgabenSearchResultComponent } from '@modules/geko/components/aufgaben-search-result/aufgaben-search-result.component';
import { ToolboxService } from '@app/shared';

@Component({
    selector: 'avam-aufgaben-search',
    templateUrl: './aufgaben-search.component.html'
})
export class AufgabenSearchComponent extends Unsubscribable implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('searchForm') searchForm: AufgabenSearchFormComponent;
    @ViewChild('searchResult') searchResult: AufgabenSearchResultComponent;
    formSpinnerChannel = 'gekoAufgabenSearch';
    resultSpinnerChannel = 'gekoAufgabenResults';
    private reloadSubscription: Subscription;

    constructor(private router: Router, private gekoAufgabenService: GekoAufgabenService) {
        super();
    }

    ngOnInit(): void {
        this.gekoAufgabenService.clearMessages();
        this.reloadSubscription = ReloadHelper.enable(this.router, this.unsubscribe, () => this.reset());
        this.serviceSubscribe();
    }

    ngAfterViewInit(): void {
        this.gekoAufgabenService.loadCodes(this.formSpinnerChannel);
    }

    ngOnDestroy(): void {
        if (this.reloadSubscription) {
            this.reloadSubscription.unsubscribe();
        }
        this.gekoAufgabenService.clearMessages();
        super.ngOnDestroy();
    }

    submit(): void {
        this.searchForm.submit(this.resultSpinnerChannel);
    }

    reset(): void {
        this.searchForm.reset();
        this.searchResult.reset();
        this.submit();
    }

    openAufgabe(aufgabe: GeKoAufgabeDTO): void {
        ToolboxService.GESPEICHERTEN_LISTE_URL = this.router.url;
        this.gekoAufgabenService.navigateToAufgabeBearbeitenFromSearch(aufgabe);
    }

    private serviceSubscribe(): void {
        this.gekoAufgabenService.codesSubject.pipe(takeUntil(this.unsubscribe)).subscribe((codes: GekoAufgabenCodes) => {
            this.searchForm.status = codes.status;
            this.searchForm.geschaeftsarten = codes.geschaeftsarten;
            this.submit();
        });
    }
}

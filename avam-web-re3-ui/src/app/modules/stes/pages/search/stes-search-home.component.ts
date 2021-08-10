import { Component, OnInit, ViewChild } from '@angular/core';
import { StesSearchComponent, StesSearchResultComponent } from '@stes/components';
import { Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ReloadHelper } from '@shared/helpers/reload.helper';

@Component({
    selector: 'app-stes-search-home',
    templateUrl: './stes-search-home.component.html',
    styleUrls: ['./stes-search-home.component.scss']
})
export class StesSearchHomeComponent extends Unsubscribable implements OnInit {
    @ViewChild('stesSearchComponent') stesSearchComponent: StesSearchComponent;
    @ViewChild('stesSearchResultComponent') stesSearchResultComponent: StesSearchResultComponent;

    constructor(private fehlermeldungService: FehlermeldungenService, private router: Router) {
        super();
    }

    ngOnInit(): void {
        ReloadHelper.enable(this.router, this.unsubscribe, () => this.onReset());
        this.fehlermeldungService.closeMessage();
    }

    onReset(): void {
        this.stesSearchComponent.onReset();
        this.stesSearchResultComponent.onReset();
    }
}

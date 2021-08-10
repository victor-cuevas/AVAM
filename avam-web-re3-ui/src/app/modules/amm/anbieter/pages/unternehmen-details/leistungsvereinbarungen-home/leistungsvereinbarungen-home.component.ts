import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeistungsvereinbarungenNavigationService } from '../../../services/leistungsvereinbarungen-navigation.service';

@Component({
    selector: 'avam-leistungsvereinbarungen-home',
    templateUrl: './leistungsvereinbarungen-home.component.html',
    providers: []
})
export class LeistungsvereinbarungenHomeComponent {
    unternehmenId: number;
    vertragswertId: number;
    teilzahlungswertId: number;
}

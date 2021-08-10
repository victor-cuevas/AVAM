import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProfilvergleichComponent } from '@shared/components/zuweisung/profilvergleich/profilvergleich.component';
import { ActivatedRoute } from '@angular/router';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';

@Component({
    selector: 'avam-oste-profil-vergleich-page',
    templateUrl: './oste-profil-vergleich-page.component.html'
})
export class OsteProfilVergleichPageComponent implements OnInit, OnDestroy {
    @ViewChild('component') component: ProfilvergleichComponent;
    unternehmenId: any;
    stesId: any;
    osteId: any;

    constructor(private route: ActivatedRoute, private infopanelService: AmmInfopanelService, private fehlermeldungenService: FehlermeldungenService) {}

    ngOnInit() {
        this.fehlermeldungenService.closeMessage();
        this.getRouteParams();
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.label.profildatenVergleichen' });
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
    }

    getRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.stesId = params.get('stesId');
            this.osteId = params.get('osteId');
            this.component.stesId = this.stesId;
            this.component.osteId = this.osteId;
        });

        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
        });
    }
}

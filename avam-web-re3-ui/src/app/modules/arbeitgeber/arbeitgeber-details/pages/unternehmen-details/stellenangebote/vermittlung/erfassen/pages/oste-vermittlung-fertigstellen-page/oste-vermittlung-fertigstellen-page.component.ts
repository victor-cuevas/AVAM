import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfilvergleichComponent } from '@shared/components/zuweisung/profilvergleich/profilvergleich.component';
import { ZuweisungWizardService } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';

@Component({
    selector: 'avam-oste-vermittlung-fertigstellen-page',
    templateUrl: './oste-vermittlung-fertigstellen-page.component.html'
})
export class OsteVermittlungFertigstellenPageComponent implements OnInit {
    @ViewChild('component') component: ProfilvergleichComponent;
    unternehmenId: any;
    stesId: any;
    osteId: any;

    constructor(private route: ActivatedRoute, private zuweisungWizard: ZuweisungWizardService, private infopanelService: AmmInfopanelService) {}

    ngOnInit() {
        this.getRouteParams();
        this.infopanelService.updateInformation({ subtitle: 'arbeitgeber.label.vermittlungFertigstellen' });
    }

    getRouteParams() {
        this.route.queryParamMap.subscribe(params => {
            this.stesId = params.get('stesId');
            this.osteId = params.get('osteId');
            this.component.stesId = this.stesId;
            this.component.osteId = this.osteId;
            this.zuweisungWizard.setStesId(this.stesId);
            this.zuweisungWizard.setOsteId(this.osteId);
        });

        this.route.parent.params.subscribe(params => {
            this.unternehmenId = params['unternehmenId'];
        });
    }
}

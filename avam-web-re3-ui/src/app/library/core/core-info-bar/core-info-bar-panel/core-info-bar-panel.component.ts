import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { InfoleistePanelConfig } from '@app/shared/services/infoleiste-panel.service';
import { CoreInfoBarPanelService } from './core-info-bar-panel.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';

@Component({
    selector: 'core-info-bar-panel',
    templateUrl: './core-info-bar-panel.component.html',
    styleUrls: ['./core-info-bar-panel.component.scss']
})
export class CoreInfoBarPanelComponent implements OnInit, OnDestroy {
    @Input('template') template: any;
    @Input('data') data: any;
    popupInformation: any = false;
    rawData: any = null;
    dynamicTemplate: any;

    templateSubscription = null;
    lastUpdateSubscription = null;

    constructor(private coreInfobarPanel: CoreInfoBarPanelService, private stesDataRestService: StesDataRestService) {}

    ngOnInit() {
        this.templateSubscription = this.coreInfobarPanel.pullTemplate().subscribe(template => {
            this.dynamicTemplate = template;
        });

        this.lastUpdateSubscription = this.coreInfobarPanel.pullLastUpdate().subscribe(data => {
            this.rawData = data;
        });
    }

    ngOnDestroy() {
        this.templateSubscription.unsubscribe();
        this.lastUpdateSubscription.unsubscribe();
    }

    onClickInfoIcon() {
        const lastUpdateDate = this.rawData.geaendertAm || this.rawData.erfasstAm;
        const benutzerLogin = this.rawData.geaendertAm ? this.rawData.geaendertDurch : this.rawData.erfasstDurch;
        const info: InfoleistePanelConfig = { datumLetzteAktualisierung: new Date(lastUpdateDate).getTime(), stesBenutzerLogin: benutzerLogin };

        this.stesDataRestService.getBenutzerByLogin(benutzerLogin).subscribe(
            response => {
                const benutzer = response.data;
                if (benutzer) {
                    info.stesBenutzerName = benutzer.nachname;
                    info.stesBenutzerVorname = benutzer.vorname;
                }
                this.popupInformation = info;
            },
            () => {
                this.popupInformation = info;
            }
        );
    }
}

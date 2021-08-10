import { Component, OnInit, Input, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { AvamStesInfoBarService } from './avam-stes-info-bar.service';
import { StesStoreService } from '@app/modules/stes/stes-store.service';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import { Subscription } from 'rxjs';
import { StesHeaderDTO } from '@dtos/stesHeaderDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { ToolboxService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'avam-stes-info-bar',
    templateUrl: './avam-stes-info-bar.component.html',
    styleUrls: ['./avam-stes-info-bar.component.scss']
})
export class AvamStesInfoBarComponent implements OnInit, OnDestroy {
    @Input('hasTitle') hasTitle = true;

    @Input('data') set data(data) {
        this.stesHeader = data;
    }

    @ViewChild('panelTemplate') panelTemplate: TemplateRef<any>;

    stesHeader: any = false;
    stesStoreSub: any;
    private detailsHeaderSubscription: Subscription;
    private dataServiceSubscription: Subscription;

    constructor(
        private dbTranslateService: DbTranslateService,
        private stesInfoBarService: AvamStesInfoBarService,
        private stesStore: StesStoreService,
        private componentInteraction: StesComponentInteractionService,
        private dataService: StesDataRestService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.stesInfoBarService.removeItemFromInfoPanel(this.panelTemplate);
        this.stesStoreSub = this.stesStore.data$.subscribe((stes: any) => {
            if (stes.length > 0) {
                this.stesHeader = stes[0].data;
                this.stesInfoBarService.addItemToInfoPanel(this.panelTemplate);
            }
        });
        this.detailsHeaderSubscription = this.componentInteraction.detailsHeaderSubject.subscribe(stesId => {
            this.loadStesHeader(stesId);
        });
        this.stesInfoBarService.addItemToInfoPanel(this.panelTemplate);
    }

    setAresse(): string {
        let adresse = '';

        if (this.stesHeader.plz.postleitzahl) {
            const strasse = this.stesHeader.strasse ? this.stesHeader.strasse : '';
            const strasseNr = this.stesHeader.hausnummer ? this.stesHeader.hausnummer : '';

            if (this.stesHeader.strasse || this.stesHeader.hausnummer) {
                adresse = this.stesHeader.strasse && this.stesHeader.hausnummer ? `${strasse} ${strasseNr}, ` : `${strasse}${strasseNr}, `;
            }

            adresse += `${this.stesHeader.plz.postleitzahl} ${this.dbTranslateService.translate(this.stesHeader.plz, 'ort')}`;
        }

        return adresse;
    }

    setPersonalberater(): string {
        return this.stesHeader.personalberaterName ? `${this.stesHeader.personalberaterName}, ${this.stesHeader.personalberaterVorname}` : '';
    }

    private loadStesHeader(stesId: string) {
        this.dataServiceSubscription = this.dataService.getStesHeader(stesId, this.translateService.currentLang).subscribe((data: StesHeaderDTO) => {
            this.stesHeader = { ...data };
            this.toolboxService.sendEmailAddress(this.stesHeader.stesBenutzerEmail ? this.stesHeader.stesBenutzerEmail : '');
        });
    }

    ngOnDestroy(): void {
        this.stesStoreSub.unsubscribe();
        if (this.detailsHeaderSubscription) {
            this.detailsHeaderSubscription.unsubscribe();
        }
        if (this.dataServiceSubscription) {
            this.dataServiceSubscription.unsubscribe();
        }
        // Moved to OnInit (Problem with two infobars)
        // this.stesInfoBarService.removeItemFromInfoPanel(this.panelTemplate);
    }
}

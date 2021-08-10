import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InfoleistePanelService, InfoleistePanelConfig } from '@app/shared/services/infoleiste-panel.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { StesHeaderDTO } from '@shared/models/dtos-generated/stesHeaderDTO';

@Component({
    selector: 'app-stes-details-infoleiste-panel',
    templateUrl: './stes-details-infoleiste-panel.component.html',
    styleUrls: ['./stes-details-infoleiste-panel.component.scss']
})
export class StesDetailsInfoleistePanelComponent implements OnInit, OnDestroy {
    /**
     * info about STES - often relevant
     */
    @Input() stesHeader: StesHeaderDTO;
    /**
     * Should we display the name of the stes?
     */
    @Input() hasName = false;

    /**
     * info about current business object (null if BO not present)
     */
    popupInformation;

    /**
     * a few screens dont have info - disable on init, enable on leave
     */
    showInfoIcon = true;

    infoleisteServiceSubscription: Subscription;

    constructor(private infoleistePanelService: InfoleistePanelService, private dbTranslateService: DbTranslateService) {}

    ngOnInit() {
        this.infoleisteServiceSubscription = this.infoleistePanelService.getData().subscribe((data: InfoleistePanelConfig) => {
            if (data) {
                this.showInfoIcon = data.showInfoIcon !== undefined ? data.showInfoIcon : true;

                /**
                 * data about current BO (not the STES)
                 */
                if (data.datumLetzteAktualisierung !== undefined) {
                    this.popupInformation = {
                        datumLetzteAktualisierung: data.datumLetzteAktualisierung !== 0 ? data.datumLetzteAktualisierung : '',
                        stesBenutzerLogin: data.stesBenutzerLogin,
                        stesBenutzerVorname: data.stesBenutzerVorname,
                        stesBenutzerName: data.stesBenutzerName
                    };
                } else {
                    this.popupInformation = null;
                }
            }
        });
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

    ngOnDestroy() {
        if (this.infoleisteServiceSubscription) {
            this.infoleisteServiceSubscription.unsubscribe();
        }
    }

    getInfoIconData() {
        return this.popupInformation || this.stesHeader;
    }
}

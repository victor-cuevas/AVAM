import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmnutzungWizardService } from '@app/shared/components/new/avam-wizard/ammnutzung-wizard.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { DeleteGuarded } from '@app/shared/services/can-delete-guard.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-ammnutzung-wizard',
    templateUrl: './ammnutzung-wizard.component.html',
    styleUrls: ['./ammnutzung-wizard.component.scss']
})
export class AmmnutzungWizardComponent implements OnInit, OnDestroy, DeleteGuarded {
    ueberschrift = '';
    ueberschriftSubscription: Subscription;
    wizardTitle = '';
    allowedTypes: string[] = [AmmMassnahmenCode.INDIVIDUELL_AP, AmmMassnahmenCode.INDIVIDUELL_BP, AmmMassnahmenCode.INDIVIDUELL_KURS];
    channel = 'AmmNutzungChannel';
    stesHeader: any[];

    private stesId: string;

    constructor(
        private wizardService: AmmnutzungWizardService,
        private route: ActivatedRoute,
        private router: Router,
        private ammDataService: AmmRestService,
        private dataService: StesDataRestService,
        private facade: FacadeService
    ) {}

    ngOnInit() {
        this.wizardService.clearOldValues();
        this.route.paramMap.subscribe(params => {
            this.stesId = params.get('stesId');
            this.wizardService.stesId = this.stesId;
            const type = params.get('type');
            if (!this.allowedTypes.includes(type)) {
                this.router.navigate(['/not-found']);
            }
            this.wizardService.type = type;
            const massnahmeLabel = AmmHelper.ammMassnahmenToLabel.find(a => a.code === this.wizardService.type).label;
            const erfassen = 'amm.nutzung.alttext.erfassen';

            this.facade.translateService.stream([massnahmeLabel, erfassen]).subscribe((label: string) => {
                this.wizardTitle = `${label[massnahmeLabel]} ${label[erfassen]}`;
            });
        });

        this.route.params.subscribe(data => {
            if (data && data['stesId']) {
                this.dataService.getStesHeader(data['stesId'], this.facade.translateService.currentLang).subscribe((stesData: StesHeaderDTO) => {
                    this.stesHeader = stesData as any;
                });
            }
        });
    }

    ngOnDestroy() {
        this.wizardService.clearOldValues();
    }

    back() {
        this.wizardService.stesId = this.stesId;
        this.wizardService.navigateZurAmmUebersicht();
    }

    shouldDelete(): boolean {
        return this.wizardService.isDirty.buchung || this.wizardService.isDirty.beschreibung || this.wizardService.isDirty.beschreibung || this.wizardService.notFirstEntry;
    }

    delete(): Observable<boolean> {
        const gfId = this.wizardService.gfId;
        const stesId = this.stesId;
        if (gfId && gfId !== AmmConstants.UNDEFINED_LONG_ID) {
            return new Observable(subscriber => {
                this.facade.spinnerService.activate(this.channel);
                this.ammDataService.geschaeftsfallLoeschen(stesId, gfId).subscribe(
                    () => {
                        this.facade.spinnerService.deactivate(this.channel);
                        subscriber.next(true);
                        subscriber.complete();
                    },
                    () => {
                        this.facade.spinnerService.deactivate(this.channel);
                    }
                );
            });
        } else {
            return of(true);
        }
    }
}

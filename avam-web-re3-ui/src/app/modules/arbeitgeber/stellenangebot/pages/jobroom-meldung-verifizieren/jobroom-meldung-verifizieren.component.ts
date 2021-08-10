import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AmmInfopanelService } from '@shared/components/amm-infopanel/amm-infopanel.service';
import { Unsubscribable } from 'oblique-reactive';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { ActivatedRoute } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { OsteEgovDTO } from '@dtos/osteEgovDTO';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { FacadeService } from '@shared/services/facade.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { forkJoin } from 'rxjs';
import { AlertChannelEnum } from '@shared/components/alert/alert-channel.enum';
import { CodeDTO } from '@dtos/codeDTO';

@Component({
    selector: 'avam-jobroom-meldung-verifizieren',
    templateUrl: './jobroom-meldung-verifizieren.component.html',
    styleUrls: ['./jobroom-meldung-verifizieren.component.scss']
})
export class JobroomMeldungVerifizierenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    osteEgovId = this.route.snapshot.queryParams['osteEgovId'];
    channel = 'jobroom-meldung-verifizieren';
    osteEgovDTO: OsteEgovDTO;
    anredeDomain: any[];
    kpAnredeCode;
    alertChannel = AlertChannelEnum;
    stepOne = `arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren?osteEgovId=${this.osteEgovId}`;
    stepTwo = `arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/zuordnen?osteEgovId=${this.osteEgovId}`;
    stepThree = `arbeitgeber/stellenangebot/jobroom-meldungen/verifizieren/uebernehmen?osteEgovId=${this.osteEgovId}`;

    constructor(
        public wizardService: MeldungenVerifizierenWizardService,
        private infopanelService: AmmInfopanelService,
        private unternehmenRestService: UnternehmenRestService,
        private route: ActivatedRoute,
        private facadeService: FacadeService,
        private dataService: StesDataRestService,
        private stesDataRestService: StesDataRestService
    ) {
        super();
    }

    ngOnInit() {
        this.infopanelService.updateInformation({
            title: '',
            subtitle: 'arbeitgeber.oste.stelleverifizieren',
            tableCount: undefined,
            hideInfobar: true
        });
    }

    ngAfterViewInit() {
        this.initSubscriptions();
        this.getData();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.wizardService.resetData();
        this.infopanelService.updateInformation({ hideInfobar: false, tableCount: undefined });
        this.facadeService.fehlermeldungenService.closeMessage();
    }

    private setAnrede() {
        if (this.osteEgovDTO.kpAnredeCode) {
            const anrede = this.anredeDomain.find(item => item.code === this.osteEgovDTO.kpAnredeCode);
            this.kpAnredeCode = anrede[`text${this.facadeService.translateService.currentLang[0].toUpperCase()}${this.facadeService.translateService.currentLang[1]}`];
        }
    }

    private initSubscriptions() {
        this.facadeService.translateService.onLangChange.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
            this.setAnrede();
        });
    }

    private getData() {
        if (this.osteEgovId) {
            this.wizardService.activateSpinner(this.channel);
            forkJoin(
                this.unternehmenRestService.getOsteegovById(this.osteEgovId),
                this.dataService.getCode(DomainEnum.ANREDE),
                this.dataService.getCode(DomainEnum.ARBEITSFORM),
                this.dataService.getCode(DomainEnum.JOBROOM),
                this.dataService.getCode(DomainEnum.ABLEHNUNGSGRUND_EGOV)
            )
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => {
                        this.wizardService.deactivateSpinner(this.channel);
                        this.stesDataRestService
                            .getStaatByISOCode(this.osteEgovDTO.untLand)
                            .pipe(takeUntil(this.unsubscribe))
                            .subscribe(staat => {
                                this.wizardService.setOsteEgovStaat(staat);
                            });
                    })
                )
                .subscribe(([response, anredeDomain, arbeitsFormDomain, meldeArtDomain, grundResponse]) => {
                    if (response.data) {
                        this.osteEgovDTO = response.data;
                        this.wizardService.setOsteEgovId(this.osteEgovId);
                        this.wizardService.setGrundDomain(grundResponse.map(this.customPropertyMapper));
                        this.wizardService.setAnredenDomain(anredeDomain);
                        this.wizardService.setArbeitsFormDomain(arbeitsFormDomain);
                        this.wizardService.setMeldeArtDomain(meldeArtDomain);
                        this.wizardService.setOsteEgovDTO(this.osteEgovDTO);
                        this.anredeDomain = anredeDomain;
                        this.setAnrede();
                        if (!this.wizardService.finishedSteps.step0) {
                            this.wizardService.selectCurrentStep(0);
                        }
                    } else {
                        this.wizardService.disabledButtons = true;
                    }
                });
        } else {
            this.wizardService.navigateToMeldungenUebersicht();
        }
    }

    private customPropertyMapper(element: CodeDTO): any {
        return {
            value: element.code,
            labelFr: element.kurzTextFr,
            labelIt: element.kurzTextIt,
            labelDe: element.kurzTextDe
        };
    }
}

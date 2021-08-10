import { Component, Input, QueryList, ContentChildren, AfterContentInit, Injector } from '@angular/core';
import { AvamWizardStepComponent } from './avam-wizard-step/avam-wizard-step.component';
import { WizardService } from './wizard.service';
import { ZuweisungWizardService } from './zuweisung-wizard.service';
import { FachberatungWizardService } from './fachberatung-wizard.service';
import { AmmnutzungWizardService } from './ammnutzung-wizard.service';
import { MatchingWizardService } from './matching-wizard.service';
import { MassnahmeBuchenWizardService } from './massnahme-buchen-wizard.service';
import { UnternehmenWizardService } from '@shared/components/new/avam-wizard/unternehmen-wizard.service';
import { AmmProduktErfassenWizardService } from './amm-produkt-erfassen-wizard.service';
import { AmmInfotagMassnahmeWizardService } from './amm-infotag-massnahme-wizard.service';
import { AmmMassnahmeErfassenWizardService } from './amm-massnahme-erfassen-wizard.service';
import { AmmKursErfassenWizardService } from './amm-kurs-erfassen-wizard.service';
import { AmmStandortErfassenWizardService } from './amm-standort-erfassen-wizard.service';
import { WizardErfassenService } from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/erfassen/wizard/wizard-erfassen.service';
import { AmmBeschaeftigungseinheitErfassenWizardService } from './amm-beschaeftigungseinheit-erfassen-wizard.service';
import { VertragswertErfassenWizardService } from './vertragswert-erfassen-wizard.service';
import { AbrechnungswertErfassenWizardService } from './abrechnungswert-erfassen-wizard.service';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { BenutzerstelleErfassenWizardService } from '@shared/components/new/avam-wizard/benutzerstelle-erfassen-wizard.service';
import { RolleErfassenWizardService } from '@shared/components/new/avam-wizard/rolle-erfassen-wizard.service';

export const ServiceMap = {
    stes: WizardService,
    arbeitgeber: ZuweisungWizardService,
    fachberatung: FachberatungWizardService,
    ammnutzung: AmmnutzungWizardService,
    matching: MatchingWizardService,
    massnahmeBuchen: MassnahmeBuchenWizardService,
    unternehmen: UnternehmenWizardService,
    ammProduktErfassen: AmmProduktErfassenWizardService,
    ammInfotagMassnahme: AmmInfotagMassnahmeWizardService,
    bewirtschaftungМassnahmeErfassen: AmmMassnahmeErfassenWizardService,
    ammKursErfassen: AmmKursErfassenWizardService,
    ammStandortErfassen: AmmStandortErfassenWizardService,
    osteErfassen: WizardErfassenService,
    ammBeschaeftigungseinheitErfassen: AmmBeschaeftigungseinheitErfassenWizardService,
    vertragswertErfassenWizardService: VertragswertErfassenWizardService,
    benutzerstelleErfassenWizardService: BenutzerstelleErfassenWizardService,
    rolleErfassenWizardService: RolleErfassenWizardService,
    abrechnungswertErfassenWizardService: AbrechnungswertErfassenWizardService,
    meldungenVerifizierenWizardService: MeldungenVerifizierenWizardService
};

@Component({
    selector: 'avam-wizard',
    templateUrl: './avam-wizard.component.html',
    styleUrls: ['./avam-wizard.component.scss']
})
export class AvamWizardComponent implements AfterContentInit {
    @ContentChildren(AvamWizardStepComponent) public wizardStepsQueryList: QueryList<AvamWizardStepComponent>;
    @Input() service: string;
    injectedService: any;

    constructor(private injector: Injector) {}

    ngAfterContentInit(): void {
        this.injectedService = this.injector.get<any>(ServiceMap[this.service]);
        this.injectedService.list = this.wizardStepsQueryList;
        this.injectedService.initSteps();
        this.injectServiceIntoChild();
    }

    injectServiceIntoChild() {
        this.injectedService.list.forEach(step => {
            step.wizardService = this.injectedService;
        });
    }
}

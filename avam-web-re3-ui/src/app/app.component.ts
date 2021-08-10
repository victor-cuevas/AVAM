import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ConfigService } from '@config/config.service';
import { RoboHelpService } from '@app/shared';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { takeUntil } from 'rxjs/operators';
import { EnvironmentRestService } from '@core/http/environment-rest.service';
import { EnvironmentDTO } from '@shared/models/dtos-generated/environmentDTO';
import { Unsubscribable } from 'oblique-reactive';
import { Permissions } from '@shared/enums/permissions.enum';
import { BenutzerstelleAendernService } from '@myAvam/services/benutzerstelle-aendern.service';
import { TopNavigationInterface } from '@core/components/top-navigation/top-navigation.interface';
import { AuthenticationService } from '@core/services/authentication.service';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { BewProduktSuchenComponent } from './modules/amm/bewirtschaftung/pages/bew-produkt-suchen/bew-produkt-suchen.component';
import { BewMassnahmeSuchenComponent } from './modules/amm/bewirtschaftung/pages/bew-massnahme-suchen/bew-massnahme-suchen.component';
import { BewDfeSuchenComponent } from './modules/amm/bewirtschaftung/pages';
import { InfotagBewirtschaftungSuchenComponent, InfotagMassnahmeSuchenComponent } from './modules/amm/infotag/pages';
import { GekoAbzumeldendeSearchComponent } from '@modules/geko/pages/geko-abzumeldende-search/geko-abzumeldende-search.component';
import { LeistungsvereinbarungSuchenComponent, RahmenvertragSuchenComponent, VertragswertSuchenComponent } from './modules/amm/vertraege/pages';
import { StesSearchFormComponent } from './modules/geko/components/stes-search-form/stes-search-form.component';
import { GekoMeldungenSearchFormComponent } from './modules/geko/components/geko-meldungen-search-form/geko-meldungen-search-form.component';
import { AufgabenSearchFormComponent } from './modules/geko/components/aufgaben-search-form/aufgaben-search-form.component';
import { TeilzahlungenSuchenComponent } from './modules/amm/teilzahlungen/pages/teilzahlungen-suchen/teilzahlungen-suchen.component';
import { AbrechnungswertSuchenComponent } from './modules/amm/anbieter/pages/abrechnungswert-suchen/abrechnungswert-suchen.component';
import { TeilzahlungswertSuchenComponent } from './modules/amm/anbieter/pages/teilzahlungswert-suchen/teilzahlungswert-suchen.component';
import { StellenSuchenComponent } from '@modules/arbeitgeber/stellenangebot/pages/stellen-suchen/stellen-suchen.component';
import { ArbeitgeberSearchPageComponent } from '@modules/geko/pages/arbeitgeber-search-page/arbeitgeber-search-page.component';
import { AnbieterSearchPageComponent } from '@modules/geko/pages/anbieter-search-page/anbieter-search-page.component';
import { JobroomMeldungenSearchFormComponent } from '@modules/arbeitgeber/stellenangebot/components/jobroom-meldungen-search-form/jobroom-meldungen-search-form.component';
// prettier-ignore
import {
    StellenAngeboteMatchingTreffernComponent
} from '@modules/arbeitgeber/arbeitsvermittlung/pages/stellen-angebote-matching-treffern/stellen-angebote-matching-treffern.component';
import { ZahlstellenSuchenFormComponent } from '@modules/informationen/pages/zahlstellen-suchen-page/zahlstellen-suchen-form/zahlstellen-suchen-form.component';
import { InformationsmeldungenSuchenComponent } from '@modules/informationen/pages/informationsmeldungen-suchen/informationsmeldungen-suchen.component';
import { BewDfeSuchenTableComponent } from '@modules/amm/bewirtschaftung/components';
import { BewMassnahmeSuchenTableComponent, BewProduktSuchenTableComponent } from '@modules/amm/bewirtschaftung/components';
import { BudgetSuchenTableComponent } from '@modules/amm/budgetierung/components';
import { BudgetSuchenComponent } from '@modules/amm/budgetierung/pages';
import { PlanwertSuchenTableComponent } from '@modules/amm/planung/components';
import { PlanungAnzeigenComponent, PlanwertSuchenComponent } from '@modules/amm/planung/pages';
import { InfotagBewirtschaftungSuchenTableComponent, InfotagMassnahmeSuchenTableComponent } from '@modules/amm/infotag/components';
import { AufgabenSearchResultComponent } from '@modules/geko/components/aufgaben-search-result/aufgaben-search-result.component';
import { GekoMeldungenSearchResultComponent } from '@modules/geko/components/geko-meldungen-search-result/geko-meldungen-search-result.component';
import { StesSearchResultComponent } from '@modules/geko/components/stes-search-result/stes-search-result.component';
import { VollzugsregionSuchenComponent } from '@modules/informationen/pages/vollzugsregion-suchen/vollzugsregion-suchen.component';
import { RollenSuchenPageComponent } from '@modules/informationen/pages/rollen-suchen-page/rollen-suchen-page.component';
import { CodesSuchenComponent } from './modules/informationen/pages/codes-suchen/codes-suchen.component';
import { CodesSuchenTableComponent } from './modules/informationen/components/code-domaene/codes-suchen-table/codes-suchen-table.component';
import { LeistungsvereinbarungSuchenTableComponent, RahmenvertragSuchenTableComponent } from './modules/amm/vertraege/components';
import { BerufSuchenComponent } from '@modules/informationen/pages/beruf-suchen/beruf-suchen.component';
import { TeilzahlungenSuchenTableComponent } from './modules/amm/teilzahlungen/components';
import { SchlagwortSuchenComponent } from './modules/informationen/pages/schlagwort-suchen/schlagwort-suchen.component';
import { SchlagwortSuchenTableComponent } from './modules/informationen/components/schlagwort-suchen-table/schlagwort-suchen-table.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: [
        `
            .application.has-cover {
                background-image: url('./assets/images/cover-background.jpg');
            }
        `
    ],
    providers: [BenutzerstelleAendernService]
})
export class AppComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    isLoggedIn = false;
    envInfo: EnvironmentDTO;
    private static readonly HELP_ID = 'nav-item-help';
    private data: TopNavigationInterface[];

    constructor(
        private config: ConfigService,
        private renderer: Renderer2,
        private roboHelpService: RoboHelpService,
        private environmentRestService: EnvironmentRestService,
        private authService: AuthenticationService,
        private benutzerstelleAendernService: BenutzerstelleAendernService
    ) {
        super();
    }

    ngOnInit(): void {
        this.data = this.getFullNavigation();
        this.environmentRestService
            .getEnvironmentInfo()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(envInfo => {
                this.envInfo = envInfo;
            });
        this.isLoggedIn = this.config.isLoggedIn();
        this.config
            .getLoginObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((isLoggedIn: boolean) => {
                this.isLoggedIn = isLoggedIn;
                this.handleLogin(isLoggedIn);
            });
        this.benutzerstelleAendernService.subject
            .asObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.data = this.getFullNavigation();
            });
    }

    ngAfterViewInit(): void {
        this.handleLogin(this.isLoggedIn);
        // Remove the or-top-control. This comes sometimes on the bottom right ("Zum Seitenanfang"). It doesn't work and gives only problems.
        const orTopControl = document.getElementsByTagName('or-top-control');
        if (orTopControl && orTopControl[0]) {
            orTopControl[0].parentNode.removeChild(orTopControl[0]);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    getEnvironment(): string {
        if (!this.envInfo) {
            return '';
        } else if (!this.envInfo.environment) {
            return '';
        }

        this.envInfo.environment = this.envInfo.environment.toLowerCase();

        if (this.envInfo.environment.startsWith('p')) {
            return '';
        }

        return 'i18n.application.footer.env.' + this.envInfo.environment[0];
    }

    private handleLogin(isLoggedIn: boolean): void {
        const navbarElements = document.getElementsByClassName('navbar-locale');
        if (navbarElements && navbarElements.length > 0) {
            const parentElement = navbarElements.item(0) as HTMLElement;
            parentElement.style.display = isLoggedIn ? 'none' : 'flex';
            const help: HTMLElement = document.getElementById(AppComponent.HELP_ID);
            if (!isLoggedIn) {
                this.createHelp(parentElement, help);
            } else {
                if (help) {
                    help.remove();
                }
            }
        }
    }

    private createHelp(parentElement, helpElement: HTMLElement): void {
        if (!helpElement) {
            const help: HTMLElement = this.renderer.createElement('li');
            this.renderer.setAttribute(help, 'id', AppComponent.HELP_ID);
            this.renderer.setAttribute(help, 'class', 'nav-item ng-star-inserted');
            this.renderer.setAttribute(help, 'role', 'menuItem');

            const helpButton = this.renderer.createElement('button');
            this.renderer.setAttribute(helpButton, 'class', 'btn btn-secondary ml-2 border-0 bg-transparent');
            this.renderer.listen(helpButton, 'click', () => this.roboHelpService.help(StesFormNumberEnum.ANMELDUNG));

            const helpIcon = this.renderer.createElement('span');
            this.renderer.setAttribute(helpIcon, 'class', 'fa fa-question control-label');

            this.renderer.appendChild(helpButton, helpIcon);
            this.renderer.appendChild(help, helpButton);
            this.renderer.appendChild(parentElement, help);
        }
    }

    private getFullNavigation(): TopNavigationInterface[] {
        return [
            this.getNavigationStes(),
            this.getNavigationArbeitgeber(),
            this.getNavigationAmm(),
            this.getNavigationGeko(),
            this.getNavigationInformationen(),
            this.getNavigationMyAvam()
        ];
    }

    private getNavigationStes() {
        return {
            label: 'i18n.routes.stes-search.title',
            path: 'stes',
            permissions: [Permissions.STES],
            children: [
                this.getNavigationStesStellensuchende(),
                this.getNavigationStesArbeitsbemuehungen(),
                this.getNavigationStesFachberatung(),
                this.getNavigationStesAmmGeschaefte(),
                this.getNavigationStesArbeitsvermittlung()
            ]
        };
    }

    private getNavigationStesStellensuchende() {
        return {
            label: 'i18n.routes.stes-search.title',
            items: [
                {
                    label: 'i18n.routes.stes-search-top-navigation.title',
                    path: '/stes/search',
                    clearStateWithKey: 'stes-search-cache',
                    restoreDefaultStateWithKey: 'stes-search-table',
                    permissions: [Permissions.STES_SUCHEN_SICHTEN]
                },
                {
                    label: 'i18n.routes.stes-anmeldung-top-navigation.title',
                    path: '/stes/anmeldung/personenstammdatensuchen',
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN]
                }
            ]
        };
    }

    private getNavigationStesArbeitsbemuehungen() {
        return {
            label: 'i18n.routes.stes-arbeitsbemuehungen.title',
            items: [
                {
                    label: 'i18n.routes.stes-arbeitsbemuehungen-search-kontrollperioden.title',
                    path: '/stes/arbeitsbemuehungen/search/kontrollperioden',
                    clearStateWithKey: 'kontrollperioden-search-cache',
                    restoreDefaultStateWithKey: 'kontrollperioden-stes-suchen-stateKey',
                    permissions: [Permissions.STES_GESCHAEFT_SUCHEN_SICHTEN]
                },
                {
                    label: 'i18n.routes.stes-arbeitsbemuehungen-search-fehlender-kontrollperioden.title',
                    path: '/stes/arbeitsbemuehungen/search/fehlender-kontrollperioden',
                    clearStateWithKey: 'fehlender-kontrollperioden-search-cache',
                    restoreDefaultStateWithKey: 'fehlender-kontrollperioden-stes-suchen-stateKey',
                    permissions: [Permissions.STES_GESCHAEFT_SUCHEN_SICHTEN]
                }
            ]
        };
    }

    private getNavigationStesFachberatung() {
        return {
            label: 'stes.label.fachberatung',
            items: [
                {
                    label: 'stes.label.fachberatung.suchen',
                    path: '/stes/fachberatung/suchen',
                    clearStateWithKey: 'fachberatung-search-cache',
                    restoreDefaultStateWithKey: 'fachberatung-suchen-stateKey',
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SUCHEN]
                },
                {
                    label: 'stes.label.fachberatung.erfassen',
                    path: '/stes/fachberatung/erfassen',
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_ERFASSEN]
                },
                {
                    label: 'unternehmen.topnavmenuitem.kontaktpersonsuchen',
                    path: '/stes/fachberatung/kontaktperson/suchen',
                    clearStateWithKey: 'kontaktperson-search-cache',
                    restoreDefaultStateWithKey: 'kontaktperson-search',
                    permissions: [Permissions.FEATURE_33]
                },
                {
                    label: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE_SUCHEN,
                    path: '/stes/fachberatung/fachberatungsangebote/suchen',
                    clearStateWithKey: 'fachberatungsangebote-form-state-key',
                    restoreDefaultStateWithKey: 'fachberatungsangebote-result',
                    permissions: [Permissions.FEATURE_33, Permissions.STES_FACHBERATUNG_SUCHEN]
                }
            ]
        };
    }

    private getNavigationStesAmmGeschaefte() {
        return {
            label: 'amm.suchen.navigation.ammgeschaefte',
            items: [
                {
                    label: 'amm.suchen.navigation.ammgeschaeftesuchen',
                    path: '/stes/amm-geschaefte/suchen',
                    clearStateWithKey: 'amm-geschaefte-stes-search-cache',
                    restoreDefaultStateWithKey: 'amm-geschaefte-stes-suchen-stateKey',
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN]
                }
            ]
        };
    }

    private getNavigationStesArbeitsvermittlung() {
        return {
            label: 'i18n.routes.stes-arbeitsvermittlung.title',
            items: [
                {
                    label: 'i18n.routes.stes-arbeitsvermittlung-search-matchingtreffern.title',
                    path: '/stes/arbeitsvermittlung/search/matchingtreffern',
                    clearStateWithKey: 'matching-stes-search-cache-stateKey',
                    restoreDefaultStateWithKey: 'matching-stes-table-stateKey',
                    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_MATCHING]
                },
                {
                    label: 'i18n.routes.stellenangebot.suchen',
                    path: '/stes/arbeitsvermittlung/search/stellenangebot',
                    clearStateWithKey: 'oste-vermittlung-suchen-cache-state-key',
                    restoreDefaultStateWithKey: 'oste-vermittlung-suchen-state-key',
                    permissions: [Permissions.FEATURE_33, Permissions.STES_VM_ZUWEISUNG_BEARBEITEN]
                }
            ]
        };
    }

    private getNavigationStelleMeldepflicht() {
        return {
            label: 'arbeitgeber.oste.topnavmenuitem.oste',
            items: [
                {
                    label: 'i18n.routes.stellenangebot.suchen',
                    path: '/arbeitgeber/stellenangebot/stellen/suchen',
                    permissions: [Permissions.FEATURE_33],
                    clearStateWithKey: StellenSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: 'stellen-suchen-table'
                },
                {
                    label: 'arbeitgeber.oste.topnavmenuitem.jobroomSuchen',
                    path: '/arbeitgeber/stellenangebot/jobroom-meldungen/suchen',
                    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_JOBROOM_SUCHEN],
                    clearStateWithKey: JobroomMeldungenSearchFormComponent.STATE_KEY_CACHE,
                    restoreDefaultStateWithKey: JobroomMeldungenSearchFormComponent.STATE_KEY_RESTORE
                },
                {
                    label: 'arbeitgeber.oste.topnavmenuitem.meldepflichtPruefen',
                    path: '/arbeitgeber/stellenangebot/stellenmeldepflicht-pruefen',
                    permissions: [Permissions.FEATURE_33]
                },
                {
                    label: 'arbeitgeber.oste.topnavmenuitem.meldepflichtListe',
                    path: '/arbeitgeber/stellenangebot/stellenmeldepflicht/berufe-liste',
                    permissions: [Permissions.FEATURE_33]
                }
            ]
        };
    }

    private getNavigationArbeitgeber() {
        return {
            label: 'stes.label.arbeitgeber',
            path: 'arbeitgeber',
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER],
            children: [
                {
                    label: 'stes.label.arbeitgeber',
                    items: this.getArbeitgeberChildren()
                },
                this.getNavigationStelleMeldepflicht(),
                {
                    label: 'stes.label.arbeitsvermittlung',
                    items: [
                        {
                            label: 'arbeitgeber.topnavmenuitem.stellenvermittlung.stellensuchendeSuchen',
                            path: '/arbeitgeber/arbeitsvermittlung/stellensuchende/suchen',
                            clearStateWithKey: 'stes-vermitttlung-key',
                            restoreDefaultStateWithKey: 'stes-vermittlung-table-state-key',
                            permissions: [Permissions.FEATURE_33, Permissions.STES_SUCHEN_SICHTEN]
                        },
                        {
                            label: 'arbeitgeber.topnavmenuitem.stellenvermittlung.stellenangebote',
                            path: '/arbeitgeber/arbeitsvermittlung/stellenangebote/suchen',
                            clearStateWithKey: StellenAngeboteMatchingTreffernComponent.STATE_KEY,
                            restoreDefaultStateWithKey: 'stellen-angebot-matching-treffern-table-state-key',
                            permissions: [Permissions.FEATURE_33, Permissions.STES_VM_MATCHING]
                        }
                    ]
                },
                {
                    label: 'unternehmen.subnavmenuitem.kurzarbeit',
                    items: [
                        {
                            label: 'kaeswe.topnavmenuitem.voranmeldungsuchen',
                            path: '/arbeitgeber/kurzarbeit/voranmeldung/suchen',
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_SUCHEN],
                            clearStateWithKey: 'voranmeldung-search-cache',
                            restoreDefaultStateWithKey: 'voranmeldung-search-result-cache'
                        }
                    ]
                },
                {
                    label: 'unternehmen.subnavmenuitem.schlechtwetter',
                    items: [
                        {
                            label: 'kaeswe.topnavmenuitem.meldungsuchen',
                            path: '/arbeitgeber/schlechtwetter/swe-meldung/suchen',
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SWE_MELDUNG_SUCHEN],
                            clearStateWithKey: 'swemeldung-search-cache',
                            restoreDefaultStateWithKey: 'swe-meldung-search-result-cache'
                        }
                    ]
                }
            ]
        };
    }

    private getArbeitgeberChildren() {
        return [
            {
                label: 'arbeitgeber.oste.button.arbeitgebersuchen',
                path: '/arbeitgeber/details/suchen',
                clearStateWithKey: 'arbeitgeber-search-cache',
                restoreDefaultStateWithKey: 'arbeitgeber-suchen-stateKey',
                permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SUCHEN]
            },
            {
                label: 'arbeitgeber.oste.button.arbeitgebererfassen',
                path: '/arbeitgeber/details/erfassen',
                permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_ERFASSEN]
            },
            {
                label: 'unternehmen.topnavmenuitem.kontaktpersonsuchen',
                path: '/arbeitgeber/details/kontaktperson/suchen',
                permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN],
                clearStateWithKey: 'kontaktperson-search-cache',
                restoreDefaultStateWithKey: 'kontaktperson-search'
            }
        ];
    }

    private getNavigationAmm() {
        return {
            label: 'amm.nutzung.label.amm',
            path: 'amm',
            permissions: [Permissions.FEATURE_34, Permissions.AMM],
            children: [
                this.getNavigationAmmAdministration(),
                this.getNavigationAmmBewirtschaftung(),
                this.getNavigationAmmAnbieter(),
                this.getNavigationAmmBudgetierung(),
                this.getNavigationAmmPlanung(),
                this.getNavigationAmmVertraege(),
                this.getNavigationAmmTeilzahlungen(),
                this.getNavigationAmmAbrechnungen(),
                this.getNavigationAmmInfotage()
            ]
        };
    }

    private getNavigationAmmAdministration() {
        return {
            label: 'amm.administration.topnavmenuitem.administration',
            items: [
                {
                    label: 'amm.administration.topnavmenuitem.massnahmenart',
                    path: '/amm/administration/massnahmeartstruktur',
                    permissions: [Permissions.FEATURE_34]
                }
            ]
        };
    }

    private getNavigationAmmBewirtschaftung() {
        return {
            label: 'amm.massnahmen.topnavmenuitem.bewirtschaftung',
            items: [
                {
                    label: 'amm.massnahmen.topnavmenuitem.produktsuchen',
                    path: '/amm/bewirtschaftung/produkt/suchen',
                    clearStateWithKey: BewProduktSuchenComponent.CHANNEL_STATE_KEY,
                    restoreDefaultStateWithKey: BewProduktSuchenTableComponent.STATE_KEY,
                    permissions: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.FEATURE_34]
                },
                {
                    label: 'amm.massnahmen.topnavmenuitem.produkterfassen',
                    path: '/amm/bewirtschaftung/produkt/erfassen/grunddaten',
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_BEARBEITEN]
                },
                {
                    label: 'amm.massnahmen.topnavmenuitem.massnahmesuchen',
                    path: '/amm/bewirtschaftung/massnahme/suchen',
                    clearStateWithKey: BewMassnahmeSuchenComponent.CHANNEL_STATE_KEY,
                    restoreDefaultStateWithKey: BewMassnahmeSuchenTableComponent.STATE_KEY,
                    permissions: [{ or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN] }, Permissions.FEATURE_34]
                },
                {
                    label: 'amm.massnahmen.topnavmenuitem.durchfuehrungseinheitsuchen',
                    path: '/amm/bewirtschaftung/dfe/suchen',
                    clearStateWithKey: BewDfeSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: BewDfeSuchenTableComponent.STATE_KEY,
                    permissions: [Permissions.FEATURE_34]
                }
            ]
        };
    }

    private getNavigationAmmAnbieter() {
        return {
            label: 'amm.abrechnungen.label.anbieter',
            items: [
                {
                    label: 'amm.abrechnungen.alttext.anbietersuchen',
                    path: '/amm/anbieter/suchen',
                    clearStateWithKey: 'anbieter-search-cache',
                    restoreDefaultStateWithKey: 'anbieter-suchen-stateKey',
                    permissions: [Permissions.FEATURE_34, Permissions.ANBIETER_SUCHEN]
                },
                {
                    label: 'amm.abrechnungen.alttext.anbietererfassen',
                    path: '/amm/anbieter/erfassen',
                    permissions: [Permissions.FEATURE_34, Permissions.ANBIETER_ERFASSEN]
                },
                {
                    label: 'unternehmen.topnavmenuitem.kontaktpersonsuchen',
                    path: '/amm/anbieter/kontaktperson/suchen',
                    permissions: [Permissions.FEATURE_34],
                    clearStateWithKey: 'kontaktperson-search-cache',
                    restoreDefaultStateWithKey: 'kontaktperson-search'
                }
            ]
        };
    }

    private getNavigationAmmBudgetierung() {
        return {
            label: 'amm.budgetierung.topnavmenuitem.budgetierung',
            items: [
                {
                    path: '/amm/budget/suchen',
                    label: 'amm.budgetierung.topnavmenuitem.budgetsuchen',
                    clearStateWithKey: BudgetSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: BudgetSuchenTableComponent.STATE_KEY,
                    permissions: [Permissions.FEATURE_34]
                },
                {
                    label: 'amm.budgetierung.topnavmenuitem.budgeterfassen',
                    path: '/amm/budget/gesamtbudget',
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET]
                }
            ]
        };
    }

    private getNavigationAmmPlanung() {
        return {
            label: 'amm.planung.topnavmenuitem.planung',
            items: [
                {
                    path: '/amm/planung/planwert/suchen',
                    label: 'amm.planung.topnavmenuitem.planwertsuchen',
                    clearStateWithKey: PlanwertSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: PlanwertSuchenTableComponent.STATE_KEY,
                    permission: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                },
                {
                    path: '/amm/planung/anzeigen',
                    label: 'amm.planung.topnavmenuitem.planunganzeigen',
                    clearStateWithKey: PlanungAnzeigenComponent.CHANNEL_STATE_KEY,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                }
            ]
        };
    }

    private getNavigationAmmTeilzahlungen() {
        return {
            label: 'amm.anbieter.subnavmenuitem.teilzahlungen',
            items: [
                {
                    path: '/amm/teilzahlungen/suchen',
                    label: 'amm.abrechnungen.alttext.tzsuchen',
                    clearStateWithKey: TeilzahlungenSuchenComponent.CHANNEL_STATE_KEY,
                    restoreDefaultStateWithKey: TeilzahlungenSuchenTableComponent.STATE_KEY,
                    permission: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
                },
                {
                    path: '/amm/anbieter/teilzahlungswert/suchen',
                    label: 'amm.zahlungen.topnavmenuitem.teilzahlungswertsuchen',
                    clearStateWithKey: TeilzahlungswertSuchenComponent.CHANNEL,
                    restoreDefaultStateWithKey: 'teilzahlungswertSuchen',
                    permission: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
                }
            ]
        };
    }

    private getNavigationAmmVertraege() {
        return {
            label: 'amm.akquisition.topnavmenuitem.akquisition',
            items: [
                {
                    path: '/amm/vertraege/rahmenvertrag/suchen',
                    label: 'amm.akquisition.topnavmenuitem.rahmenvertragsuchen',
                    clearStateWithKey: RahmenvertragSuchenComponent.CHANNEL_STATE_KEY,
                    restoreDefaultStateWithKey: RahmenvertragSuchenTableComponent.STATE_KEY,
                    permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34]
                },
                {
                    path: '/amm/vertraege/leistungsvereinbarung/suchen',
                    label: 'amm.akquisition.topnavmenuitem.leistungsvereinbarungsuchen',
                    clearStateWithKey: LeistungsvereinbarungSuchenComponent.CHANNEL_STATE_KEY,
                    restoreDefaultStateWithKey: LeistungsvereinbarungSuchenTableComponent.STATE_KEY,
                    permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34]
                },
                {
                    path: '/amm/vertraege/vertragswert/suchen',
                    label: 'amm.akquisition.topnavmenuitem.vertragswertsuchen',
                    clearStateWithKey: VertragswertSuchenComponent.CHANNEL_STATE_KEY,
                    permissions: [{ or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN] }, Permissions.FEATURE_34]
                }
            ]
        };
    }

    private getNavigationAmmAbrechnungen() {
        return {
            label: 'amm.abrechnungen.topnavmenuitem.abrechnung',
            items: [
                {
                    path: '/amm/anbieter/abrechnungen/suchen',
                    label: 'amm.abrechnungen.topnavmenuitem.abrechnungsuchen',
                    clearStateWithKey: 'abrechnung-search-cache-state-key',
                    restoreDefaultStateWithKey: 'abrechnung-search-table-state-key',
                    permission: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
                },
                {
                    path: '/amm/anbieter/abrechnungswert/suchen',
                    label: 'amm.abrechnungen.topnavmenuitem.abrechnungswertsuchen',
                    clearStateWithKey: AbrechnungswertSuchenComponent.CHANNEL,
                    restoreDefaultStateWithKey: AbrechnungswertSuchenComponent.TABLE_CHANNEL,
                    permission: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
                }
            ]
        };
    }

    private getNavigationAmmInfotage() {
        return {
            label: 'amm.infotag.topnavmenuitem.infotag',
            items: [
                {
                    label: 'amm.infotag.topnavmenuitem.infotagmassnahmesuchen',
                    path: '/amm/infotag/massnahme/suchen',
                    clearStateWithKey: InfotagMassnahmeSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: InfotagMassnahmeSuchenTableComponent.STATE_KEY,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                },
                {
                    label: 'amm.infotag.topnavmenuitem.infotagmassnahmeerfassen',
                    path: '/amm/infotag/massnahme/erfassen/grunddaten',
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                },
                {
                    label: 'amm.infotag.topnavmenuitem.infotagsuchen',
                    path: '/amm/infotag/suchen',
                    clearStateWithKey: InfotagBewirtschaftungSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: InfotagBewirtschaftungSuchenTableComponent.STATE_KEY,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
                }
            ]
        };
    }

    private getNavigationGeko() {
        return {
            label: 'i18n.routes.geschaeftskontrolle.title',
            path: 'geko',
            permissions: [Permissions.FEATURE_32, Permissions.GEKO],
            children: [this.gekoGeschaefte(), this.gekoMeldungen(), this.gekoAufgaben(), this.gekoAuswertungen(), this.gekoGeschaeftsregeln()]
        };
    }

    private gekoAuswertungen() {
        return {
            label: 'geko.subnavmenuitem.auswertungen',
            items: [
                {
                    label: 'geko.topmenuitem.abzumeldendeStesSuchen',
                    path: '/geko/auswertungen/search',
                    clearStateWithKey: GekoAbzumeldendeSearchComponent.CACHE_STATE_KEY,
                    restoreDefaultStateWithKey: GekoAbzumeldendeSearchComponent.TABLE_STATE_KEY,
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN]
                }
            ]
        };
    }

    private gekoGeschaeftsregeln() {
        return {
            label: 'geko.subnavmenuitem.geschaeftsregeln',
            items: [
                {
                    label: 'geko.subnavmenuitem.geschaeftsregelnAnzeigen',
                    path: '/geko/geschaeftsregeln',
                    permissions: [Permissions.FEATURE_35, Permissions.GEKO_REGELN_SUCHEN]
                }
            ]
        };
    }

    private gekoAufgaben() {
        return {
            label: 'geko.subnavmenuitem.aufgaben',
            items: [
                {
                    label: 'geko.topmenuitem.aufgabenSuchen',
                    path: '/geko/aufgaben/search',
                    clearStateWithKey: AufgabenSearchFormComponent.CACHE_STATE_KEY,
                    restoreDefaultStateWithKey: AufgabenSearchResultComponent.STATE_KEY,
                    permissions: [Permissions.GEKO_AUFGABEN_SUCHEN]
                }
            ]
        };
    }

    private gekoMeldungen() {
        return {
            label: 'geko.subnavmenuitem.meldungen',
            items: [
                {
                    label: 'geko.topmenuitem.meldungenSuchen',
                    path: '/geko/meldung/search',
                    clearStateWithKey: GekoMeldungenSearchFormComponent.CACHE_STATE_KEY,
                    restoreDefaultStateWithKey: GekoMeldungenSearchResultComponent.STATE_KEY,
                    permissions: [Permissions.GEKO_MELDUNGEN_SUCHEN]
                }
            ]
        };
    }

    private gekoGeschaefte() {
        return {
            label: 'geko.subnavmenuitem.geschaefte',
            items: [
                {
                    label: 'geko.topmenuitem.geschaefteSuchenStes',
                    path: '/geko/stes/search',
                    clearStateWithKey: StesSearchFormComponent.CACHE_STATE_KEY,
                    restoreDefaultStateWithKey: StesSearchResultComponent.STATE_KEY,
                    permissions: [Permissions.GEKO_VERLAUF_SUCHEN_STES]
                },
                {
                    label: 'geko.topmenuitem.geschaefteSuchenAG',
                    path: '/geko/arbeitgeber/search',
                    permissions: [Permissions.FEATURE_33, Permissions.GEKO_VERLAUF_SUCHEN_AG],
                    clearStateWithKey: ArbeitgeberSearchPageComponent.CACHE_STATE_KEY
                },
                {
                    label: 'geko.topmenuitem.geschaefteSuchenAMM',
                    path: '/geko/anbieter/search',
                    permissions: [Permissions.FEATURE_34, Permissions.GEKO_VERLAUF_SUCHEN_ANBIETER],
                    clearStateWithKey: AnbieterSearchPageComponent.CACHE_STATE_KEY
                }
            ]
        };
    }

    private getNavigationMyAvam() {
        return {
            label: 'i18n.routes.myavam.title',
            path: 'myavam',
            children: [
                {
                    label: 'i18n.routes.myavam.title',
                    items: [
                        {
                            label: 'common.topnavmenuitem.benutzerstellewechseln',
                            path: '/myavam/benutzerstelleaendern'
                        }
                    ]
                }
            ]
        };
    }

    private getNavigationInformationen() {
        return {
            label: 'i18n.routes.informationen.title',
            path: 'informationen',
            permissions: [Permissions.FEATURE_35],
            children: [this.getNavigationVollzugsregion(), this.getNavigationVerzeichnisse(), this.getNavigationInformationensMeldungen()]
        };
    }

    private getNavigationVerzeichnisse() {
        return {
            label: 'i18n.routes.informationen.verzeichnisse',
            items: [
                {
                    label: 'stes.alttext.berufsdaten',
                    path: '/informationen/verzeichnisse/beruf/suchen',
                    permissions: [Permissions.INFORMATIONEN_VERZEICHNISSE_BERUF_SUCHEN],
                    clearStateWithKey: BerufSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: BerufSuchenComponent.TABLE_STATE_KEY
                },
                {
                    label: 'stes.subnavmenuitem.stesBerufErfassen',
                    path: '/informationen/verzeichnisse/beruf/erfassen',
                    permissions: [Permissions.INFORMATIONEN_VERZEICHNISSE_BERUF_ERFASSEN]
                },
                {
                    label: 'verzeichnisse.topnavmenuitem.codesuchen',
                    path: '/informationen/verzeichnisse/code/suchen',
                    clearStateWithKey: CodesSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: CodesSuchenTableComponent.STATE_KEY,
                    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_CODE_SUCHENSICHTEN]
                },
                {
                    label: 'i18n.routes.informationen.benustellesuchen',
                    path: '/informationen/verzeichnisse/benutzerstellen/suchen',
                    clearStateWithKey: 'benutzerstellen-suchen-searchForm-stateKey',
                    restoreDefaultStateWithKey: 'benutzerstellen-suchen-result-stateKey',
                    permissions: [Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_SUCHENSICHTEN]
                },
                {
                    label: 'verzeichnisse.topnavmenuitem.benutzerstelleerfassen',
                    path: '/informationen/verzeichnisse/benutzerstelle/erfassen/grunddaten',
                    permissions: [Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_ERFASSEN]
                },
                {
                    label: 'informationen.topmenuitem.zahlstellensuchen',
                    path: '/informationen/verzeichnisse/zahlstellen/suchen',
                    permissions: [Permissions.INFORMATIONEN_VERZEICHNISSE_ZAHLSTELLEN_SUCHEN],
                    clearStateWithKey: ZahlstellenSuchenFormComponent.stateKey,
                    restoreDefaultStateWithKey: 'zahlstellen-table-search'
                },
                {
                    label: 'verzeichnisse.topnavmenuitem.zahlstelleerfassen',
                    path: '/informationen/verzeichnisse/zahlstellen/erfassen',
                    permissions: [Permissions.INFORMATIONEN_VERZEICHNISSE_ZAHLSTELLEN_ERFASSEN]
                },
                {
                    label: 'verzeichnisse.topnavmenuitem.schlagwortsuchen',
                    path: '/informationen/verzeichnisse/schlagwort/suchen',
                    clearStateWithKey: SchlagwortSuchenComponent.STATE_KEY,
                    restoreDefaultStateWithKey: SchlagwortSuchenTableComponent.STATE_KEY,
                    permissions: [
                        { or: [Permissions.INFORMATIONEN_VERZEICHNISSE_SCHLAGWORT_SUCHEN, Permissions.INFORMATIONEN_VERZEICHNISSE_SCHLAGWORT_GRUPPE_SUCHEN] },
                        Permissions.FEATURE_35
                    ]
                }
            ]
        };
    }

    private getNavigationInformationensMeldungen() {
        return {
            label: 'verzeichnisse.topnavmenuitem.informationsmeldungen',
            items: [
                {
                    label: 'informationen.topmenuitem.informationsmeldungensuchen',
                    path: '/informationen/informationsmeldungen/meldungen/suchen',
                    permissions: [Permissions.INFORMATIONEN_INFORMATIONSMELDUNGEN_SUCHEN],
                    clearStateWithKey: InformationsmeldungenSuchenComponent.stateKey,
                    restoreDefaultStateWithKey: 'informationsmeldungen-suchen'
                },
                {
                    label: 'verzeichnisse.topnavmenuitem.informationsmeldungerfassen',
                    path: '/informationen/informationsmeldungen/meldungen/erfassen',
                    permissions: [Permissions.INFORMATIONEN_INFORMATIONSMELDUNGEN_INFORMATIONSMELDUNGEN_BEARBEITEN]
                }
            ]
        };
    }

    private getNavigationVollzugsregion() {
        return {
            label: 'benutzerverwaltung.topnavmenuitem.benutzerverwaltung',
            items: [
                {
                    label: 'benutzerverwaltung.topnavmenuitem.benutzersuchen',
                    path: '/informationen/benutzerverwaltung/benutzer/suchen'
                },
                {
                    label: 'benutzerverwaltung.topnavmenuitem.vollzugsregionsuchen',
                    path: '/informationen/benutzerverwaltung/vollzugsregion/suchen',
                    permissions: [Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZREGION_SUCHEN_SICHTEN],
                    clearStateWithKey: VollzugsregionSuchenComponent.stateKey,
                    restoreDefaultStateWithKey: 'vollzugsregion-search'
                },
                {
                    label: 'benutzerverwaltung.topnavmenuitem.vollzugsregionerfassen',
                    path: '/informationen/benutzerverwaltung/vollzugsregion/erfassen',
                    permissions: [Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_VOLLZREGION_ERFASSEN]
                },
                {
                    label: 'benutzerverwaltung.topnavmenuitem.rollensuchen',
                    path: '/informationen/benutzerverwaltung/rollen/suchen',
                    clearStateWithKey: RollenSuchenPageComponent.FORM_CACHE_STATE_KEY,
                    restoreDefaultStateWithKey: RollenSuchenPageComponent.RESULT_CACHE_STATE_KEY,
                    permissions: [Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_SUCHENSICHTEN]
                },
                {
                    label: 'benutzerverwaltung.topnavmenuitem.rolleerfassen',
                    path: '/informationen/benutzerverwaltung/rolle/erfassen/grunddaten',
                    permissions: [Permissions.INFORMATIONEN_BENUTZERVERWALTUNG_ROLLE_ERFASSEN]
                },
                {
                    label: 'benutzerverwaltung.topnavmenuitem.benutzertmeldungensuchen',
                    path: '/informationen/benutzerverwaltung/benutzertmeldungen/suchen'
                }
            ]
        };
    }
}

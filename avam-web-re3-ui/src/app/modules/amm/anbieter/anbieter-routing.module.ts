import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/core/guards/permission.guard';
import { WizardDoppelerfassungComponent } from '@shared/components/unternehmen/erfassen/wizard-doppelerfassung/wizard-doppelerfassung.component';
import { WizardStandortadresseComponent } from '@shared/components/unternehmen/erfassen/wizard-standortadresse/wizard-standortadresse.component';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { UnternehmenPaths } from '@app/shared/enums/stes-navigation-paths.enum';
import { UnternehmenTitles, UnternehmenTypes } from '@app/shared/enums/unternehmen.enum';
import { Permissions } from '@shared/enums/permissions.enum';
import { CanDeactivateGuard } from '@shared/services/can-deactive-guard.service';
import { KontaktpersonSuchenPageComponent } from '@modules/amm/anbieter/pages/kontaktperson-suchen-page/kontaktperson-suchen-page.component';
import { UnternehmenSuchenPageComponent } from '@modules/amm/anbieter/pages/unternehmen-suchen-page/unternehmen-suchen-page.component';
import { UnternehmenErfassenPageComponent } from '@modules/amm/anbieter/pages/unternehmen-erfassen-page/unternehmen-erfassen-page.component';
import { MainContainerPageComponent } from '@modules/amm/anbieter/pages/main-container-page/main-container-page.component';
import { AdressdatenPageComponent } from '@modules/amm/anbieter/pages/unternehmen-details/adressdaten-page/adressdaten-page.component';
import { KontaktpersonenPageComponent } from '@modules/amm/anbieter/pages/kontaktpflege/kontaktpersonen/kontaktpersonen-page.component';
import { KontaktPersonErfassenPageComponent } from '@modules/amm/anbieter/pages/kontaktpflege/kontaktpersonen/kontakt-person-erfassen-page/kontakt-person-erfassen-page.component';
import { KontaktePageComponent } from '@modules/amm/anbieter/pages/kontaktpflege/kontakte/kontakte-page.component';
import { KontaktErfassenPageComponent } from '@modules/amm/anbieter/pages/kontaktpflege/kontakte/kontakt-erfassen-page/kontakt-erfassen-page.component';
import { BurDatenAnzeigenPageComponent } from '@modules/amm/anbieter/pages/bur-bfs/bur-daten-anzeigen-page/bur-daten-anzeigen-page.component';
import { MutationsantraegeAnzeigenPageComponent } from '@modules/amm/anbieter/pages/bur-bfs/mutationsantraege-anzeigen-page/mutationsantraege-anzeigen-page.component';
import { KundenberaterPageComponent } from '@modules/amm/anbieter/pages/kontaktpflege/kundenberater/kundenberater-page.component';
import { AnbieterZertifikateComponent } from './pages/unternehmen-details/anbieter-zertifikate/anbieter-zertifikate.component';
import { MutationsantragSichtenPageComponent } from '@modules/amm/anbieter/pages/bur-bfs/mutationsantrag-sichten-page/mutationsantrag-sichten-page.component';
import { MitteilungenAnzeigenPageComponent } from '@modules/amm/anbieter/pages/bur-bfs/mitteilung/mitteilungen-anzeigen-page/mitteilungen-anzeigen-page.component';
import { MitteilungAnzeigenPageComponent } from '@modules/amm/anbieter/pages/bur-bfs/mitteilung/mitteilung-anzeigen-page/mitteilung-anzeigen-page.component';
import { AbrechnungenAnzeigenComponent } from './pages/unternehmen-details/abrechnungen-anzeigen/abrechnungen-anzeigen.component';
import { AbrechnungErfassenComponent } from './pages/unternehmen-details/abrechnung-erfassen/abrechnung-erfassen.component';
import { FormModeEnum } from '@app/shared/enums/form-mode.enum';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { TeilzahlungenUebersichtComponent } from './pages/unternehmen-details/teilzahlungen-uebersicht/teilzahlungen-uebersicht.component';
import { AbrechnungBearbeitenComponent } from './pages/unternehmen-details/abrechnung-bearbeiten/abrechnung-bearbeiten.component';
import { TeilzahlungBearbeitenPageComponent } from './pages/unternehmen-details/teilzahlung-bearbeiten-page/teilzahlung-bearbeiten-page.component';
import { TeilzahlungErfassenPageComponent } from './pages/unternehmen-details/teilzahlung-erfassen-page/teilzahlung-erfassen-page.component';
import { LeistungsvereinbarungErfassenPageComponent } from './pages/unternehmen-details/leistungsvereinbarung-erfassen-page/leistungsvereinbarung-erfassen-page.component';
import { RahmenvertraegeUebersichtComponent } from './pages/unternehmen-details/rahmenvertraege-uebersicht/rahmenvertraege-uebersicht.component';
import { LeistungsvereinbarungBearbeitenPageComponent } from './pages/unternehmen-details/leistungsvereinbarung-bearbeiten-page/leistungsvereinbarung-bearbeiten-page.component';
import { LeistungsvereinbarungenUebersichtComponent } from './pages/leistungsvereinbarungen-uebersicht/leistungsvereinbarungen-uebersicht.component';
import { RahmenvertragErfassenComponent } from './pages/unternehmen-details/rahmenvertrag-erfassen/rahmenvertrag-erfassen.component';
import { VertragswertControllingwerteComponent } from './pages/vertragswert-controllingwerte/vertragswert-controllingwerte.component';
import { AbrechnungenSuchenComponent } from './pages/abrechnungen-suchen/abrechnungen-suchen.component';
import { AbrechnungswertSuchenComponent } from './pages/abrechnungswert-suchen/abrechnungswert-suchen.component';
import { RahmenvertragBearbeitenComponent } from './pages/unternehmen-details/rahmenvertrag-bearbeiten/rahmenvertrag-bearbeiten.component';
import { VertragswertErfassenWizardComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/vertragswert-erfassen-wizard.component';
import { CanDeleteGuard } from '@app/shared/services/can-delete-guard.service';
import { ObjektAuswaehlenComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/pages/objekt-auswaehlen/objekt-auswaehlen.component';
import { PlanwertAuswaehlenErfassenComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/pages/planwert-auswaehlen/planwert-auswaehlen.component';
import { VertragswertDetailErfassenComponent } from './pages/unternehmen-details/vertragswert-erfassen-wizard/pages/vertragswert-detail/vertragswert-detail.component';
import { VertragswertAsalDatenComponent } from './pages/vertragswert-asal-daten/vertragswert-asal-daten.component';
import { TeilzahlungswerteUebersichtComponent } from './pages/teilzahlungswerte-uebersicht/teilzahlungswerte-uebersicht.component';
import { TeilzahlungswertSuchenComponent } from './pages/teilzahlungswert-suchen/teilzahlungswert-suchen.component';
import { TeilzahlungswertErfassenPageComponent } from './pages/teilzahlungswert-erfassen-page/teilzahlungswert-erfassen-page.component';
import { AbrechnungswertGrunddatenComponent } from './pages/abrechnungswert-grunddaten/abrechnungswert-grunddaten.component';
import { AbrechnungswertErfassenWizardComponent } from './pages/unternehmen-details/abrechnungswert-erfassen-wizard/abrechnungswert-erfassen-wizard.component';
// prettier-ignore
import { AbrechnungswertGrunddatenErfassenComponent }
from './pages/unternehmen-details/abrechnungswert-erfassen-wizard/pages/abrechnungswert-grunddaten-erfassen/abrechnungswert-grunddaten-erfassen.component';
// prettier-ignore
import { AbrechnungswertKostenErfassenComponent }
from './pages/unternehmen-details/abrechnungswert-erfassen-wizard/pages/abrechnungswert-kosten-erfassen/abrechnungswert-kosten-erfassen.component';
import { TeilzahlungswertBearbeitenComponent } from './pages/teilzahlungswert-bearbeiten/teilzahlungswert-bearbeiten.component';
import { AnbieterAufgabenAnzeigenPageComponent } from '@modules/amm/anbieter/pages/aufgaben-anzeigen/anbieter-aufgaben-anzeigen-page.component';
import { UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { MeldungenPageComponent } from '@modules/amm/anbieter/pages/geschaeftskontrolle/meldungen/meldungen-page.component';
import { GeschaeftePageComponent } from '@modules/amm/anbieter/pages/geschaeftskontrolle/geschaefte/geschaefte-page.component';
import { VertragswertBearbeitenPageComponent } from './pages/unternehmen-details/vertragswert-bearbeiten-page/vertragswert-bearbeiten-page.component';
import { AufgabenErfassenPageComponent } from '@modules/amm/anbieter/pages/geschaeftskontrolle/aufgaben-erfassen-page/aufgaben-erfassen-page.component';
import { AbrechnungswertKostenaufteilungComponent } from './pages/unternehmen-details/abrechnungswert-kostenaufteilung/abrechnungswert-kostenaufteilung.component';
import { AbrechnungswertKostenComponent } from './pages/unternehmen-details/abrechnungswert-kosten/abrechnungswert-kosten.component';
import { VertragswertHomeComponent } from './pages/unternehmen-details/vertragswert-home/vertragswert-home.component';
import { LeistungsvereinbarungHomeComponent } from './pages/unternehmen-details/leistungsvereinbarung-home/leistungsvereinbarung-home.component';
import { AbrechnungswertHomeComponent } from './pages/unternehmen-details/abrechnungswert-home/abrechnungswert-home.component';
import { TeilzahlungswertHomeComponent } from './pages/unternehmen-details/teilzahlungswert-home/teilzahlungswert-home.component';
import { LeistungsvereinbarungenHomeComponent } from './pages/unternehmen-details/leistungsvereinbarungen-home/leistungsvereinbarungen-home.component';

const anbieterRoutes: Routes = [
    {
        path: UnternehmenPaths.KONTAKTPERSON_SUCHEN,
        component: KontaktpersonSuchenPageComponent,
        data: { title: UnternehmenTitles.KONTAKTPERSON_SUCHEN, formNumber: StesFormNumberEnum.KONTAKTPERSON_SUCHEN, type: UnternehmenTypes.ANBIETER }
    },
    {
        path: UnternehmenPaths.SUCHEN,
        component: UnternehmenSuchenPageComponent,
        data: { title: UnternehmenTitles.ANBIETER_SUCHEN, formNumber: StesFormNumberEnum.UNTERNEHMEN_SUCHEN, type: UnternehmenTypes.ANBIETER }
    },
    {
        path: UnternehmenPaths.ERFASSEN,
        component: UnternehmenErfassenPageComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: WizardStandortadresseComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: UnternehmenTitles.WIZARD_STANDORTADRESSE,
                    permissions: [Permissions.FEATURE_34, Permissions.ANBIETER_ERFASSEN],
                    formNumber: StesFormNumberEnum.UNTERNEHMEN_ERFASSEN
                }
            },
            {
                path: 'step2',
                component: WizardDoppelerfassungComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: UnternehmenTitles.WIZARD_DOPPELERFASSUNG,
                    permissions: [Permissions.FEATURE_34, Permissions.ANBIETER_ERFASSEN],
                    formNumber: StesFormNumberEnum.UNTERNEHMEN_DOPPELERFASSUNG
                }
            }
        ],
        data: { title: UnternehmenTitles.ANBIETER_ERFASSEN, type: UnternehmenTypes.ANBIETER }
    },
    {
        path: ':unternehmenId',
        component: MainContainerPageComponent,
        data: { type: UnternehmenTypes.ANBIETER },
        children: [
            { path: '', redirectTo: 'adressdaten', pathMatch: 'full' },
            {
                path: 'adressdaten',
                component: AdressdatenPageComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_ADRESSDATEN,
                    formNumber: StesFormNumberEnum.UNTERNEHMEN_ADRESSDATEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SUCHEN]
                }
            },
            {
                path: 'zertifikate',
                component: AnbieterZertifikateComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: 'amm.anbieter.label.zertifikate',
                    formNumber: AmmFormNumberEnum.AMM_ANBIETER_ZERTIFIKATE,
                    permissions: [Permissions.FEATURE_34, Permissions.ANBIETER_BEARBEITEN]
                }
            },
            {
                path: 'rahmenvertraege',
                component: RahmenvertraegeUebersichtComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.anbieter.subnavmenuitem.rahmenvertraege',
                    formNumber: AmmFormNumberEnum.AMM_ANBIETER_RAHMENVERTRAEGE,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_AKQUISITION_LESEN]
                }
            },
            {
                path: 'rahmenvertraege/erfassen',
                component: RahmenvertragErfassenComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: 'amm.akquisition.kopfzeile.rahmenvertragerstellen',
                    formNumber: AmmFormNumberEnum.AMM_ANBIETER_RAHMENVERTRAG,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN],
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: 'rahmenvertraege/bearbeiten',
                component: RahmenvertragBearbeitenComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: 'amm.akquisition.subnavmenuitem.rahmenvertrag',
                    formNumber: AmmFormNumberEnum.AMM_ANBIETER_RAHMENVERTRAG,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN],
                    mode: FormModeEnum.EDIT
                }
            },
            {
                path: 'teilzahlungen',
                component: TeilzahlungenUebersichtComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: UnternehmenTitles.TEILZAHLUNGEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                    formNumber: AmmFormNumberEnum.TEILZAHLUNGEN_UEBERSICHT
                }
            },
            {
                path: 'teilzahlungen/erfassen',
                component: TeilzahlungErfassenPageComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: UnternehmenTitles.TEILZAHLUNGEN_ERFASSEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                    formNumber: AmmFormNumberEnum.AMM_TEILZAHLUNG,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: 'teilzahlungen/bearbeiten',
                component: TeilzahlungBearbeitenPageComponent,
                canActivate: [PermissionGuard],
                canDeactivate: [CanDeactivateGuard],
                data: {
                    title: UnternehmenTitles.TEILZAHLUNG,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                    formNumber: AmmFormNumberEnum.AMM_TEILZAHLUNG,
                    mode: FormModeEnum.EDIT
                }
            },
            {
                path: 'abrechnungen',
                component: AbrechnungenAnzeigenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.anbieter.subnavmenuitem.abrechnungen',
                    formNumber: AmmFormNumberEnum.AMM_ANBIETER_ABRECHNUNGEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
                }
            },
            {
                path: 'leistungsvereinbarungen',
                component: LeistungsvereinbarungenUebersichtComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: UnternehmenTitles.LEISTUNGSVERINBARUNGEN,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                        }
                    ],
                    formNumber: AmmFormNumberEnum.AMM_LEISTUNGSVEREINBARUNGEN_UEBERSICHT
                },
                pathMatch: 'full'
            },

            {
                path: 'leistungsvereinbarungen',
                component: LeistungsvereinbarungenHomeComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: UnternehmenTitles.LEISTUNGSVERINBARUNGEN,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                        }
                    ]
                },
                children: [
                    {
                        path: 'leistungsvereinbarung',
                        component: LeistungsvereinbarungBearbeitenPageComponent,
                        canActivate: [PermissionGuard],
                        canDeactivate: [CanDeactivateGuard],
                        data: {
                            title: UnternehmenTitles.LEISTUNGSVERINBARUNG,
                            permissions: [
                                Permissions.FEATURE_34,
                                {
                                    or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                                }
                            ],
                            formNumber: AmmFormNumberEnum.AMM_LEISTUNGSVEREINBARUNG_ERFASSEN_BEARBEITEN,
                            mode: FormModeEnum.EDIT
                        },
                        pathMatch: 'full'
                    },
                    {
                        path: 'erfassen',
                        component: LeistungsvereinbarungErfassenPageComponent,
                        canActivate: [PermissionGuard],
                        canDeactivate: [CanDeactivateGuard],
                        data: {
                            title: UnternehmenTitles.LEISTUNGSVERINBARUNG_ERFASSEN,
                            permissions: [
                                Permissions.FEATURE_34,
                                {
                                    or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                                }
                            ],
                            formNumber: AmmFormNumberEnum.AMM_LEISTUNGSVEREINBARUNG_ERFASSEN_BEARBEITEN,
                            mode: FormModeEnum.CREATE
                        },
                        pathMatch: 'full'
                    },
                    {
                        path: 'leistungsvereinbarung',
                        component: LeistungsvereinbarungHomeComponent,
                        children: [
                            {
                                path: 'vertragswert',
                                pathMatch: 'full',
                                redirectTo: 'vertragswert/detail'
                            },
                            {
                                path: 'vertragswert',
                                canActivate: [PermissionGuard],
                                component: VertragswertHomeComponent,
                                data: {
                                    permissions: [Permissions.FEATURE_34]
                                },
                                children: [
                                    {
                                        path: 'detail',
                                        component: VertragswertBearbeitenPageComponent,
                                        canActivate: [PermissionGuard],
                                        canDeactivate: [CanDeactivateGuard],
                                        data: {
                                            title: UnternehmenTitles.VETRAGSWERT_DETAIL,
                                            permissions: [
                                                Permissions.FEATURE_34,
                                                {
                                                    or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                                                }
                                            ],
                                            formNumber: AmmFormNumberEnum.AMM_VERTRAGSWERT_DETAIL,
                                            mode: FormModeEnum.EDIT
                                        }
                                    },
                                    {
                                        path: 'controllingwerte',
                                        component: VertragswertControllingwerteComponent,
                                        canActivate: [PermissionGuard],
                                        canDeactivate: [CanDeactivateGuard],
                                        data: {
                                            title: UnternehmenTitles.CONTRILLINGSWERTE,
                                            permissions: [
                                                Permissions.FEATURE_34,
                                                {
                                                    or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                                                }
                                            ],
                                            formNumber: AmmFormNumberEnum.AMM_VERTRAGSWERT_CONTROLLINGSWERTE,
                                            mode: FormModeEnum.EDIT
                                        }
                                    },
                                    {
                                        path: 'asal-daten',
                                        component: VertragswertAsalDatenComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: UnternehmenTitles.ASAL_DATEN,
                                            permissions: [
                                                Permissions.FEATURE_34,
                                                {
                                                    or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                                                }
                                            ],
                                            formNumber: AmmFormNumberEnum.VERTRAGSWERT_ASAL_DATEN
                                        }
                                    },
                                    {
                                        path: 'teilzahlungswerte',
                                        component: TeilzahlungswerteUebersichtComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: UnternehmenTitles.TEILZAHLUNGSWERTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                            formNumber: AmmFormNumberEnum.TEILZAHLUNGSWERTE_UEBERSICHT
                                        },
                                        pathMatch: 'full'
                                    },
                                    {
                                        path: 'teilzahlungswerte',
                                        component: TeilzahlungswertHomeComponent,
                                        canActivate: [PermissionGuard],
                                        data: {
                                            title: UnternehmenTitles.TEILZAHLUNGSWERTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
                                        },
                                        children: [
                                            {
                                                path: 'teilzahlungswert',
                                                component: TeilzahlungswertBearbeitenComponent,
                                                canActivate: [PermissionGuard],
                                                data: {
                                                    title: UnternehmenTitles.TEILZAHLUNGSWERT,
                                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                                    formNumber: AmmFormNumberEnum.AMM_TEILZAHLUNGSWERT
                                                }
                                            },
                                            {
                                                path: 'erfassen',
                                                component: TeilzahlungswertErfassenPageComponent,
                                                canActivate: [PermissionGuard],
                                                data: {
                                                    title: UnternehmenTitles.TEILZAHLUNGSWERT_ERFASSEN,
                                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                                    formNumber: AmmFormNumberEnum.AMM_TEILZAHLUNGSWERT
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        path: 'abrechnungswert',
                                        pathMatch: 'full',
                                        redirectTo: 'abrechnungswert/grunddaten'
                                    },
                                    {
                                        path: 'abrechnungswert',
                                        canActivate: [PermissionGuard],
                                        component: AbrechnungswertHomeComponent,
                                        data: {
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
                                        },
                                        children: [
                                            {
                                                path: 'grunddaten',
                                                component: AbrechnungswertGrunddatenComponent,
                                                canActivate: [PermissionGuard],
                                                data: {
                                                    title: UnternehmenTitles.ABRECHNUNGSWERT_GRUNDDATEN,
                                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                                    formNumber: AmmFormNumberEnum.ABRECHNUNGSWERT_GRUNDDATEN
                                                }
                                            },
                                            {
                                                path: 'kosten',
                                                component: AbrechnungswertKostenComponent,
                                                canActivate: [PermissionGuard],
                                                data: {
                                                    title: UnternehmenTitles.ABRECHNUNGSWERT_KOSTEN,
                                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                                    formNumber: AmmFormNumberEnum.ABRECHNUNGSWERT_KOSTEN
                                                }
                                            },
                                            {
                                                path: 'kostenaufteilung',
                                                component: AbrechnungswertKostenaufteilungComponent,
                                                canActivate: [PermissionGuard],
                                                canDeactivate: [CanDeactivateGuard],
                                                data: {
                                                    title: UnternehmenTitles.ABRECHNUNGSWERT_KOSTENAUFTEILUNG,
                                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                                    formNumber: AmmFormNumberEnum.ABRECHNUNGSWERT_KOSTENAUFTEILUNG
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                path: 'abrechnungen/erfassen',
                component: AbrechnungErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.abrechnungen.button.abrechnungerfassen',
                    mode: FormModeEnum.CREATE,
                    formNumber: AmmFormNumberEnum.AMM_ANBIETER_ABRECHNUNG_ERFASSEN,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_DETAIL_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_KOPF_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN
                            ]
                        }
                    ]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'abrechnungen/bearbeiten',
                component: AbrechnungBearbeitenComponent,
                canActivate: [PermissionGuard],
                data: {
                    title: 'amm.abrechnungen.subnavmenuitem.abrechnung',
                    mode: FormModeEnum.EDIT,
                    formNumber: AmmFormNumberEnum.AMM_ANBIETER_ABRECHNUNG_ERFASSEN,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_DETAIL_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_KOPF_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN
                            ]
                        }
                    ]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kontaktpersonen',
                component: KontaktpersonenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTPERSONEN,
                    formNumber: StesFormNumberEnum.KONTAKTPERSONEN_ANZEIGEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN]
                }
            },
            {
                path: 'kontaktpersonen/erfassen',
                component: KontaktPersonErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTPERSONEN_ERFASSEN,
                    formNumber: StesFormNumberEnum.KONTAKTPERSON_ERFASSEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kontaktpersonen/bearbeiten',
                component: KontaktPersonErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTPERSON_BEARBEITEN,
                    formNumber: StesFormNumberEnum.KONTAKTPERSON_BEARBEITEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kundenberater',
                component: KundenberaterPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KUNDENBERATER,
                    formNumber: StesFormNumberEnum.KUNDENBERATER,
                    type: UnternehmenTypes.ARBEITGEBER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BENUTZER_SICHTEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kontakte',
                component: KontaktePageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTE,
                    formNumber: StesFormNumberEnum.KONTAKTE_ANZEIGEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN]
                }
            },
            {
                path: 'kontakte/erfassen',
                component: KontaktErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKT_ERFASSEN,
                    formNumber: StesFormNumberEnum.KONTAKT_ERFASSEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'kontakte/bearbeiten',
                component: KontaktErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_KONTAKTE,
                    formNumber: StesFormNumberEnum.KONTAKT_BEARBEITEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'bur-daten',
                component: BurDatenAnzeigenPageComponent,
                data: {
                    title: UnternehmenTitles.ARBEITGEBER_BUR_DATEN,
                    formNumber: StesFormNumberEnum.BUR_DATEN_ANZEIGEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURDATEN_BFSMITTEILUNG]
                }
            },
            {
                path: 'mutationsantraege',
                component: MutationsantraegeAnzeigenPageComponent,
                data: {
                    title: 'unternehmen.label.mutationsantraege',
                    formNumber: StesFormNumberEnum.MUTATIONSANTRAEGE,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                }
            },
            {
                path: 'mutationsantraege/bearbeiten',
                component: MutationsantragSichtenPageComponent,
                data: {
                    title: 'unternehmen.label.mutationsantrag',
                    formNumber: StesFormNumberEnum.DETAIL_MUTATION,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                }
            },
            {
                path: 'mitteilungen',
                component: MitteilungenAnzeigenPageComponent,
                data: {
                    title: 'unternehmen.label.mitteilungen',
                    formNumber: StesFormNumberEnum.BUR_MITTEILUNGEN,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                }
            },
            {
                path: 'mitteilungen/:mitteilungId',
                component: MitteilungAnzeigenPageComponent,
                data: {
                    title: 'unternehmen.label.mitteilung',
                    formNumber: StesFormNumberEnum.BUR_MITTEILUNG,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                }
            },
            {
                path: 'aufgaben',
                component: AnbieterAufgabenAnzeigenPageComponent,
                data: {
                    title: UnternehmenSideNavLabels.AUFGABEN,
                    formNumber: StesFormNumberEnum.ANBIETER_AUFGABEN_ANZEIGEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_34, Permissions.GEKO_AUFGABEN_SUCHEN]
                }
            },
            {
                path: 'aufgaben/erfassen',
                component: AufgabenErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.UNTERNEHMEN_AUFGABE_ERFASSEN,
                    formNumber: StesFormNumberEnum.ANBIETER_AUFGABE_ERFASSEN,
                    type: UnternehmenTypes.ANBIETER,
                    mode: FormModeEnum.CREATE,
                    permissions: [Permissions.FEATURE_34, Permissions.GEKO_AUFGABEN_ERFASSEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'aufgaben/bearbeiten',
                component: AufgabenErfassenPageComponent,
                data: {
                    title: UnternehmenTitles.UNTERNEHMEN_AUFGABE_BEARBEITEN,
                    formNumber: StesFormNumberEnum.ANBIETER_AUFGABE_BEARBEITEN,
                    type: UnternehmenTypes.ANBIETER,
                    mode: FormModeEnum.EDIT,
                    permissions: [Permissions.FEATURE_34, Permissions.GEKO_AUFGABEN_BEARBEITEN]
                },
                canDeactivate: [CanDeactivateGuard]
            },
            {
                path: 'meldungen',
                component: MeldungenPageComponent,
                data: {
                    title: UnternehmenTitles.UNTERNEHMEN_MELDUNGEN,
                    formNumber: StesFormNumberEnum.ANBIETER_MELDUNGEN,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_34, Permissions.GEKO_MELDUNGEN_SUCHEN]
                }
            },
            {
                path: 'geschaefte',
                component: GeschaeftePageComponent,
                data: {
                    title: UnternehmenTitles.UNTERNEHMEN_GESCHAEFTE,
                    formNumber: StesFormNumberEnum.ANBIETER_GESCHAEFTE,
                    type: UnternehmenTypes.ANBIETER,
                    permissions: [Permissions.FEATURE_34, Permissions.GEKO_MELDUNGEN_SUCHEN, Permissions.GEKO_AUFGABEN_SUCHEN]
                }
            }
        ]
    },
    {
        path: UnternehmenPaths.VERTRAGSWERT_ERFASSEN,
        component: VertragswertErfassenWizardComponent,
        data: {
            permissions: [Permissions.FEATURE_34]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: UnternehmenPaths.OBJEKT_AUSWAEHLEN,
                component: ObjektAuswaehlenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_34],
                    title: UnternehmenTitles.OBJEKT_AUSWAEHLEN,
                    formNumber: AmmFormNumberEnum.VERTRAGSWERT_OBJEKT_AUSWAEHLEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: UnternehmenPaths.PLANWERT_AUSWAEHLEN,
                component: PlanwertAuswaehlenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_34],
                    title: UnternehmenTitles.PLANWERT_AUSWAEHLEN,
                    formNumber: AmmFormNumberEnum.VERTRAGSWERT_PLANWERT_AUSWAEHLEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: UnternehmenPaths.VERTRAGSWERT_DETAIL,
                component: VertragswertDetailErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [Permissions.FEATURE_34],
                    title: UnternehmenTitles.VETRAGSWERT_DETAIL,
                    formNumber: AmmFormNumberEnum.VERTRAGSWERT_DETAIL,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: UnternehmenPaths.SUCHEN },
    {
        path: 'abrechnungen/suchen',
        component: AbrechnungenSuchenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.abrechnungen.topnavmenuitem.abrechnungsuchen',
            formNumber: AmmFormNumberEnum.ABRECHNUNG_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
        }
    },
    {
        path: 'abrechnungswert/suchen',
        component: AbrechnungswertSuchenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.abrechnungen.topnavmenuitem.abrechnungswertsuchen',
            formNumber: AmmFormNumberEnum.ABRECHNUNGSWERT_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
        }
    },
    {
        path: 'teilzahlungswert/suchen',
        component: TeilzahlungswertSuchenComponent,
        canActivate: [PermissionGuard],
        data: {
            title: 'amm.zahlungen.topnavmenuitem.teilzahlungswertsuchen',
            formNumber: AmmFormNumberEnum.AMM_TEILZAHLUNGSWERT_SUCHEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN]
        }
    },
    {
        path: UnternehmenPaths.ABRECHNUNGSWERT_ERFASSEN,
        component: AbrechnungswertErfassenWizardComponent,
        data: {
            permissions: [
                Permissions.FEATURE_34,
                {
                    or: [
                        Permissions.AMM_ZAHLUNG_ABRECHNUNG_DETAIL_BEARBEITEN,
                        Permissions.AMM_ZAHLUNG_ABRECHNUNG_KOPF_BEARBEITEN,
                        Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN,
                        Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN
                    ]
                }
            ]
        },
        canActivate: [PermissionGuard],
        canDeactivate: [CanDeleteGuard],
        children: [
            {
                path: UnternehmenPaths.ABRECHNUNGSWERT_ERFASSEN_GRUNDDATEN,
                component: AbrechnungswertGrunddatenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_DETAIL_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_KOPF_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN
                            ]
                        }
                    ],
                    title: UnternehmenTitles.ABRECHNUNGSWERT_GRUNDDATEN,
                    formNumber: AmmFormNumberEnum.ABRECHNUNGSWERT_GRUNDDATEN,
                    mode: FormModeEnum.CREATE
                }
            },
            {
                path: UnternehmenPaths.ABRECHNUNGSWERT_ERFASSEN_KOSTEN,
                component: AbrechnungswertKostenErfassenComponent,
                canActivate: [PermissionGuard],
                data: {
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_DETAIL_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_KOPF_BEARBEITEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN,
                                Permissions.AMM_ZAHLUNG_ABRECHNUNG_UNTERSCHREIBEN
                            ]
                        }
                    ],
                    title: UnternehmenTitles.ABRECHNUNGSWERT_KOSTEN,
                    formNumber: AmmFormNumberEnum.ABRECHNUNGSWERT_KOSTEN,
                    mode: FormModeEnum.CREATE
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(anbieterRoutes)],
    exports: [RouterModule]
})
export class AnbieterRoutingModule {}

import {
    AmmBewirtschaftungLabels,
    AmmBudgetLabels,
    AmmInfotagMassnahmeLabels,
    AMMLabels,
    ArbeitsvermittlungLabels,
    FachberatungLabels,
    GekoAufgabenLabels,
    KontrollperiodenLabels,
    MatchingprofilLabels,
    SanktionLabels,
    SchnellzuweisungLabels,
    StesDetailsLabels,
    StesLeistunsexporteLabels,
    StesTermineLabels,
    StesZwischenverdienstLabels,
    UnternehmenSideNavLabels,
    VermittlungLabels,
    VermittlungsfaehigkeitLabels,
    WidereingliederungLabels,
    AmmTeilzahlungenLabels,
    InformationenLabels
} from '@shared/enums/stes-routing-labels.enum';
import { Permissions } from '../enums/permissions.enum';
import { AmmMassnahmenCode } from '../enums/domain-code/amm-massnahmen-code.enum';
import { StesSanktionen } from '../enums/stes-navigation-paths.enum';
import { BewMassnahmenUebersichtComponent } from '../../modules/amm/bewirtschaftung/pages/bew-massnahmen-uebersicht/bew-massnahmen-uebersicht.component';
import { BewDfeUebersichtComponent } from '@app/modules/amm/bewirtschaftung/pages';
import { TeilzahlungenUebersichtComponent } from '@app/modules/amm/anbieter/pages/unternehmen-details/teilzahlungen-uebersicht/teilzahlungen-uebersicht.component';
import { RahmenvertraegeUebersichtComponent } from '@app/modules/amm/anbieter/pages/unternehmen-details/rahmenvertraege-uebersicht/rahmenvertraege-uebersicht.component';
import { LeistungsvereinbarungenUebersichtComponent } from '@app/modules/amm/anbieter/pages/leistungsvereinbarungen-uebersicht/leistungsvereinbarungen-uebersicht.component';
import { InfotageUebersichtComponent } from '@app/modules/amm/infotag/pages/infotage-uebersicht/infotage-uebersicht.component';
import { StesMatchingprofilComponent } from '@stes/pages/stes-matchingprofil';

const stesStes = {
    id: 'stes',
    path: './',
    label: StesDetailsLabels.STES,
    permissions: [
        {
            or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN]
        }
    ],
    items: [
        {
            id: 'personalien',
            label: StesDetailsLabels.PERSONALIEN,
            permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
        },
        {
            id: 'zusatzadresse',
            label: StesDetailsLabels.ZUSATZADRESSE,
            permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
        },
        {
            id: 'grunddaten',
            label: StesDetailsLabels.GRUNDDATEN,
            permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
        },
        {
            id: 'berufsdaten',
            label: StesDetailsLabels.BERUFSDATEN,
            permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }],
            items: [
                {
                    id: 'erfassen',
                    label: StesDetailsLabels.BERUFSDATENERFASSEN,
                    disabled: true,
                    showCloseButton: true
                },
                {
                    id: 'bearbeiten',
                    label: StesDetailsLabels.BERUFSDATENBEARBEITEN,
                    disabled: true,
                    showCloseButton: true
                }
            ]
        },
        {
            id: 'stellensuche',
            label: StesDetailsLabels.STELLENSUCHE,
            permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
        },
        {
            id: 'sprachkenntnisse',
            label: StesDetailsLabels.SPRACHKENNTNISSE,
            permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
        },
        {
            id: 'datenfreigabe',
            label: StesDetailsLabels.DATENFREIGABE,
            permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }]
        }
    ]
};
const stesTermine = {
    id: 'termine',
    label: StesTermineLabels.TERMINEANZEIGEN,
    permissions: [
        { or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN, Permissions.AMM_INFOTAG_NUTZEN, Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] }
    ],
    collapsed: true,
    items: [
        {
            id: 'erfassen',
            label: StesTermineLabels.TERMINERFASSEN,
            disabled: true,
            showCloseButton: true
        },
        {
            id: 'bearbeiten',
            label: StesTermineLabels.TERMINBEARBEITEN,
            disabled: true,
            showCloseButton: true
        },
        {
            id: 'infotag',
            label: StesTermineLabels.INFOTAG,
            disabled: true,
            showCloseButton: true,
            items: [
                {
                    id: 'grunddatenbuchung',
                    label: StesTermineLabels.INFOTAGGRUNDDATENBUCHUNG,
                    disabled: true
                },
                {
                    id: 'beschreibungdurchfuehrungsort',
                    label: StesTermineLabels.INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT,
                    disabled: true
                },
                {
                    id: 'teilnehmerliste',
                    label: StesTermineLabels.INFOTAGTEILNEHMERLISTE,
                    disabled: true
                }
            ]
        }
    ]
};
const stesWiedereingliederung = {
    id: 'wiedereingliederung',
    label: WidereingliederungLabels.WIDEREINGLIEDERUNG,
    permissions: [Permissions.FEATURE_32],
    items: [
        {
            id: 'ausgangslage',
            label: WidereingliederungLabels.AUSGANGSLAGEN,
            permissions: [
                { or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN, Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] },
                Permissions.FEATURE_32
            ],
            items: [
                {
                    id: 'erfassen',
                    label: WidereingliederungLabels.AUSGANGSLAGE_ERFASSEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32]
                },
                {
                    id: 'bearbeiten',
                    label: WidereingliederungLabels.AUSGANGSLAGE_BEARBEITEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32]
                }
            ]
        },
        {
            id: 'ziele',
            label: WidereingliederungLabels.ZIELE,
            permissions: [
                { or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN, Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] },
                Permissions.FEATURE_32
            ],
            items: [
                {
                    id: 'erfassen',
                    label: WidereingliederungLabels.ZIEL_ERFASSEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32]
                },
                {
                    id: 'bearbeiten',
                    label: WidereingliederungLabels.ZIEL_BEARBEITEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32]
                }
            ]
        },
        {
            id: 'aktionen',
            label: WidereingliederungLabels.AKTIONEN,
            permissions: [
                { or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN, Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] },
                Permissions.FEATURE_32
            ],
            items: [
                {
                    id: 'erfassen',
                    label: WidereingliederungLabels.AKTION_ERFASSEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32]
                },
                {
                    id: 'bearbeiten',
                    label: WidereingliederungLabels.AKTION_BEARBEITEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32]
                }
            ]
        }
    ]
};
const stesFachberatungen = {
    id: 'fachberatungen',
    label: FachberatungLabels.FACHBERATUNGEN,
    permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_FB_SUCHEN],
    items: [
        {
            id: 'bearbeiten',
            label: FachberatungLabels.VERMITTLUNG,
            queryParams: 'fachberatungId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_32, Permissions.STES_VM_ZUWEISUNG_FB_SUCHEN]
        }
    ]
};
const stesArbeitsvermittlungen = {
    id: 'arbeitsvermittlungen',
    label: ArbeitsvermittlungLabels.ARBEITSVERMITTLUNG,
    permissions: [{ or: [Permissions.STES_VM_STES_ZUWEISUNG_SUCHEN, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN] }, Permissions.FEATURE_32],
    items: [
        {
            id: 'schnellzuweisung-erfassen',
            label: SchnellzuweisungLabels.SCHNELLZUWEISUNG_ERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_32, Permissions.STES_SCHNELLZUWEISUNG_BEARBEITEN]
        },
        {
            id: 'schnellzuweisung-bearbeiten',
            label: SchnellzuweisungLabels.SCHNELLZUWEISUNG_BEARBEITEN,
            queryParams: 'zuweisungId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_32, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN]
        },
        {
            id: 'vermittlung-bearbeiten',
            label: VermittlungLabels.VERMITTLUNG_BEARBEITEN,
            queryParams: 'zuweisungId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_32, Permissions.STES_VM_STES_ZUWEISUNG_SUCHEN]
        }
    ]
};
const stesMatchingprofil = {
    id: 'matchingprofil',
    label: MatchingprofilLabels.MATCHING,
    clearStateWithKey: StesMatchingprofilComponent.STATE_KEY,
    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] }]
};
const stesZwischenverdienste = {
    id: 'zwischenverdienste',
    label: StesZwischenverdienstLabels.ZWISCHENVERDIENSTE,
    collapsed: true,
    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] }],
    items: [
        {
            id: 'erfassen',
            label: StesZwischenverdienstLabels.ZWISCHENVERDIENSTEERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_ANMELDEN_BEARBEITEN, Permissions.FEATURE_32]
        },
        {
            id: 'bearbeiten',
            label: StesZwischenverdienstLabels.ZWISCHENVERDIENSTEBEARBEITEN,
            queryParams: 'zwischenverdienstId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_SUCHEN_SICHTEN, Permissions.FEATURE_32]
        }
    ]
};
const stesAmmMassnahme = [
    {
        id: 'gesuch',
        label: AMMLabels.GESUCH_NAV,
        disabled: true,
        permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
    },
    {
        id: 'kosten',
        label: AMMLabels.KOSTEN,
        disabled: true,
        permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
    },
    {
        id: 'speziell-entscheid',
        label: AMMLabels.ENTSCHEID,
        disabled: true,
        permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
    }
];
const stesAmmBuchungIndividuell = {
    id: 'buchung-individuell',
    label: AMMLabels.BUCHUNG,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmBeschreibung = {
    id: 'beschreibung',
    label: AMMLabels.BESCHREIBUNG,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmDurchfuehrungsortIndividuell = {
    id: 'durchsfuhrungsort-individuell',
    label: AMMLabels.DURCHFUHRUNGSORT,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmKostenIndividuell = {
    id: 'kosten-individuell',
    label: AMMLabels.KOSTEN,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmSpesen = {
    id: 'spesen',
    label: AMMLabels.SPESEN,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmBimBemEntscheid = {
    id: 'bim-bem-entscheid',
    label: AMMLabels.ENTSCHEID,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmBpKosten = {
    id: 'bp-kosten',
    label: AMMLabels.KOSTEN,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmKosten = {
    id: 'kosten',
    label: AMMLabels.KOSTEN,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmBuchungPsak = {
    id: 'buchung-psak',
    label: AMMLabels.BUCHUNG,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmDurchfuehrungsortKollektiv = {
    id: 'durchsfuhrungsort-kollektiv',
    label: AMMLabels.DURCHFUHRUNGSORT,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmmTeilnehmerplaetze = {
    id: 'teilnehmerplaetze',
    label: AMMLabels.TEILNEHMERPLAETZE,
    disabled: true,
    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
};
const stesAmm = {
    id: 'amm',
    label: AMMLabels.AMM,
    permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
    items: [
        {
            id: 'uebersicht',
            label: AMMLabels.UEBERSICHT,
            permissions: [Permissions.FEATURE_32, Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN],
            items: [
                {
                    id: AmmMassnahmenCode.AZ,
                    label: AMMLabels.AZ,
                    disabled: true,
                    showCloseButton: true,
                    items: stesAmmMassnahme
                },
                {
                    id: AmmMassnahmenCode.EAZ,
                    label: AMMLabels.EAZ,
                    disabled: true,
                    showCloseButton: true,
                    items: stesAmmMassnahme
                },
                {
                    id: AmmMassnahmenCode.FSE,
                    label: AMMLabels.FSE,
                    disabled: true,
                    showCloseButton: true,
                    items: stesAmmMassnahme
                },
                {
                    id: AmmMassnahmenCode.PEWO,
                    label: AMMLabels.PEWO,
                    disabled: true,
                    showCloseButton: true,
                    items: stesAmmMassnahme
                },
                {
                    id: AmmMassnahmenCode.INDIVIDUELL_KURS,
                    label: AMMLabels.INDIVIDUELL_KURS,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [stesAmmBuchungIndividuell, stesAmmBeschreibung, stesAmmDurchfuehrungsortIndividuell, stesAmmKostenIndividuell, stesAmmSpesen, stesAmmBimBemEntscheid]
                },
                {
                    id: AmmMassnahmenCode.INDIVIDUELL_BP,
                    label: AMMLabels.INDIVIDUELL_BP,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [stesAmmBuchungIndividuell, stesAmmBeschreibung, stesAmmDurchfuehrungsortIndividuell, stesAmmBpKosten, stesAmmSpesen, stesAmmBimBemEntscheid]
                },
                {
                    id: AmmMassnahmenCode.INDIVIDUELL_AP,
                    label: AMMLabels.INDIVIDUELL_AP,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [stesAmmBuchungIndividuell, stesAmmBeschreibung, stesAmmDurchfuehrungsortIndividuell, stesAmmKosten, stesAmmSpesen, stesAmmBimBemEntscheid]
                },
                {
                    id: AmmMassnahmenCode.KURS,
                    label: AMMLabels.KOLLEKTIV_KURS,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [
                        {
                            id: 'buchung-kollektiv',
                            label: AMMLabels.BUCHUNG,
                            disabled: true,
                            permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
                        },
                        stesAmmBeschreibung,
                        stesAmmDurchfuehrungsortKollektiv,
                        {
                            id: 'teilnehmer-warteliste',
                            label: AMMLabels.TEILNEHMERWARTELISTE,
                            disabled: true,
                            permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
                        },
                        stesAmmSpesen,
                        stesAmmBimBemEntscheid
                    ]
                },
                {
                    id: AmmMassnahmenCode.AP,
                    label: AMMLabels.KOLLEKTIV_AP,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [stesAmmBuchungPsak, stesAmmBeschreibung, stesAmmDurchfuehrungsortKollektiv, stesAmmTeilnehmerplaetze, stesAmmSpesen, stesAmmBimBemEntscheid]
                },
                {
                    id: AmmMassnahmenCode.BP,
                    label: AMMLabels.KOLLEKTIV_BP,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [
                        stesAmmBuchungPsak,
                        stesAmmBeschreibung,
                        stesAmmDurchfuehrungsortKollektiv,
                        stesAmmTeilnehmerplaetze,
                        stesAmmBpKosten,
                        stesAmmSpesen,
                        stesAmmBimBemEntscheid
                    ]
                },
                {
                    id: AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT,
                    label: AMMLabels.INDIVIDUELL_KURS_IN_ANGEBOT,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [
                        {
                            id: 'buchung-angebot',
                            label: AMMLabels.BUCHUNG,
                            disabled: true,
                            permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
                        },
                        {
                            id: 'beschreibung-angebot',
                            label: AMMLabels.BESCHREIBUNG,
                            disabled: true,
                            permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
                        },
                        {
                            id: 'durchsfuhrungsort-angebot',
                            label: AMMLabels.DURCHFUHRUNGSORT,
                            disabled: true,
                            permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
                        },
                        stesAmmKostenIndividuell,
                        stesAmmSpesen,
                        stesAmmBimBemEntscheid
                    ]
                },
                {
                    id: AmmMassnahmenCode.UEF,
                    label: AMMLabels.UEF,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [stesAmmBuchungPsak, stesAmmBeschreibung, stesAmmDurchfuehrungsortKollektiv, stesAmmTeilnehmerplaetze, stesAmmSpesen, stesAmmBimBemEntscheid]
                },
                {
                    id: AmmMassnahmenCode.PVB,
                    label: AMMLabels.PVB,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [stesAmmBuchungPsak, stesAmmBeschreibung, stesAmmDurchfuehrungsortKollektiv, stesAmmTeilnehmerplaetze, stesAmmSpesen, stesAmmBimBemEntscheid]
                },
                {
                    id: AmmMassnahmenCode.SEMO,
                    label: AMMLabels.SEMO,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32],
                    items: [stesAmmBuchungPsak, stesAmmBeschreibung, stesAmmDurchfuehrungsortKollektiv, stesAmmTeilnehmerplaetze, stesAmmSpesen, stesAmmBimBemEntscheid]
                }
            ]
        },
        {
            id: 'auszug',
            label: AMMLabels.AUSZUG,
            permissions: [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32]
        }
    ]
};
const stesLeistungsexporte = {
    id: 'leistungsexporte',
    label: StesLeistunsexporteLabels.LEISTUNGSEXPORTE,
    collapsed: true,
    permissions: [{ or: [Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32],
    items: [
        {
            id: 'erfassen',
            label: StesLeistunsexporteLabels.LEISTUNGSEXPORTEERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_LEISTUNGSEXPORT_BEARBEITEN, Permissions.FEATURE_32]
        },
        {
            id: 'bearbeiten',
            label: StesLeistunsexporteLabels.LEISTUNGSEXPORTEBEARBEITEN,
            queryParams: 'leistungsexportId',
            disabled: true,
            showCloseButton: true,
            permissions: [{ or: [Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN] }, Permissions.FEATURE_32]
        }
    ]
};
const stesRahmenfristen = {
    id: 'rahmenfristen',
    label: 'stes.subnavmenuitem.stesRahmenFristen',
    collapsed: true,
    items: [
        {
            id: 'rahmenfristdetails',
            label: 'common.label.rahmenfrist',
            disabled: true,
            showCloseButton: true,
            items: [
                {
                    id: 'zaehlerstand',
                    label: 'stes.subnavmenuitem.stesRahmenFristZaehlerstand',
                    disabled: true
                }
            ]
        }
    ]
};
const stesKontrollperioden = {
    id: 'kontrollperioden',
    label: KontrollperiodenLabels.KONTROLLPERIODEN,
    permissions: [Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN],
    items: [
        {
            id: 'erfassen',
            label: KontrollperiodenLabels.ERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_ANMELDEN_BEARBEITEN]
        },
        {
            id: 'bearbeiten',
            label: KontrollperiodenLabels.BEARBEITEN,
            queryParams: 'kontrollperiodeId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_ANMELDEN_BEARBEITEN]
        }
    ]
};

function stesSanktionenSachverhaltErfassen(id) {
    return {
        id,
        label: SanktionLabels.SACHVERHALT_ERFASSEN,
        disabled: true,
        showCloseButton: true,
        permissions: [Permissions.STES_SANKTION_VMF_BEARBEITEN]
    };
}

function stesSanktionenSachverhaltBearbeiten(id) {
    return {
        id,
        label: SanktionLabels.SACHVERHALT_BEARBEITEN,
        queryParams: 'sachverhaltId',
        disabled: true,
        showCloseButton: true,
        permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN]
    };
}

function stesSanktionenStellungsnahmeErfassen(id) {
    return {
        id,
        label: SanktionLabels.STELLUNGNAHME_ERFASSEN,
        queryParams: 'sachverhaltId',
        disabled: true,
        showCloseButton: true,
        permissions: [Permissions.STES_SANKTION_VMF_BEARBEITEN]
    };
}

function stesSanktionenStellungsnahmeBearbeiten(id) {
    return {
        id,
        label: SanktionLabels.STELLUNGNAHME_BEARBEITEN,
        queryParams: ['sachverhaltId', 'stellungnahmeId'],
        disabled: true,
        showCloseButton: true,
        permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN]
    };
}

function stesSanktionenEntscheidErfassen(id) {
    return {
        id,
        label: SanktionLabels.ENTSCHEID_ERFASSEN,
        queryParams: 'sachverhaltId',
        disabled: true,
        showCloseButton: true,
        permissions: [Permissions.STES_SANKTION_VMF_BEARBEITEN]
    };
}

function stesSanktionenEntscheidBearbeiten(id) {
    return {
        id,
        label: SanktionLabels.ENTSCHEID_BEARBEITEN,
        queryParams: ['sachverhaltId', 'entscheidId'],
        disabled: true,
        showCloseButton: true,
        permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN]
    };
}

const stesSanktionen = {
    id: 'sanktionen',
    label: 'stes.subnavmenuitem.sanktionen.anzeigen',
    collapsed: true,
    permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN],
    items: [
        stesSanktionenSachverhaltErfassen('arbeitsbemuehungen-erfassen'),
        stesSanktionenSachverhaltErfassen('arbeitsmarktliche-massnahmen-erfassen'),
        stesSanktionenSachverhaltErfassen('beratung-erfassen'),
        stesSanktionenSachverhaltErfassen('kontrollvorschriften-weisungen-erfassen'),
        stesSanktionenSachverhaltErfassen('vermittlung-erfassen'),
        stesSanktionenSachverhaltBearbeiten('arbeitsbemuehungen-bearbeiten'),
        stesSanktionenSachverhaltBearbeiten('arbeitsmarktliche-massnahmen-bearbeiten'),
        stesSanktionenSachverhaltBearbeiten('beratung-bearbeiten'),
        stesSanktionenSachverhaltBearbeiten('kontrollvorschriften-weisungen-bearbeiten'),
        stesSanktionenSachverhaltBearbeiten('vermittlung-bearbeiten'),
        stesSanktionenStellungsnahmeErfassen('arbeitsmarktliche-massnahmen-stellungnahme-erfassen'),
        stesSanktionenStellungsnahmeErfassen('beratung-stellungnahme-erfassen'),
        stesSanktionenStellungsnahmeErfassen('kontrollvorschriften-weisungen-stellungnahme-erfassen'),
        stesSanktionenStellungsnahmeErfassen('arbeitsbemuehungen-stellungnahme-erfassen'),
        stesSanktionenStellungsnahmeErfassen('vermittlung-stellungnahme-erfassen'),
        stesSanktionenStellungsnahmeBearbeiten('arbeitsmarktliche-massnahmen-stellungnahme-bearbeiten'),
        stesSanktionenStellungsnahmeBearbeiten('beratung-stellungnahme-bearbeiten'),
        stesSanktionenStellungsnahmeBearbeiten('kontrollvorschriften-weisungen-stellungnahme-bearbeiten'),
        stesSanktionenStellungsnahmeBearbeiten('arbeitsbemuehungen-stellungnahme-bearbeiten'),
        stesSanktionenStellungsnahmeBearbeiten('vermittlung-stellungnahme-bearbeiten'),
        stesSanktionenEntscheidErfassen(StesSanktionen.SANKTION_MASSNAHMEN_ENTSCHEID_ERFASSEN),
        stesSanktionenEntscheidErfassen(StesSanktionen.SANKTION_BERATUNG_ENTSCHEID_ERFASSEN),
        stesSanktionenEntscheidErfassen(StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_ENTSCHEID_ERFASSEN),
        stesSanktionenEntscheidErfassen(StesSanktionen.SANKTION_BEMUEHUNGEN_ENTSCHEID_ERFASSEN),
        stesSanktionenEntscheidErfassen(StesSanktionen.SANKTION_VERMITTLUNG_ENTSCHEID_ERFASSEN),
        stesSanktionenEntscheidBearbeiten(StesSanktionen.SANKTION_MASSNAHMEN_ENTSCHEID_BEARBEITEN),
        stesSanktionenEntscheidBearbeiten(StesSanktionen.SANKTION_BERATUNG_ENTSCHEID_BEARBEITEN),
        stesSanktionenEntscheidBearbeiten(StesSanktionen.SANKTION_KONTROLL_WEISUNGEN_ENTSCHEID_BEARBEITEN),
        stesSanktionenEntscheidBearbeiten(StesSanktionen.SANKTION_BEMUEHUNGEN_ENTSCHEID_BEARBEITEN),
        stesSanktionenEntscheidBearbeiten(StesSanktionen.SANKTION_VERMITTLUNG_ENTSCHEID_BEARBEITEN)
    ]
};
const stesVermittlungsfaehigkeit = {
    id: 'vermittlungsfaehigkeit',
    label: 'stes.subnavmenuitem.stesvermittlungsfaehigkeit.anzeigen',
    permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN],
    collapsed: true,
    items: [
        {
            id: 'erfassen',
            label: VermittlungsfaehigkeitLabels.SACHVERHALT_ERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_SANKTION_VMF_BEARBEITEN]
        },
        {
            id: 'sachverhalt-bearbeiten',
            label: VermittlungsfaehigkeitLabels.SACHVERHALT_BEARBEITEN,
            queryParams: 'sachverhaltId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN]
        },
        {
            id: 'entscheid-erfassen',
            label: VermittlungsfaehigkeitLabels.ENTSCHEID_ERFASSEN,
            queryParams: 'sachverhaltId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_SANKTION_VMF_BEARBEITEN]
        },
        {
            id: 'entscheid-bearbeiten',
            label: VermittlungsfaehigkeitLabels.ENTSCHEID_BEARBEITEN,
            queryParams: ['sachverhaltId', 'entscheidId'],
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN]
        },
        {
            id: 'stellungnahme-erfassen',
            label: VermittlungsfaehigkeitLabels.STELLUNGNAHME_ERFASSEN,
            queryParams: 'sachverhaltId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_SANKTION_VMF_BEARBEITEN]
        },
        {
            id: 'stellungnahme-bearbeiten',
            label: VermittlungsfaehigkeitLabels.STELLUNGNAHME_BEARBEITEN,
            queryParams: ['sachverhaltId', 'stellungnahmeId'],
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.STES_SANKTION_VMF_SUCHEN_SICHTEN]
        }
    ]
};
const stesAbmeldung = {
    id: 'abmeldung',
    label: 'stes.subnavmenuitem.stesabmeldung',
    permissions: [{ or: [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN, Permissions.STES_LEISTUNGSEXPORT_SUCHEN_SICHTEN] }]
};
const stesMeldungen = {
    id: 'meldungen',
    label: 'geko.subnavmenuitem.meldungen',
    permissions: [Permissions.GEKO_MELDUNGEN_SUCHEN]
};
const stesAufgaben = {
    id: 'aufgaben',
    label: GekoAufgabenLabels.AUFGABEN,
    collapsed: true,
    permissions: [Permissions.GEKO_AUFGABEN_SUCHEN],
    items: [
        {
            id: 'erfassen',
            label: GekoAufgabenLabels.NEUE_AUFGABE,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.GEKO_AUFGABEN_ERFASSEN]
        },
        {
            id: 'bearbeiten',
            label: GekoAufgabenLabels.AUFGABE_BEARBEITEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.GEKO_AUFGABEN_BEARBEITEN]
        }
    ]
};
const stesGeschaefte = {
    id: 'geschaefte',
    label: 'geko.subnavmenuitem.geschaefte',
    permissions: [Permissions.GEKO_MELDUNGEN_SUCHEN, Permissions.GEKO_AUFGABEN_SUCHEN]
};
const stes = {
    stes: {
        navTree: {
            label: 'navTree',
            items: [
                stesStes,
                stesRahmenfristen,
                stesTermine,
                stesWiedereingliederung,
                stesFachberatungen,
                stesArbeitsvermittlungen,
                stesMatchingprofil,
                stesZwischenverdienste,
                stesAmm,
                stesLeistungsexporte,
                stesKontrollperioden,
                stesSanktionen,
                stesVermittlungsfaehigkeit,
                stesAbmeldung,
                stesMeldungen,
                stesAufgaben,
                stesGeschaefte
            ]
        }
    }
};

const myavam = { myAvam: {} };

const arbeitgeberAufgaben = {
    id: 'aufgaben',
    label: UnternehmenSideNavLabels.AUFGABEN,
    collapsed: true,
    permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_SUCHEN],
    items: [
        {
            id: 'erfassen',
            label: UnternehmenSideNavLabels.AUFGABE_ERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_ERFASSEN]
        },
        {
            id: 'bearbeiten',
            label: UnternehmenSideNavLabels.AUFGABE_BEARBEITEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_BEARBEITEN]
        }
    ]
};

const unternehmenMeldungen = {
    id: 'meldungen',
    label: UnternehmenSideNavLabels.MELDUNGEN,
    permissions: [Permissions.FEATURE_33, Permissions.GEKO_MELDUNGEN_SUCHEN]
};

const unternehmenGeschaefte = {
    id: 'geschaefte',
    label: UnternehmenSideNavLabels.GESCHAEFTE,
    permissions: [Permissions.FEATURE_33, Permissions.GEKO_MELDUNGEN_SUCHEN, Permissions.GEKO_AUFGABEN_SUCHEN]
};

const unternehmenGeKo = {
    id: 'geschaeftskontrolle',
    path: './',
    label: UnternehmenSideNavLabels.GESCHAEFTSKONTROLLE,
    permissions: [],
    items: [arbeitgeberAufgaben, unternehmenMeldungen, unternehmenGeschaefte]
};

const fachberatungsstelleGeKo = {
    id: 'geschaeftskontrolle',
    path: './',
    label: UnternehmenSideNavLabels.GESCHAEFTSKONTROLLE,
    permissions: [],
    items: [arbeitgeberAufgaben, unternehmenMeldungen]
};

const unternehmenBurbfs = {
    id: 'bur-bfs',
    path: './',
    label: UnternehmenSideNavLabels.BUR_BFS,
    permissions: [],
    items: [
        {
            id: 'bur-daten',
            label: UnternehmenSideNavLabels.BUR_DATEN,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURDATEN_BFSMITTEILUNG]
        },
        {
            id: 'mutationsantraege',
            label: UnternehmenSideNavLabels.MUTATIONSANTRAEGE,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN],
            items: [
                {
                    id: 'bearbeiten',
                    label: UnternehmenSideNavLabels.MUTATIONSANTRAG,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                }
            ]
        },
        {
            id: 'mitteilungen',
            label: UnternehmenSideNavLabels.BUR_MITTEILUNGEN,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN],
            items: [
                {
                    id: 'bearbeiten',
                    label: UnternehmenSideNavLabels.BUR_MITTEILUNG,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BURMUTATIONEN_SICHTEN]
                }
            ]
        }
    ]
};

const unternehmenKontaktpersonen = {
    id: 'kontaktpersonen',
    label: UnternehmenSideNavLabels.KONTAKTPERSONEN,
    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN],
    items: [
        {
            id: 'erfassen',
            label: UnternehmenSideNavLabels.KONTAKTPERSON_ERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_BEARBEITEN]
        },
        {
            id: 'bearbeiten',
            label: UnternehmenSideNavLabels.KONTAKTPERSON_BEARBEITEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTPERSON_SUCHEN]
        }
    ]
};
const unternehmenKundenberater = {
    id: 'kundenberater',
    label: UnternehmenSideNavLabels.KUNDENBERATER,
    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_BENUTZER_SICHTEN]
};
const unternehmenKontakte = {
    id: 'kontakte',
    label: UnternehmenSideNavLabels.KONTAKTE,
    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN],
    items: [
        {
            id: 'erfassen',
            label: UnternehmenSideNavLabels.KONTAKT_ERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_BEARBEITEN]
        },
        {
            id: 'bearbeiten',
            label: UnternehmenSideNavLabels.KONTAKT_BEARBEITEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KONTAKTE_SICHTEN]
        }
    ]
};

const arbeitgeberBerufeTaetigkeit = {
    id: 'berufe-taetigkeit',
    label: UnternehmenSideNavLabels.BERUFE_TAETIGKEIT,
    permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_ARBEITGEBERDATEN_BEARBEITEN],
    items: [
        {
            id: 'erfassen',
            label: UnternehmenSideNavLabels.BERUFE_TAETIGKEIT_ERFASSEN,
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_ARBEITGEBERDATEN_BEARBEITEN]
        },
        {
            id: 'bearbeiten',
            label: UnternehmenSideNavLabels.BERUFE_TAETIGKEIT_BEARBEITEN,
            queryParams: 'beschaeftigterBerufId',
            disabled: true,
            showCloseButton: true,
            permissions: [Permissions.FEATURE_33]
        }
    ]
};

const arbeitgeberArbeitgeber = {
    id: 'arbeitgeber',
    path: './',
    label: UnternehmenSideNavLabels.ARBEITGEBER,
    permissions: [],
    items: [
        {
            id: 'adressdaten',
            label: UnternehmenSideNavLabels.ADRESSDATEN,
            permissions: []
        },
        {
            id: 'geschaeftsstatistik',
            label: UnternehmenSideNavLabels.GESCHAEFTSSTATISTIK,
            permissions: []
        },
        {
            id: 'stellenangebote',
            label: UnternehmenSideNavLabels.STELLENANGEBOTE,
            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN],
            items: [
                {
                    id: 'stellenangebot',
                    label: UnternehmenSideNavLabels.STELLENANGEBOT,
                    disabled: true,
                    showCloseButton: true,
                    queryParams: 'osteId',
                    permissions: [Permissions.FEATURE_33],
                    items: [
                        {
                            id: 'bewirtschaftung',
                            label: UnternehmenSideNavLabels.BEWIRTSCHAFTUNG,
                            disabled: false,
                            showCloseButton: false,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        },
                        {
                            id: 'basisangaben',
                            label: UnternehmenSideNavLabels.BASISANGABEN,
                            disabled: false,
                            showCloseButton: false,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        },
                        {
                            id: 'anforderungen',
                            label: UnternehmenSideNavLabels.ANFORDERUNGEN,
                            disabled: false,
                            showCloseButton: false,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        },
                        {
                            id: 'bewerbung',
                            label: UnternehmenSideNavLabels.BEWERBUNG,
                            disabled: false,
                            showCloseButton: false,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_BEARBEITEN]
                        },
                        {
                            id: 'matchingprofil',
                            label: UnternehmenSideNavLabels.STELLENANGEBOT_MATCHINGPROFIL,
                            disabled: false,
                            showCloseButton: false,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_OSTE_SUCHEN]
                        },
                        {
                            id: 'vermittlungen',
                            label: UnternehmenSideNavLabels.STELLENAGEBOT_VERMITTLUNGEN_ANZEIGEN,
                            disabled: false,
                            showCloseButton: false,
                            permissions: [Permissions.FEATURE_33, Permissions.KEY_STES_VM_OSTE_ZUWEISUNG_SUCHEN],
                            items: [
                                {
                                    id: 'bearbeiten',
                                    label: UnternehmenSideNavLabels.STELLENANGEBOT_VERMITTLUNG,
                                    disabled: true,
                                    showCloseButton: true,
                                    queryParams: ['osteId', 'zuweisungId'],
                                    permissions: [Permissions.FEATURE_33, Permissions.KEY_STES_VM_OSTE_ZUWEISUNG_SUCHEN, Permissions.KEY_POPUP_STES_SUCHEN_SICHTEN]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'schnellzuweisungen',
            label: UnternehmenSideNavLabels.SCHNELLZUWEISUNGEN,
            permissions: [Permissions.FEATURE_33, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN],
            items: [
                {
                    id: 'bearbeiten',
                    label: SchnellzuweisungLabels.SCHNELLZUWEISUNG_BEARBEITEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.FEATURE_33, Permissions.STES_SCHNELLZUWEISUNG_ANZEIGEN]
                }
            ]
        },
        {
            id: 'kurzarbeit',
            label: UnternehmenSideNavLabels.KURZARBEIT,
            permissions: [Permissions.FEATURE_33],
            items: [
                {
                    id: 'voranmeldungen',
                    label: UnternehmenSideNavLabels.VORANMELDUNGEN,
                    disabled: false,
                    showCloseButton: false,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_SUCHEN],
                    items: [
                        {
                            id: 'bearbeiten',
                            label: UnternehmenSideNavLabels.VORANMELDUNG_BEARBEITEN,
                            disabled: true,
                            showCloseButton: true,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_BEARBEITEN]
                        },
                        {
                            id: 'erfassen',
                            label: UnternehmenSideNavLabels.VORANMELDUNG_ERFASSEN,
                            disabled: true,
                            showCloseButton: true,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_ERFASSEN]
                        }
                    ]
                }
            ]
        },
        {
            id: 'schlechtwetter',
            label: UnternehmenSideNavLabels.SCHLECHTWETTER,
            permissions: [Permissions.FEATURE_33],
            items: [
                {
                    id: 'meldungen',
                    label: UnternehmenSideNavLabels.LISTE_MELDUNGEN,
                    disabled: false,
                    showCloseButton: false,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_VORANMELDUNG_SUCHEN],
                    items: [
                        {
                            id: 'bearbeiten',
                            label: UnternehmenSideNavLabels.MELDUNG_BEARBEITEN,
                            disabled: true,
                            showCloseButton: true,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SWE_MELDUNG_BEARBEITEN]
                        },
                        {
                            id: 'erfassen',
                            label: UnternehmenSideNavLabels.MELDUNG_ERFASSEN,
                            disabled: true,
                            showCloseButton: true,
                            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_SWE_MELDUNG_ERFASSEN]
                        }
                    ]
                }
            ]
        },
        {
            id: 'betriebsabteilungen',
            label: UnternehmenSideNavLabels.BETRIEBSABTEILUNGEN,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_ERFASSEN]
        },
        {
            id: 'rahmenfristen',
            label: UnternehmenSideNavLabels.RAHMENFRISTEN,
            permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_SWE_RAHMENFRISTEN_SUCHEN],
            items: [
                {
                    id: 'anzeigen',
                    label: UnternehmenSideNavLabels.RAHMENFRIST,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_KAE_SWE_RAHMENFRISTEN_SUCHEN]
                },
                {
                    id: 'zahlungen',
                    label: UnternehmenSideNavLabels.ZAHLUNGEN_KAE_SWE,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.FEATURE_33, Permissions.ARBEITGEBER_RAHMENFRIST_ZAHLUNG_SUCHEN]
                }
            ]
        }
    ]
};
const arbeitgeberKontaktpflege = {
    id: 'kontaktpflege',
    path: './',
    label: UnternehmenSideNavLabels.KONTAKTPFLEGE,
    permissions: [],
    items: [
        {
            id: 'akquisition',
            label: UnternehmenSideNavLabels.AKQUISITION,
            permissions: [Permissions.FEATURE_33, Permissions.KEY_AG_ARBEITGEBERDATEN_BEARBEITEN],
            items: []
        },
        unternehmenKontaktpersonen,
        unternehmenKundenberater,
        unternehmenKontakte,
        arbeitgeberBerufeTaetigkeit
    ]
};

const arbeitgeberGeko = {
    id: 'geko',
    path: './',
    label: UnternehmenSideNavLabels.GESCHAEFTSKONTROLLE,
    permissions: [Permissions.FEATURE_33],
    items: [
        {
            id: 'aufgaben',
            label: UnternehmenSideNavLabels.AUFGABEN,
            permissions: [Permissions.FEATURE_33, Permissions.GEKO_AUFGABEN_SUCHEN]
        }
    ]
};

const arbeitgeber = {
    arbeitgeber: {
        id: 'stellenangebot',
        path: 'stellenangebot',
        permissions: [Permissions.FEATURE_32],
        navTree: {
            label: 'navTree',
            items: [arbeitgeberArbeitgeber, arbeitgeberKontaktpflege, unternehmenBurbfs, unternehmenGeKo]
        }
    }
};

const fachberatungsstelleFachberatung = {
    id: 'fachberatung',
    path: './',
    label: 'Fachberatungsstelle',
    permissions: [],
    items: [
        {
            id: 'adressdaten',
            label: UnternehmenSideNavLabels.ADRESSDATEN,
            permissions: []
        },
        {
            id: 'fachberatungsangebote',
            label: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE,
            permissions: [],
            items: [
                {
                    id: 'erfassen',
                    label: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE_ERFASSEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: []
                },
                {
                    id: 'bearbeiten',
                    label: UnternehmenSideNavLabels.FACHBERATUNGSANGEBOTE_BEARBEITEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: []
                }
            ]
        }
    ]
};
const fachberatungsstelleKontaktpflege = {
    id: 'kontaktpflege',
    path: './',
    label: UnternehmenSideNavLabels.KONTAKTPFLEGE,
    permissions: [],
    items: [unternehmenKontaktpersonen, unternehmenKundenberater, unternehmenKontakte]
};
const fachberatungsstelle = {
    fachberatungsStelle: {
        navTree: {
            label: 'navTree',
            items: [fachberatungsstelleFachberatung, fachberatungsstelleKontaktpflege, unternehmenBurbfs, fachberatungsstelleGeKo]
        }
    }
};

const ammAmm = {
    id: 'amm',
    path: './',
    label: UnternehmenSideNavLabels.ANBIETER,
    permissions: [],
    items: [
        {
            id: 'adressdaten',
            label: UnternehmenSideNavLabels.ADRESSDATEN,
            permissions: []
        },
        {
            id: 'zertifikate',
            label: UnternehmenSideNavLabels.ZERTIFIKATE,
            permissions: [Permissions.FEATURE_34]
        },
        {
            id: 'rahmenvertraege',
            label: UnternehmenSideNavLabels.RAHMENVERTRAEGE,
            clearStateWithKey: RahmenvertraegeUebersichtComponent.channel,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_AKQUISITION_LESEN],
            items: [
                {
                    id: 'erfassen',
                    label: UnternehmenSideNavLabels.RAHMENVERTRAG_ERFASSEN,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                        }
                    ],
                    disabled: true,
                    showCloseButton: true
                },
                {
                    id: 'bearbeiten',
                    label: UnternehmenSideNavLabels.RAHMENVERTRAG_BEARBEITEN,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                        }
                    ],
                    disabled: true,
                    showCloseButton: true
                }
            ]
        },
        {
            id: 'leistungsvereinbarungen',
            label: UnternehmenSideNavLabels.LEISTUNGSVEREINBARUNGEN,
            clearStateWithKey: LeistungsvereinbarungenUebersichtComponent.CHANNEL_STATE_KEY,
            permissions: [
                Permissions.FEATURE_34,
                {
                    or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                }
            ],
            items: [
                {
                    id: 'leistungsvereinbarung',
                    label: UnternehmenSideNavLabels.LEISTUNGSVEREINBARUNG,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                        }
                    ],
                    showCloseButton: true,
                    disabled: true,
                    items: [
                        {
                            id: 'vertragswert',
                            label: UnternehmenSideNavLabels.VERTRAGSWERT,
                            permissions: [
                                Permissions.FEATURE_34,
                                {
                                    or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                                }
                            ],
                            showCloseButton: true,
                            disabled: true,
                            items: [
                                {
                                    id: 'detail',
                                    label: UnternehmenSideNavLabels.DETAIL,
                                    permissions: [
                                        Permissions.FEATURE_34,
                                        {
                                            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    id: 'controllingwerte',
                                    label: UnternehmenSideNavLabels.CONTROLLINGWERTE,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                    disabled: true
                                },
                                {
                                    id: 'asal-daten',
                                    label: UnternehmenSideNavLabels.ASAL_DATEN,
                                    permissions: [
                                        Permissions.FEATURE_34,
                                        {
                                            or: [Permissions.AMM_AKQUISITION_UNTERSCHREIBEN, Permissions.AMM_AKQUISITION_BEARBEITEN]
                                        }
                                    ],
                                    disabled: true
                                },
                                {
                                    id: 'teilzahlungswerte',
                                    label: UnternehmenSideNavLabels.TEILZAHLUNGSWERTE,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                    items: [
                                        {
                                            id: 'erfassen',
                                            label: UnternehmenSideNavLabels.TEILZAHLUNGSWERT_ERFASSEN,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                            disabled: true,
                                            showCloseButton: true
                                        },
                                        {
                                            id: 'teilzahlungswert',
                                            label: UnternehmenSideNavLabels.TEILZAHLUNGSWERT,
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
                                            ],
                                            disabled: true,
                                            showCloseButton: true
                                        }
                                    ]
                                },
                                {
                                    id: 'abrechnungswert',
                                    label: UnternehmenSideNavLabels.ABRECHNUNGSWERT,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                    disabled: true,
                                    items: [
                                        {
                                            id: 'grunddaten',
                                            label: UnternehmenSideNavLabels.GRUNDDATEN,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                            disabled: true
                                        },
                                        {
                                            id: 'kosten',
                                            label: UnternehmenSideNavLabels.ABRECHNUNGSWERT_KOSTEN,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                            disabled: true
                                        },
                                        {
                                            id: 'kostenaufteilung',
                                            label: UnternehmenSideNavLabels.ABRECHNUNGSWERT_KOSTENAUFTEILUNG,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                                            disabled: true
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'erfassen',
                    label: UnternehmenSideNavLabels.LEISTUNGSVEREINBARUNG_ERFASSEN,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
                        }
                    ],
                    disabled: true,
                    showCloseButton: true
                }
            ]
        },
        {
            id: 'teilzahlungen',
            label: UnternehmenSideNavLabels.TEILZAHLUNGEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
            clearStateWithKey: TeilzahlungenUebersichtComponent.CHANNEL_STATE_KEY,
            items: [
                {
                    id: 'erfassen',
                    label: AmmTeilzahlungenLabels.TEILZAHLUNG_ERFASSEN,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                    disabled: true,
                    showCloseButton: true
                },
                {
                    id: 'bearbeiten',
                    label: AmmTeilzahlungenLabels.TEILZAHLUNG,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
                    disabled: true,
                    showCloseButton: true
                }
            ]
        },
        {
            id: 'abrechnungen',
            label: UnternehmenSideNavLabels.ABRECHNUNGEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_ZAHLUNG_ABRECHNUNG_SICHTEN],
            items: [
                {
                    id: 'erfassen',
                    label: 'amm.abrechnungen.button.abrechnungerfassen',
                    disabled: true,
                    showCloseButton: true,
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
                {
                    id: 'bearbeiten',
                    label: 'amm.abrechnungen.subnavmenuitem.abrechnung',
                    disabled: true,
                    showCloseButton: true,
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
                }
            ]
        }
    ]
};
const ammKontaktpflege = {
    id: 'kontaktpflege',
    path: './',
    label: UnternehmenSideNavLabels.KONTAKTPFLEGE,
    permissions: [],
    items: [unternehmenKontaktpersonen, unternehmenKundenberater, unternehmenKontakte]
};
const ammInfotagmassnahme = {
    id: 'infotagMassnahme',
    path: './',
    label: AmmInfotagMassnahmeLabels.INFOTAG_MASSNAHME,
    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
    items: [
        {
            id: 'grunddaten',
            label: AmmInfotagMassnahmeLabels.GRUNDDATEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
        },
        {
            id: 'beschreibung',
            label: AmmInfotagMassnahmeLabels.BESCHREIBUNG,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN]
        },
        {
            id: 'infotage',
            label: AmmInfotagMassnahmeLabels.INFOTAGE,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
            clearStateWithKey: InfotageUebersichtComponent.CHANNEL,
            items: [
                {
                    id: 'infotag',
                    label: AmmInfotagMassnahmeLabels.INFOTAG,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                    disabled: true,
                    showCloseButton: true,
                    items: [
                        {
                            id: 'grunddaten',
                            label: AmmInfotagMassnahmeLabels.GRUNDDATEN,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                            disabled: true
                        },
                        {
                            id: 'beschreibung',
                            label: AmmInfotagMassnahmeLabels.BESCHREIBUNG,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                            disabled: true
                        },
                        {
                            id: 'teilnehmerliste',
                            label: AmmInfotagMassnahmeLabels.TEILNEHMERLISTE,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_INFOTAG_BEWIRTSCHAFTEN],
                            disabled: true
                        }
                    ]
                }
            ]
        }
    ]
};

const ammGrunddaten = {
    id: 'grunddaten',
    label: AmmBewirtschaftungLabels.GRUNDDATEN,
    permissions: [
        Permissions.FEATURE_34,
        {
            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
        }
    ],
    disabled: true
};

const ammBeschreibung = {
    id: 'beschreibung',
    label: AmmBewirtschaftungLabels.BESCHREIBUNG,
    permissions: [
        Permissions.FEATURE_34,
        {
            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
        }
    ],
    disabled: true
};

const ammDurchfuehrungsort = {
    id: 'durchfuehrungsort',
    label: AmmBewirtschaftungLabels.DURCHFUHRUNGSORT,
    permissions: [
        Permissions.FEATURE_34,
        {
            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
        }
    ],
    disabled: true
};

const ammTeilnehmerlisteTwoRoles = {
    id: 'teilnehmerliste',
    label: AmmBewirtschaftungLabels.TEILNEHMERLISTE,
    permissions: [
        Permissions.FEATURE_34,
        {
            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
        }
    ],
    disabled: true
};

const ammTeilnehmerlistSingleRole = {
    id: 'teilnehmerliste',
    label: AmmBewirtschaftungLabels.TEILNEHMERLISTE,
    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN],
    disabled: true
};

const ammVertragswerte = {
    id: 'vertragswerte',
    label: AmmBewirtschaftungLabels.VERTRAGSWERTE,
    permissions: [
        Permissions.FEATURE_34,
        {
            or: [Permissions.AMM_AKQUISITION_BEARBEITEN, Permissions.AMM_AKQUISITION_UNTERSCHREIBEN]
        }
    ],
    disabled: true
};

const ammTeilnehmerplaetzeTwoRoles = {
    id: 'teilnehmerplaetze',
    label: AmmBewirtschaftungLabels.TEILNEHMERPLAETZE,
    permissions: [
        Permissions.FEATURE_34,
        {
            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
        }
    ],
    disabled: true
};

const ammProdukt = {
    id: 'produkt',
    path: './',
    label: AmmBewirtschaftungLabels.PRODUKT,
    permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN],
    items: [
        {
            id: 'grunddaten',
            label: AmmBewirtschaftungLabels.GRUNDDATEN,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN]
        },
        {
            id: 'beschreibung',
            label: AmmBewirtschaftungLabels.BESCHREIBUNG,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_SICHTEN]
        },
        {
            id: 'massnahmen',
            label: AmmBewirtschaftungLabels.MASSNAHMEN,
            permissions: [
                Permissions.FEATURE_34,
                {
                    or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                }
            ],
            clearStateWithKey: BewMassnahmenUebersichtComponent.CHANNEL_STATE_KEY,
            items: [
                {
                    id: 'massnahme',
                    label: AmmBewirtschaftungLabels.MASSNAHME,
                    showCloseButton: true,
                    permissions: [
                        Permissions.FEATURE_34,
                        {
                            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                        }
                    ],
                    disabled: true,
                    items: [
                        ammGrunddaten,
                        ammBeschreibung,
                        ammDurchfuehrungsort,
                        {
                            id: 'kosten',
                            label: AmmBewirtschaftungLabels.KOSTEN,
                            permissions: [
                                Permissions.FEATURE_34,
                                {
                                    or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                }
                            ],
                            disabled: true
                        },
                        ammTeilnehmerlistSingleRole,
                        {
                            id: 'kurse',
                            label: AmmBewirtschaftungLabels.KURSE,
                            permissions: [
                                Permissions.FEATURE_34,
                                {
                                    or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                }
                            ],
                            clearStateWithKey: BewDfeUebersichtComponent.CHANNEL_STATE_KEY,
                            disabled: true,
                            items: [
                                {
                                    id: 'kurs',
                                    label: AmmBewirtschaftungLabels.KURS,
                                    showCloseButton: true,
                                    permissions: [
                                        Permissions.FEATURE_34,
                                        {
                                            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                        }
                                    ],
                                    disabled: true,
                                    items: [
                                        ammGrunddaten,
                                        ammBeschreibung,
                                        ammDurchfuehrungsort,
                                        {
                                            id: 'reservierte-plaetze',
                                            label: AmmBewirtschaftungLabels.RESERVIERTE_PLAETZE,
                                            permissions: [Permissions.FEATURE_34, Permissions.KEY_AMM_MASSNAHMEN_RESERVATION_SICHTEN],
                                            disabled: true
                                        },
                                        ammTeilnehmerlistSingleRole,
                                        {
                                            id: 'warteliste',
                                            label: AmmBewirtschaftungLabels.WARTELISTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN],
                                            disabled: true
                                        },
                                        {
                                            id: 'planwerte',
                                            label: AmmBewirtschaftungLabels.PLANWERTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            disabled: true,
                                            items: [
                                                {
                                                    id: 'erfassen',
                                                    label: AmmBewirtschaftungLabels.PLANWERT_ERFASSEN,
                                                    disabled: true,
                                                    showCloseButton: true,
                                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                                                },
                                                {
                                                    id: 'planwert',
                                                    label: AmmBewirtschaftungLabels.PLANWERT,
                                                    permissions: [Permissions.FEATURE_34],
                                                    disabled: true,
                                                    showCloseButton: true,
                                                    items: [
                                                        {
                                                            id: 'bearbeiten',
                                                            label: AmmBewirtschaftungLabels.PLANWERT_DETAIL,
                                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                                            disabled: true
                                                        },
                                                        {
                                                            id: 'controllingwerte',
                                                            label: AmmBewirtschaftungLabels.CONTROLLINGWERTE,
                                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                                            disabled: true
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        ammVertragswerte
                                    ]
                                }
                            ]
                        },
                        {
                            id: 'standorte',
                            label: AmmBewirtschaftungLabels.STANDORTE,
                            permissions: [
                                Permissions.FEATURE_34,
                                {
                                    or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                }
                            ],
                            clearStateWithKey: BewDfeUebersichtComponent.CHANNEL_STATE_KEY,
                            disabled: true,
                            items: [
                                {
                                    id: 'standort',
                                    label: AmmBewirtschaftungLabels.STANDORT,
                                    showCloseButton: true,
                                    permissions: [
                                        Permissions.FEATURE_34,
                                        {
                                            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                        }
                                    ],
                                    disabled: true,
                                    items: [
                                        ammGrunddaten,
                                        ammBeschreibung,
                                        ammDurchfuehrungsort,
                                        ammTeilnehmerlistSingleRole,
                                        {
                                            id: 'teilnehmerplaetze',
                                            label: AmmBewirtschaftungLabels.TEILNEHMERPLAETZE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN],
                                            disabled: true
                                        },
                                        {
                                            id: 'arbeitsplatzkategorien',
                                            label: AmmBewirtschaftungLabels.ARBEITSPLATZKATEGORIEN,
                                            permissions: [
                                                Permissions.FEATURE_34,
                                                {
                                                    or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                                }
                                            ],
                                            disabled: true,
                                            items: [
                                                {
                                                    id: 'arbeitsplatzkategorie',
                                                    label: AmmBewirtschaftungLabels.ARBEITSPLATZKATEGORIE,
                                                    showCloseButton: true,
                                                    permissions: [
                                                        Permissions.FEATURE_34,
                                                        {
                                                            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                                        }
                                                    ],
                                                    disabled: true,
                                                    items: [ammGrunddaten, ammBeschreibung, ammDurchfuehrungsort, ammTeilnehmerlisteTwoRoles, ammTeilnehmerplaetzeTwoRoles]
                                                }
                                            ]
                                        },
                                        {
                                            id: 'praktikumsstellen',
                                            label: AmmBewirtschaftungLabels.PRAKTIKUM_STELLEN,
                                            permissions: [
                                                Permissions.FEATURE_34,
                                                {
                                                    or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                                }
                                            ],
                                            disabled: true,
                                            items: [
                                                {
                                                    id: 'praktikumsstelle',
                                                    label: AmmBewirtschaftungLabels.PRAKTIKUMSSTELLE,
                                                    showCloseButton: true,
                                                    permissions: [
                                                        Permissions.FEATURE_34,
                                                        {
                                                            or: [Permissions.AMM_MASSNAHMEN_SICHTEN, Permissions.AMM_MASSNAHMEN_BEWIRTSCHAFTUNG_SICHTEN]
                                                        }
                                                    ],
                                                    disabled: true,
                                                    items: [ammGrunddaten, ammBeschreibung, ammDurchfuehrungsort, ammTeilnehmerlisteTwoRoles, ammTeilnehmerplaetzeTwoRoles]
                                                }
                                            ]
                                        },
                                        {
                                            id: 'planwerte',
                                            label: AmmBewirtschaftungLabels.PLANWERTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            disabled: true,
                                            items: [
                                                {
                                                    id: 'erfassen',
                                                    label: AmmBewirtschaftungLabels.PLANWERT_ERFASSEN,
                                                    disabled: true,
                                                    showCloseButton: true,
                                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                                                },
                                                {
                                                    id: 'planwert',
                                                    label: AmmBewirtschaftungLabels.PLANWERT,
                                                    permissions: [Permissions.FEATURE_34],
                                                    disabled: true,
                                                    showCloseButton: true,
                                                    items: [
                                                        {
                                                            id: 'bearbeiten',
                                                            label: AmmBewirtschaftungLabels.PLANWERT_DETAIL,
                                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                                            disabled: true
                                                        },
                                                        {
                                                            id: 'controllingwerte',
                                                            label: AmmBewirtschaftungLabels.CONTROLLINGWERTE,
                                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                                            disabled: true
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        ammVertragswerte
                                    ]
                                }
                            ]
                        },
                        {
                            id: 'planwerte',
                            label: AmmBewirtschaftungLabels.PLANWERTE,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                            disabled: true,
                            items: [
                                {
                                    id: 'erfassen',
                                    label: AmmBewirtschaftungLabels.PLANWERT_ERFASSEN,
                                    disabled: true,
                                    showCloseButton: true,
                                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                                },
                                {
                                    id: 'planwert',
                                    label: AmmBewirtschaftungLabels.PLANWERT,
                                    permissions: [Permissions.FEATURE_34],
                                    disabled: true,
                                    showCloseButton: true,
                                    items: [
                                        {
                                            id: 'bearbeiten',
                                            label: AmmBewirtschaftungLabels.PLANWERT_DETAIL,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            disabled: true
                                        },
                                        {
                                            id: 'controllingwerte',
                                            label: AmmBewirtschaftungLabels.CONTROLLINGWERTE,
                                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                                            disabled: true
                                        }
                                    ]
                                }
                            ]
                        },
                        ammVertragswerte
                    ]
                },
                {
                    id: 'planwerte',
                    label: AmmBewirtschaftungLabels.PLANWERTE,
                    permissions: [Permissions.FEATURE_34],
                    disabled: true
                }
            ]
        },
        {
            id: 'planwerte',
            label: AmmBewirtschaftungLabels.PLANWERTE,
            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
            disabled: true,
            items: [
                {
                    id: 'erfassen',
                    label: AmmBewirtschaftungLabels.PLANWERT_ERFASSEN,
                    disabled: true,
                    showCloseButton: true,
                    permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN]
                },
                {
                    id: 'planwert',
                    label: AmmBewirtschaftungLabels.PLANWERT,
                    permissions: [Permissions.FEATURE_34],
                    disabled: true,
                    showCloseButton: true,
                    items: [
                        {
                            id: 'bearbeiten',
                            label: AmmBewirtschaftungLabels.PLANWERT_DETAIL,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                            disabled: true
                        },
                        {
                            id: 'controllingwerte',
                            label: AmmBewirtschaftungLabels.CONTROLLINGWERTE,
                            permissions: [Permissions.FEATURE_34, Permissions.AMM_PLANUNG_LESEN],
                            disabled: true
                        }
                    ]
                }
            ]
        }
    ]
};
const amm = {
    amm: {
        navTree: {
            label: 'navTree',
            items: [ammAmm, ammKontaktpflege, unternehmenBurbfs, unternehmenGeKo]
        },
        infotagMassnahme: {
            navTree: {
                label: 'navTree',
                items: [ammInfotagmassnahme]
            }
        },
        bewirtschaftung: {
            navTree: {
                label: 'navTree',
                items: [ammProdukt]
            }
        },
        budgetNavItems: {
            navTree: {
                label: 'navTree',
                items: [
                    {
                        id: 'budget',
                        path: './',
                        label: AmmBudgetLabels.BUDGET,
                        permissions: [Permissions.FEATURE_34],
                        items: [
                            {
                                id: 'gesamtbudget',
                                label: AmmBudgetLabels.GESAMTBUDGET,
                                permissions: [
                                    Permissions.FEATURE_34,
                                    {
                                        or: [
                                            Permissions.AMM_BUDGETIERUNG_SICHTEN_BUDGET,
                                            Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET,
                                            Permissions.AMM_BUDGETIERUNG_UNTERSCHREIBEN_BUDGET
                                        ]
                                    }
                                ]
                            },
                            {
                                id: 'teilbudgets',
                                label: AmmBudgetLabels.TEILBUDGETS,
                                permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_SICHTEN_BUDGET],
                                items: [
                                    {
                                        id: 'erfassen',
                                        label: AmmBudgetLabels.TEILBUDGET_ERFASSEN,
                                        disabled: true,
                                        showCloseButton: true,
                                        permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET]
                                    },
                                    {
                                        id: 'bearbeiten',
                                        label: AmmBudgetLabels.TEILBUDGET,
                                        disabled: true,
                                        showCloseButton: true,
                                        permissions: [
                                            Permissions.FEATURE_34,
                                            {
                                                or: [
                                                    Permissions.AMM_BUDGETIERUNG_SICHTEN_BUDGET,
                                                    Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET,
                                                    Permissions.AMM_BUDGETIERUNG_UNTERSCHREIBEN_BUDGET
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        budgetErfassenNavItems: {
            navTree: {
                label: 'navTree',
                items: [
                    {
                        id: 'budget',
                        path: './',
                        label: AmmBudgetLabels.BUDGET,
                        permissions: [Permissions.FEATURE_34],
                        items: [
                            {
                                id: 'erfassen',
                                label: AmmBudgetLabels.BUDGET_ERFASSEN,
                                showCloseButton: true,
                                permissions: [Permissions.FEATURE_34, Permissions.AMM_BUDGETIERUNG_ERSTELLEN_BUDGET]
                            }
                        ]
                    }
                ]
            }
        }
    }
};

const geschaeftsregelnItems = {
    id: 'geschaeftsregeln',
    path: './',
    label: 'geko.subnavmenuitem.geschaeftsregeln',
    permissions: [Permissions.FEATURE_35, Permissions.GEKO_REGELN_SUCHEN],
    collapsed: false,
    items: [
        {
            id: 'erfassen',
            disabled: true,
            label: 'geko.subnavmenuitem.geschaeftsregelErfassen',
            permissions: [Permissions.FEATURE_35, Permissions.GEKO_REGELN_SUCHEN]
        },
        {
            id: 'bearbeiten',
            disabled: true,
            label: 'geko.subnavmenuitem.geschaeftsregelBearbeiten',
            permissions: [Permissions.FEATURE_35, Permissions.GEKO_REGELN_BEARBEITEN, Permissions.GEKO_REGELN_LOESCHEN]
        }
    ]
};

const geschaeftsregeln = {
    geschaeftsregeln: {
        navTree: {
            label: 'navTree',
            items: [geschaeftsregelnItems]
        }
    }
};

const benutzerstelleItems = {
    id: 'benutzerstelle',
    path: './',
    label: InformationenLabels.BENUTZERSTELLE,
    permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_SUCHENSICHTEN],
    items: [
        {
            id: 'grunddaten',
            label: InformationenLabels.GRUNDDATEN,
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_SUCHENSICHTEN]
        },
        {
            id: 'erweiterte-daten',
            label: InformationenLabels.ERWEITERTE_DATEN,
            permissions: [Permissions.FEATURE_35, Permissions.INFORMATIONEN_VERZEICHNISSE_BENUTZERSTELLE_SUCHENSICHTEN]
        }
    ]
};

const benutzerstelle = {
    benutzerstelle: {
        navTree: {
            label: 'navTree',
            items: [benutzerstelleItems]
        }
    }
};

const rolleItems = {
    id: 'rolle',
    path: './',
    label: InformationenLabels.ROLLE,
    permissions: [Permissions.FEATURE_35],
    items: [
        {
            id: 'grunddaten',
            label: InformationenLabels.GRUNDDATEN,
            permissions: [Permissions.FEATURE_35]
        },
        {
            id: 'berechtigungen',
            label: InformationenLabels.BERECHTIGUNGEN,
            permissions: [Permissions.FEATURE_35]
        }
    ]
};

const codeItems = {
    id: 'code',
    path: './',
    label: InformationenLabels.CODE_BEARBEITEN,
    permissions: [Permissions.FEATURE_35]
};

const rolle = {
    rolle: {
        navTree: {
            label: 'navTree',
            items: [rolleItems]
        }
    }
};

const code = {
    code: {
        navTree: {
            label: 'navTree',
            items: [codeItems]
        }
    }
};

export const navigationModel = {
    ...stes,
    ...myavam,
    ...geschaeftsregeln,
    ...arbeitgeber,
    ...fachberatungsstelle,
    ...amm,
    ...benutzerstelle,
    ...rolle,
    ...code
};

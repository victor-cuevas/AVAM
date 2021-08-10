export enum StesDetailsPaths {
    'STES' = 'stes',
    'PERSONALIEN' = './personalien',
    'ZUSATZADRESSE' = './zusatzadresse',
    'GRUNDDATEN' = './grunddaten',
    'BERUFSDATEN' = './berufsdaten',
    'BERUFSDATENERFASSEN' = './berufsdaten/erfassen',
    'BERUFSDATENBEARBEITEN' = './berufsdaten/bearbeiten',
    'STELLENSUCHE' = './stellensuche',
    'SPRACHKENNTNISSE' = './sprachkenntnisse',
    'DATENFREIGABE' = './datenfreigabe'
}

export enum StesTerminePaths {
    'TERMINEANZEIGEN' = 'termine',
    'TERMINERFASSEN' = 'termine/erfassen',
    'TERMINBEARBEITEN' = 'termine/bearbeiten',
    'INFOTAG' = 'termine/infotag',
    'INFOTAGGRUNDDATENBUCHUNG' = 'termine/infotag/grunddatenbuchung',
    'INFOTAGBESCHREIBUNGDURCHFUEHRUNGSORT' = 'termine/infotag/beschreibungdurchfuehrungsort',
    'INFOTAGTEILNEHMERLISTE' = 'termine/infotag/teilnehmerliste'
}

export enum StesZwischenverdienstPaths {
    'ZWISCHENVERDIENSTE' = 'zwischenverdienste',
    'ZWISCHENVERDIENSTEERFASSEN' = 'zwischenverdienste/erfassen',
    'ZWISCHENVERDIENSTEBEARBEITEN' = 'zwischenverdienste/bearbeiten'
}

export enum StesLeistunsexportePaths {
    'LEISTUNGSEXPORTE' = 'leistungsexporte',
    'LEISTUNGSEXPORTEERFASSEN' = 'leistungsexporte/erfassen',
    'LEISTUNGSEXPORTEBEARBEITEN' = 'leistungsexporte/bearbeiten'
}

export enum StesRahmenfristenPaths {
    'RAHMENFRISTEN' = 'rahmenfristen',
    'RAHMENFRIST' = 'rahmenfristen/rahmenfristdetails',
    'RAHMENFRISTZAELERSTAND' = 'rahmenfristen/rahmenfristdetails/zaehlerstand'
}

export enum StesWiedereingliederungPaths {
    'WIEDEREINGLIEDERUNG' = 'wiedereingliederung',
    'AUSGANGSLAGEN_ANZEIGEN' = 'wiedereingliederung/ausgangslage',
    'AUSGANGSLAGEN_ERFASSEN' = 'wiedereingliederung/ausgangslage/erfassen',
    'AUSGANGSLAGEN_BEARBEITEN' = 'wiedereingliederung/ausgangslage/bearbeiten',
    'ZIELE_ANZEIGEN' = 'wiedereingliederung/ziele',
    'ZIEL_ERFASSEN' = 'wiedereingliederung/ziele/erfassen',
    'ZIEL_BEARBEITEN' = 'wiedereingliederung/ziele/bearbeiten',
    'AKTIONEN_ANZEIGEN' = 'wiedereingliederung/aktionen',
    'AKTION_ERFASSEN' = 'wiedereingliederung/aktionen/erfassen',
    'AKTIONEN_BEARBEITEN' = 'wiedereingliederung/aktionen/bearbeiten'
}

export enum StesArbeitsvermittlungPaths {
    'ARBEITSVERMITTLUNGEN_ANZEIGEN' = 'arbeitsvermittlungen',
    'SCHNELLZUWEISUNG_ERFASSEN' = 'arbeitsvermittlungen/schnellzuweisung-erfassen',
    'SCHNELLZUWEISUNG_BEARBEITEN' = 'arbeitsvermittlungen/schnellzuweisung-bearbeiten',
    'VERMITTLUNG_ERFASSEN' = 'arbeitsvermittlungen/vermittlung/erfassen',
    'VERMITTLUNG_BEARBEITEN' = 'arbeitsvermittlungen/vermittlung-bearbeiten'
}

export enum FachberatungPaths {
    'FACHBERATUNGEN' = 'fachberatungen',
    'FACHBERATUNG_ERFASSEN' = 'fachberatungen-erfassen',
    'FACHBERATUNG_BEARBEITEN' = 'fachberatungen/bearbeiten'
}

export enum ArbeitgeberPaths {
    'ADRESSDATEN' = 'adressdaten',
    'ARBEITGEBER_DETAILS' = 'arbeitgeber/details',
    'STELLENANGEBOT_STELLENMELDEPFLICHT_PRUEFEN' = 'stellenmeldepflicht-pruefen',
    'STELLENANGEBOTE_MATCHINGPROFIL' = 'stellenangebote/stellenangebot/matchingprofil',
    'STELLENANGEBOTE_STELLEANGEBOT_VERMITTLUNG_BEARBEITEN' = 'stellenangebote/stellenangebot/vermittlungen/bearbeiten',
    'VERMITTLUNG_ERFASSEN' = 'vermittlung/erfassen',
    'STELLENANGEBOTE_STELLENANGEBOT_BASISANGABEN' = 'stellenangebote/stellenangebot/basisangaben',
    'STELLENANGEBOTE_STELLENANGEBOT_BEWERBUNG' = 'stellenangebote/stellenangebot/bewerbung',
    'KURZARBEIT_VORANMELDUNGEN_BEARBEITEN' = 'kurzarbeit/voranmeldungen/bearbeiten',
    'SCHLECHTWETTER_MELDUNGEN_BEARBEITEN' = 'schlechtwetter/meldungen/bearbeiten'
}

export enum AMMPaths {
    'AMM' = 'amm',
    'AUSZUG' = 'amm/auszug',
    'UEBERSICHT' = 'amm/uebersicht',
    'AMM_GENERAL' = 'amm/uebersicht/:type',
    'AMM_GESCHAEFT_SUCHEN' = 'amm-geschaefte/suchen',

    'AZ_GESUCH' = 'amm/uebersicht/1/gesuch',
    'AZ_KOSTEN' = 'amm/uebersicht/1/kosten',
    'EAZ_GESUCH' = 'amm/uebersicht/2/gesuch',
    'EAZ_KOSTEN' = 'amm/uebersicht/2/kosten',
    'FSE_GESUCH' = 'amm/uebersicht/4/gesuch',
    'FSE_KOSTEN' = 'amm/uebersicht/4/kosten',
    'PEWO_GESUCH' = 'amm/uebersicht/3/gesuch',
    'PEWO_KOSTEN' = 'amm/uebersicht/3/kosten',
    'SPEZIELL_ENTSCHEID' = 'amm/uebersicht/:type/speziell-entscheid',

    'INDIVIDUELL_BUCHUNG' = 'amm/uebersicht/:type/buchung-individuell',
    'BESCHREIBUNG' = 'amm/uebersicht/:type/beschreibung',
    'INDIVIDUELL_DURCHFUHRUNG' = 'amm/uebersicht/:type/durchsfuhrungsort-individuell',
    'INDIVIDUELL_KOSTEN' = 'amm/uebersicht/:type/kosten-individuell',

    'KURS_INDIV_IM_ANGEBOT_BUCHUNG' = 'amm/uebersicht/:type/buchung-angebot',
    'KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG' = 'amm/uebersicht/:type/beschreibung-angebot',
    'KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT' = 'amm/uebersicht/:type/durchsfuhrungsort-angebot',

    'KOLLEKTIV_BUCHUNG' = 'amm/uebersicht/:type/buchung-kollektiv',
    'KOLLEKTIV_DURCHFUHRUNG' = 'amm/uebersicht/:type/durchsfuhrungsort-kollektiv',

    'PSAK_BUCHUNG' = 'amm/uebersicht/:type/buchung-psak',

    'SPESEN' = 'amm/uebersicht/:type/spesen',
    'BP_KOSTEN' = 'amm/uebersicht/:type/bp-kosten',
    'BIM_BEM_ENTSCHEID' = 'amm/uebersicht/:type/bim-bem-entscheid',
    'TEILNEHMERWARTELISTE' = 'amm/uebersicht/:type/teilnehmer-warteliste',
    'TEILNEHMERPLAETZE' = 'amm/uebersicht/:type/teilnehmerplaetze',

    'ANGEBOT_SUCHEN' = 'angebot-suchen',
    'KOLLEKTIV_KURS_ERFASSEN' = 'kurs-kollektiv-erfassen',
    'PSAK_ERFASSEN' = 'psak-erfassen',
    'KURS_INDIV_IM_ANGEBOT_ERFASSEN' = 'kurs-indiv-angebot-erfassen',
    'KURS_INDIV_IM_ANGEBOT_BESCHREIBUNG_ERFASSEN' = ':type/beschreibung',
    'KURS_INDIV_IM_ANGEBOT_DURCHFUEHRUNGSORT_ERFASSEN' = ':type/durchfuehrungsort',

    'INFOTAG_MASSNAHME_SUCHEN' = 'massnahme/suchen',
    'INFOTAG_MASSNAHME_ERFASSEN' = 'massnahme/erfassen',

    'INFOTAG_BEWIRTSCHAFTUNG_SUCHEN' = 'suchen',
    'INFOTAG_BEWIRTSCHAFTUNG_ERFASSEN' = 'massnahme/:massnahmeId/infotag/erfassen',

    'BUDGET_SUCHEN' = 'suchen',

    'BEW_PRODUKT' = 'produkt',
    'BEW_PRODUKT_SUCHEN' = 'produkt/suchen',
    'BEW_DFE_SUCHEN' = 'dfe/suchen',
    'BEW_MASSNAHME_SUCHEN' = 'massnahme/suchen',

    'BEW_DFE' = 'kurs',
    'BEW_PRODUKT_ERFASSEN' = 'produkt/erfassen',
    'BEW_MASSNAHME_ERFASSEN' = 'produkt/:produktId/massnahme/erfassen',
    'BEW_KURS_ERFASSEN' = 'produkt/:produktId/massnahmen/:massnahmeId/kurs/erfassen',
    'BEW_STANDORT_ERFASSEN' = 'produkt/:produktId/massnahmen/:massnahmeId/standort/erfassen',
    'BEW_BESCHAEFTIGUNGSEINHEIT_ERFASSEN' = 'produkt/:produktId/massnahmen/:massnahmeId/standort/:dfeId/beschaeftigungseinheit/erfassen',
    'BEW_PRODUKT_HOME' = 'produkt/:produktId',
    'BEW_GRUNDDATEN' = 'grunddaten',
    'BEW_BESCHREIBUNG' = 'beschreibung',
    'BEW_DURCHFUEHRUNGSORT' = 'durchfuehrungsort',
    'BEW_PRODUKT_MASSNAHMEN' = 'massnahmen',
    'BEW_MASSNAHMEN_HOME' = 'massnahmen/massnahme',
    'BEW_MASSNAHMEN_GRUNDDATEN_HOME' = 'massnahmen/massnahme/grunddaten',
    'BEW_MASSNAHMEN_MASSNAHME' = 'massnahme',
    'BEW_KURSE' = 'kurse',
    'BEW_KURSE_HOME' = 'kurse/kurs',
    'BEW_KURSE_GRUNDDATEN_HOME' = 'kurse/kurs/grunddaten',
    'BEW_STANDORTE' = 'standorte',
    'BEW_STANDORTE_HOME' = 'standorte/standort',
    'BEW_STANDORTE_GRUNDDATEN_HOME' = 'standorte/standort/grunddaten',
    'BEW_TEILNEHMERPLAETZE' = 'teilnehmerplaetze',
    'BEW_TEILNEHMERLISTE' = 'teilnehmerliste',
    'BEW_PLANWERTE' = 'planwerte',
    'BEW_KOSTEN' = 'kosten',
    'PLANWERT' = 'planwerte/planwert',
    'PLANWERT_ERFASSEN' = 'planwerte/erfassen',
    'PLANWERT_BEARBEITEN_FULL' = 'planwerte/planwert/bearbeiten',
    'PLANWERT_BEARBEITEN' = 'bearbeiten',
    'PLANWERT_CONTROLLINGWERTE' = 'controllingwerte',
    'BEW_RESERVIERTE_PLAETZE' = 'reservierte-plaetze',
    'BEW_PRAKTIKUMSTELLEN' = 'praktikumsstellen',
    'BEW_PRAKTIKUMSTELLEN_GRUNDDATEN_HOME' = 'praktikumsstellen/praktikumsstelle/grunddaten',
    'BEW_ARBEITSPLATZKATEGORIEN' = 'arbeitsplatzkategorien',
    'BEW_ARBEITSPLATZKATEGORIEN_HOME' = 'arbeitsplatzkategorien/arbeitsplatzkategorie',
    'BEW_ARBEITSPLATZKATEGORIEN_GRUNDDATEN_HOME' = 'arbeitsplatzkategorien/arbeitsplatzkategorie/grunddaten',
    'BEW_PRAKTIKUMSTELLEN_HOME' = 'praktikumsstellen/praktikumsstelle',
    'BEW_WARTELISTE' = 'warteliste',
    'BEW_VERTRAGSWERTE' = 'vertragswerte',

    'TEILZAHLUNGEN_SUCHEN' = 'suchen',
    'TEILZAHLUNGEN' = 'amm/teilzahlungen',

    'VERTRAEGE_LEISTUNGSVEREINBARUNG' = 'leistungsvereinbarung',
    'VERTRAEGE_LEISTUNGSVEREINBARUNG_SUCHEN' = 'leistungsvereinbarung/suchen',
    'VERTRAEGE_RAHMENVERTRAG_SUCHEN' = 'rahmenvertrag/suchen',
    'VERTRAEGE_VERTRAGSWERT_SUCHEN' = 'vertragswert/suchen'
}

export enum StesVermittlungsfaehigkeits {
    'VERMITTLUNGSFAEHIGKEIT' = 'vermittlungsfaehigkeit',
    'SACHVERHALT' = 'vermittlungsfaehigkeit/erfassen',
    'SACHVERHALT_BEARBEITEN' = 'vermittlungsfaehigkeit/sachverhalt-bearbeiten',
    'ENTSCHEID_ERFASSEN' = 'vermittlungsfaehigkeit/entscheid-erfassen',
    'ENTSCHEID_BEARBEITEN' = 'vermittlungsfaehigkeit/entscheid-bearbeiten',
    'STELLUNGNAHME_ERFASSEN' = 'vermittlungsfaehigkeit/stellungnahme-erfassen',
    'STELLUNGNAHME_BEARBEITEN' = 'vermittlungsfaehigkeit/stellungnahme-bearbeiten'
}

export enum StesSanktionen {
    'SANKTIONEN' = 'sanktionen',
    'SANKTION_ERFASSEN_BEMUEHUNGEN' = 'arbeitsbemuehungen-erfassen',
    'SANKTION_ERFASSEN_MASSNAHMEN' = 'arbeitsmarktliche-massnahmen-erfassen',
    'SANKTION_ERFASSEN_BERATUNG' = 'beratung-erfassen',
    'SANKTION_ERFASSEN_KONTROLL_WEISUNGEN' = 'kontrollvorschriften-weisungen-erfassen',
    'SANKTION_ERFASSEN_VERMITTLUNG' = 'vermittlung-erfassen',
    'SANKTION_BEARBEITEN_BEMUEHUNGEN' = 'arbeitsbemuehungen-bearbeiten',
    'SANKTION_BEARBEITEN_MASSNAHMEN' = 'arbeitsmarktliche-massnahmen-bearbeiten',
    'SANKTION_BEARBEITEN_BERATUNG' = 'beratung-bearbeiten',
    'SANKTION_BEARBEITEN_KONTROLL_WEISUNGEN' = 'kontrollvorschriften-weisungen-bearbeiten',
    'SANKTION_BEARBEITEN_VERMITTLUNG' = 'vermittlung-bearbeiten',

    'SANKTION_BEMUEHUNGEN_STELLUNGNAHME_ERFASSEN' = 'arbeitsbemuehungen-stellungnahme-erfassen',
    'SANKTION_MASSNAHMEN_STELLUNGNAHME_ERFASSEN' = 'arbeitsmarktliche-massnahmen-stellungnahme-erfassen',
    'SANKTION_BERATUNG_STELLUNGNAHME_ERFASSEN' = 'beratung-stellungnahme-erfassen',
    'SANKTION_KONTROLL_WEISUNGEN_STELLUNGNAHME_ERFASSEN' = 'kontrollvorschriften-weisungen-stellungnahme-erfassen',
    'SANKTION_VERMITTLUNG_STELLUNGNAHME_ERFASSEN' = 'vermittlung-stellungnahme-erfassen',
    'SANKTION_BEMUEHUNGEN_STELLUNGNAHME_BEARBEITEN' = 'arbeitsbemuehungen-stellungnahme-bearbeiten',
    'SANKTION_MASSNAHMEN_STELLUNGNAHME_BEARBEITEN' = 'arbeitsmarktliche-massnahmen-stellungnahme-bearbeiten',
    'SANKTION_BERATUNG_STELLUNGNAHME_BEARBEITEN' = 'beratung-stellungnahme-bearbeiten',
    'SANKTION_KONTROLL_WEISUNGEN_STELLUNGNAHME_BEARBEITEN' = 'kontrollvorschriften-weisungen-stellungnahme-bearbeiten',
    'SANKTION_VERMITTLUNG_STELLUNGNAHME_BEARBEITEN' = 'vermittlung-stellungnahme-bearbeiten',

    'SANKTION_BEMUEHUNGEN_ENTSCHEID_ERFASSEN' = 'arbeitsbemuehungen-entscheid-erfassen',
    'SANKTION_MASSNAHMEN_ENTSCHEID_ERFASSEN' = 'arbeitsmarktliche-massnahmen-entscheid-erfassen',
    'SANKTION_BERATUNG_ENTSCHEID_ERFASSEN' = 'beratung-entscheid-erfassen',
    'SANKTION_KONTROLL_WEISUNGEN_ENTSCHEID_ERFASSEN' = 'kontrollvorschriften-weisungen-entscheid-erfassen',
    'SANKTION_VERMITTLUNG_ENTSCHEID_ERFASSEN' = 'vermittlung-entscheid-erfassen',
    'SANKTION_BEMUEHUNGEN_ENTSCHEID_BEARBEITEN' = 'arbeitsbemuehungen-entscheid-bearbeiten',
    'SANKTION_MASSNAHMEN_ENTSCHEID_BEARBEITEN' = 'arbeitsmarktliche-massnahmen-entscheid-bearbeiten',
    'SANKTION_BERATUNG_ENTSCHEID_BEARBEITEN' = 'beratung-entscheid-bearbeiten',
    'SANKTION_KONTROLL_WEISUNGEN_ENTSCHEID_BEARBEITEN' = 'kontrollvorschriften-weisungen-entscheid-bearbeiten',
    'SANKTION_VERMITTLUNG_ENTSCHEID_BEARBEITEN' = 'vermittlung-entscheid-bearbeiten'
}

export enum StesKontrollperioden {
    'KONTROLLPERIODEN' = 'kontrollperioden',
    'ERFASSEN' = 'kontrollperioden/erfassen',
    'BEARBEITEN' = 'kontrollperioden/bearbeiten'
}

export enum StesMatchingprofilPaths {
    'MATCHINGPROFIL' = 'matchingprofil',
    'VERMITTLUNG_ERFASSEN' = 'vermittlung-erfassen'
}

export enum StesAufgabenPaths {
    'AUFGABEN' = 'aufgaben',
    'AUFGABEN_ERFASSEN' = 'aufgaben/erfassen',
    'AUFGABEN_BEARBEITEN' = 'aufgaben/bearbeiten'
}

export enum StesGeschaeftePaths {
    GESCHAEFTE = 'geschaefte'
}

export enum StesMeldungenPaths {
    MELDUNGEN = 'meldungen'
}

export enum StesFachberatungPaths {
    FACHBERATUNG = 'fachberatung'
}

export enum InformationenPaths {
    BASE = 'informationen',
    VERZEICHNISSE_BENUTZERSTELLE = 'verzeichnisse/benutzerstelle/:benutzerstelleId',
    VERZEICHNISSE_BENUTZERSTELLE_ERFASSEN = 'verzeichnisse/benutzerstelle/erfassen',
    VERZEICHNISSE_BENUTZERSTELLE_GRUNDDATEN_BEARBEITEN = 'grunddaten',
    VERZEICHNISSE_BENUTZERSTELLE_ERWEITERTE_DATEN_BEARBEITEN = 'erweiterte-daten',
    VERZEICHNISSE_BENUTZERSTELLEN_SUCHEN = 'verzeichnisse/benutzerstellen/suchen',
    VERZEICHNISSE_ZAHLSTELLEN_SUCHEN = 'verzeichnisse/zahlstellen/suchen',
    INFORMATIONSMELDUNGEN_MELDUNG_ERFASSEN = 'informationsmeldungen/meldungen/erfassen',
    BENUTZERVERWALTUNG_ROLLEN_SUCHEN = 'benutzerverwaltung/rollen/suchen',
    BENUTZERVERWALTUNG_ROLLEN_GRUNDDATEN_BEARBEITEN = 'grunddaten',
    BENUTZERVERWALTUNG_ROLLEN_BERECHTIGUNGEN_BEARBEITEN = 'berechtigungen',
    INFORMATIONSMELDUNGEN_MELDUNG_BEARBEITEN = 'informationsmeldungen/meldungen/bearbeiten',
    BENUTZERVERWALTUNG_ROLLE_ERFASSEN = 'benutzerverwaltung/rolle/erfassen',
    BENUTZERVERWALTUNG_ROLLE = 'benutzerverwaltung/rolle/:rolleId',
    BENUTZERVERWALTUNG_BENUTZERMELDUNGEN_SUCHEN = 'benutzerverwaltung/benutzertmeldungen/suchen',
    BENUTZERVERWALTUNG_BENUTZER_SUCHEN = 'benutzerverwaltung/benutzer/suchen'
}

export enum UnternehmenPaths {
    ERFASSEN = 'erfassen',
    SUCHEN = 'suchen',
    KONTAKTPERSON_SUCHEN = 'kontaktperson/suchen',
    STELLEN_MELDEPLICHT_BERUFE_LISTE = 'stellenmeldepflicht/berufe-liste',
    STELLEN_SUCHEN = 'stellen/suchen',
    JOBROOM_MELDUNGEN_SUCHEN = 'jobroom-meldungen/suchen',
    JOBROOM_MELDUNG_VERFIZIEREN = 'jobroom-meldungen/verifizieren',
    JOBROOM_MELDUNG_ZUORDNEN = 'zuordnen',
    JOBROOM_MELDUNG_UEBERNEHMEN = 'uebernehmen',
    STES_ARBEITSVERMITTLUNG_SUCHEN = 'stellensuchende/suchen',
    STES_ARBEITSVERMITTLUNG_STELLENANGEBOTE_SUCHEN = 'stellenangebote/suchen',
    VORANMELDUNG_SUCHEN = 'voranmeldung/suchen',
    SWE_MELDUNG_SUCHEN = 'swe-meldung/suchen',
    SCHNELLZUWEISUNG_BEARBEITEN = './schnellzuweisungen/bearbeiten',
    VERTRAGSWERT_ERFASSEN = ':anbieterId/vertragswert/erfassen',
    OBJEKT_AUSWAEHLEN = 'objekt-auswaehlen',
    PLANWERT_AUSWAEHLEN = 'planwert-auswaehlen',
    VERTRAGSWERT_DETAIL = 'detail',
    ABRECHNUNGSWERT_ERFASSEN = ':anbieterId/leistungsvereinbarungen/leistungsvereinbarung/vertragswert/abrechnungswert/erfassen',
    ABRECHNUNGSWERT_ERFASSEN_GRUNDDATEN = 'grunddaten',
    ABRECHNUNGSWERT_ERFASSEN_KOSTEN = 'kosten',
    AMM_ANBIETER = 'amm/anbieter'
}

export enum AmmBewirtschaftungPaths {
    AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERTE = './planwerte',

    AMM_BEWIRTSCHAFTUNG_MASSNAHME_MASSNAHMEN = './massnahmen/massnahme',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_GRUNDDATEN = './massnahmen/massnahme/grunddaten',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_BESCHREIBUNG = './massnahmen/massnahme/beschreibung',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_DURCHFUEHRUNGSORT = './massnahmen/massnahme/durchfuehrungsort',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_KOSTEN = './massnahmen/massnahme/kosten',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_TEILNEHMERLISTE = './massnahmen/massnahme/teilnehmerliste',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_KURSE = './massnahmen/massnahme/kurse',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_STANDORTE = './massnahmen/massnahme/standorte',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERTE = './massnahmen/massnahme/planwerte',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_VERTRAGSWERTE = './massnahmen/massnahme/vertragswerte',

    AMM_BEWIRTSCHAFTUNG_KURS = './massnahmen/massnahme/kurse/kurs',
    AMM_BEWIRTSCHAFTUNG_KURS_GRUNDDATEN = './massnahmen/massnahme/kurse/kurs/grunddaten',
    AMM_BEWIRTSCHAFTUNG_KURS_BESCHREIBUNG = './massnahmen/massnahme/kurse/kurs/beschreibung',
    AMM_BEWIRTSCHAFTUNG_KURS_DURCHFUEHRUNGSORT = './massnahmen/massnahme/kurse/kurs/durchfuehrungsort',
    AMM_BEWIRTSCHAFTUNG_KURS_TEILNEHMERLISTE = './massnahmen/massnahme/kurse/kurs/teilnehmerliste',
    AMM_BEWIRTSCHAFTUNG_KURS_RESERVIERTE_PLAETZE = './massnahmen/massnahme/kurse/kurs/reservierte-plaetze',
    AMM_BEWIRTSCHAFTUNG_KURS_WARTELISTE = './massnahmen/massnahme/kurse/kurs/warteliste',
    AMM_BEWIRTSCHAFTUNG_KURS_PLANWERTE = './massnahmen/massnahme/kurse/kurs/planwerte',
    AMM_BEWIRTSCHAFTUNG_KURS_VERTRAGSWERTEE = './massnahmen/massnahme/kurse/kurs/vertragswerte',

    AMM_BEWIRTSCHAFTUNG_STANDORT = './massnahmen/massnahme/standorte/standort',
    AMM_BEWIRTSCHAFTUNG_STANDORT_GRUNDDATEN = './massnahmen/massnahme/standorte/standort/grunddaten',
    AMM_BEWIRTSCHAFTUNG_STANDORT_BESCHREIBUNG = './massnahmen/massnahme/standorte/standort/beschreibung',
    AMM_BEWIRTSCHAFTUNG_STANDORT_DURCHFUEHRUNGSORT = './massnahmen/massnahme/standorte/standort/durchfuehrungsort',
    AMM_BEWIRTSCHAFTUNG_STANDORT_TEILNEHMERLISTE = './massnahmen/massnahme/standorte/standort/teilnehmerliste',
    AMM_BEWIRTSCHAFTUNG_STANDORT_TEILNEHMER_PLAETZE = './massnahmen/massnahme/standorte/standort/teilnehmerplaetze',
    AMM_BEWIRTSCHAFTUNG_STANDORT_ABREITSKATEGORIEN = './massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien',
    AMM_BEWIRTSCHAFTUNG_STANDORT_PRAKTIKUMSSTELLEN = './massnahmen/massnahme/standorte/standort/praktikumsstellen',
    AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERTE = './massnahmen/massnahme/standorte/standort/planwerte',
    AMM_BEWIRTSCHAFTUNG_STANDORT_VERTRAGSWERTE = './massnahmen/massnahme/standorte/standort/vertragswerte',

    AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE = './massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien/arbeitsplatzkategorie',
    AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_GRUNDDATEN = './massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien/arbeitsplatzkategorie/grunddaten',
    AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_BESCHREIBUNG = './massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien/arbeitsplatzkategorie/beschreibung',
    AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_DURCHFUEHRUNGSORT = './massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien/arbeitsplatzkategorie/durchfuehrungsort',
    AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_TEILNEHMERLISTE = './massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien/arbeitsplatzkategorie/teilnehmerliste',
    AMM_BEWIRTSCHAFTUNG_ABREITSKATEGORIE_TEILNEHMERPLAETZE = './massnahmen/massnahme/standorte/standort/arbeitsplatzkategorien/arbeitsplatzkategorie/teilnehmerplaetze',

    AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE = './massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle',
    AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_GRUNDDATEN = './massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle/grunddaten',
    AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_BESCHREIBUNG = './massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle/beschreibung',
    AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_DURCHFUEHRUNGSORT = './massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle/durchfuehrungsort',
    AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_TEILNEHMERLISTE = './massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle/teilnehmerliste',
    AMM_BEWIRTSCHAFTUNG_PRAKTIKUMSSTELLE_TEILNEHMERPLAETZE = './massnahmen/massnahme/standorte/standort/praktikumsstellen/praktikumsstelle/teilnehmerplaetze',

    AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT_ERFASSEN = './planwerte/erfassen',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT_ERFASSEN = './massnahmen/massnahme/planwerte/erfassen',
    AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT_ERFASSEN = './massnahmen/massnahme/kurse/kurs/planwerte/erfassen',
    AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT_ERFASSEN = './massnahmen/massnahme/standorte/standort/planwerte/erfassen',
    AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT = './planwerte/planwert',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT = './massnahmen/massnahme/planwerte/planwert',
    AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT = './massnahmen/massnahme/kurse/kurs/planwerte/planwert',
    AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT = './massnahmen/massnahme/standorte/standort/planwerte/planwert',
    AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT_DETAIL = './planwerte/planwert/bearbeiten',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT_DETAIL = './massnahmen/massnahme/planwerte/planwert/bearbeiten',
    AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT_DETAIL = './massnahmen/massnahme/kurse/kurs/planwerte/planwert/bearbeiten',
    AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT_DETAIL = './massnahmen/massnahme/standorte/standort/planwerte/planwert/bearbeiten',
    AMM_BEWIRTSCHAFTUNG_PRODUKT_PLANWERT_CONTROLLINGWERTE = './planwerte/planwert/controllingwerte',
    AMM_BEWIRTSCHAFTUNG_MASSNAHME_PLANWERT_CONTROLLINGWERTE = './massnahmen/massnahme/planwerte/planwert/controllingwerte',
    AMM_BEWIRTSCHAFTUNG_KURS_PLANWERT_CONTROLLINGWERTE = './massnahmen/massnahme/kurse/kurs/planwerte/planwert/controllingwerte',
    AMM_BEWIRTSCHAFTUNG_STANDORT_PLANWERT_CONTROLLINGWERTE = './massnahmen/massnahme/standorte/standort/planwerte/planwert/controllingwerte'
}

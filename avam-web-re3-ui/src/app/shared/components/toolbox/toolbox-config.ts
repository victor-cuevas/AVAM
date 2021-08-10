import { ToolboxActionEnum, ToolboxConfiguration } from '../../services/toolbox.service';

export class ToolboxConfig {
    private static readonly ENABLED = true;
    private static readonly WITH_BORDER = true;
    private static readonly WITH_NO_BORDER = false;
    private static dmsPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static dmsWordPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.WORD, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static emailDmsPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.EMAIL, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static emailHistoryDmsCopyWordPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.EMAIL, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.COPY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.WORD, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static emailHistoryDmsPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.EMAIL, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static emailHistoryDmsWordPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.EMAIL, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.WORD, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static emailHistoryPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.EMAIL, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static emailPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.EMAIL, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static historyDmsCopyPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.COPY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static historyDmsCopyWordPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.COPY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.WORD, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static historyDmsWordPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.DMS, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.WORD, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static printHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static printHelpExitConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_NO_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_NO_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.EXIT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_NO_BORDER)
    ];
    private static printHelpExcelConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.EXCEL, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];
    private static historyPrintHelpConfig = [
        new ToolboxConfiguration(ToolboxActionEnum.HISTORY, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.PRINT, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER),
        new ToolboxConfiguration(ToolboxActionEnum.HELP, ToolboxConfig.ENABLED, ToolboxConfig.WITH_BORDER)
    ];

    public static getStesVermittlungSearchConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getStellenAngeboteMatchingTreffernConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getOsteVermittlungSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getOsteBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getDefaultConfig(): ToolboxConfiguration[] {
        return this.emailHistoryDmsPrintHelpConfig.slice();
    }

    public static getStesAnmeldungConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getStesAbmeldungConfig(): ToolboxConfiguration[] {
        return this.emailPrintHelpConfig.slice();
    }

    public static getStesAbmeldungBearbeitenConfig(): ToolboxConfiguration[] {
        return this.emailHistoryDmsWordPrintHelpConfig.slice();
    }

    public static getStesTerminbearbeitenConfig(): ToolboxConfiguration[] {
        return this.emailHistoryDmsCopyWordPrintHelpConfig.slice();
    }

    public static getStesTerminerfassenConfig(): ToolboxConfiguration[] {
        return this.emailPrintHelpConfig.slice();
    }

    public static getStesLeistungsexportErfassenConfig(): ToolboxConfiguration[] {
        return this.emailPrintHelpConfig.slice();
    }

    public static getStesLeistungsexportBearbeitenConfig(): ToolboxConfiguration[] {
        return this.emailHistoryDmsCopyWordPrintHelpConfig.slice();
    }

    public static getStesZwischenverdienstErfassenConfig(): ToolboxConfiguration[] {
        return this.emailPrintHelpConfig.slice();
    }

    public static getStesZwischenverdienstBearbeitenConfig(): ToolboxConfiguration[] {
        return this.emailHistoryPrintHelpConfig.slice();
    }

    public static getStesInfotagBeschreibungDurchfuehrungsortConfig(): ToolboxConfiguration[] {
        return this.emailDmsPrintHelpConfig.slice();
    }

    public static getInfotagTeilnehmerlisteConfig(): ToolboxConfiguration[] {
        return this.emailDmsPrintHelpConfig.slice();
    }

    public static getStesInfotagGrunddatenBuchungConfig(): ToolboxConfiguration[] {
        return this.emailHistoryDmsCopyWordPrintHelpConfig.slice();
    }

    public static getDmsTemplatesConfig(): ToolboxConfiguration[] {
        return this.printHelpExitConfig.slice();
    }

    public static getDatenfreigabeErfassenConfig(): ToolboxConfiguration[] {
        return this.emailDmsPrintHelpConfig.slice();
    }

    public static getDatenfreigabeBearbeitenConfig(): ToolboxConfiguration[] {
        return this.emailHistoryDmsWordPrintHelpConfig.slice();
    }

    public static getAmmErfassenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getAmmBearbeitenConfig(): ToolboxConfiguration[] {
        return this.emailHistoryDmsCopyWordPrintHelpConfig.slice();
    }

    public static getGekoStesSearchConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getStesGeschaefteConfig(): ToolboxConfiguration[] {
        return this.emailPrintHelpConfig.slice();
    }

    public static getKontakteConfig(): ToolboxConfiguration[] {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getKontaktpersonenSearchConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getKontaktpersonenConfig(): ToolboxConfiguration[] {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getMeldungenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getFachberatungsangeboteConfig(): ToolboxConfiguration[] {
        return this.dmsWordPrintHelpConfig.slice();
    }

    public static getStellenAngeboteConfig(): ToolboxConfiguration[] {
        return this.dmsWordPrintHelpConfig.slice();
    }

    public static getFachberatungsangebotSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getKontaktpersonErfassenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getKontaktpersonBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getKundenberaterConfig(): ToolboxConfiguration[] {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getKontaktErfassenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getKontaktBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getBurDatenAnzeigenConfig(): ToolboxConfiguration[] {
        return this.historyDmsWordPrintHelpConfig.slice();
    }

    public static getGekoMeldungenSearchConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getBenutzerstellenSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getRollenSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getStesMeldungConfig(): ToolboxConfiguration[] {
        return this.emailPrintHelpConfig.slice();
    }

    public static getGekoAufgabenSearchConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getStesAufgabenAnzeigenConfig(): ToolboxConfiguration[] {
        return this.emailDmsPrintHelpConfig.slice();
    }

    public static getAufgabeErfassenConfig(): ToolboxConfiguration[] {
        return this.emailDmsPrintHelpConfig.slice();
    }

    public static getAufgabeBearbeitenConfig(): ToolboxConfiguration[] {
        return this.emailDmsPrintHelpConfig.slice();
    }

    public static getMutationsAntraegeConfig(): ToolboxConfiguration[] {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getMitteilungenAnzeigenConfig(): ToolboxConfiguration[] {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getUnternehmenBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getMutationsAntragConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getMitteilungAnzeigenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getVoranmeldungErfassenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getSweMeldungErfassenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getSweMeldungBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getVoranmeldungBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getFachberatungsangebotErfassenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getFachberatungsangebotBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getGeschaeftsStatistikConfig(): ToolboxConfiguration[] {
        return this.dmsWordPrintHelpConfig.slice();
    }

    public static getArbeitgetberAkquisitionBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyDmsCopyWordPrintHelpConfig.slice();
    }

    public static getVoranmeldungSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getSweMeldungSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getBerufeTaetigkeitAnzeigenConfig(): ToolboxConfiguration[] {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getBerufTaetigkeitErfassenConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getVoranmeldungenConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getRahmenfristenKaeSweConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getRahmenfristKaeSweConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getBerufTaetigkeitBearbeitenConfig() {
        return this.historyDmsCopyPrintHelpConfig.slice();
    }

    public static getSchnellzuweisungenAnzeigenConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getStellenangebotVermittlungConfig() {
        return this.historyDmsCopyPrintHelpConfig.slice();
    }

    public static getVermittlungenAnzeigenConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getZuweisungErfassenSuchenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getOsteErfassenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getMatchingProfilConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getSweMeldungenConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getBetriebsabteilungenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getGeKoArbeitgeberSearchConfig() {
        return this.printHelpConfig.slice();
    }

    public static getGeKoArbeitgeberConfig() {
        return this.printHelpConfig.slice();
    }

    public static getStellenmeldepflichtBerufeConfig() {
        return this.printHelpConfig.slice();
    }

    public static getRahmenfristKaeSweZahlungenConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getStellenmeldepflichtBerufPruefenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getStellenangebotSuchenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getJobroomMeldungenSuchenConfig() {
        return this.printHelpExcelConfig.slice();
    }

    public static getUnternehmenAufgabenConfig() {
        return this.dmsPrintHelpConfig.slice();
    }

    public static getGeschaeftsregelnErfassenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getJobroomStelleVerifizierenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getJobroomArbeitgeberZuordnenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getGeKoGeschaeftsregelnConfig() {
        return this.printHelpConfig.slice();
    }

    public static getJobroomArbeitgeberErfassenConfig() {
        return this.printHelpExitConfig.slice();
    }

    public static getZahlstelleErfassenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getVollzugsregionErfassenBearbeitenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getBerufErfassenBearbeitenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getZahlstellenSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getBenutzerstelleBearbeitenConfig() {
        return this.printHelpConfig.slice();
    }

    static getGeschaeftsregelnBearbeitenConfig(): ToolboxConfiguration[] {
        return this.historyPrintHelpConfig.slice();
    }

    public static getInformationsmeldungenErfassenConfig() {
        return this.printHelpConfig.slice();
    }

    public static getInformationsmeldungenSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getRollenBearbeitenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getVollzugsregionSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getBerufSuchenConfig(): ToolboxConfiguration[] {
        return this.printHelpConfig.slice();
    }

    public static getAenlichBerufeSuchenModalConfig() {
        return this.printHelpExitConfig.slice();
    }
}

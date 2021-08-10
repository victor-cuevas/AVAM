import { VorlagenKategorie } from '@shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { DokumentVorlageActionDTO } from '@app/shared/models/dtos-generated/dokumentVorlageActionDTO';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';

export class ToolboxDataHelper {
    private static readonly GF_ID = 'GF_ID';
    private static readonly STES_ID = 'STES_ID';
    private static readonly DFE_ID = 'DFE_ID';
    private static readonly STES_TERMIN_ID = 'STES_TERMIN_ID';
    private static readonly LSTEXP_ID = 'LSTEXP_ID';
    private static readonly MASSNAHME_ID = 'MASSNAHME_ID';
    private static readonly ENTSCHEID_ID = 'ENTSCHEID_ID';
    private static readonly KONTAKT_ID = 'KONTAKT_ID';
    private static readonly UNTERNEHMEN_ID = 'UNTERNEHMEN_ID';
    private static readonly PRODUKT_ID = 'PRODUKT_ID';
    private static readonly ARBEITSVERMITTLUNG_ZUWEISUNG_ID = 'ARBEITSVERMITTLUNG_ZUWEISUNG_ID';
    private static readonly KONTROLLPERIODE_ID = 'KONTROLLPERIODE_ID';
    private static readonly STELLUNGNAHME_ID = 'STELLUNGNAHME_ID';

    static createForStellensuchende(stesId: string): DokumentVorlageToolboxData {
        return this.createStesData(DokumentVorlageActionDTO.TargetEntityEnum.STESPERSONALIEN, [VorlagenKategorie.Stellensuchende], stesId);
    }

    static createForStesTermin(terminId: string): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.STESTERMIN, [VorlagenKategorie.Termin]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_TERMIN_ID] = terminId;
        return toolboxData;
    }

    static createForLstexpBearbeiten(stesId: string, lstExpId: string): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.createStesData(DokumentVorlageActionDTO.TargetEntityEnum.LSTEXP, [VorlagenKategorie.Lstexp], stesId);
        toolboxData.entityIDsMapping[ToolboxDataHelper.LSTEXP_ID] = lstExpId;
        return toolboxData;
    }

    static createForInfotag(dfeId: string, geschaeftsfallID: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.STESINFOTAG, [VorlagenKategorie.InfotagBuchungBearbeiten]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.DFE_ID] = dfeId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallID;
        return toolboxData;
    }

    static createStesData(entity: DokumentVorlageActionDTO.TargetEntityEnum, kategorien: VorlagenKategorie[], stesId: string): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(entity, kategorien);
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        return toolboxData;
    }

    static createForKontakteByUnternehmenId(unternehmenId: number): DokumentVorlageToolboxData {
        return ToolboxDataHelper.createByUnternehmenId(unternehmenId);
    }

    static createForUnternehmen(unternehmenId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.UGUNTERNEHMENDATEN, [VorlagenKategorie.UNTERNEHMEN]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.UNTERNEHMEN_ID] = unternehmenId;
        return toolboxData;
    }

    static createForArbeitgeber(unternehmenId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.ARBEITGEBER, [VorlagenKategorie.UNTERNEHMEN_ARBEITGEBER]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.UNTERNEHMEN_ID] = unternehmenId;
        return toolboxData;
    }

    static createForArbeitgeberllenangebot(unternehmenId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.ARBEITGEBER, [VorlagenKategorie.ARBEITGEBER_STELLENANGEBOT]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.UNTERNEHMEN_ID] = unternehmenId;
        return toolboxData;
    }

    static createForOsteZuweisung(zuweisungid: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.ARBEITGEBER, [VorlagenKategorie.Vermittlung_Stellenvermittlung]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.ARBEITSVERMITTLUNG_ZUWEISUNG_ID] = zuweisungid;
        return toolboxData;
    }

    static createForKontaktpersonByUnternehmenId(unternehmenId: number): DokumentVorlageToolboxData {
        return ToolboxDataHelper.createByUnternehmenId(unternehmenId);
    }

    static createForAmm(
        entity: DokumentVorlageActionDTO.TargetEntityEnum,
        kategorien: VorlagenKategorie[],
        stesId: number,
        geschaeftsfallId: number,
        massnahmeId: number,
        entscheidId: number
    ): DokumentVorlageToolboxData {
        const toolboxData: DokumentVorlageToolboxData = ToolboxDataHelper.data(entity, kategorien);
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.MASSNAHME_ID] = massnahmeId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.ENTSCHEID_ID] = entscheidId;

        return toolboxData;
    }

    static createForAmmGeschaeftsfall(stesId: number, geschaeftsfallId: number): DokumentVorlageToolboxData {
        const toolboxData: DokumentVorlageToolboxData = ToolboxDataHelper.data(null, null);
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallId;

        return toolboxData;
    }

    static createForAmmAuszugUebersicht(stesId: number): DokumentVorlageToolboxData {
        const toolboxData: DokumentVorlageToolboxData = ToolboxDataHelper.data(null, null);
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;

        return toolboxData;
    }

    static createForBuchung(stesId: number, geschaeftsfallId: number, massnahmeId: number, massnahmeType: string, entscheidId: number): DokumentVorlageToolboxData {
        switch (massnahmeType) {
            case AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT:
            case AmmMassnahmenCode.INDIVIDUELL_KURS:
                return this.createForAmm(
                    DokumentVorlageActionDTO.TargetEntityEnum.KURSINDBUCHUNG,
                    [VorlagenKategorie.AMM_BUCHUNG_IND],
                    stesId,
                    geschaeftsfallId,
                    massnahmeId,
                    entscheidId
                );
            case AmmMassnahmenCode.INDIVIDUELL_AP:
                return this.createForAmm(
                    DokumentVorlageActionDTO.TargetEntityEnum.APINDBUCHUNG,
                    [VorlagenKategorie.AMM_BUCHUNG_AP_IND, VorlagenKategorie.AMM_BESCHAEFTIGUNGSEINHEIT],
                    stesId,
                    geschaeftsfallId,
                    massnahmeId,
                    entscheidId
                );
            case AmmMassnahmenCode.INDIVIDUELL_BP:
                return this.createForAmm(
                    DokumentVorlageActionDTO.TargetEntityEnum.BPINDBUCHUNG,
                    [VorlagenKategorie.AMM_BUCHUNG_BP_IND, VorlagenKategorie.AMM_BESCHAEFTIGUNGSEINHEIT],
                    stesId,
                    geschaeftsfallId,
                    massnahmeId,
                    entscheidId
                );
            default:
                return null;
        }
    }

    static createForAmmProdukt(produktId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(null, null);
        toolboxData.entityIDsMapping[ToolboxDataHelper.PRODUKT_ID] = produktId;
        return toolboxData;
    }

    static createForAmmMassnahme(massnahmeId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(null, null);
        toolboxData.entityIDsMapping[ToolboxDataHelper.MASSNAHME_ID] = massnahmeId;
        return toolboxData;
    }

    static createForAmmDfe(dfeId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(null, null);
        toolboxData.entityIDsMapping[ToolboxDataHelper.DFE_ID] = dfeId;
        return toolboxData;
    }

    static createByUnternehmenId(unternehmenId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(null, null);
        toolboxData.entityIDsMapping[ToolboxDataHelper.UNTERNEHMEN_ID] = unternehmenId;
        return toolboxData;
    }

    static createForOsteBearbeiten(osteId: number) {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.STELLENANGEBOT, [VorlagenKategorie.STELLENANGEBOT]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = osteId;
        return toolboxData;
    }

    static createForVoranmeldungBearbeiten(voranmeldungKaeId: number): DokumentVorlageToolboxData {
        const toolboxData: DokumentVorlageToolboxData = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.VORANMELDUNGKAE, [VorlagenKategorie.VORANMELDUNG_KAE]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = voranmeldungKaeId;
        return toolboxData;
    }

    static createForKontrollperiode(kontrollperiodeId: string, stesId: number, geschaeftsfallId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.KONTROLLPERIODE, [VorlagenKategorie.KONTROLLPERIODE]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.KONTROLLPERIODE_ID] = kontrollperiodeId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallId;
        return toolboxData;
    }

    static createForVmfStellungnahme(stellungnahmeId: string, stesId: number, geschaeftsfallId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.VMFSTELLUNGNAHME, [VorlagenKategorie.VMF_STELLUNGNAHME]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.STELLUNGNAHME_ID] = stellungnahmeId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallId;
        return toolboxData;
    }

    static createForVmfEntscheid(entscheidId: string, stesId: number, geschaeftsfallId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.VMFENTSCHEID, [VorlagenKategorie.VMF_ENTSCHEID]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.ENTSCHEID_ID] = entscheidId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallId;
        return toolboxData;
    }

    static createForSanktionStellungnahme(stellungnahmeId: string, stesId: number, geschaeftsfallId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.SANKTIONSTELLUNGNAHME, [VorlagenKategorie.SANKTION_STELLUNGNAHME]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.STELLUNGNAHME_ID] = stellungnahmeId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallId;
        return toolboxData;
    }

    static createForSanktionEntscheid(entscheidId: string, stesId: number, geschaeftsfallId: number): DokumentVorlageToolboxData {
        const toolboxData: any = ToolboxDataHelper.data(DokumentVorlageActionDTO.TargetEntityEnum.SANKTIONENTSCHEID, [VorlagenKategorie.SANKTION_ENTSCHEID]);
        toolboxData.entityIDsMapping[ToolboxDataHelper.ENTSCHEID_ID] = entscheidId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.STES_ID] = stesId;
        toolboxData.entityIDsMapping[ToolboxDataHelper.GF_ID] = geschaeftsfallId;
        return toolboxData;
    }

    static createForFachberatungUebersicht(unternehmenId: number): DokumentVorlageToolboxData {
        return {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.FACHBERATUNGUEBERSICHT,
            vorlagenKategorien: [VorlagenKategorie.UEBERSICHT_FACHBERATUNG],
            entityIDsMapping: { UNTERNEHMEN_ID: unternehmenId }
        };
    }

    private static data(entity: DokumentVorlageActionDTO.TargetEntityEnum, kategorien: VorlagenKategorie[]): DokumentVorlageToolboxData {
        return {
            targetEntity: entity,
            vorlagenKategorien: kategorien,
            entityIDsMapping: {}
        } as DokumentVorlageToolboxData;
    }
}

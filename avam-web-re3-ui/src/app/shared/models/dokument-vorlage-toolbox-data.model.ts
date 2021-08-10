import { VorlagenKategorie } from '@shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlageActionDTO } from '@dtos/dokumentVorlageActionDTO';

export interface DokumentVorlageToolboxData {
    targetEntity: DokumentVorlageActionDTO.TargetEntityEnum;
    vorlagenKategorien: VorlagenKategorie[];
    entityIDsMapping: { [key: string]: number };
    uiSuffix?: string;
    entityAdditionalDataMapping?: { [key: string]: any };
    kursLamErstelltEntscheide?: boolean;
}

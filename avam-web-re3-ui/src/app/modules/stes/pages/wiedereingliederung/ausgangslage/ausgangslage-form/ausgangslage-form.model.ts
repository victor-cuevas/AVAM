import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StesRahmenfristDTO } from '@app/shared/models/dtos-generated/stesRahmenfristDTO';
import { StesAusgangslageDetailsDTO } from '@app/shared/models/dtos-generated/stesAusgangslageDetailsDTO';

export interface AusgangsLageFormData {
    vermittelbarkeitOptions?: CodeDTO[];
    qualifikationsbedarfOptions?: CodeDTO[];
    handlungsbedarfOptions?: CodeDTO[];
    priorityOptions?: CodeDTO[];
    rahmenfristDTO?: StesRahmenfristDTO;
    ausgangslageDetailsDTO?: StesAusgangslageDetailsDTO;
    stesId?: number;
}

export enum SituationsbeurteilungColumns {
    BEURTEILUNGSKRITERIUM = 'beurteilungskriterium',
    HANDLUNGSBEDARF = 'handlungsbedarf',
    PRIORITY = 'priority'
}

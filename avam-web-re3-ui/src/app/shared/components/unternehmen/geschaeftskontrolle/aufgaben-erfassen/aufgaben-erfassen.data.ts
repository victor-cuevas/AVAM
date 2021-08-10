import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { GeKoAufgabeDetailsDTO } from '@dtos/geKoAufgabeDetailsDTO';
import { GekoAufgabenCodes } from '@shared/models/geko-aufgaben-codes.model';

export interface AufgabenErfassenData {
    aufgabeId?: number;
    bereich?: GekobereichCodeEnum;
    channel?: string;
    formMode?: FormModeEnum;
    unternehmenId?: number;
    codes?: GekoAufgabenCodes;
    dto?: GeKoAufgabeDetailsDTO;
}

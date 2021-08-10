import { CodeDTO } from '@dtos/codeDTO';

export interface GekoAufgabenCodes {
    geschaeftsarten: Array<CodeDTO>;
    status: Array<CodeDTO>;
    priorities: Array<CodeDTO>;
}

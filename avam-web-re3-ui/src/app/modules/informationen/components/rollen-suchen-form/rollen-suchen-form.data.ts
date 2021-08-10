import { CodeDTO } from '@dtos/codeDTO';

export interface RollenSuchenFormData {
    vollzugsregionen?: CodeDTO[];
    benutzerstellen?: CodeDTO[];
    bezeichnung?: string;
    rollenId?: string;
    vollzugsregionenTyp?: string;
    benutzerstellenTyp?: string;
}

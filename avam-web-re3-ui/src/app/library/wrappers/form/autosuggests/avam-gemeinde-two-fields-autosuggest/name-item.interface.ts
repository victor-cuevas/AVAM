import { GemeindeDTO } from '@app/shared/models/dtos-generated/gemeindeDTO';

export interface INameItem {
    plz?: any;
    gemeindeBaseInfo?: GemeindeDTO;
    ortschaftsbezeichnung?: any;
    kanton?: any;
}

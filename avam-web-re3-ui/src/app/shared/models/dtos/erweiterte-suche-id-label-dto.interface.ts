export interface ErweiterteSucheIdLabelDTO {
    id: string;
    label: string;
    labelDe: string;
    labelFr: string;
    labelIt: string;
    children: Array<ErweiterteSucheIdLabelDTO>;
    dataTypeDate: boolean;
    dataTypeDecimal: boolean;
    dataTypeText: boolean;
}

export interface AvamMultiselectTreeInterface {
    id: string;
    textDe: string;
    textFr: string;
    textIt: string;
    value: boolean;
    parentId?: string;
    isParent?: boolean;
    children?: AvamMultiselectTreeInterface[];
}

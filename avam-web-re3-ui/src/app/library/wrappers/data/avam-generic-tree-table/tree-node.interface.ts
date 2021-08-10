export interface TreeNodeInterface {
    id: string;
    data: {};
    rowColor?: string;
    rowFontStyle?: {
        bold?: boolean;
        color?: string;
    };
    selectedRow?: boolean;
    children?: TreeNodeInterface[];
}

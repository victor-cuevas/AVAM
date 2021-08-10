export interface TopNavigationItemInterface {
    label: string;
    path: string;
    permissions?: any[];
}

export interface TopNavigationChildrenInterface {
    label: string;
    items: TopNavigationItemInterface[];
}

export interface TopNavigationRowInterface {
    children: TopNavigationChildrenInterface[];
}

export interface TopNavigationInterface {
    id?: string;
    selected?: boolean;
    label: string;
    path?: string;
    permissions?: any[];
    children?: TopNavigationChildrenInterface[];
    pathSelected?: boolean;
    clearStateWithKey?: string;
}

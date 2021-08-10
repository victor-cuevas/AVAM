import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

export class NodeData {
    budgetwertId?: number;
    strukturelementId?: number;
    gueltigVon?: Date;
    gueltigVonStr?: string;
    gueltigBis?: Date;
    gueltigBisStr?: string;
    elementCode?: string;
    elementName?: string;
    beschreibung?: string;
    chf?: number;
    saldoChf?: number;
    tnTage?: number;
    saldoTnTage?: number;
    tn?: number;
    saldoTn?: number;
    tnPreis?: number;
    tagesPreis?: number;

    constructor() {
        this.budgetwertId = null;
        this.strukturelementId = null;
        this.gueltigVon = null;
        this.gueltigBis = null;
        this.elementCode = null;
        this.elementName = null;
        this.beschreibung = null;
        this.chf = 0;
        this.saldoChf = 0;
        this.tnTage = 0;
        this.saldoTnTage = 0;
        this.tn = 0;
        this.saldoTn = 0;
        this.tnPreis = 0;
        this.tagesPreis = 0;
    }
}

export class Node<T> implements TreeNodeInterface {
    id: string;
    data: T = null;
    children = [];

    constructor(id, value) {
        this.id = id;
        this.data = value;
        this.children = [];
    }

    addChild(child: Node<T>) {
        this.children.push(child);
    }
}

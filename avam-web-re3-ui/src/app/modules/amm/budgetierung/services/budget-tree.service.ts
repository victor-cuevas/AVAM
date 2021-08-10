import { Injectable } from '@angular/core';
import { BudgetwertDTO } from '@app/shared/models/dtos-generated/budgetwertDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { Node, NodeData } from '../models/budget-tree-models';
import * as uuidv4 from 'uuid/v4';
import { DatePipe, formatNumber } from '@angular/common';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { LocaleEnum } from '@app/shared/enums/locale.enum';

@Injectable()
export class BudgetTreeService {
    constructor(private datePipe: DatePipe, private dbTranslateService: DbTranslateService) {}

    buildTree(strukturelement: StrukturElementDTO, budgetwerte: { [key: string]: Array<BudgetwertDTO> }): Node<NodeData> {
        const root: Node<NodeData> = new Node(uuidv4(), new NodeData());

        const budgetwert = budgetwerte[strukturelement.strukturelementId] ? budgetwerte[strukturelement.strukturelementId][0] : null;

        root.data = this.mapNode(strukturelement, budgetwert);

        strukturelement.nachfolgerElementList.forEach(element => {
            root.addChild(this.buildTree(element, budgetwerte));
        });

        return root;
    }

    mapNode(strukturEl: StrukturElementDTO, budgetwert: BudgetwertDTO): NodeData {
        const node = new NodeData();
        //map matching properties directly
        //if it is an object create new instead of reference
        Object.keys(strukturEl).forEach(function(key) {
            if (node.hasOwnProperty(key)) {
                node[key] = strukturEl[key];
            }
        });

        if (budgetwert) {
            this.setBudgetwerte(node, budgetwert);
        }

        node.gueltigVonStr = this.datePipe.transform(node.gueltigVon, 'dd.MM.yyyy');
        node.gueltigBisStr = this.datePipe.transform(node.gueltigBis, 'dd.MM.yyyy');

        node.elementName = this.dbTranslateService.translateWithOrder(strukturEl, 'elementName');
        node.beschreibung = this.dbTranslateService.translateWithOrder(strukturEl, 'beschreibung');

        return node;
    }

    setBudgetwerte(node: NodeData, budgetwert: BudgetwertDTO) {
        node.budgetwertId = budgetwert.budgetwertId;
        node.chf = budgetwert.chf;
        node.saldoChf = budgetwert.saldoChf;
        node.tnTage = budgetwert.tnTage;
        node.saldoTnTage = budgetwert.saldoTnTage;
        node.tn = budgetwert.tn;
        node.saldoTn = budgetwert.saldoTn;
        node.tnPreis = budgetwert.tnPreis;
        node.tagesPreis = budgetwert.tagesPreis;
    }
}

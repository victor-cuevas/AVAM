import { Injectable } from '@angular/core';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { Node, NodeData } from './massnahmenart-tree-models';
import * as uuidv4 from 'uuid/v4';
import { DatePipe } from '@angular/common';
import { FormUtilsService } from '@app/shared';
import * as moment from 'moment';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

@Injectable()
export class MassnahmeartTreeService {
    constructor(private datePipe: DatePipe, private formUtils: FormUtilsService, private dbTranslateService: DbTranslateService) {}

    buildTree(strukturEl: StrukturElementDTO, searchKategorieId: number): Node<NodeData> {
        //create root node
        const root: Node<NodeData> = new Node(uuidv4(), new NodeData());
        //map data to root node
        root.data = this.mapNode(strukturEl);
        root.data.searchKategorieId = searchKategorieId;
        //call buildTree for all children of the element
        //passing the child as root and the route basis
        //push the result in the children array of the root
        strukturEl.nachfolgerElementList.forEach(element => {
            root.addChild(this.buildTree(element, searchKategorieId));
        });

        return root;
    }

    buildTreeForAmmStruktur(strukturEl: StrukturElementDTO, kategorie: number, anzeigeDatum: Date, level = 0, selectedId: number = null): Node<NodeData> {
        const root: Node<NodeData> = new Node(uuidv4(), new NodeData());

        root.data = this.mapNode(strukturEl);

        root.showActions = level > 1 && level < 5 && kategorie !== AmmConstants.AMM_ELEMENTKATEGORIE_GESETZ && kategorie !== AmmConstants.AMM_ELEMENTKATEGORIE_AUSGLEICHSTELLE;

        root.selectedRow = selectedId && root.data.strukturelementId === selectedId;

        this.setRowFontColor(root, anzeigeDatum);

        strukturEl.nachfolgerElementList.forEach(element => {
            element.vorgaengerObject = { ...strukturEl, nachfolgerElementList: null };
            root.addChild(this.buildTreeForAmmStruktur(element, kategorie, anzeigeDatum, level + 1, selectedId));
        });

        return root;
    }

    mapNode(strukturEl: StrukturElementDTO): NodeData {
        const node = new NodeData();
        //map matching properties directly
        //if it is an object create new instead of reference
        Object.keys(strukturEl).forEach(function(key) {
            if (node.hasOwnProperty(key)) {
                node[key] = strukturEl[key];
            }
        });
        if (node.vorgaengerObject) {
            node.vorgaengerObject = this.mapNode({ ...strukturEl.vorgaengerObject });
        }
        if (strukturEl.nachfolgerElementList) {
            strukturEl.nachfolgerElementList.forEach(child => {
                node.nachfolgerElements.push(this.mapNode(child));
            });
        }
        node.elementkategorieObject = { ...strukturEl.elementkategorieObject };
        //aftermapping
        //create date strings in the correct display format
        node.gueltigVonStr = this.datePipe.transform(node.gueltigVon, 'dd.MM.yyyy');
        node.gueltigBisStr = this.datePipe.transform(node.gueltigBis, 'dd.MM.yyyy');
        //trim whitespaces in the elment names
        node.elementNameDe = node.elementNameDe.trim();
        node.elementNameFr = node.elementNameFr.trim();
        node.elementNameIt = node.elementNameIt.trim();
        //translate translatable properties
        node.elementName = this.dbTranslateService.translateWithOrder(strukturEl, 'elementName');
        node.beschreibung = this.dbTranslateService.translateWithOrder(strukturEl, 'beschreibung');

        return node;
    }

    private setRowFontColor(root: Node<NodeData>, anzeigeDatum: Date) {
        const filterDate = moment(anzeigeDatum, 'DD.MM.YYYY');
        if (filterDate.isBefore(this.formUtils.parseDate(root.data.gueltigVon), 'day')) {
            root.rowFontStyle = { color: '#005e8e' };
        } else if (filterDate.isAfter(this.formUtils.parseDate(root.data.gueltigBis), 'day')) {
            root.rowFontStyle = { color: '#A9A9A9' };
        }
    }
}

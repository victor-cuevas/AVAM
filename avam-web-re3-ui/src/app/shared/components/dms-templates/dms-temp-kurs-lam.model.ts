import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';
import { DokumentVorlagenDTO } from '@app/shared/models/dtos-generated/dokumentVorlagenDTO';
import { TeilnehmerDTO } from '@app/shared/models/dtos-generated/teilnehmerDTO';
import { FacadeService } from '@app/shared/services/facade.service';

export class NodeData {
    // Vorlage
    dmsTypeCode: number;
    vorlageId: number;
    kategorie: string;
    language: string;
    name: string;
    type: string;
    // Teilnehmer
    gfId: number;
    buchungPlatz: string;
    stesFullName: string;
    entscheidStatusKurzText: string;
    entscheidArtKurzText: string;

    constructor(vorlage: DokumentVorlagenDTO, facade: FacadeService, teilnehmer?: TeilnehmerDTO, fromWarteListe?: boolean) {
        this.dmsTypeCode = vorlage.dmsTypeCode;
        this.vorlageId = vorlage.id;
        this.kategorie = vorlage.kategorie;
        this.language = vorlage.language;
        this.name = vorlage.name;
        this.type = facade.dbTranslateService.translateWithOrder(vorlage, 'type');

        if (teilnehmer) {
            this.gfId = teilnehmer.gfId;
            this.buchungPlatz = !fromWarteListe
                ? teilnehmer.buchungPlatz
                : `${teilnehmer.buchungPlatz} (${facade.translateService.instant('amm.massnahmen.subnavmenuitem.warteliste')})`;
            this.stesFullName = [teilnehmer.stesName, teilnehmer.stesVorname].join(', ');
            this.entscheidStatusKurzText = facade.dbTranslateService.translateWithOrder(teilnehmer.entscheidStatus, 'kurzText');
            this.entscheidArtKurzText = facade.dbTranslateService.translateWithOrder(teilnehmer.entscheidArt, 'kurzText');
        }
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

export enum DmsTypeConstants {
    DT_ENTSCHEID = 1250,
    DT_KORRESPONDENZ = 1290,
    DT_BESCHEINIGUNG = 1140
}

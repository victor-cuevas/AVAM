import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { MultiLanguageParamDTO } from '@app/shared/models/dtos-generated/multiLanguageParamDTO';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

export class NodeData {
    ownerId?: number;
    ojbVersion?: number;
    erfasstAm?: Date;
    geaendertAm?: Date;
    strukturelementId?: number;
    gueltigVon?: Date;
    gueltigVonStr?: string;
    gueltigBis?: Date;
    gueltigBisStr?: string;
    sortierSchluessel?: number;
    elementCode?: string;
    elementName?: string;
    elementNameDe?: string;
    elementNameFr?: string;
    elementNameIt?: string;
    beschreibung?: string;
    beschreibungDe?: string;
    beschreibungFr?: string;
    beschreibungIt?: string;
    elementkategorieId?: number;
    elementkategorieObject?: ElementKategorieDTO;
    mappingAusgleichstelleId?: number;
    kbArtASAL?: string;
    gesetz?: boolean;
    vorgaengerObject?: NodeData;
    nachfolgerElements?: NodeData[];
    amtsstellePath?: MultiLanguageParamDTO;
    ausgleichstellePath?: MultiLanguageParamDTO;
    searchKategorieId?: number;

    constructor() {
        this.ownerId = null;
        this.ojbVersion = null;
        this.erfasstAm = null;
        this.geaendertAm = null;
        this.strukturelementId = null;
        this.gueltigVon = null;
        this.gueltigVonStr = null;
        this.gueltigBis = null;
        this.gueltigBisStr = null;
        this.sortierSchluessel = null;
        this.elementCode = null;
        this.elementName = null;
        this.elementNameDe = null;
        this.elementNameFr = null;
        this.elementNameIt = null;
        this.beschreibung = null;
        this.beschreibungDe = null;
        this.beschreibungFr = null;
        this.beschreibungIt = null;
        this.elementkategorieId = null;
        this.elementkategorieObject = null;
        this.mappingAusgleichstelleId = null;
        this.kbArtASAL = null;
        this.gesetz = null;
        this.vorgaengerObject = null;
        this.nachfolgerElements = [];
        this.searchKategorieId = null;
    }

    getPath(dbTranslateService: DbTranslateService): string {
        let path = this.elementName;
        const dots = '...';
        const arrows = ' >> ';
        const buildShortPath = this.elementkategorieObject.kategorie === AmmElementkategorieEnum.AMM_ELEMENTKATEGORIE_GESETZ ? false : true;

        let currentElement = this.vorgaengerObject;
        while (currentElement) {
            path = dbTranslateService.translate(currentElement, 'elementName').concat(arrows.concat(path));

            if (buildShortPath && currentElement.elementkategorieObject.kategorie === AmmElementkategorieEnum.AMM_ELEMENTKATEGORIE_GESETZ) {
                path = dots.concat(path);
                break;
            }
            currentElement = currentElement.vorgaengerObject;
        }

        return path;
    }

    getFullPath(): string {
        let path = this.elementName;
        const arrows = ' >> ';

        let currentElement = this.vorgaengerObject;
        while (currentElement) {
            path = currentElement.elementName.concat(arrows.concat(path));
            currentElement = currentElement.vorgaengerObject;
        }

        return path;
    }
}

//tree table models
export class Node<T> implements TreeNodeInterface {
    id: string;
    data: T = null;
    rowFontStyle?: {
        bold?: boolean;
        color?: string;
    };
    selectedRow?: boolean;
    showActions?: boolean;
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

export class ElementKategorieQueryParams {
    type?: StrukturElementType;
    elementKategorieId?: string;
    berechtigungsKey?: string;
}

export class MassnahmenQueryParams {
    type?: StrukturElementType;
    elementKategorieId?: string;
    berechtigungsKey?: string;
    anzeigeDatum?: Date;
    ausgleichstelleInfo?: boolean;
    amtsstellenId?: number;
    rootAbGesetzVonId?: number;
    rootId?: number;
}

export enum StrukturElementType {
    AMTSSTELLE = 'AMTSSTELLE',
    VOLLZUGSREGIONLISTE = 'VOLLZUGSREGIONLISTE',
    AUSGLEICHSSTELLE = 'AUSGLEICHSSTELLE',
    AMTSSTELLELISTE = 'AMTSSTELLELISTE',
    BERECHTIGTELISTE = 'BERECHTIGTELISTE'
}

export enum AmmElementkategorieEnum {
    AMM_ELEMENTKATEGORIE_GESETZ = 0
}

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { AmmConstants } from '@app/shared/enums/amm-constants';
import { BaseResponseWrapperListAmmStesGeschaeftsfallDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListAmmStesGeschaeftsfallDTOWarningMessages';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AmmStesGeschaeftsfallDTO } from '@app/shared/models/dtos-generated/ammStesGeschaeftsfallDTO';
import { AmmEntscheidDTO } from '@app/shared/models/dtos-generated/ammEntscheidDTO';
import { AmmEntscheidGruendeDTO } from '@app/shared/models/dtos-generated/ammEntscheidGruendeDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { BenutzerDTO } from '@app/shared/models/dtos-generated/benutzerDTO';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { DatePipe } from '@angular/common';
import * as uuidv4 from 'uuid/v4';
import { AmmGeschaeftElementCode } from '@app/shared/enums/domain-code/amm-geschaeft-element-code.enum';
import { SpinnerService } from 'oblique-reactive';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmStoreService } from '@app/modules/stes/pages/amm/amm-store.service';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

@Component({
    selector: 'avam-amm-uebersicht-tree-table',
    templateUrl: './avam-amm-uebersicht-tree-table.component.html',
    styleUrls: ['./avam-amm-uebersicht-tree-table.component.scss']
})
export class AvamAmmUebersichtTreeTableComponent implements OnInit {
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;
    readonly channel: string = 'avam-amm-uebersicht-tree-table';
    treeArray: TreeNodeInterface[] = [];
    treeOptions: TreeOptionInterface;
    geschaeftsFall: BaseResponseWrapperListAmmStesGeschaeftsfallDTOWarningMessages;
    stesId: string;
    isLastEntscheid: boolean;

    constructor(
        private datePipe: DatePipe,
        private translate: TranslateService,
        private dbTranslateService: DbTranslateService,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private ammDataService: AmmRestService,
        private ammStore: AmmStoreService
    ) {
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
            this.spinnerService.activate(this.channel);
            this.ammDataService.getAmmStesGeschaeftsfall(this.stesId).subscribe(
                (geschaeftsFall: BaseResponseWrapperListAmmStesGeschaeftsfallDTOWarningMessages) => {
                    this.treeArray = this.buildTree(geschaeftsFall.data).getChildren();
                    this.spinnerService.deactivate(this.channel);
                    this.translate.onLangChange.subscribe(() => {
                        this.treeArray = this.buildTree(geschaeftsFall.data).getChildren();
                    });
                },
                () => {
                    this.spinnerService.deactivate(this.channel);
                }
            );
        });

        this.treeOptions = {
            columnOrder: ['title', 'dauer', 'unternehmen', 'entscheid', 'status', 'bearbeitung', 'datum'],
            columnTitle: [
                'amm.nutzung.label.massnahme',
                'amm.nutzung.label.dauer',
                'amm.nutzung.label.anbieter',
                'amm.nutzung.label.entscheidart',
                'amm.nutzung.label.status',
                'amm.nutzung.label.bearbeitungEntscheidung',
                'common.label.geaendertam'
            ],
            actions: {
                template: this.actionColumnTemplate
            }
        };
    }

    onClick(element) {
        const nodeData: NodeData = element.model.data;
        this.ammStore.addAmm(nodeData);
    }

    buildTree(ammStesGeschaeftsvorgaengeList: AmmStesGeschaeftsfallDTO[]): Node<NodeData> {
        const root: Node<NodeData> = new Node(uuidv4(), new NodeData());
        // Filter all repeating Geschaeftsvorgaenge
        const geschaeftsvorgaengeNoDuplicateKeysMap = new Map<number, AmmStesGeschaeftsfallDTO[]>();
        for (const ammStesGeschaeftsvorgang of ammStesGeschaeftsvorgaengeList) {
            if (!geschaeftsvorgaengeNoDuplicateKeysMap.has(ammStesGeschaeftsvorgang.basisNr)) {
                geschaeftsvorgaengeNoDuplicateKeysMap.set(ammStesGeschaeftsvorgang.basisNr, [ammStesGeschaeftsvorgang]);
            } else {
                geschaeftsvorgaengeNoDuplicateKeysMap.get(ammStesGeschaeftsvorgang.basisNr).push(ammStesGeschaeftsvorgang);
            }
        }
        geschaeftsvorgaengeNoDuplicateKeysMap.forEach(geschaeftsfaelle => {
            let agfTreeNode: Node<NodeData>;
            // Get first element and create the Geschaeftsvorgang node
            const mostRecentGeschaeftsfall: AmmStesGeschaeftsfallDTO = geschaeftsfaelle[0];
            let gfText = this.dbTranslateService.translate(mostRecentGeschaeftsfall.massnahmenTypObject, 'kurzText');
            const mostRecentEntsheid = this.getEntscheid(mostRecentGeschaeftsfall);
            const isEntscheidStatus = this.isEntscheidStatus(mostRecentEntsheid);
            if (mostRecentEntsheid.massnahmenTitel) {
                gfText = `${gfText} ${mostRecentEntsheid.massnahmenTitel}`;
            }
            agfTreeNode = this.createNode(AmmGeschaeftElementCode.AMM_GF_ELEM_ROOT, mostRecentGeschaeftsfall, mostRecentEntsheid.ammEntscheidId, this.stesId);
            agfTreeNode.data.title = gfText;
            const unternehmen = mostRecentGeschaeftsfall.unternehmenObject;
            if (unternehmen) {
                agfTreeNode.data.unternehmen = this.getUnternemen(unternehmen);
                agfTreeNode.data.ort = this.dbTranslateService.translate(unternehmen.plz, 'ort');
            }
            const mostRecentGfGesuchType =
                mostRecentGeschaeftsfall.ammGesuchAz || mostRecentGeschaeftsfall.ammGesuchFse || mostRecentGeschaeftsfall.ammGesuchPewo || mostRecentGeschaeftsfall.ammGesuchEaz;
            if (mostRecentGfGesuchType) {
                agfTreeNode.data.status = this.getGfStatus(mostRecentEntsheid, mostRecentGeschaeftsfall.ammGesuch.statusObject);
            }
            geschaeftsfaelle.forEach(ammGeschaeftsfall => {
                const entscheid = this.getEntscheid(ammGeschaeftsfall);
                this.isLastEntscheid = false;

                ammGeschaeftsfall.allAmmEntscheid.forEach((ammEntscheid: AmmEntscheidDTO) => {
                    this.addAmmEntscheid(ammEntscheid, ammGeschaeftsfall, agfTreeNode, isEntscheidStatus);
                });
                const ammGesuch = ammGeschaeftsfall.ammGesuchAz || ammGeschaeftsfall.ammGesuchFse || ammGeschaeftsfall.ammGesuchPewo || ammGeschaeftsfall.ammGesuchEaz;
                this.addAmmGesuch(ammGesuch, entscheid, ammGeschaeftsfall, isEntscheidStatus, agfTreeNode);
                const ammBuchung = ammGeschaeftsfall.ammBuchungArbeitsplatzkategorie || ammGeschaeftsfall.ammBuchungPraktikumsstelle || ammGeschaeftsfall.ammBuchungSession;
                this.addAmmBuchung(ammBuchung, entscheid, ammGeschaeftsfall, isEntscheidStatus, agfTreeNode);
            });
            root.addChild(agfTreeNode);
        });
        return root;
    }

    private fillNodeData(data: any, ammGeschaeftsfallId: number, node: Node<NodeData>) {
        const nodeData = node.data;
        nodeData.status = data.statusObject ? this.dbTranslateService.translate(data.statusObject, 'kurzText') : null;
        nodeData.entscheid = data.entscheidArtObject ? this.dbTranslateService.translate(data.entscheidArtObject, 'kurzText') : null;
        nodeData.ersetzt = data.statusObject.code === AmmConstants.VIER_AUGEN_STATUS_ERSETZT;
        nodeData.datum = this.getDate(data);
        nodeData.kosten = data.ammKosten ? data.ammKosten.betrag : null;

        if (nodeData.ersetzt) {
            node.rowColor = 'lightgray';
        }
    }

    private getUnternemen(unternehmen: UnternehmenDTO): string {
        let unternehmenName = '';
        if (unternehmen.name1) {
            unternehmenName += `${unternehmen.name1}`;
        }
        if (unternehmen.name2) {
            unternehmenName += ` ${unternehmen.name2}`;
        }
        if (unternehmen.name3) {
            unternehmenName += ` ${unternehmen.name3}`;
        }
        return unternehmenName;
    }

    private addAmmEntscheid(ammEntscheid: AmmEntscheidDTO, ammGeschaeftsfall: AmmStesGeschaeftsfallDTO, agfTreeNode: Node<NodeData>, isEntscheidStatus: boolean) {
        const aeTreeNode: Node<NodeData> = this.createNode(AmmGeschaeftElementCode.AMM_GF_ELEM_ENTSCHEID, ammGeschaeftsfall, ammEntscheid.ammEntscheidId, this.stesId);

        this.fillNodeData(ammEntscheid, ammGeschaeftsfall.ammGeschaeftsfallId, aeTreeNode);

        const entscheidText = this.dbTranslateService.translate(ammEntscheid.entscheidTypObject, 'kurzText');
        aeTreeNode.data.title = entscheidText;

        const entscheidgrund = this.getGruende(ammEntscheid.gruende);
        aeTreeNode.data.entscheidgrund = entscheidgrund ? this.dbTranslateService.translate(entscheidgrund, 'kurzText') : null;

        const geldgeber = ammEntscheid.geldgeberObject;
        aeTreeNode.data.geldgeber = geldgeber ? this.dbTranslateService.translate(geldgeber, 'kurzText') : null;

        aeTreeNode.data.benutzerstelle = ammEntscheid.benutzerstelle;
        aeTreeNode.data.bearbeitung = this.getGfBearbeitung(ammEntscheid, ammEntscheid.entscheidungDurchObject);

        aeTreeNode.data.von = ammEntscheid.ammVon;
        aeTreeNode.data.bis = ammEntscheid.ammBis;
        aeTreeNode.data.dauer = this.getDauerFormatted(ammEntscheid.ammVon, ammEntscheid.ammBis);

        if (!this.isLastEntscheid) {
            this.isLastEntscheid = true;

            if (isEntscheidStatus) {
                agfTreeNode.data.entscheid = this.dbTranslateService.translate(ammEntscheid.entscheidArtObject, 'kurzText');
                agfTreeNode.data.entscheidgrund = aeTreeNode.data.entscheidgrund;

                agfTreeNode.data.datum = this.getDate(ammEntscheid);
                agfTreeNode.data.von = ammEntscheid.ammVon;
                agfTreeNode.data.bis = ammEntscheid.ammBis;
                agfTreeNode.data.dauer = this.getDauerFormatted(ammEntscheid.ammVon, ammEntscheid.ammBis);

                agfTreeNode.data.benutzerstelle = aeTreeNode.data.benutzerstelle;
                agfTreeNode.data.geldgeber = aeTreeNode.data.geldgeber;
                agfTreeNode.data.kosten = aeTreeNode.data.kosten;
            }
        }

        agfTreeNode.addChild(aeTreeNode);
    }

    private addAmmGesuch(ammGesuch: any, ammFirstEntscheid: AmmEntscheidDTO, ammGeschaeftsfall: AmmStesGeschaeftsfallDTO, isEntscheidStatus: boolean, agfTreeNode: Node<NodeData>) {
        if (ammGesuch) {
            let gesuchLabel;
            if (!ammGeschaeftsfall.ammGesuchAz && !ammGeschaeftsfall.ammGesuchFse && !ammGeschaeftsfall.ammGesuchPewo) {
                gesuchLabel = this.translate.instant('amm.nutzung.subnavmenuitem.gesuch');
            } else {
                gesuchLabel = this.dbTranslateService.translate(ammGesuch.typIdObject, 'kurzText');
            }

            const agTreeNode: Node<NodeData> = this.createNode(AmmGeschaeftElementCode.AMM_GF_ELEM_GESUCH, ammGeschaeftsfall, ammFirstEntscheid.ammEntscheidId, this.stesId);
            this.fillNodeData(ammGesuch, ammGeschaeftsfall.ammGeschaeftsfallId, agTreeNode);
            if (ammGesuch.ausbildungVon && ammGesuch.ausbildungBis) {
                agfTreeNode.data.dauer = this.getDauerFormatted(ammGesuch.ausbildungVon, ammGesuch.ausbildungBis);
            }
            agTreeNode.data.title = gesuchLabel;
            agTreeNode.data.unternehmen = agfTreeNode.data.unternehmen;

            agTreeNode.data.von = ammGesuch.massnahmeVon;
            agTreeNode.data.bis = ammGesuch.massnahmeBis;
            agTreeNode.data.dauer = this.getDauerFormatted(agTreeNode.data.von, agTreeNode.data.bis);
            agTreeNode.data.bearbeitung = this.getBearbeitung(ammGesuch.bearbeiterObject);
            agTreeNode.data.ort = agfTreeNode.data.ort;
            const kontaktperson = ammGesuch.ammKontaktpersonObject;
            if (kontaktperson) {
                agfTreeNode.data.kontaktperson = `${kontaktperson.name} ${kontaktperson.vorname}`;
                agTreeNode.data.kontaktperson = `${kontaktperson.name} ${kontaktperson.vorname}`;
            }

            agfTreeNode.data.bearbeitung = this.getGfBearbeitung(ammFirstEntscheid, ammGesuch.bearbeiterObject);
            agfTreeNode.data.datum = this.getGfDate(ammFirstEntscheid, ammGesuch);

            if (!isEntscheidStatus) {
                agfTreeNode.data.dauer = this.getDauerFormatted(agTreeNode.data.von, agTreeNode.data.bis);
            }

            agfTreeNode.addChild(agTreeNode);
        }
    }

    private addAmmBuchung(
        ammBuchung: any,
        ammFirstEntscheid: AmmEntscheidDTO,
        ammGeschaeftsfall: AmmStesGeschaeftsfallDTO,
        isEntscheidStatus: boolean,
        agfTreeNode: Node<NodeData>
    ) {
        if (ammBuchung) {
            const abTreeNode: Node<NodeData> = this.createNode(
                AmmGeschaeftElementCode.AMM_GF_ELEM_BUCHUNG,
                ammGeschaeftsfall,
                ammFirstEntscheid.ammEntscheidId,
                this.stesId,
                ammBuchung.massnahmeId
            );
            this.fillNodeData(ammBuchung, ammGeschaeftsfall.ammGeschaeftsfallId, abTreeNode);
            abTreeNode.data.title = this.translate.instant('amm.nutzung.label.buchung');

            abTreeNode.data.von = ammBuchung.buchungVon;
            abTreeNode.data.bis = ammBuchung.buchungBis;
            abTreeNode.data.dauer = this.getDauerFormatted(abTreeNode.data.von, abTreeNode.data.bis);

            abTreeNode.data.bearbeitung = this.getBearbeitung(ammBuchung.bearbeiterObject);
            abTreeNode.data.unternehmen = agfTreeNode.data.unternehmen;

            abTreeNode.data.ort = agfTreeNode.data.ort;

            if (!agfTreeNode.data.status) {
                agfTreeNode.data.status = this.getGfStatus(ammFirstEntscheid, ammBuchung.statusObject);
            }

            agfTreeNode.data.bearbeitung = this.getGfBearbeitung(ammFirstEntscheid, ammBuchung.bearbeiterObject);
            agfTreeNode.data.datum = this.getGfDate(ammFirstEntscheid, ammBuchung);

            if (!isEntscheidStatus) {
                agfTreeNode.data.dauer = this.getDauerFormatted(ammBuchung.buchungVon, ammBuchung.buchungBis);
            }

            agfTreeNode.addChild(abTreeNode);
        }
    }

    private getDate(dateObject: any): string {
        let date = dateObject.geaendertAm;
        if (!date) {
            date = dateObject.erfasstAm;
        }
        return `${this.datePipe.transform(new Date(date), 'dd.MM.yyyy')}`;
    }

    private getGruende(gruendeList: AmmEntscheidGruendeDTO[]): CodeDTO {
        if (gruendeList.length > 0) {
            if (gruendeList[0].grundObject && gruendeList[0].grundObject.codeId > 0) {
                return gruendeList[0].grundObject;
            }
        }
        return null;
    }

    private getGfBearbeitung(entscheid: AmmEntscheidDTO, bearbeitung: BenutzerDTO) {
        let bearbeiter = '';
        if (this.isEntscheidStatus(entscheid)) {
            const vs = entscheid.statusObject.code;
            if (vs === AmmConstants.VIER_AUGEN_STATUS_FREIGABEBEREIT || vs === AmmConstants.VIER_AUGEN_STATUS_IN_UEBERARBEITUNG) {
                bearbeiter = this.getBearbeitung(entscheid.entscheidungDurchObject);
            } else {
                bearbeiter = this.getBearbeitung(entscheid.freigabeDurchObject);
            }
        } else {
            bearbeiter = this.getBearbeitung(bearbeitung);
        }
        return bearbeiter;
    }

    private isEntscheidStatus(entscheid: AmmEntscheidDTO): boolean {
        let isEntscheidStatus = false;
        const vs = entscheid.statusObject.code;
        if (
            vs === AmmConstants.VIER_AUGEN_STATUS_FREIGABEBEREIT ||
            vs === AmmConstants.VIER_AUGEN_STATUS_IN_UEBERARBEITUNG ||
            vs === AmmConstants.VIER_AUGEN_STATUS_FREIGEGEBEN ||
            vs === AmmConstants.VIER_AUGEN_STATUS_ERSETZT
        ) {
            isEntscheidStatus = true;
        }
        return isEntscheidStatus;
    }

    private getBearbeitung(bearbeitung: BenutzerDTO): string {
        let s = '';
        if (bearbeitung != null) {
            s = `${bearbeitung.benutzerLogin} ${bearbeitung.nachname} ${bearbeitung.vorname}`;
        }
        return s;
    }

    private createNode(elType: string, gf: AmmStesGeschaeftsfallDTO, entscheidId: any, stesId: any, massnahmeId?: any): Node<NodeData> {
        const data = new NodeData();
        const node: Node<NodeData> = new Node(uuidv4(), data);
        if (gf) {
            node.data.gfId = gf.ammGeschaeftsfallId;
            node.data.type = gf.massnahmenTypObject ? gf.massnahmenTypObject.code : null;
        }
        node.data.entscheidId = entscheidId;
        node.data.massnahmeId = massnahmeId;
        node.data.stesId = stesId;
        node.data.elementType = elType;

        return node;
    }

    private getEntscheid(geschaeftsfall: AmmStesGeschaeftsfallDTO): AmmEntscheidDTO {
        let entscheid;
        if (geschaeftsfall.allAmmEntscheid && geschaeftsfall.allAmmEntscheid.length > 0) {
            entscheid = geschaeftsfall.allAmmEntscheid[0];
        }
        return entscheid;
    }

    private getGfStatus(entscheid: AmmEntscheidDTO, geschaeftsStatus: CodeDTO) {
        let gfStatus = '';
        if (this.isEntscheidStatus(entscheid)) {
            gfStatus = this.dbTranslateService.translate(entscheid.statusObject, 'kurzText');
        } else {
            gfStatus = this.dbTranslateService.translate(geschaeftsStatus, 'kurzText');
        }
        return gfStatus;
    }

    private getGfDate(entscheid: AmmEntscheidDTO, vo: any): string {
        let date: Date;
        if (this.isEntscheidStatus(entscheid)) {
            vo = entscheid;
        }
        date = vo.geaendertAm;
        if (date == null) {
            date = vo.erfasstAm;
        }
        return `${this.datePipe.transform(date, 'dd.MM.yyyy')}`;
    }

    private getDauerFormatted(von: Date, bis: Date): string {
        let dateFormatted = '';
        if (von) {
            dateFormatted += `${this.datePipe.transform(von, 'dd.MM.yyyy')}`;
        }
        if (bis) {
            dateFormatted += ` - ${this.datePipe.transform(bis, 'dd.MM.yyyy')}`;
        }
        return dateFormatted;
    }
}

class Node<T> implements TreeNodeInterface {
    id: string;
    data: T = null;
    rowColor: string;
    children = [];

    constructor(id, value) {
        this.id = id;
        this.data = value;
        this.children = [];
    }

    addChild(child: Node<T>) {
        this.children.push(child);
    }

    getChildren(): Node<T>[] {
        return this.children;
    }
}

class NodeData {
    gfId: any = null;
    entscheidId: any = null;
    stesId: any = null;
    massnahmeId: any = null;
    type: string = null;
    elementType: string = null;
    title: string = null;
    uniqueKey: string = null;
    tip: string = null;
    dauer: string = null;
    entscheid: string = null;
    entscheidgrund: string = null;
    von: Date = null;
    bis: Date = null;
    datum: string = null;
    datumStr: string = null;
    unternehmen: string = null;
    kosten: number = null;
    ort: string = null;
    status: string = null;
    geldgeber: string = null;
    benutzerstelle = null;
    kontaktperson: string = null;
    bearbeitung: string = null;
    ersetzt: boolean = null;
}

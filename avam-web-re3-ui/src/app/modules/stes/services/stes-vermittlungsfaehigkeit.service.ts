import { Injectable } from '@angular/core';

import * as uuid from 'uuid';
import { StesVmfEntscheidDTO } from '@shared/models/dtos-generated/stesVmfEntscheidDTO';
import * as moment from 'moment';
import { StesVmfStellungnahmeDTO } from '@shared/models/dtos-generated/stesVmfStellungnahmeDTO';
import { FormUtilsService } from '@app/shared';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { VermittlungsfaehigkeitDTO } from '@dtos/vermittlungsfaehigkeitDTO';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

@Injectable({
    providedIn: 'root'
})
export class StesVermittlungsfaehigkeitService {
    constructor(private formUtils: FormUtilsService, private dbTranslateService: DbTranslateService, private translateService: TranslateService) {}

    public createTreeTableForBearbeiten(sachverhalt: VermittlungsfaehigkeitDTO): TreeNodeInterface[] {
        const rows = [];

        if (!!sachverhalt.stellungnahmeList && sachverhalt.stellungnahmeList.length > 0) {
            sachverhalt.stellungnahmeList.sort(StesVermittlungsfaehigkeitService.orderByOldestErfassungsdatum);
            for (const stellungnahme of sachverhalt.stellungnahmeList) {
                rows.push({
                    id: uuid.v4(),
                    data: this.stellungMapper(stellungnahme),
                    children: []
                });
            }
        }

        if (!!sachverhalt.entscheidList && sachverhalt.entscheidList.length > 0) {
            rows.push(this.getEntscheidChain(sachverhalt.entscheidList));
        }

        return rows;
    }

    public createVmfTreeTableList(sachverhalte: VermittlungsfaehigkeitDTO[]): any[] {
        const vmfOutput = [];
        const rootElements: VermittlungsfaehigkeitDTO[] = sachverhalte.filter(item => StesVermittlungsfaehigkeitService.isParent(item));

        rootElements.forEach((aRoot: VermittlungsfaehigkeitDTO) => {
            const family = this.buildFamily(aRoot, sachverhalte);

            const hauptZeile = this.buildHauptzeile(family);
            const rootNode = this.sachverhaltTreeNodeMapper(aRoot);

            let members = family.slice(1).reverse();
            if (members.length > 0) {
                let parentNode = this.sachverhaltTreeNodeMapper(members[0]);
                hauptZeile.children.push(parentNode);
                members = members.length > 1 ? members.splice(1, members.length - 1) : [];

                for (const member of members) {
                    const childNode = this.sachverhaltTreeNodeMapper(member);
                    parentNode.children.push(childNode);
                    parentNode = childNode;
                }
                parentNode.children.push(rootNode);
            } else {
                hauptZeile.children.push(rootNode);
            }

            const notRootSachverhaltWithEntscheid = family.filter(sachverhalt => sachverhalt.entscheidNr !== aRoot.entscheidNr && sachverhalt.entscheidList.length > 0);
            const notRootSachverhaltWithStellungnahme = family.filter(sachverhalt => sachverhalt.entscheidNr !== aRoot.entscheidNr && sachverhalt.stellungnahmeList.length > 0);

            if (aRoot.stellungnahmeList && aRoot.stellungnahmeList.length) {
                aRoot.stellungnahmeList.sort(StesVermittlungsfaehigkeitService.orderByOldestErfassungsdatum);
                aRoot.stellungnahmeList.forEach(stellung => {
                    hauptZeile.children.push(this.getStellungnahme(stellung));
                });
            }

            if (notRootSachverhaltWithStellungnahme) {
                notRootSachverhaltWithStellungnahme.sort(StesVermittlungsfaehigkeitService.orderByOldestErfassungsdatum);
                notRootSachverhaltWithStellungnahme.forEach(stellung => {
                    stellung.stellungnahmeList.forEach(stell => {
                        hauptZeile.children.push(this.getStellungnahme(stell));
                    });
                });
            }

            if (aRoot.entscheidList && aRoot.entscheidList.length) {
                hauptZeile.children.push(this.getEntscheidChain(aRoot.entscheidList));
            }

            if (notRootSachverhaltWithEntscheid) {
                notRootSachverhaltWithEntscheid.forEach(sachverhalt => {
                    hauptZeile.children.push(this.getEntscheidChain(sachverhalt.entscheidList));
                });
            }

            vmfOutput.push(hauptZeile);
        });
        return vmfOutput.sort(StesVermittlungsfaehigkeitService.orderByNewestErfassungsdatum);
    }

    private static isParent(sachverhalt: VermittlungsfaehigkeitDTO) {
        return !sachverhalt.vorEntscheidObject;
    }

    private static orderByNewestErfassungsdatum(h1: TreeNodeInterface, h2: TreeNodeInterface): number {
        return moment(h2.data['erfassungsdatumDate']).isAfter(h1.data['erfassungsdatumDate']) ? 1 : -1;
    }

    private static orderByOldestErfassungsdatum(h1, h2): number {
        return moment(h1.erfassungsdatumDate).isBefore(h2.erfassungsdatumDate) ? -1 : 1;
    }

    private buildFamily(root: VermittlungsfaehigkeitDTO, data) {
        const family: VermittlungsfaehigkeitDTO[] = [root];

        let parent = root;
        while (parent.nachEntscheidObject) {
            const aChildObject = this.findChildren(data, parent);
            family.push(aChildObject);
            parent = aChildObject;
        }
        return family;
    }

    private findChildren(data, parent: VermittlungsfaehigkeitDTO): VermittlungsfaehigkeitDTO {
        return data.find(candidate => parent.nachEntscheidObject && candidate.sachverhaltId === parent.nachEntscheidObject.sachverhaltId);
    }

    private buildHauptzeile(family: VermittlungsfaehigkeitDTO[]): TreeNodeInterface {
        return {
            id: uuid.v4(),
            data: this.getHauptzeile(family),
            children: []
        };
    }

    private getHauptzeile(allSachverhalts: VermittlungsfaehigkeitDTO[]): VmfTableRow {
        const result = new VmfTableRow(null, null, null, null, null, null, null, null, null, null, null, null, null);

        const row = allSachverhalts[0];
        const rowStellungnahmeList = row.stellungnahmeList;
        const rowEntscheidList = row.entscheidList;
        const aktuellsteSachverhalt = this.getYoungsteSachverhalt(allSachverhalts);

        // BSP4
        this.checkBSP4(result, rowEntscheidList, allSachverhalts);

        if (rowStellungnahmeList.length === 0 && rowEntscheidList.length === 0) {
            // BSP5
            result.erfassungsdatum = this.formUtils.formatDateNgx(aktuellsteSachverhalt.erfasstAm, 'DD.MM.YYYY');
            result.erfassungsdatumDate = aktuellsteSachverhalt.erfasstAm;
            result.status = this.dbTranslateService.translate(aktuellsteSachverhalt.statusCode, 'text');
            result.frist = null;
        } else if (rowStellungnahmeList.length > 0 && rowEntscheidList.length === 0) {
            //BSP6
            const stellungnahme = this.getYoungsteStellungnahme(rowStellungnahmeList);
            result.erfassungsdatum = this.formUtils.formatDateNgx(stellungnahme.erfasstAm, 'DD.MM.YYYY');
            result.erfassungsdatumDate = stellungnahme.erfasstAm;
            result.status = this.getStellungnahmeStatus(stellungnahme);
            result.frist = this.formUtils.formatDateNgx(stellungnahme.stellungnahmeBis, 'DD.MM.YYYY');
        } else if (rowStellungnahmeList.length === 0 && rowEntscheidList.length > 0) {
            //BSP7
            const entscheid = this.getYoungsteEntscheid(rowEntscheidList);
            result.erfassungsdatum = this.formUtils.formatDateNgx(entscheid.erfasstAm, 'DD.MM.YYYY');
            result.erfassungsdatumDate = entscheid.erfasstAm;
            result.status = this.dbTranslateService.translate(entscheid.statusCode, 'text');
            result.frist = null;
        } else if (rowStellungnahmeList.length > 0 && rowEntscheidList.length > 0) {
            //BSP8, BSP9
            const entscheid = this.getYoungsteEntscheid(rowEntscheidList);
            const stellungnahme = this.getYoungsteStellungnahme(rowStellungnahmeList);
            this.checkBSP8AndBSP9(result, entscheid, stellungnahme);
        }

        // BSP10
        result.objekte = aktuellsteSachverhalt.grund;
        result.meldedatum = this.formUtils.formatDateNgx(aktuellsteSachverhalt.meldeDatum, 'DD.MM.YYYY');
        result.stesId = aktuellsteSachverhalt.stesIdAvam;

        return result;
    }

    private checkBSP4(result: any, rowEntscheidList: StesVmfEntscheidDTO[], allSachverhalts: VermittlungsfaehigkeitDTO[]) {
        if (rowEntscheidList.length > 0) {
            const entscheid = this.getYoungsteEntscheid(rowEntscheidList);
            result.entscheiddatum = this.formUtils.formatDateNgx(entscheid.entscheidDatum, 'DD.MM.YYYY');
            result.entscheid = this.getEntscheidEntscheid(entscheid);
            result.zeit = this.getInDerZeitVonBis(entscheid);
        } else {
            const sachverhalt = this.getYoungsteSachverhalt(allSachverhalts);
            result.entscheiddatum = this.formUtils.formatDateNgx(sachverhalt.entscheidDatum, 'DD.MM.YYYY');
            result.entscheid = this.getSachverhaltEntscheid(sachverhalt);
            result.zeit = null;
        }
    }

    private getYoungsteEntscheid(entscheidList: StesVmfEntscheidDTO[]) {
        const momentsEntscheidList = entscheidList.map(d => moment(d.erfasstAm));
        const maxEntscheidDate = moment.max(momentsEntscheidList);
        return entscheidList.find(v => moment(v.erfasstAm).isSame(maxEntscheidDate));
    }

    private getYoungsteStellungnahme(stellungnahmeList: StesVmfStellungnahmeDTO[]) {
        const momentsStellungnahme = stellungnahmeList.map(d => moment(d.erfasstAm));
        const maxStellungnahmeDate = moment.max(momentsStellungnahme);
        return stellungnahmeList.find(v => moment(v.erfasstAm).isSame(maxStellungnahmeDate));
    }

    private getYoungsteSachverhalt(allSachverhalts: VermittlungsfaehigkeitDTO[]) {
        const momentsSachverhalt = allSachverhalts.map(d => moment(d.erfasstAm));
        const maxSachverhaltDate = moment.max(momentsSachverhalt);
        return allSachverhalts.find(v => moment(v.erfasstAm).isSame(maxSachverhaltDate));
    }

    private getStellungnahmeStatus(stellungnahme: StesVmfStellungnahmeDTO) {
        return this.translateService.instant(
            stellungnahme.begruendungAkzeptiert === true
                ? 'stes.vermittlungsfaehigkeit.status.akzeptiert'
                : stellungnahme.begruendungAkzeptiert === false
                ? 'stes.vermittlungsfaehigkeit.status.abgelehnt'
                : 'stes.vermittlungsfaehigkeit.status.ausstehend'
        );
    }

    private checkBSP8AndBSP9(result: any, entscheid: StesVmfEntscheidDTO, stellungnahme: StesVmfStellungnahmeDTO) {
        const maxEntscheidDate = moment(entscheid.erfasstAm);
        const maxStellungnahmeDate = moment(stellungnahme.erfasstAm);

        //BSP8
        if (maxStellungnahmeDate.isAfter(maxEntscheidDate)) {
            result.erfassungsdatum = this.formUtils.formatDateNgx(stellungnahme.erfasstAm, 'DD.MM.YYYY');
            result.erfassungsdatumDate = stellungnahme.erfasstAm;
            result.status = this.getStellungnahmeStatus(stellungnahme);
            result.frist = this.formUtils.formatDateNgx(stellungnahme.stellungnahmeBis, 'DD.MM.YYYY');
        }

        //BSP9
        if (maxStellungnahmeDate.isBefore(maxEntscheidDate)) {
            result.erfassungsdatum = this.formUtils.formatDateNgx(entscheid.erfasstAm, 'DD.MM.YYYY');
            result.erfassungsdatumDate = entscheid.erfasstAm;
            result.status = this.dbTranslateService.translate(entscheid.statusCode, 'text');
            result.frist = null;
        }
    }

    private getEntscheidEntscheid(entscheid: StesVmfEntscheidDTO) {
        return this.translateService.instant(
            entscheid.istVermittlungsfaehig ? 'stes.vermittlungsfaehigkeit.status.vermittlungsfaehig' : 'stes.vermittlungsfaehigkeit.status.nichtvermittlungsfaehig'
        );
    }

    private getSachverhaltEntscheid(sachverhalt: VermittlungsfaehigkeitDTO) {
        return this.translateService.instant(
            sachverhalt.ueberpruefung ? 'stes.vermittlungsfaehigkeit.status.ueberpruefen' : 'stes.vermittlungsfaehigkeit.status.nichtueberpruefen'
        );
    }

    private getInDerZeitVonBis(entscheid: StesVmfEntscheidDTO) {
        if (!entscheid.vermittlungsfaehigBis && !entscheid.vermittlungsfaehigVon) {
            return '';
        } else if (!entscheid.vermittlungsfaehigBis) {
            return `${this.formUtils.formatDateNgx(entscheid.vermittlungsfaehigVon, 'DD.MM.YYYY')}`;
        }
        return `${this.formUtils.formatDateNgx(entscheid.vermittlungsfaehigVon, 'DD.MM.YYYY')} - ${this.formUtils.formatDateNgx(entscheid.vermittlungsfaehigBis, 'DD.MM.YYYY')}`;
    }

    private sachverhaltTreeNodeMapper(sachverhalt: VermittlungsfaehigkeitDTO): TreeNodeInterface {
        return {
            id: uuid.v4(),
            data: this.sachverhaltMapper(sachverhalt),
            children: []
        };
    }

    private sachverhaltMapper(row: VermittlungsfaehigkeitDTO): VmfTableRow {
        return new VmfTableRow(
            row.sachverhaltId,
            null,
            this.translateService.instant('stes.vermittlungsfaehigkeit.objekte.sachverhalt', { '0': row.entscheidNr.toString() }), // objekte
            this.formUtils.formatDateNgx(row.erfasstAm, 'DD.MM.YYYY'),
            this.formUtils.formatDateNgx(row.meldeDatum, 'DD.MM.YYYY'),
            this.dbTranslateService.translate(row.statusCode, 'text'), // status
            null,
            this.formUtils.formatDateNgx(row.entscheidDatum, 'DD.MM.YYYY'),
            this.getSachverhaltEntscheid(row), // entscheid
            null,
            null,
            'SACHVERHALT',
            row.erfasstAm
        );
    }

    private getStellungnahme(stellung: any) {
        const stellungChild: TreeNodeInterface = {
            id: uuid.v4(),
            data: this.stellungMapper(stellung),
            children: []
        };
        return stellungChild;
    }

    private stellungMapper(row: StesVmfStellungnahmeDTO): VmfTableRow {
        return new VmfTableRow(
            row.stellungnahmeId,
            row.vmfId,
            this.translateService.instant('stes.vermittlungsfaehigkeit.objekte.stellungnahme'), // objekte
            this.formUtils.formatDateNgx(row.erfasstAm, 'DD.MM.YYYY'), // erfassungsdatum
            null, // meldedatum
            this.getStellungnahmeStatus(row),
            this.formUtils.formatDateNgx(row.stellungnahmeBis, 'DD.MM.YYYY'), // frist
            null,
            null,
            null,
            null,
            'STELLUNGNAHME',
            row.erfasstAm
        );
    }

    private entscheidMapper(row: StesVmfEntscheidDTO): VmfTableRow {
        return new VmfTableRow(
            row.entscheidVmfId,
            row.vmfId,
            this.translateService.instant('stes.vermittlungsfaehigkeit.objekte.entscheid', { '0': row.entscheidNr.toString() }), //objekte
            this.formUtils.formatDateNgx(row.erfasstAm, 'DD.MM.YYYY'),
            null,
            this.dbTranslateService.translate(row.statusCode, 'text'),
            null,
            this.formUtils.formatDateNgx(row.entscheidDatum, 'DD.MM.YYYY'),
            this.getEntscheidEntscheid(row),
            this.getInDerZeitVonBis(row),
            null,
            'ENTSCHEID',
            row.erfasstAm
        );
    }

    private getEntscheidChain(entscheidList: StesVmfEntscheidDTO[]): TreeNodeInterface {
        const lastEntscheid = entscheidList.find(item => !item.vorgEntscheid && !item.nachfEntscheid);
        let result: TreeNodeInterface = {
            id: uuid.v4(),
            data: this.entscheidMapper(lastEntscheid),
            children: []
        };

        let parentEntscheid = this.getParentEntscheid(entscheidList, lastEntscheid);
        while (!!parentEntscheid) {
            result = {
                id: uuid.v4(),
                data: this.entscheidMapper(parentEntscheid),
                children: [result]
            };
            parentEntscheid = this.getParentEntscheid(entscheidList, parentEntscheid);
        }

        return result;
    }

    private getParentEntscheid(entscheidList: StesVmfEntscheidDTO[], entscheid: StesVmfEntscheidDTO) {
        return entscheidList.find(candidate => candidate.vorEntscheidId && candidate.vorEntscheidId === entscheid.entscheidVmfId);
    }
}

class VmfTableRow {
    constructor(
        public id: number,
        public parentId: number,
        public objekte: string,
        public erfassungsdatum: string,
        public meldedatum: string,
        public status: string,
        public frist: string,
        public entscheiddatum: string,
        public entscheid: string,
        public zeit: string,
        public stesId: string,
        public type: string,
        public erfassungsdatumDate: Date
    ) {}
}

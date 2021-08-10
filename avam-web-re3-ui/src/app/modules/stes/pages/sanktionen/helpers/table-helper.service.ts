import { Injectable } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { SanktionSachverhaltDTO } from '@dtos/sanktionSachverhaltDTO';
import * as moment from 'moment';
import * as uuid from 'uuid';
import { StellungnahmeSanktionDTO } from '@dtos/stellungnahmeSanktionDTO';
import { EntscheidSanktionDTO } from '@dtos/entscheidSanktionDTO';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

@Injectable({
    providedIn: 'root'
})
export class TableHelperService {
    constructor(private formUtils: FormUtilsService, private translateService: TranslateService, private dbTranslateService: DbTranslateService) {}

    public buildRows(data: SanktionSachverhaltDTO) {
        const stellungnahmeChildRows: SanktionenTableRow[] = [];
        let entscheidChildRow: SanktionenTableRow = null;
        const newestStellungnahme = this.getNewestStellungnahmeDTO(data.stellungnahmeList);
        if (newestStellungnahme) {
            this.buildStellungnahmeChildRows(data.stellungnahmeList, stellungnahmeChildRows, data.sanktionSachverhalt.sachverhaltTypID);
        }
        const newestEntscheid = this.getActualEntscheidDTO(data.entscheidList);
        if (newestEntscheid) {
            entscheidChildRow = this.buildEntscheidRow(newestEntscheid, data);
            return [...stellungnahmeChildRows, entscheidChildRow];
        }

        return [...stellungnahmeChildRows];
    }

    public generateTableRows(sanktionen: SanktionSachverhaltDTO[]): TreeNodeInterface[] {
        moment.locale(this.dbTranslateService.getCurrentLang());
        const rows: TreeNodeInterface[] = [];

        for (const sachverhalt of sanktionen) {
            rows.push(this.buildHeaderRow(sachverhalt));
        }

        return rows.sort(this.orderHeaderByYoungestErfassungsdatum);
    }

    private orderHeaderByYoungestErfassungsdatum(h1: SanktionenTableRow, h2: SanktionenTableRow): number {
        return h1.data.originalErfassung > h2.data.originalErfassung ? -1 : 1;
    }

    private buildHeaderRow(dto: SanktionSachverhaltDTO): SanktionenTableRow {
        const stellungnahmeChildRows: SanktionenTableRow[] = [];
        let entscheidChildRow: SanktionenTableRow = null;

        const newestStellungnahme = this.getNewestStellungnahmeDTO(dto.stellungnahmeList);
        if (newestStellungnahme) {
            this.buildStellungnahmeChildRows(dto.stellungnahmeList, stellungnahmeChildRows, dto.sanktionSachverhalt.sachverhaltTypID);
        }
        const newestEntscheid = this.getActualEntscheidDTO(dto.entscheidList);
        if (newestEntscheid) {
            entscheidChildRow = this.buildEntscheidRow(newestEntscheid, dto);
        }

        const data = this.buildBSPAndDataRow(dto, newestStellungnahme, newestEntscheid, dto.stellungnahmeList || [], dto.entscheidList || []);
        const row = new SanktionenTableRow(data);
        row.children.push(this.buildSachverhaltRow(dto));

        if (stellungnahmeChildRows.length > 0) {
            row.children.push(...stellungnahmeChildRows);
        }
        if (entscheidChildRow != null) {
            row.children.push(entscheidChildRow);
        }

        return row;
    }

    private buildBSPAndDataRow(
        dto: SanktionSachverhaltDTO,
        newestStellungnahme: StellungnahmeSanktionDTO,
        newestEntscheid: EntscheidSanktionDTO,
        auxStellungnahmeList: StellungnahmeSanktionDTO[],
        auxEntscheidList: EntscheidSanktionDTO[]
    ): SanktionenDataRow {
        let auxErfasssungsdatum = null;
        let auxStatus = null;
        let auxFrist = null;

        if (auxStellungnahmeList.length === 0 && auxEntscheidList.length === 0) {
            //BSP4
            auxErfasssungsdatum = dto.sanktionSachverhalt.erfasstAm;
        } else if (auxStellungnahmeList.length > 0 && auxEntscheidList.length === 0) {
            //BSP5
            auxErfasssungsdatum = newestStellungnahme.erfasstAm;
            auxStatus = this.getStellungnahmeStatus(newestStellungnahme);
            auxFrist = newestStellungnahme.stellungnahmeBis;
        } else if (auxStellungnahmeList.length === 0 && auxEntscheidList.length > 0) {
            //BSP6
            auxErfasssungsdatum = newestEntscheid.erfasstAm;
            auxStatus = this.dbTranslateService.translate(newestEntscheid.entscheidStatusObject, 'text');
        } else if (auxStellungnahmeList.length > 0 && auxEntscheidList.length > 0) {
            const maxStellungnahmeDate = moment(newestStellungnahme.erfasstAm);
            const maxEntscheidDate = moment(newestEntscheid.erfasstAm);

            if (maxStellungnahmeDate.isAfter(maxEntscheidDate)) {
                //BSP7
                auxErfasssungsdatum = newestStellungnahme.erfasstAm;
                auxStatus = this.getStellungnahmeStatus(newestStellungnahme);
                auxFrist = newestStellungnahme.stellungnahmeBis;
            } else {
                //BSP8
                auxErfasssungsdatum = newestEntscheid.erfasstAm;
                auxStatus = this.dbTranslateService.translate(newestEntscheid.entscheidStatusObject, 'text');
            }
        }

        return this.buildDataRow(dto, newestEntscheid, auxErfasssungsdatum, auxStatus, auxFrist);
    }

    private buildDataRow(dto: SanktionSachverhaltDTO, newestEntscheid: EntscheidSanktionDTO, auxErfasssungsdatum: Date, auxStatus: string, auxFrist: Date): SanktionenDataRow {
        return new SanktionenDataRow(
            null,
            null,
            this.dbTranslateService.translate(dto.sachverhaltGrund, 'text'), // BSP9
            this.formUtils.formatDateNgx(dto.sanktionSachverhalt.datumKontrollPeriode, FormUtilsService.GUI_MONTH_DATE_FORMAT), //BSP9
            auxErfasssungsdatum ? this.formUtils.formatDateNgx(auxErfasssungsdatum, FormUtilsService.GUI_DATE_FORMAT) : null,
            auxStatus,
            auxFrist ? this.formUtils.formatDateNgx(auxFrist, FormUtilsService.GUI_DATE_FORMAT) : null,
            newestEntscheid ? this.formUtils.formatDateNgx(newestEntscheid.entscheidDatum, FormUtilsService.GUI_DATE_FORMAT) : null, //BSP3
            newestEntscheid ? newestEntscheid.einstelltage : null, //BSP3
            newestEntscheid ? this.formUtils.formatDateNgx(newestEntscheid.datumEinstellungsBeginn, FormUtilsService.GUI_DATE_FORMAT) : null, //BSP3
            dto.sanktionSachverhalt.stesIdAvam,
            null,
            null,
            auxErfasssungsdatum
        );
    }

    private getNewestStellungnahmeDTO(stellungnahmeList: StellungnahmeSanktionDTO[]): StellungnahmeSanktionDTO {
        let actualStellungnahme = null;
        if (!!stellungnahmeList && stellungnahmeList.length > 0) {
            stellungnahmeList.sort(this.orderByYoungestErfassungsdatum);
            actualStellungnahme = stellungnahmeList[0];
        }
        return actualStellungnahme;
    }

    private buildStellungnahmeChildRows(stellungnahmeList: StellungnahmeSanktionDTO[], stellungnahmeChildRows: SanktionenTableRow[], sanktionType: number): void {
        for (const stellungnahme of stellungnahmeList) {
            stellungnahmeChildRows.push(this.buildStellungnahmeRow(stellungnahme, sanktionType));
        }
    }

    private getActualEntscheidDTO(entscheidList: EntscheidSanktionDTO[]): EntscheidSanktionDTO {
        let actualEntscheid = null;
        if (!!entscheidList && entscheidList.length > 0) {
            entscheidList.sort(this.orderByYoungestErfassungsdatum);
            actualEntscheid = entscheidList[0];
        }
        return actualEntscheid;
    }

    private orderByYoungestErfassungsdatum(h1, h2): number {
        return moment(h1.erfasstAm).isAfter(h2.erfasstAm) ? -1 : 1;
    }

    private buildSachverhaltRow(dto: SanktionSachverhaltDTO): SanktionenTableRow {
        const data = new SanktionenDataRow(
            dto.sanktionSachverhalt.sachverhaltID,
            null,
            this.translateService.instant('stes.label.sachverhalt'), // objekte
            this.formUtils.formatDateNgx(dto.sanktionSachverhalt.datumKontrollPeriode, FormUtilsService.GUI_MONTH_DATE_FORMAT),
            this.formUtils.formatDateNgx(dto.sanktionSachverhalt.erfasstAm, FormUtilsService.GUI_DATE_FORMAT), // erfassungsdatum
            null,
            null,
            null,
            null,
            null,
            null,
            'SACHVERHALT',
            dto.sanktionSachverhalt.sachverhaltTypID,
            dto.sanktionSachverhalt.erfasstAm
        );
        return new SanktionenTableRow(data);
    }

    private buildStellungnahmeRow(stellungnahmeDto: StellungnahmeSanktionDTO, sanktionType: number): SanktionenTableRow {
        const data = new SanktionenDataRow(
            stellungnahmeDto.stellungnahmeId,
            stellungnahmeDto.sachverhaltId,
            this.translateService.instant('stes.vermittlungsfaehigkeit.objekte.stellungnahme'), // objekte
            null,
            this.formUtils.formatDateNgx(stellungnahmeDto.erfasstAm, FormUtilsService.GUI_DATE_FORMAT), // erfassungsdatum
            this.getStellungnahmeStatus(stellungnahmeDto),
            this.formUtils.formatDateNgx(stellungnahmeDto.stellungnahmeBis, FormUtilsService.GUI_DATE_FORMAT), // frist
            null,
            null,
            null,
            null,
            'STELLUNGNAHME',
            sanktionType,
            stellungnahmeDto.erfasstAm
        );
        return new SanktionenTableRow(data);
    }

    private buildEntscheidRow(entscheidDto: EntscheidSanktionDTO, dto: SanktionSachverhaltDTO): SanktionenTableRow {
        const data = new SanktionenDataRow(
            entscheidDto.entscheidSanktionId,
            entscheidDto.sachverhaltId,
            this.translateService.instant('stes.vermittlungsfaehigkeit.objekte.entscheid', { '0': entscheidDto.entscheidNr.toString() }), //objekte
            null,
            this.formUtils.formatDateNgx(entscheidDto.erfasstAm, FormUtilsService.GUI_DATE_FORMAT), // erfassungsdatum
            this.dbTranslateService.translate(entscheidDto.entscheidStatusObject, 'text'),
            null,
            this.formUtils.formatDateNgx(entscheidDto.entscheidDatum, FormUtilsService.GUI_DATE_FORMAT), // entscheiddatum
            entscheidDto.einstelltage,
            this.formUtils.formatDateNgx(entscheidDto.datumEinstellungsBeginn, FormUtilsService.GUI_DATE_FORMAT), // entscheiddatum
            null,
            'ENTSCHEID',
            dto.sanktionSachverhalt.sachverhaltTypID,
            entscheidDto.erfasstAm
        );
        const row = new SanktionenTableRow(data);
        if (!!entscheidDto.vorEntscheidId) {
            const vorgaengerEntscheid = dto.entscheidList.find(element => element.entscheidSanktionId === entscheidDto.vorEntscheidId);
            if (vorgaengerEntscheid) {
                row.children.push(this.buildEntscheidRow(vorgaengerEntscheid, dto));
            }
        }
        return row;
    }

    private getStellungnahmeStatus(stellungnahme: StellungnahmeSanktionDTO): string {
        return this.translateService.instant(
            stellungnahme.begruendungAkzeptiert === true
                ? 'stes.vermittlungsfaehigkeit.status.akzeptiert'
                : stellungnahme.begruendungAkzeptiert === false
                ? 'stes.vermittlungsfaehigkeit.status.abgelehnt'
                : 'stes.vermittlungsfaehigkeit.status.ausstehend'
        );
    }
}

class SanktionenDataRow {
    constructor(
        public id: number,
        public parentId: number,
        public objekte: string,
        public kontrollperiode: string,
        public erfassungsdatum: string,
        public status: string,
        public frist: string,
        public entscheiddatum: string,
        public einstelltage: number,
        public einstellungsbeginn: string,
        public stesId: string,
        public type: string,
        public sanktionType: number,
        public originalErfassung: Date
    ) {}
}

class SanktionenTableRow implements TreeNodeInterface {
    children: TreeNodeInterface[];
    id: string;

    constructor(public data: SanktionenDataRow) {
        this.id = uuid.v4();
        this.children = [];
    }
}

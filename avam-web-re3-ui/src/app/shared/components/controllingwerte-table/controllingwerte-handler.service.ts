import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { FormUtilsService } from '@app/shared';
import { AufteilungBudgetjahrDTO } from '@app/shared/models/dtos-generated/aufteilungBudgetjahrDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { KantonDTO } from '@app/shared/models/dtos-generated/kantonDTO';
import * as uuid from 'uuid';
import { ControllingwerteReactiveFormsService } from './controllingwerte-reactive-forms.service';
import { FacadeService } from '@shared/services/facade.service';

export enum CtrlTableRowTypes {
    JAHR = 'JAHR',
    GELDGEBER = 'GELDGEBER'
}
export interface CtrlwerteTableData {
    ctrlwerte: CtrlwerteTableDataRow[];
    kantone: KantonDTO[];
    kostenverteilschluessel: CodeDTO[];
    institution: CodeDTO[];
    panelFormData?: CtrlwertePanelFormData;
    enabledFields?: boolean;
    disableKostenverteilschluesselChecks?: boolean;
    supportNegativeChf?: boolean;
    geldgeberRequired?: boolean;
}

export interface CtrlwerteTableDataRow {
    tableId: string;
    id: number;
    jahrOrGeldgeber: string | CodeDTO;
    kanton: KantonDTO;
    chf: number;
    tnTage: number;
    teilnehmer: number;
    prozent: number;
    rowType: CtrlTableRowTypes;
    editable: boolean;
    newEntry: boolean;
    institutionOptions: any[];
}

export interface CtrlwertePanelFormData {
    kostenverteilschluessel: CodeDTO;
    showAWKosten?: boolean;
    anrechenbareKosten?: number;
    alvRelevanteKosten?: number;
}

@Injectable()
export class ControllingwerteHandlerService {
    constructor(public reactiveForms: ControllingwerteReactiveFormsService, private facade: FacadeService) {}

    mapKantonDropdown(items: KantonDTO[]) {
        return items.map(item => {
            return {
                value: item.kantonsKuerzel,
                codeId: item.kantonsKuerzel,
                labelFr: item.kantonsKuerzel,
                labelIt: item.kantonsKuerzel,
                labelDe: item.kantonsKuerzel,
                code: item.kantonsKuerzel
            };
        });
    }

    getRowDefaultValues(institutionOptions: any[]): CtrlwerteTableDataRow {
        const defRowelement: CtrlwerteTableDataRow = {
            tableId: uuid.v4(),
            id: null,
            jahrOrGeldgeber: '',
            kanton: null,
            chf: null,
            tnTage: null,
            teilnehmer: null,
            prozent: null,
            rowType: CtrlTableRowTypes.GELDGEBER,
            editable: true,
            newEntry: true,
            institutionOptions
        };
        return defRowelement;
    }

    mapToForm(data: CtrlwertePanelFormData) {
        return {
            kostenverteilschluessel: data.kostenverteilschluessel.codeId,
            anrechenbareKosten: data.anrechenbareKosten,
            alvRelevanteKosten: data.alvRelevanteKosten
        };
    }

    createTableData(data: AufteilungBudgetjahrDTO, institutions: CodeDTO[]): CtrlwerteTableDataRow[] {
        const instituionOptions = this.facade.formUtilsService.mapDropdownKurztext(institutions);
        const rows: CtrlwerteTableDataRow[] = [];
        rows.push({
            tableId: uuid.v4(),
            id: data.aufteilungBudgetjahrId,
            jahrOrGeldgeber: String(data.budgetjahr),
            kanton: { kantonsKuerzel: 'dummy' },
            chf: data.wertTripelBudjetjahr.chfBetrag,
            tnTage: data.wertTripelBudjetjahr.teilnehmerTage,
            teilnehmer: data.wertTripelBudjetjahr.teilnehmer,
            prozent: data.wertTripelBudjetjahr.prozent,
            rowType: CtrlTableRowTypes.JAHR,
            editable: false,
            newEntry: false,
            institutionOptions: []
        });
        data.aufteilungenGeldgeber.forEach(element => {
            rows.push({
                tableId: uuid.v4(),
                id: element.aufteilungGeldgeberId || null,
                jahrOrGeldgeber: element.institutionObject,
                kanton: element.kantonObject,
                chf: element.wertTripelGeldgeberObject.chfBetrag,
                tnTage: element.wertTripelGeldgeberObject.teilnehmerTage,
                teilnehmer: element.wertTripelGeldgeberObject.teilnehmer,
                prozent: element.wertTripelGeldgeberObject.prozent,
                rowType: CtrlTableRowTypes.GELDGEBER,
                editable: !element.undeleteAble,
                newEntry: element.aufteilungGeldgeberId <= 0,
                institutionOptions: this.mapInstitutionsForBERows(element.institutionObject, instituionOptions)
            });
        });
        return rows;
    }

    mapInstitutionsForBERows(curInstitution: CodeDTO, institutions: any[]): any[] {
        return institutions.some(el => el.codeId === curInstitution.codeId)
            ? institutions
            : institutions.concat(this.facade.formUtilsService.mapDropdownKurztext([curInstitution]));
    }

    getKostenverteilschluesselCode(codeId: string, domainList: CodeDTO[]): string {
        return this.facade.formUtilsService.getCodeByCodeId(domainList, codeId);
    }

    mergeDataForBE(beTableData: AufteilungBudgetjahrDTO, formArray: FormArray, institutionDomainList: CodeDTO[]): AufteilungBudgetjahrDTO {
        let ggNewId = -1;
        const returnData = JSON.parse(JSON.stringify(beTableData));
        const tableRows = formArray;
        for (const rowControl of tableRows.controls) {
            const cwRow = rowControl.value;
            if (cwRow.newEntry && cwRow.rowType === CtrlTableRowTypes.GELDGEBER) {
                returnData.aufteilungenGeldgeber.push({
                    aufteilungGeldgeberId: ggNewId,
                    kantonObject: { kantonsKuerzel: cwRow.kanton },
                    institutionObject: institutionDomainList.filter(institution => {
                        return institution.codeId === Number(cwRow.jahrOrGeldgeber);
                    })[0],
                    wertTripelGeldgeberObject: {
                        teilnehmer: +cwRow.teilnehmer,
                        teilnehmerTage: +cwRow.tnTage,
                        chfBetrag: rowControl.get('chf').value,
                        prozent: +rowControl.get('prozent').value
                    }
                });
                ggNewId = ggNewId - 1;
            } else {
                returnData.aufteilungenGeldgeber.forEach(element => {
                    if (element.aufteilungGeldgeberId === cwRow.id && cwRow.rowType === CtrlTableRowTypes.GELDGEBER) {
                        element.wertTripelGeldgeberObject.chfBetrag = rowControl.get('chf').value;
                        element.wertTripelGeldgeberObject.teilnehmer = cwRow.teilnehmer;
                        element.wertTripelGeldgeberObject.teilnehmerTage = cwRow.tnTage;
                        element.wertTripelGeldgeberObject.prozent = +rowControl.get('prozent').value;
                        if (cwRow.editable) {
                            element.kantonObject = { kantonsKuerzel: cwRow.kanton };
                            element.institutionObject = institutionDomainList.filter(institution => {
                                return institution.codeId === Number(cwRow.jahrOrGeldgeber);
                            })[0];
                        }
                    }
                });
            }
        }
        return returnData;
    }
}

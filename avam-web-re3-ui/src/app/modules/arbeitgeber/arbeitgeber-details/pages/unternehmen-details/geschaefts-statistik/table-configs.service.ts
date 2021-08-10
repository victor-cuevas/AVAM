import { Injectable } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { FormUtilsService } from '@app/shared';
import { ArbeitgeberGeschaeftsgangDTO } from '@dtos/arbeitgeberGeschaeftsgangDTO';
import { Observable, of } from 'rxjs';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages } from '@dtos/baseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages';
import { ArbeitgeberGeschaeftsgangDetailDTO } from '@dtos/arbeitgeberGeschaeftsgangDetailDTO';
import { Permissions } from '@shared/enums/permissions.enum';
import { AuthenticationService } from '@core/services/authentication.service';
import { StesSearchRestService } from '@core/http/stes-search-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';

@Injectable({
    providedIn: 'root'
})
export class TableConfigsService {
    private ravTableConfig = {
        columns: [
            {
                columnDef: 'meldedatung',
                header: 'arbeitgeber.oste.label.meldedatum',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.anmeldedatum, FormUtilsService.GUI_DATE_FORMAT)}`
            },
            { columnDef: 'stelleNr', header: 'arbeitgeber.label.stellennr', cell: (element: any) => `${element.stelleNr}` },
            { columnDef: 'stellenBezeichnung', header: 'arbeitgeber.label.stellenbezeichnung', cell: (element: any) => `${element.stellenBezeichnung}` },
            { columnDef: 'arbeitsort', header: 'arbeitgeber.oste.label.arbeitsort', cell: (element: any) => `${element.arbeitsort}` },
            { columnDef: 'beschaeftigungsGrad', header: 'stes.label.beschaeftigungsgrad', cell: (element: any) => `${element.beschaeftigungsGrad}` },
            { columnDef: 'vermittlungen', header: 'arbeitgeber.oste.label.zuweisungen', cell: (element: any) => `${element.vermittlungen}` },
            {
                columnDef: 'abmeldedatum',
                header: 'stes.label.abmeldedatum',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.abmeldedatum, FormUtilsService.GUI_DATE_FORMAT)}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'abmeldedatum',
            sortOrder: -1,
            displayedColumns: []
        },
        toolboxConfig: [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)]
    };
    private zwischenverdienstTableConfig = {
        columns: [
            { columnDef: 'name', header: 'common.label.name', cell: (element: any) => `${element.name}` },
            { columnDef: 'vorname', header: 'common.label.vorname', cell: (element: any) => `${element.vorname}` },
            { columnDef: 'benutzerstelle', header: 'common.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle}` },
            { columnDef: 'stesID', header: 'arbeitgeber.label.stesId', cell: (element: any) => `${element.stesID}` },
            {
                columnDef: 'datumVon',
                header: 'arbeitgeber.label.datumvon',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.datumVon, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'datumBis',
                header: 'arbeitgeber.label.datumbis',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.datumBis, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            { columnDef: 'berufTaetigkeit', header: 'arbeitgeber.oste.label.beruftaetigkeit', cell: (element: any) => `${element.berufTaetigkeit}` },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'datumVon',
            sortOrder: -1,
            displayedColumns: []
        }
    };
    private neuerArbeitgeberPermissions = [Permissions.STES_SUCHEN_SICHTEN, Permissions.SOZIALHILFESTELLEN_STES_SUCHEN_SICHTEN];
    private neuerArbeitgeberConfig = {
        columns: [
            { columnDef: 'name', header: 'common.label.name', cell: (element: any) => `${element.name}` },
            { columnDef: 'vorname', header: 'common.label.vorname', cell: (element: any) => `${element.vorname}` },
            { columnDef: 'benutzerstelle', header: 'common.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle}` },
            { columnDef: 'stesID', header: 'arbeitgeber.label.stesId', cell: (element: any) => `${element.stesID}` },
            {
                columnDef: 'abmeldedatum',
                header: 'stes.label.abmeldedatum',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.abmeldedatum, FormUtilsService.GUI_DATE_FORMAT)}`
            },
            { columnDef: 'berufTaetigkeit', header: 'arbeitgeber.oste.label.beruftaetigkeit', cell: (element: any) => `${element.berufTaetigkeit}` },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'abmeldedatum',
            sortOrder: -1,
            displayedColumns: [],
            disabledButtonRow: !this.checkAnyPermissions(this.neuerArbeitgeberPermissions)
        }
    };
    private letzterArbeitgeberTableConfig = {
        columns: [
            { columnDef: 'name', header: 'common.label.name', cell: (element: any) => `${element.name}` },
            { columnDef: 'vorname', header: 'common.label.vorname', cell: (element: any) => `${element.vorname}` },
            { columnDef: 'benutzerstelle', header: 'common.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle}` },
            { columnDef: 'stesID', header: 'arbeitgeber.label.stesId', cell: (element: any) => `${element.stesID}` },
            {
                columnDef: 'anmeldedatum',
                header: 'stes.label.anmeldedatum',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.anmeldedatum, FormUtilsService.GUI_DATE_FORMAT)}`
            },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'anmeldedatum',
            sortOrder: -1,
            displayedColumns: []
        }
    };
    // Used both for Einarbeitungszuschuss, Ausbildungszuschuss, Berufspraktika and Ausbildungspraktika anzeigen
    private zuschussPraktikaPermissions = [Permissions.AMM_NUTZUNG_MASSNAHME_SICHTEN, Permissions.FEATURE_32];
    private zuschussPraktikaTableConfig = {
        columns: [
            { columnDef: 'name', header: 'common.label.name', cell: (element: any) => `${element.name}` },
            { columnDef: 'vorname', header: 'common.label.vorname', cell: (element: any) => `${element.vorname}` },
            { columnDef: 'benutzerstelle', header: 'common.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle}` },
            { columnDef: 'stesID', header: 'arbeitgeber.label.stesId', cell: (element: any) => `${element.stesID}` },
            {
                columnDef: 'datumVon',
                header: 'arbeitgeber.label.datumvon',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.datumVon, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'datumBis',
                header: 'arbeitgeber.label.datumbis',
                cell: (element: any) => `${this.formUtils.formatDateNgx(element.datumBis, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            { columnDef: 'entscheidNr', header: 'common.label.entscheidnr', cell: (element: any) => `${element.entscheidNr}` },
            { columnDef: 'berufTaetigkeit', header: 'arbeitgeber.oste.label.beruftaetigkeit', cell: (element: any) => `${element.berufTaetigkeit || ''}` },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'datumVon',
            sortOrder: -1,
            displayedColumns: [],
            disabledButtonRow: !this.checkAllPermissions(this.zuschussPraktikaPermissions)
        }
    };

    constructor(
        private formUtils: FormUtilsService,
        private stesRestService: StesSearchRestService,
        private unternehmenRestService: UnternehmenRestService,
        private dbTranslateService: DbTranslateService,
        private authService: AuthenticationService
    ) {}

    public getModalConfigs() {
        return this.setTableConfigs();
    }

    public getModalObservable(
        statistics: ArbeitgeberGeschaeftsgangDTO,
        id: string,
        startDate: string,
        endDate: string,
        locale: string
    ): Observable<BaseResponseWrapperListArbeitgeberGeschaeftsgangDetailDTOWarningMessages>[] {
        const observableArray = [];
        observableArray.push(+statistics.besetztRav ? this.unternehmenRestService.getRAVStellenangebote(id, startDate, endDate) : of(null));
        observableArray.push(+statistics.zwischenverdienst ? this.unternehmenRestService.getStesZwischenverdienst(id, startDate, endDate, locale) : of(null));
        observableArray.push(+statistics.angestellt ? this.unternehmenRestService.getNeuerArbeitsgeber(id, startDate, endDate, locale) : of(null));
        observableArray.push(+statistics.betrieb ? this.unternehmenRestService.getStesLetzterArbeitgeber(id, startDate, endDate, locale) : of(null));
        observableArray.push(+statistics.einarbeitung ? this.unternehmenRestService.getEinarbeitungZuschuss(id, startDate, endDate, locale) : of(null));
        observableArray.push(+statistics.ausbildung ? this.unternehmenRestService.getAusbildungsZuschuss(id, startDate, endDate, locale) : of(null));
        observableArray.push(+statistics.praktika ? this.unternehmenRestService.getBerufspraktika(id, startDate, endDate, locale) : of(null));
        observableArray.push(+statistics.ausbildungsPraktika ? this.unternehmenRestService.getAusbildungsPraktika(id, startDate, endDate, locale) : of(null));
        return observableArray;
    }

    public createRAVStellenangeboteRow(row: ArbeitgeberGeschaeftsgangDetailDTO) {
        return {
            anmeldedatum: row.osteAnmeldeDatum,
            stelleNr: row.stellenNummer,
            stellenBezeichnung: row.stellenBezeichnung,
            arbeitsort: !!row.arbeitsort ? this.dbTranslateService.translate(row.arbeitsort, 'ort') : row.arbeitsortAuslandOrt,
            beschaeftigungsGrad: row.beschaeftigung,
            vermittlungen: row.anzahlZuweisungen,
            abmeldedatum: row.abmeldeDatum,
            dto: row
        };
    }

    public sortAndCreateZwischenverdienstRow(neuerArbeitgeberData: ArbeitgeberGeschaeftsgangDetailDTO[]) {
        neuerArbeitgeberData.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        return neuerArbeitgeberData.map(row => this.createZwischenverdienstRow(row));
    }

    public sortAndCreateNeuArbeitgeberRow(neuerArbeitgeberData: ArbeitgeberGeschaeftsgangDetailDTO[]) {
        neuerArbeitgeberData.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        return neuerArbeitgeberData.map(row => this.createNeuerArbeitgeberRow(row));
    }

    public sortAndCreateLetztArbeitgeberRow(neuerArbeitgeberData: ArbeitgeberGeschaeftsgangDetailDTO[]) {
        neuerArbeitgeberData.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        return neuerArbeitgeberData.map(row => this.createLetzterArbeitgeberRow(row));
    }

    public sortAndCreateZuschussPraktikaRow(einarbeitungZuschussData: ArbeitgeberGeschaeftsgangDetailDTO[]) {
        einarbeitungZuschussData.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        return einarbeitungZuschussData.map(row => this.createZuschussPraktikaRow(row));
    }

    private createZwischenverdienstRow(row: ArbeitgeberGeschaeftsgangDetailDTO) {
        return {
            name: row.name,
            vorname: row.vorname,
            benutzerstelle: row.benutzerstelle,
            stesID: row.stesId,
            datumVon: row.dateVon,
            datumBis: row.dateBis,
            berufTaetigkeit: row.berufTaetigkeit || '',
            dto: row
        };
    }

    private createNeuerArbeitgeberRow(row: ArbeitgeberGeschaeftsgangDetailDTO) {
        return {
            name: row.name,
            vorname: row.vorname,
            benutzerstelle: row.benutzerstelle,
            stesID: row.stesId,
            abmeldedatum: row.abmeldeDatum,
            berufTaetigkeit: row.berufTaetigkeit || '',
            dto: row
        };
    }

    private createLetzterArbeitgeberRow(row: ArbeitgeberGeschaeftsgangDetailDTO) {
        return {
            name: row.name,
            vorname: row.vorname,
            benutzerstelle: row.benutzerstelle,
            stesID: row.stesId,
            anmeldedatum: row.anmeldeDatum,
            dto: row
        };
    }

    private createZuschussPraktikaRow(row: ArbeitgeberGeschaeftsgangDetailDTO) {
        return {
            name: row.name,
            vorname: row.vorname,
            benutzerstelle: row.benutzerstelle,
            stesID: row.stesId,
            datumVon: row.dateVon,
            datumBis: row.dateBis,
            entscheidNr: row.entscheidNr,
            berufTaetigkeit: row.berufTaetigkeit || '',
            dto: row
        };
    }

    private setTableConfigs() {
        this.ravTableConfig.config.displayedColumns = this.ravTableConfig.columns.map(c => c.columnDef);
        this.zwischenverdienstTableConfig.config.displayedColumns = this.zwischenverdienstTableConfig.columns.map(c => c.columnDef);
        this.neuerArbeitgeberConfig.config.displayedColumns = this.neuerArbeitgeberConfig.columns.map(c => c.columnDef);
        this.letzterArbeitgeberTableConfig.config.displayedColumns = this.letzterArbeitgeberTableConfig.columns.map(c => c.columnDef);
        this.zuschussPraktikaTableConfig.config.displayedColumns = this.zuschussPraktikaTableConfig.columns.map(c => c.columnDef);
        return {
            rav: this.ravTableConfig,
            zv: this.zwischenverdienstTableConfig,
            neuerArbeitgeber: this.neuerArbeitgeberConfig,
            letztArbeitgeber: this.letzterArbeitgeberTableConfig,
            einarbeitungZuschuss: Object.assign({}, this.zuschussPraktikaTableConfig),
            ausbildungsZuschuss: Object.assign({}, this.zuschussPraktikaTableConfig),
            berufspratika: Object.assign({}, this.zuschussPraktikaTableConfig),
            ausbildungsPraktika: Object.assign({}, this.zuschussPraktikaTableConfig)
        };
    }

    private checkAnyPermissions(permissions) {
        return this.authService.hasAnyPermission(permissions);
    }

    private checkAllPermissions(permissions) {
        return this.authService.hasAllPermissions(permissions);
    }
}

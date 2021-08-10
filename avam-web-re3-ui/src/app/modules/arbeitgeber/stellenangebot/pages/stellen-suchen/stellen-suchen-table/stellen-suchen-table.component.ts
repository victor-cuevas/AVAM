import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormUtilsService } from '@app/shared';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { FacadeService } from '@shared/services/facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
    StatusCode,
    StatusSortPosition
} from '@modules/arbeitgeber/arbeitgeber-details/pages/unternehmen-details/stellenangebote/vermittlung/stellen-angebote-table/stellen-angebote-table.component';
import * as moment from 'moment';
import { OsteDataRestService } from '@core/http/oste-data-rest.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { OsteDTO } from '@dtos/osteDTO';

@Component({
    selector: 'avam-stellen-suchen-table',
    templateUrl: './stellen-suchen-table.component.html',
    styleUrls: ['./stellen-suchen-table.component.scss']
})
export class StellenSuchenTableComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() public dataSource = [];
    @Input() public inputData: any;
    @Input() public isPrintModal = false;
    @Input() public statusList = [];
    channel: 'stellen-suchen-table';
    columns = [
        {
            columnDef: 'flag',
            header: '',
            fixWidth: true,
            cell: (element: any) => element.flag
        },
        {
            columnDef: 'anmeldeDatum',
            header: 'arbeitgeber.oste.label.meldedatum',
            cell: (element: any) => this.facadeService.formUtilsService.formatDateNgx(element.anmeldeDatum, FormUtilsService.GUI_DATE_FORMAT)
        },
        {
            columnDef: 'stellennr',
            header: 'arbeitgeber.oste.label.stellennr',
            cell: (element: any) => `${element.stellennr || ''}`
        },
        {
            columnDef: 'stellenbezeichnung',
            header: 'arbeitgeber.oste.label.stellenbezeichnung',
            cell: (element: any) => `${element.stellenbezeichnung || ''}`
        },
        {
            columnDef: 'arbeitsort',
            header: 'arbeitgeber.label.arbeitsort',
            cell: (element: any) => `${element.arbeitsort || ''}`
        },
        {
            columnDef: 'namearbeitgeber',
            header: 'arbeitgeber.label.namearbeitgeber',
            cell: (element: any) => `${element.namearbeitgeber || ''}`
        },
        {
            columnDef: 'ort',
            header: 'arbeitgeber.label.ort',
            cell: (element: any) => `${element.ort || ''}`
        },
        {
            columnDef: 'zuweisungen',
            header: 'arbeitgeber.oste.label.zuweisungen',
            cell: (element: any) => `${element.zuweisungen || 0} / ${element.maxZuweisungen || 0} `
        },
        {
            columnDef: 'status',
            header: 'arbeitgeber.oste.label.status',
            cell: (element: any) => `${element.status || ''}`
        },
        {
            columnDef: 'abmeldedatum',
            header: 'arbeitgeber.oste.label.abmeldedatum',
            cell: (element: any) => this.facadeService.formUtilsService.formatDateNgx(element.abmeldedatum, FormUtilsService.GUI_DATE_FORMAT)
        },
        {
            columnDef: 'action',
            header: '',
            cell: (element: any) => `${element.actions}`,
            width: '65px'
        }
    ];
    eventOrder = 1;
    displayedColumns = [];
    meldepflichtEnum = MeldepflichtEnum;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private facadeService: FacadeService, private osteDataRestService: OsteDataRestService) {
        super();
    }

    ngOnInit() {
        this.displayedColumns = this.columns.map(c => c.columnDef);
        if (this.isPrintModal) {
            this.displayedColumns = this.displayedColumns.filter(col => col !== 'action');
            this.setData(this.inputData, this.statusList);
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    onSort(event) {
        const fielsdDate = ['anmeldeDatum', 'abmeldedatum', 'flag', 'zuweisungen'];
        const fieldsObject = ['stellennr', 'stellenbezeichnung', 'arbeitsort', 'namearbeitgeber', 'ort', 'status'];
        this.eventOrder = event.order;
        if (fielsdDate.includes(event.field)) {
            this.sortDate(event.data, event.field);
        } else if (fieldsObject.includes(event.field)) {
            this.sortString(event.data, event.field);
        }
    }

    itemSelected(event: any) {
        this.osteDataRestService
            .searchByOste(event.osteId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                })
            )
            .subscribe((response: OsteDTO) => {
                this.router.navigate([`../arbeitgeber/details/${response.unternehmenId}/stellenangebote/stellenangebot/bewirtschaftung`], {
                    queryParams: { osteId: event.osteId }
                });
            });
    }

    public setData(data, statusList) {
        this.statusList = statusList;
        this.dataSource = [];
        if (data) {
            this.eventOrder = 1;
            this.sortString(data, 'stellenbezeichnung');
            this.eventOrder = -1;
            this.sortDate(data, 'anmeldeDatum');
            data.map(elem => {
                elem.status = elem[`status${this.facadeService.translateService.currentLang[0].toUpperCase() + this.facadeService.translateService.currentLang[1]}`];
                elem.statusCode = this.getStatusCode(elem.statusDe);
                return elem;
            });
            data = this.sortStatus({ data, order: this.eventOrder });

            data.forEach(row => {
                this.dataSource.push({
                    flag: this.getFlag(row),
                    anmeldeDatum: row.anmeldeDatum,
                    stellennr: row.stellenNrAvam,
                    stellenbezeichnung: row.stellenbezeichnung + '',
                    arbeitsort: row.arbeitsortDe ? this.facadeService.dbTranslateService.translate(row, 'arbeitsort') : '',
                    namearbeitgeber: row.unternehmenName,
                    zuweisungen: row.anzZuweisungen,
                    maxZuweisungen: row.maxZuweisungen,
                    status: row.statusDe ? this.facadeService.dbTranslateService.translate(row, 'status') : '',
                    abmeldedatum: row.abmeldeDatum,
                    ort: row.unternehmenOrtDe ? this.facadeService.dbTranslateService.translate(row, 'unternehmenOrt') : '',
                    osteId: row.osteId,
                    unternehmenId: row.unternehmenId
                });
            });
        }
    }

    private getStatusCode(textDe: string): string {
        return this.statusList.find(statusDTO => statusDTO.labelDe === textDe).code;
    }

    private sortStatus(event: any) {
        return event.data.sort((a, b) => {
            return this.getSortOrderValueFromStatusCode(a.statusCode) - this.getSortOrderValueFromStatusCode(b.statusCode);
        });
    }

    private getSortOrderValueFromStatusCode(code: string): number {
        if (+code === StatusCode.INAKTIV) {
            return StatusSortPosition.INAKTIV.valueOf();
        } else if (+code === StatusCode.AKTIV) {
            return StatusSortPosition.AKTIV.valueOf();
        } else {
            return StatusSortPosition.ABGEMELDET.valueOf();
        }
    }

    private getFlag(data: any) {
        const hasSign = !!data.meldepflicht;
        return hasSign ? (moment(data.sperrfristDatum).isSameOrAfter(moment(), 'day') ? MeldepflichtEnum.UNTERLIEGT_LAUFEND : MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN) : null;
    }

    private sortDate(data: any, prop) {
        return data.sort((value1, value2) => {
            if (value1[prop] < value2[prop]) {
                return -1 * this.eventOrder;
            }
            if (value1[prop] > value2[prop]) {
                return 1 * this.eventOrder;
            }
            return 0;
        });
    }

    private sortString(data: any, prop: any) {
        data.sort((value1, value2) => {
            return value1[prop].localeCompare(value2[prop]) * this.eventOrder;
        });
    }
}

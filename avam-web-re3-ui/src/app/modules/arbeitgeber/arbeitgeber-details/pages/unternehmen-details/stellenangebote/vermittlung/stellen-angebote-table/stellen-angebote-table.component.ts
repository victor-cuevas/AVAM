import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { FormUtilsService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { CodeDTO } from '@dtos/codeDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AvamUnternehmenSucheComponent } from '@app/library/wrappers/form/autosuggests/avam-unternehmen-autosuggest/avam-unternehmen-suche/avam-unternehmen-suche.component';
import { FacadeService } from '@shared/services/facade.service';
import { OsteNavigationHelperService } from '@modules/arbeitgeber/arbeitgeber-details/services/oste-navigation-helper.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';

export enum StellenangeboteDropDownAktionenEnum {
    UMTEILEN = 0,
    KOPIEREN = 1
}
export enum StatusSortPosition {
    INAKTIV = 1,
    AKTIV = 2,
    ABGEMELDET = 3
}
export enum StatusCode {
    INAKTIV = 2,
    AKTIV = 1,
    ABGEMELDET = 3
}

@Component({
    selector: 'avam-stellen-angebote-table',
    templateUrl: './stellen-angebote-table.component.html',
    styleUrls: ['./stellen-angebote-table.component.scss']
})
export class StellenAngeboteTableComponent extends Unsubscribable implements OnInit, OnDestroy {
    aktionenOptions: { label: string; aktionId: number }[] = [
        { label: 'arbeitgeber.oste.button.umteilen', aktionId: StellenangeboteDropDownAktionenEnum.UMTEILEN },
        { label: 'common.button.kopieren', aktionId: StellenangeboteDropDownAktionenEnum.KOPIEREN }
    ];
    @Input() public dataSource = [];
    @Input() public isPrintModal = false;
    @Input() public inputData = [];
    @Input() public statusList = [];
    @Output() umteilenEmitter = new EventEmitter<Map<string, number>>();
    eventOrder = 1;
    meldepflichtEnum = MeldepflichtEnum;
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
            cell: (element: any) => this.formUtils.formatDateNgx(element.anmeldeDatum, FormUtilsService.GUI_DATE_FORMAT)
        },
        {
            columnDef: 'stellenNrAvam',
            header: 'arbeitgeber.oste.label.stellennr',
            cell: (element: any) => `${element.stellenNrAvam || ''}`
        },
        {
            columnDef: 'stellenbezeichnung',
            header: 'arbeitgeber.oste.label.stellenbezeichnung',
            cell: (element: any) => `${element.stellenbezeichnung || ''}`
        },
        {
            columnDef: 'arbeitsort',
            header: 'arbeitgeber.oste.label.arbeitsort',
            cell: (element: any) => `${element.arbeitsort || ''}`
        },
        {
            columnDef: 'stellenantritt',
            header: 'arbeitgeber.oste.label.stellenantritt',
            cell: (element: any) => this.formUtils.formatDateNgx(element.stellenantritt, FormUtilsService.GUI_DATE_FORMAT)
        },
        {
            columnDef: 'beschaeftigungsgrad',
            header: 'stes.label.beschaeftigungsgrad',
            cell: (element: any) => `${element.beschaeftigungsgrad || ''}`
        },
        {
            columnDef: 'zuweisungen',
            header: 'arbeitgeber.oste.label.zuweisungen',
            cell: (element: any) => `${element.zuweisungen || ''}`
        },
        {
            columnDef: 'status',
            header: 'arbeitgeber.oste.label.status',
            cell: (element: any) => `${element.status || ''}`
        },
        {
            columnDef: 'gueltigkeit',
            header: 'arbeitgeber.oste.label.gueltigkeitsdatum',
            cell: (element: any) => this.formUtils.formatDateNgx(element.gueltigkeit, FormUtilsService.GUI_DATE_FORMAT)
        },
        {
            columnDef: 'abmeldeDatum',
            header: 'arbeitgeber.oste.label.abmeldedatum',
            cell: (element: any) => this.formUtils.formatDateNgx(element.abmeldeDatum, FormUtilsService.GUI_DATE_FORMAT)
        },
        {
            columnDef: 'actions',
            header: '',
            cell: (element: any) => `${element.actions}`,
            width: '170px'
        }
    ];
    displayedColumns = [];

    permissions: typeof Permissions = Permissions;

    private readonly ABGEMELDET_CODE = '3';
    private selectedOsteId: number;

    constructor(
        private osteSideNavHelper: OsteNavigationHelperService,
        private modalService: NgbModal,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private translateService: TranslateService,
        private formUtils: FormUtilsService,
        private facadeService: FacadeService
    ) {
        super();
    }

    ngOnInit() {
        this.facadeService.authenticationService.buttonsPermissionSubject.pipe(takeUntil(this.unsubscribe)).subscribe(buttonPermissions => {
            if (!this.facadeService.authenticationService.hasAnyPermission([Permissions.KEY_AG_OSTE_BEARBEITEN], buttonPermissions)) {
                this.columns.find(c => c.columnDef === 'actions').width = '58px';
            }
        });

        this.displayedColumns = this.isPrintModal ? this.columns.filter(col => col.columnDef !== 'actions').map(c => c.columnDef) : this.columns.map(c => c.columnDef);
        if (this.isPrintModal) {
            this.setData(this.inputData, this.statusList);
        }
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public onSort(event) {
        const fielsdDate = ['anmeldeDatum', 'stellenantritt', 'gueltigkeit', 'abmeldeDatum', 'flag'];
        const fieldsObject = ['stellenNrAvam', 'stellenbezeichnung', 'arbeitsort', 'beschaeftigungsgrad', 'zuweisungen', 'status'];
        this.eventOrder = event.order;
        if (fielsdDate.includes(event.field)) {
            this.sortDate(event.data, event.field);
        } else if (fieldsObject.includes(event.field)) {
            this.sortString(event.data, event.field);
        }
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
                elem.status = elem[`status${this.translateService.currentLang[0].toUpperCase() + this.translateService.currentLang[1]}`];
                elem.statusCode = this.getStatusCode(elem.statusDe);
                return elem;
            });
            data = this.sortStatus({ data, order: this.eventOrder });
            data.forEach(row => {
                this.dataSource.push({
                    flag: this.getFlag(row),
                    anmeldeDatum: row.anmeldeDatum,
                    stellenNrAvam: row.stellenNrAvam,
                    stellenbezeichnung: row.stellenbezeichnung,
                    arbeitsort: this.facadeService.dbTranslateService.translate(row, 'arbeitsort'),
                    stellenantritt: row.stellenantritt,
                    beschaeftigungsgrad: row.pensum,
                    zuweisungen: row.zuweisungen,
                    status: this.facadeService.dbTranslateService.translate(row, 'status'),
                    statusCode: this.getStatusCode(row.statusDe),
                    gueltigkeit: row.gueltigkeit,
                    abmeldeDatum: row.abmeldeDatum,
                    osteId: row.osteId
                });
            });
        }
    }

    public itemSelected(osteId) {
        this.osteSideNavHelper.resetOsteContext(osteId);
        this.router.navigate(['./stellenangebot/bewirtschaftung'], { queryParams: { osteId }, relativeTo: this.activatedRoute });
    }

    selectFromSuchePlus(sucheSelected: any) {
        const map = new Map<string, number>();
        map.set('osteId', this.selectedOsteId);
        map.set('unternehmenId', sucheSelected.unternehmenId);
        this.umteilenEmitter.emit(map);
    }

    onActionSelected(aktionId, row) {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (aktionId === StellenangeboteDropDownAktionenEnum.UMTEILEN) {
            if (row.zuweisungen && row.zuweisungen.split('/')[0] !== '0') {
                this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stellenichtumgeteiltzuweisung', 'danger');
            } else if (row.statusCode === this.ABGEMELDET_CODE) {
                this.facadeService.fehlermeldungenService.showMessage('arbeitgeber.oste.message.stellenichtumteilenabgemeldet', 'danger');
            } else {
                this.selectedOsteId = row.osteId;
                this.unternehmenUmteilen();
            }
        } else if (aktionId === StellenangeboteDropDownAktionenEnum.KOPIEREN) {
            this.router.navigate(['./erfassen'], { queryParams: { osteId: row.osteId }, relativeTo: this.activatedRoute });
        }
    }

    private getStatusCode(textDe: string): string {
        return this.statusList.find((statusDTO: CodeDTO) => statusDTO.textDe === textDe).code;
    }

    private unternehmenUmteilen() {
        const suchePlus = this.modalService.open(AvamUnternehmenSucheComponent, {
            ariaLabelledBy: '',
            windowClass: 'avam-modal-xl',
            centered: true,
            backdrop: 'static'
        });
        suchePlus.result
            .then(result => {
                if (result) {
                    this.selectFromSuchePlus(result);
                }
            })
            .catch(() => {});
        suchePlus.componentInstance.label = 'arbeitgeber.oste.label.arbeitgeber';
        suchePlus.componentInstance.isAvamOnly = true;
    }

    private getFlag(data: any) {
        const hasSign = !!(data.meldepflicht || data.meldepflicht === false);
        return hasSign ? (data.meldepflicht ? MeldepflichtEnum.UNTERLIEGT_LAUFEND : MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN) : null;
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

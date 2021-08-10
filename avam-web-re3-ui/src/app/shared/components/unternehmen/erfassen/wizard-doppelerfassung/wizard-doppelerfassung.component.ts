import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UnternehmenResultDTO } from '@dtos/unternehmenResultDTO';
import { takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StaatDTO } from '@dtos/staatDTO';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-wizard-doppelerfassung',
    templateUrl: './wizard-doppelerfassung.component.html',
    styleUrls: ['./wizard-doppelerfassung.component.scss']
})
export class WizardDoppelerfassungComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalPrint') public modalPrint: ElementRef;
    @ViewChild('burDatenModal') public burDatenModal: ElementRef;
    public secondStepData;
    public tableConfig;
    public schweizDTO: StaatDTO;
    public selectedBurData: UnternehmenResultDTO;
    channel = 'wizzardDopplelerfassungChannel';
    private baseTableConfig = {
        columns: [
            { columnDef: 'exclamation', header: '', fixWidth: true, cell: (element: any) => `${element.exclamation}` },
            { columnDef: 'name', header: 'stes.label.name', cell: (element: any) => `${element.name}` },
            { columnDef: 'strasseNr', header: 'amm.massnahmen.label.strassenr', cell: (element: any) => `${element.strasseNr}` },
            { columnDef: 'plzOrt', header: 'arbeitgeber.oste.label.plzort', cell: (element: any) => `${element.plzOrt}` },
            { columnDef: 'land', header: 'stes.label.land', cell: (element: any) => `${element.land}` },
            { columnDef: 'uid', header: 'unternehmen.label.uidnummer', cell: (element: any) => `${element.uid}` },
            { columnDef: 'status', header: 'unternehmen.label.termin.status', cell: (element: any) => `${element.status}` },
            { columnDef: 'isAvam', header: 'unternehmen.label.avam', cell: (element: any) => `${element.isAvam}` },
            { columnDef: 'actions', header: 'common.button.oeffnen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'name',
            sortOrder: 1,
            displayedColumns: [],
            maxHeight: 530
        }
    };

    constructor(
        private dataService: UnternehmenRestService,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private router: Router,
        private facadeService: FacadeService
    ) {
        super();
    }

    public ngOnInit() {
        if (!this.secondStepData) {
            window.history.back();
        } else {
            this.showWarnings();
            const unifiedData = this.setPlzOrtValues(this.secondStepData.data);
            this.setTableData(unifiedData);
            this.facadeService.dbTranslateService
                .getEventEmitter()
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(() => {
                    this.setTableData(this.secondStepData.data);
                });
        }
    }

    public ngOnDestroy(): void {
        this.facadeService.fehlermeldungenService.closeMessage();
        super.ngOnDestroy();
    }

    public selectItem(selectedRow): void {
        if (selectedRow.additionalData.ugInAvam === false) {
            const selectedBur = this.secondStepData.data.find(item => item.unternehmenBurId === selectedRow.additionalData.unternehmenBurId);
            this.openBurModal(selectedBur);
        } else {
            this.router.navigate([`${this.router.url.split('/', 3).join('/')}/${selectedRow.additionalData.unternehmenId}`]);
        }
    }

    private openBurModal(selectedBur) {
        const burId = selectedBur.unternehmenBurId;
        this.facadeService.spinnerService.activate(this.channel);
        this.dataService
            .getBurUnternehmenErfassenDTOByBurOrEnheitId(burId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                result => {
                    this.facadeService.spinnerService.deactivate(this.channel);
                    if (!!result && !!result.data) {
                        const burDetail = result.data;
                        burDetail.uidOrganisationIdCategorie = selectedBur.uidOrganisationIdCategorie;
                        burDetail.uidOrganisationId = selectedBur.uidOrganisationId;
                        burDetail.burNr = selectedBur.burNr;
                        this.selectedBurData = burDetail;
                        this.modalService.open(this.burDatenModal, { windowClass: 'modal-md', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
                    }
                },
                () => this.facadeService.spinnerService.deactivate(this.channel)
            );
    }

    private setForeignValues(item) {
        return {
            ...item,
            ortDe: item.ortAusland || item.postfachOrtAusland || item.ortDe,
            ortFr: item.ortAusland || item.postfachOrtAusland || item.ortFr,
            ortIt: item.ortAusland || item.postfachOrtAusland || item.ortIt,
            plz: item.plzAusland || item.postfachPlzAusland || item.plz
        };
    }

    private setPlzOrtValues(data) {
        data = data.map(item => {
            let modifiedItem = item;
            if (item.staatId !== this.schweizDTO.staatId) {
                modifiedItem = this.setForeignValues(item);
            } else {
                modifiedItem.ortDe = item.ortDe || item.postfachOrtDe;
                modifiedItem.ortFr = item.ortFr || item.postfachOrtFr;
                modifiedItem.ortIt = item.ortIt || item.postfachOrtIt;
                modifiedItem.plz = item.plz || item.postfachPlz;
            }
            return modifiedItem;
        });
        data = this.sortByPlzOrt(data);
        return data;
    }

    private setExclamationTooltip() {
        return this.facadeService.translateService.instant('unternehmen.alttext.unternehmenfiktivparameter', { '0': this.getType() });
    }

    private getType() {
        let type;
        switch (this.activatedRoute.parent.snapshot.data['navPath']) {
            case 'amm':
                type = 'amm.anbieter.label.anbieter';
                break;
            case 'arbeitgeber':
                type = 'amm.nutzung.label.arbeitgeber';
                break;
            default:
                type = 'unternehmen.label.suchen.fachberatung';
                break;
        }
        return this.facadeService.translateService.instant(type);
    }

    private setTableData(data) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.columns[0].header = this.setExclamationTooltip();
        this.tableConfig.data = data ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private formatUID(category, uid) {
        return category && uid ? `${category}-${uid.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
    }

    private createRow(data: UnternehmenResultDTO) {
        const plz = data.plz || data.plzAusland || '';
        const ort = this.facadeService.dbTranslateService.translate(data, 'ort') || '';
        const land = this.facadeService.dbTranslateService.translate(data, 'staat') || '';
        const uid = this.formatUID(data.uidOrganisationIdCategorie, data.uidOrganisationId);
        const status = this.facadeService.dbTranslateService.translate(data, 'status') || 'common.label.na';
        const isAvam = data.ugInAvam === false ? 'common.label.neingross' : 'common.label.jagross';

        return {
            exclamation: data.fiktiv ? this.setExclamationTooltip() : '',
            name: data.name,
            strasseNr: `${data.strasse || ''} ${data.strasseNr || ''}`,
            plzOrt: `${plz} ${ort}`,
            land,
            uid,
            status,
            isAvam,
            additionalData: data
        };
    }

    private sortByPlzOrt(response: UnternehmenResultDTO[]): UnternehmenResultDTO[] {
        return response.sort((row1, row2) => {
            const plzOrt1 = `${row1.plz} ${this.facadeService.dbTranslateService.translate(row1, 'ort')}`;
            const plzOrt2 = `${row2.plz} ${this.facadeService.dbTranslateService.translate(row2, 'ort')}`;
            return plzOrt1 < plzOrt2 ? -1 : 1;
        });
    }

    private showWarnings() {
        if (this.secondStepData.data) {
            let messageKey;
            switch (this.activatedRoute.parent.snapshot.data['navPath']) {
                case 'amm':
                    messageKey =
                        this.secondStepData.data.length > 0
                            ? 'unternehmen.feedback.unternehmenaehnlicheuggefunden.anbieter'
                            : 'unternehmen.feedback.unternehmenkeineaehnlicheuggefunden.anbieter';
                    break;
                case 'arbeitgeber':
                    messageKey =
                        this.secondStepData.data.length > 0
                            ? 'unternehmen.feedback.unternehmenaehnlicheuggefunden.arbeitgeber'
                            : 'unternehmen.feedback.unternehmenkeineaehnlicheuggefunden.arbeitgeber';
                    break;
                default:
                    messageKey =
                        this.secondStepData.data.length > 0
                            ? 'unternehmen.feedback.unternehmenaehnlicheuggefunden.fachberatung'
                            : 'unternehmen.feedback.unternehmenkeineaehnlicheuggefunden.fachberatung';
                    break;
            }

            if (this.secondStepData.data.length > 0) {
                this.facadeService.fehlermeldungenService.showMessage(messageKey, 'warning');
            } else {
                this.facadeService.fehlermeldungenService.showMessage(messageKey, 'info');
            }
        }
    }
}

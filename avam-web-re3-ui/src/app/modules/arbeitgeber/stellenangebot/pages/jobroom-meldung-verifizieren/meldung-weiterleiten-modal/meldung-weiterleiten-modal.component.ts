import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { BenutzerstellenRestService } from '@core/http/benutzerstellen-rest.service';
import { BenutzerstellenQueryDTO } from '@dtos/benutzerstellenQueryDTO';
import { BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages } from '@dtos/baseResponseWrapperListBenutzerstelleResultDTOWarningMessages';
import { FacadeService } from '@shared/services/facade.service';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { BenutzerstelleResultDTO } from '@dtos/benutzerstelleResultDTO';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Unsubscribable } from 'oblique-reactive';

@Component({
    selector: 'avam-meldung-weiterleiten-modal',
    templateUrl: './meldung-weiterleiten-modal.component.html'
})
export class MeldungWeiterleitenModalComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @Output() benutzerStelleSelected: EventEmitter<BenutzerstelleResultDTO> = new EventEmitter();
    static readonly CHANNEL = 'meldungWeiterleitenModal';
    filterForm: FormGroup;
    tableConfig: any;
    rawData: BenutzerstelleResultDTO[] = [];
    shouldFocusInitialRow = true;

    private searchParams: BenutzerstellenQueryDTO = { gueltigkeit: 'active', jobroom: 'true' };
    private baseTableConfig = {
        columns: [
            { columnDef: 'benutzerstelle', header: 'benutzerverwaltung.label.benutzerstelle', cell: (element: any) => `${element.benutzerstelle}` },
            { columnDef: 'id', header: 'benutzerverwaltung.label.id', cell: (element: any) => `${element.id}` },
            { columnDef: 'typ', header: 'benutzerverwaltung.label.typ', cell: (element: any) => `${element.typ}` },
            { columnDef: 'strassenr', header: 'common.label.strassenr', cell: (element: any) => `${element.strassenr}` },
            { columnDef: 'ort', header: 'common.label.ort', cell: (element: any) => `${element.ort}` },
            { columnDef: 'telefon', header: 'common.label.telefon', cell: (element: any) => `${element.telefon}` },
            { columnDef: 'actions', header: 'arbeitgeber.oste.stellenmeldungweiterleiten', cell: () => '', fixWidth: true, isUebernehmen: true }
        ],
        data: [],
        config: {
            sortField: 'id',
            sortOrder: 1,
            displayedColumns: [],
            maxHeight: 530
        }
    };

    constructor(private benutzerService: BenutzerstellenRestService, private facadeService: FacadeService, private fb: FormBuilder) {
        super();
    }

    get spinnerChannel() {
        return MeldungWeiterleitenModalComponent.CHANNEL;
    }

    ngOnInit() {
        this.initForm();
        this.setTableData([]);
    }

    ngAfterViewInit() {
        this.getData(this.searchParams);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    openConfirmDialog(row: any): void {
        const modalRef = this.facadeService.openModalFensterService.openDeleteModal();
        modalRef.result.then(
            result => {
                if (result) {
                    this.weiterleiten(row.data);
                }
            },
            () => {}
        );
        modalRef.componentInstance.titleLabel = 'arbeitgeber.oste.stellenmeldungweiterleiten';
        modalRef.componentInstance.promptLabel = 'arbeitgeber.oste.message.stellenmeldungWeiterleiten';
        modalRef.componentInstance.primaryButton = 'common.button.weiterleitenJa';
        modalRef.componentInstance.secondaryButton = 'common.button.abbrechen';
    }

    weiterleiten(row: BenutzerstelleResultDTO) {
        this.benutzerStelleSelected.emit(row);
    }

    close() {
        this.facadeService.openModalFensterService.dismissAll();
    }

    private initForm() {
        this.filterForm = this.fb.group({
            benutzerstelle: null,
            id: null
        });

        this.filterForm.valueChanges
            .pipe(
                takeUntil(this.unsubscribe),
                debounceTime(500)
            )
            .subscribe((formValue: any) => {
                if (!!formValue.benutzerstelle || !!formValue.id) {
                    this.shouldFocusInitialRow = false;
                    this.setTableData(
                        this.rawData.filter(
                            (benutzerResult: BenutzerstelleResultDTO) =>
                                (!formValue.benutzerstelle || benutzerResult.nameDe.toLocaleUpperCase().indexOf(formValue.benutzerstelle.toLocaleUpperCase()) !== -1) &&
                                (!formValue.id || benutzerResult.code.toLocaleUpperCase().indexOf(formValue.id.toLocaleUpperCase()) !== -1)
                        )
                    );
                } else {
                    this.setTableData(this.rawData);
                }
            });
    }

    private getData(searchParams: BenutzerstellenQueryDTO) {
        this.facadeService.spinnerService.activate(MeldungWeiterleitenModalComponent.CHANNEL);
        this.benutzerService
            .getBenutzerstellen(searchParams, this.facadeService.translateService.currentLang, MeldungWeiterleitenModalComponent.CHANNEL)
            .pipe(finalize(() => this.facadeService.spinnerService.deactivate(MeldungWeiterleitenModalComponent.CHANNEL)))
            .subscribe((response: BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages) => {
                this.setTableData(response.data);
                this.rawData = response.data;
            });
    }

    private setTableData(data: BenutzerstelleResultDTO[]) {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.data = data.length ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: BenutzerstelleResultDTO) {
        return {
            id: data.code,
            benutzerstelle: this.facadeService.dbTranslateService.translate(data, 'name'),
            typ: this.facadeService.dbTranslateService.translate(data.typeObject, 'text'),
            strassenr: `${this.facadeService.dbTranslateService.translate(data, 'strasse')} ${data.strasseNr}`,
            ort: this.facadeService.dbTranslateService.translate(data.plzObject, 'ort'),
            telefon: data.telefonNr,
            data
        };
    }
}

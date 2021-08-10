import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SanktionErfassenAbstractComponent } from '@stes/pages/sanktionen/sanktion-erfassen-abstract/sanktion-erfassen-abstract.component';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { SanktionenSachverhaltCodeEnum } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { FormUtilsService } from '@app/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { SanktionSachverhaltAmmDTO } from '@shared/models/dtos-generated/sanktionSachverhaltAmmDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxConfiguration } from '@shared/services/toolbox.service';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { takeUntil } from 'rxjs/operators';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { DateValidator } from '@shared/validators/date-validator';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-sanktion-erfassen-massnahmen',
    templateUrl: './sanktion-erfassen-massnahmen.component.html',
    styleUrls: ['./sanktion-erfassen-massnahmen.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SanktionErfassenMassnahmenComponent extends SanktionErfassenAbstractComponent implements OnInit {
    @Input('sachverhaltDTO')
    set sachverhaltDTO(value: SanktionSachverhaltAmmDTO) {
        this._sachverhaltDTO = value;
        this.stesId = value.sanktionSachverhalt.stesID.toString();
        this.mapToForm(value);
    }

    get sachverhaltDTO(): SanktionSachverhaltAmmDTO {
        return this._sachverhaltDTO;
    }
    stesSanktionChannel = 'stesSanktionMassnahmenChannel';
    loadGrundSanktionsOptions = DomainEnum.GRUND_AMM;
    sachverhaltTypeId = SanktionenSachverhaltCodeEnum.SACHVERHALT_AMM;
    stesId: string;
    formNr = StesFormNumberEnum.ARBEITSMARKTLICHE_MASSNAHMEN_MODAL;
    baseTableConfig = {
        columns: [
            { columnDef: 'ammBezeichnung', header: 'stes.label.ammBezeichnung', cell: (element: any) => `${element.ammBezeichnung}` },
            {
                columnDef: 'dauerVon',
                header: 'kaeswe.label.dauervon',
                cell: (element: any) => `${this.facade.formUtilsService.formatDateNgx(element.dauerVon, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'dauerBis',
                header: 'stes.asal.label.bis',
                cell: (element: any) => `${this.facade.formUtilsService.formatDateNgx(element.dauerBis, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'anweisungsDatum',
                header: 'stes.label.ammAnweisungsdatum',
                cell: (element: any) => `${this.facade.formUtilsService.formatDateNgx(element.anweisungsDatum, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            { columnDef: 'entscheidArt', header: 'stes.label.ammentscheidart', cell: (element: any) => `${element.entscheidArt}` },
            { columnDef: 'entscheidStatus', header: 'stes.label.ammentscheidstatus', cell: (element: any) => `${element.entscheidStatus}` },
            { columnDef: 'actions', header: 'common.button.uebernehmen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'dauerVon',
            sortOrder: -1,
            displayedColumns: []
        }
    };
    tableConfig;
    modalToolboxConfiguration: ToolboxConfiguration[];
    printTableData: any[];
    selectedGeschaeftsfallID;

    constructor(
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected dataRestService: StesDataRestService,
        protected activatedRoute: ActivatedRoute,
        protected previousRouteService: PreviousRouteService,
        protected changeDetector: ChangeDetectorRef,
        protected facade: FacadeService
    ) {
        super(dataRestService, changeDetector, previousRouteService, facade);
        this.path = StesSanktionen.SANKTION_ERFASSEN_MASSNAHMEN;
    }

    public ngOnInit() {
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.populateModal();
            });
        this.generateForm();
        this.loadGrundSanktionsOptionsFor();
        this.populateModal();
    }

    public setModalResult(selectedRow) {
        if (selectedRow) {
            this.selectedGeschaeftsfallID = selectedRow.additionalData.ammGeschaeftsfallId;
            this.sachverhaltForm.controls.datumKontrollPeriode.setValue(new Date(selectedRow.additionalData.freigabedatum));
            this.sachverhaltForm.controls.ammBezeichnung.setValue(selectedRow.additionalData.massnahmenTitel);
            this.sachverhaltForm.controls.dauerVon.setValue(new Date(selectedRow.additionalData.ammVon));
            this.sachverhaltForm.controls.dauerBis.setValue(new Date(selectedRow.additionalData.ammBis));
            this.sachverhaltForm.controls.anweisungsdatum.setValue(new Date(selectedRow.anweisungsDatum));
            this.sachverhaltForm.markAsDirty();
        }
    }

    public mapToDto(): SanktionSachverhaltDTO {
        const sachverhaltControl = this.sachverhaltForm.controls;
        const sanktionSachverhaltMassnahmen: SanktionSachverhaltAmmDTO = super.mapToDto();
        sanktionSachverhaltMassnahmen.ammDatumVon = sachverhaltControl.dauerVon.value;
        sanktionSachverhaltMassnahmen.ammDatumBis = sachverhaltControl.dauerBis.value;
        sanktionSachverhaltMassnahmen.datumAnweisung = sachverhaltControl.anweisungsdatum.value;
        sanktionSachverhaltMassnahmen.bezeichnungAmm = sachverhaltControl.ammBezeichnung.value;
        sanktionSachverhaltMassnahmen.sanktionSachverhalt.geschaeftsfallID = this.selectedGeschaeftsfallID
            ? this.selectedGeschaeftsfallID
            : this.sachverhaltDTO
            ? this.sachverhaltDTO.sanktionSachverhalt.geschaeftsfallID
            : null;
        return sanktionSachverhaltMassnahmen;
    }

    protected mapToForm(sachverhaltAmm: SanktionSachverhaltAmmDTO): void {
        super.mapToForm(sachverhaltAmm);
        this.sachverhaltForm.patchValue({
            ammBezeichnung: sachverhaltAmm.bezeichnungAmm,
            dauerVon: new Date(sachverhaltAmm.ammDatumVon),
            dauerBis: new Date(sachverhaltAmm.ammDatumBis),
            anweisungsdatum: sachverhaltAmm.datumAnweisung,
            notizen: sachverhaltAmm.sanktionSachverhalt.notizen
        });
    }

    private generateForm() {
        this.sachverhaltForm = this.formBuilder.group({
            grundId: ['', Validators.required],
            datumKontrollPeriode: ['', [Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
            ammBezeichnung: ['', Validators.required],
            dauerVon: [],
            dauerBis: [],
            anweisungsdatum: [],
            datumErfasstAm: ''
        });
    }

    private populateModal() {
        if (!this.isDisabled) {
            this.tableConfig = Object.assign({}, this.baseTableConfig);
            this.facade.spinnerService.activate(this.sachverhaltChanel);
            this.printTableData = [];
            this.dataRestService.getSachverhalteByType(this.stesId, `massnahmen/${this.facade.translateService.currentLang}`).subscribe(
                response => {
                    this.setModalData(response.data);
                    this.facade.spinnerService.deactivate(this.sachverhaltChanel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.sachverhaltChanel);
                }
            );
        }
    }

    private setModalData(data) {
        this.tableConfig.data = data ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
        if (this.sachverhaltForm.controls.ammBezeichnung.value && this.selectedGeschaeftsfallID) {
            const objectToTranslate = data.find(element => element.ammEntscheidId === this.selectedGeschaeftsfallID.additionalData.ammEntscheidId);
            this.sachverhaltForm.controls.ammBezeichnung.setValue(objectToTranslate.massnahmenTitel);
        }
    }

    private createRow(data) {
        return {
            ammBezeichnung: data.massnahmenTitel,
            dauerVon: data.ammVon,
            dauerBis: data.ammBis,
            anweisungsDatum: data.freigabedatum,
            entscheidArt: this.facade.dbTranslateService.translate(data.entscheidArtObject, 'text'),
            entscheidStatus: this.facade.dbTranslateService.translate(data.statusObject, 'text'),
            additionalData: data
        };
    }
}

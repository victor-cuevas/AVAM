import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SanktionErfassenAbstractComponent } from '@stes/pages/sanktionen/sanktion-erfassen-abstract/sanktion-erfassen-abstract.component';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DomainEnum } from '@shared/enums/domain.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { FormUtilsService } from '@app/shared';
import { SanktionenSachverhaltCodeEnum } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { SanktionSachverhaltVermittlungDTO } from '@shared/models/dtos-generated/sanktionSachverhaltVermittlungDTO';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxConfiguration } from '@shared/services/toolbox.service';
import { pairwise, takeUntil } from 'rxjs/operators';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { DateValidator } from '@shared/validators/date-validator';
import { MeldepflichtEnum } from '@shared/enums/table-icon-enums';
import { BaseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages } from '@dtos/baseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages';
import { ArbeitsvermittlungViewDTO } from '@dtos/arbeitsvermittlungViewDTO';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-sanktion-erfassen-vermittlung',
    templateUrl: './sanktion-erfassen-vermittlung.component.html',
    styleUrls: ['./sanktion-erfassen-vermittlung.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SanktionErfassenVermittlungComponent extends SanktionErfassenAbstractComponent implements OnInit, AfterContentChecked {
    @Input('sachverhaltDTO')
    set sachverhaltDTO(value: SanktionSachverhaltVermittlungDTO) {
        this._sachverhaltDTO = value;
        this.stesId = value.sanktionSachverhalt.stesID.toString();
        this.mapToForm(value);
    }

    get sachverhaltDTO(): SanktionSachverhaltVermittlungDTO {
        return this._sachverhaltDTO;
    }

    stesSanktionChannel = 'stesSanktionVermittlungChannel';
    loadGrundSanktionsOptions = DomainEnum.GRUND_VERMITTLUNG;
    sachverhaltTypeId = SanktionenSachverhaltCodeEnum.SACHVERHALT_VMT;
    grundBSP12Value = '02';
    stesId: string;
    formNr = StesFormNumberEnum.VERMITTLUNG_AUSWAEHLEN;
    meldepflichtEnum = MeldepflichtEnum;
    baseTableConfig = {
        columns: [
            {
                columnDef: 'flag',
                header: 'arbeitgeber.oste.label.stelleMeldepflicht',
                cell: (element: any) => `${element.flag}`,
                fixWidth: true
            },
            {
                columnDef: 'vermittlungVom',
                header: 'stes.label.zuweisungstes.zuweisungsdatum',
                cell: (element: any) => `${this.facade.formUtilsService.formatDateNgx(element.vermittlungVom, FormUtilsService.GUI_DATE_FORMAT) || ''}`
            },
            {
                columnDef: 'zuweisungsNummer',
                header: 'stes.label.zuweisungstes.zuweisungsnummer',
                cell: (element: any) => `${element.zuweisungsNummer}`
            },
            {
                columnDef: 'stelleBez',
                header: 'stes.label.vermittlung.stellenbezeichnung',
                cell: (element: any) => `${element.stelleBez}`
            },
            {
                columnDef: 'unternehmensname',
                header: 'stes.label.arbeitgeberName',
                cell: (element: any) => `${element.unternehmensname}`
            },
            { columnDef: 'ort', header: 'stes.label.vermittlung.ort', cell: (element: any) => `${element.ort}` },
            { columnDef: 'stesID', header: 'stes.label.vermittlung.stesId', cell: (element: any) => `${element.stesID}` },
            { columnDef: 'status', header: 'stes.label.vermittlung.status', cell: (element: any) => `${element.status}` },
            { columnDef: 'vermittlungsErgebnis', header: 'stes.label.zuweisungstes.vermittlungsstand', cell: (element: any) => `${element.vermittlungsErgebnis}` },
            { columnDef: 'actions', header: 'common.button.uebernehmen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'vermittlungVom',
            sortOrder: -1,
            displayedColumns: []
        }
    };
    tableConfig;
    modalToolboxConfiguration: ToolboxConfiguration[];
    printTableData: any[];
    selectedZuweisungId;

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
        this.path = StesSanktionen.SANKTION_ERFASSEN_VERMITTLUNG;
    }

    public ngOnInit() {
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.populateModal();
            });
        this.loadGrundSanktionsOptionsFor();
        this.generateForm();
        this.populateModal();
        this.sachverhaltForm
            .get('nichtZugewStelle')
            .valueChanges.pipe(
                takeUntil(this.unsubscribe$),
                pairwise()
            )
            .subscribe(([prev, next]: [any, any]) => {
                if (this.sachverhaltForm.get('nichtZugewStelle').value) {
                    this.sachverhaltForm.controls.stellenBezeichnung.clearValidators();
                    if (prev !== next && this.sanktionsgrund && this.sanktionsgrund.length) {
                        this.resetFields();
                        // BSP12
                        this.sachverhaltForm.patchValue({
                            grundId: this.sanktionsgrund.find(grundValue => grundValue.code === this.grundBSP12Value).value,
                            datumKontrollPeriode: new Date()
                        });
                    }
                } else {
                    this.sachverhaltForm.controls.stellenBezeichnung.setValidators(Validators.required);
                    if (prev !== next && this.sanktionsgrund && this.sanktionsgrund.length) {
                        this.resetFields();
                        // BSP13
                        this.sachverhaltForm.patchValue({
                            grundId: this.sanktionsgrund.find(grundValue => grundValue.code === this.grundValue).value
                        });
                    }
                }
                this.sachverhaltForm.controls.stellenBezeichnung.updateValueAndValidity();
            });
    }

    public ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }

    public setModalResult(selectedRow) {
        if (selectedRow) {
            this.selectedZuweisungId = selectedRow.additionalData.zuweisungId;
            this.sachverhaltForm.controls.datumKontrollPeriode.setValue(new Date(selectedRow.additionalData.zuweisungDatumVom));
            this.sachverhaltForm.controls.stellenBezeichnung.setValue(selectedRow.additionalData.stellenbezeichnung);
            this.sachverhaltForm.controls.unternehmensname.setValue(selectedRow.additionalData.unternehmensName);
            this.sachverhaltForm.controls.vermittlungvom.setValue(new Date(selectedRow.additionalData.zuweisungDatumVom));
            this.sachverhaltForm.markAsDirty();
        }
    }

    public mapToDto(): SanktionSachverhaltDTO {
        const sachverhaltControl = this.sachverhaltForm.controls;
        const sanktionSachverhaltVermittlung: SanktionSachverhaltVermittlungDTO = super.mapToDto();
        sanktionSachverhaltVermittlung.nichtZugewStelle = !!sachverhaltControl.nichtZugewStelle.value;
        sanktionSachverhaltVermittlung.datumZuweisung = sachverhaltControl.vermittlungvom.value;
        sanktionSachverhaltVermittlung.unternehmensname = sachverhaltControl.unternehmensname.value;
        sanktionSachverhaltVermittlung.stellenBezeichnung = sachverhaltControl.stellenBezeichnung.value;
        if (!sanktionSachverhaltVermittlung.nichtZugewStelle) {
            sanktionSachverhaltVermittlung.sanktionSachverhalt.geschaeftsfallID = this.selectedZuweisungId ? this.selectedZuweisungId : null;
        } else {
            sanktionSachverhaltVermittlung.sanktionSachverhalt.geschaeftsfallID = this.sachverhaltDTO ? this.sachverhaltDTO.sanktionSachverhalt.geschaeftsfallID : null;
        }
        return sanktionSachverhaltVermittlung;
    }

    protected mapToForm(sachverhalt: SanktionSachverhaltVermittlungDTO): void {
        super.mapToForm(sachverhalt);
        this.sachverhaltForm.patchValue({
            nichtZugewStelle: sachverhalt.nichtZugewStelle,
            datumKontrollPeriode: new Date(sachverhalt.sanktionSachverhalt.datumKontrollPeriode),
            stellenBezeichnung: sachverhalt.stellenBezeichnung,
            unternehmensname: sachverhalt.unternehmensname,
            vermittlungvom: sachverhalt.datumZuweisung ? new Date(sachverhalt.datumZuweisung) : ''
        });
    }

    private generateForm() {
        this.sachverhaltForm = this.formBuilder.group({
            grundId: [this.sanktionsgrund, Validators.required],
            nichtZugewStelle: false,
            datumZuweisung: '',
            stellenBezeichnung: ['', Validators.required],
            datumKontrollPeriode: [null, [Validators.required, DateValidator.dateFormatMonthYearNgx, DateValidator.dateValidMonthYearNgx]],
            datumErfasstAm: '',
            unternehmensname: [],
            vermittlungvom: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]],
            vermittlungsnummer: [],
            ablehnung: []
        });
    }

    private populateModal() {
        if (!this.isDisabled) {
            this.tableConfig = Object.assign({}, this.baseTableConfig);
            this.facade.spinnerService.activate(this.sachverhaltChanel);
            this.printTableData = [];
            this.dataRestService.getSachverhalteByType(this.stesId, 'zugewiesen').subscribe(
                (response: BaseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages) => {
                    this.setModalData(response.data);
                    this.facade.spinnerService.deactivate(this.sachverhaltChanel);
                },
                () => {
                    this.facade.spinnerService.deactivate(this.sachverhaltChanel);
                }
            );
        }
    }

    private setModalData(data: ArbeitsvermittlungViewDTO[]) {
        this.tableConfig.data = data ? data.map(row => this.createRow(row)) : [];
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private createRow(data: ArbeitsvermittlungViewDTO) {
        const hasSign = !!(data.meldepflicht && data.sperrfristDatum);
        const filled = data.meldepflicht && this.compareSperrfristDatum(data.sperrfristDatum);
        const tooltip = hasSign ? (filled ? this.meldepflichtEnum.UNTERLIEGT_LAUFEND : this.meldepflichtEnum.UNTERLIEGT_ABGELAUFEN) : this.meldepflichtEnum.KEIN_MELDEPFLICHT;
        const zuweisungsNummer = (data.schnellZuweisungFlag ? 'SZ-' : 'Z-') + data.zuweisungNr.toString();
        return {
            flag: tooltip,
            vermittlungVom: data.zuweisungDatumVom,
            zuweisungsNummer,
            stelleBez: data.stellenbezeichnung,
            unternehmensname: data.unternehmensName,
            ort: data.unternehmensOrt,
            stesID: data.stesIdAvam,
            status: this.facade.dbTranslateService.translate(data, 'zuweisungStatus'),
            vermittlungsErgebnis: this.facade.dbTranslateService.translate(data, 'vermittlungsstand') || '',
            additionalData: data
        };
    }

    private compareSperrfristDatum(sperrfristDatum): boolean {
        return sperrfristDatum >= Date.now();
    }

    private resetFields(): void {
        this.sachverhaltForm.get('datumKontrollPeriode').reset();
        this.sachverhaltForm.get('stellenBezeichnung').reset();
        this.sachverhaltForm.get('unternehmensname').reset();
        this.sachverhaltForm.get('vermittlungvom').reset();
    }
}

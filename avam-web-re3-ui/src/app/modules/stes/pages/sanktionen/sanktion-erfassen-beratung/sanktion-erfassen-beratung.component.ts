import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SanktionErfassenAbstractComponent } from '@stes/pages/sanktionen/sanktion-erfassen-abstract/sanktion-erfassen-abstract.component';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { SanktionenSachverhaltCodeEnum } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { SanktionSachverhaltBeratungDTO } from '@shared/models/dtos-generated/sanktionSachverhaltBeratungDTO';
import { FormBuilder, Validators } from '@angular/forms';
import { DomainEnum } from '@shared/enums/domain.enum';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { ToolboxConfiguration } from '@shared/services/toolbox.service';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-sanktion-erfassen-beratung',
    templateUrl: './sanktion-erfassen-beratung.component.html',
    styleUrls: ['./sanktion-erfassen-beratung.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SanktionErfassenBeratungComponent extends SanktionErfassenAbstractComponent implements OnInit {
    @Input('sachverhaltDTO')
    set sachverhaltDTO(value: SanktionSachverhaltBeratungDTO) {
        this._sachverhaltDTO = value;
        this.stesId = value.sanktionSachverhalt.stesID.toString();
        this.mapToForm(value);
        this.translateGespraechartText(this.sachverhaltForm.controls.gespraechsart.value);
    }

    get sachverhaltDTO(): SanktionSachverhaltBeratungDTO {
        return this._sachverhaltDTO;
    }

    INFOTAG_ID = '2';
    TERMINARTDOMAIN = 'Terminart';
    stesSanktionChannel = 'stesSanktionBeratungChannel';
    loadGrundSanktionsOptions = DomainEnum.GRUND_BERATUNGSGESPRAECH;
    sachverhaltTypeId = SanktionenSachverhaltCodeEnum.SACHVERHALT_BRT;
    stesId: string;
    baseTableConfig = {
        columns: [
            { columnDef: 'art', header: 'stes.label.gespraechsart', cell: (element: any) => `${element.art}` },
            {
                columnDef: 'termin',
                header: 'stes.label.sachverhalttermin',
                cell: (element: any) => `${this.facade.formUtilsService.formatDateNgx(element.termin, 'DD.MM.YYYY') || ''}`
            },
            { columnDef: 'zeit', header: 'common.label.zeit', cell: (element: any) => `${element.zeit}` },
            {
                columnDef: 'status',
                header: 'unternehmen.label.burstatus',
                cell: (element: any) => `${element.status || ''}`
            },
            { columnDef: 'actions', header: 'common.button.uebernehmen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'termin',
            sortOrder: -1,
            displayedColumns: []
        }
    };
    tableConfig;
    formNr = StesFormNumberEnum.BERATUNG_GESPRAECHART_MODAL;
    modalToolboxConfiguration: ToolboxConfiguration[];
    selectedBeratung;

    private terminTypen;
    private infotagType;

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
        this.path = StesSanktionen.SANKTION_ERFASSEN_BERATUNG;
    }

    public ngOnInit() {
        this.generateForm();
        this.setSubscriptions();
        this.loadGrundSanktionsOptionsFor();
        this.populateModal();
    }

    public setModalResult(selectedRow) {
        if (selectedRow) {
            this.selectedBeratung = selectedRow;
            this.sachverhaltForm.controls.datumKontrollPeriode.setValue(selectedRow.kontrollPeriode);
            this.sachverhaltForm.controls.gespraechsart.setValue(this.facade.translateService.instant(selectedRow.art));
            this.sachverhaltForm.controls.termin.setValue(selectedRow.termin ? this.facade.formUtilsService.parseDate(selectedRow.termin) : null);
            this.sachverhaltForm.controls.zeit.setValue(selectedRow.zeit);
            this.sachverhaltForm.markAsDirty();
        }
    }

    public mapToDto(): SanktionSachverhaltBeratungDTO {
        const sachverhaltControl = this.sachverhaltForm.controls;
        const sanktionSachverhaltBeratung: SanktionSachverhaltBeratungDTO = super.mapToDto();
        sanktionSachverhaltBeratung.beratungstyp = sachverhaltControl.gespraechsart.value;
        sanktionSachverhaltBeratung.terminBeratung = this.getTerminBeratungFromControll(sachverhaltControl);
        sanktionSachverhaltBeratung.terminArtCode = this.selectedBeratung ? this.selectedBeratung.artCode : null;
        sanktionSachverhaltBeratung.gfId = this.selectedBeratung ? this.selectedBeratung.gfId : this.sachverhaltDTO.sanktionSachverhalt.geschaeftsfallID;
        sanktionSachverhaltBeratung.sanktionSachverhalt.geschaeftsfallID = this.selectedBeratung
            ? this.selectedBeratung.gfId
            : this.sachverhaltDTO.sanktionSachverhalt.geschaeftsfallID;
        sanktionSachverhaltBeratung.zuweisungStesFachberatungId = this.selectedBeratung ? this.selectedBeratung.zuweisungStesFachberatungId : null;
        sanktionSachverhaltBeratung.stesTerminId = this.selectedBeratung ? this.selectedBeratung.stesTerminID : null;
        return sanktionSachverhaltBeratung;
    }

    private getTerminBeratungFromControll(sachverhaltControl): Date {
        if (sachverhaltControl.termin.value) {
            if (sachverhaltControl.zeit.value && this.selectedBeratung && this.selectedBeratung.artID !== this.infotagType) {
                const zeitDate: Date = moment(sachverhaltControl.zeit.value, 'HH:mm').toDate();
                const currentBeratung = new Date(sachverhaltControl.termin.value);
                currentBeratung.setHours(zeitDate.getHours(), zeitDate.getMinutes());
                return currentBeratung;
            }
            return new Date(sachverhaltControl.termin.value);
        }
        return null;
    }

    protected mapToForm(sachverhalt: SanktionSachverhaltBeratungDTO): void {
        super.mapToForm(sachverhalt);
        this.sachverhaltForm.patchValue({
            gespraechsart: sachverhalt.beratungstyp,
            ...(sachverhalt.terminBeratung && {
                termin: new Date(sachverhalt.terminBeratung),
                zeit: moment(sachverhalt.terminBeratung)
                    .format('YYYY-MM-DD HH:mm')
                    .split(' ')[1]
            })
        });
    }

    private setSubscriptions() {
        this.dataRestService
            .getCode(this.TERMINARTDOMAIN)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(response => {
                this.terminTypen = response;
                this.infotagType = +this.facade.formUtilsService.getCodeIdByCode(this.terminTypen, this.INFOTAG_ID);
                this.translateGespraechartText(this.sachverhaltForm.controls.gespraechsart.value);
            });
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.patchValues();
            });
    }

    private generateForm() {
        this.sachverhaltForm = this.formBuilder.group({
            grundId: [this.sanktionsgrund, Validators.required],
            datumKontrollPeriode: '',
            gespraechsart: ['', Validators.required],
            termin: '',
            zeit: '',
            datumErfasstAm: ''
        });
    }

    private patchValues() {
        if (!this.isDisabled && !this.isBearbeiten && this.sachverhaltForm.controls.gespraechsart.value) {
            this.sachverhaltForm.reset();
            this.setInitialValues();
        }
        this.translateGespraechartText(this.sachverhaltForm.controls.gespraechsart.value);
        this.populateModal();
    }

    private translateGespraechartText(value: string) {
        if (value && this.terminTypen) {
            const selectedType = this.terminTypen.find(item => value === item.textDe || value === item.textFr || value === item.textIt);
            this.sachverhaltForm.controls.gespraechsart.patchValue(
                selectedType[`text${this.facade.translateService.currentLang[0].toUpperCase()}${this.facade.translateService.currentLang[1]}`]
            );
        }
    }

    private populateModal() {
        if (!this.isDisabled) {
            this.tableConfig = Object.assign({}, this.baseTableConfig);
            this.facade.spinnerService.activate(this.sachverhaltChanel);
            this.dataRestService.getSachverhalteByType(this.stesId, 'beratungsTermine').subscribe(
                response => {
                    this.facade.spinnerService.deactivate(this.sachverhaltChanel);
                    this.setModalData(response.data);
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
    }

    private createRow(data) {
        return {
            art: this.facade.dbTranslateService.translate(data.artObject, 'kurzText'),
            termin: data.beginnTS,
            zeit:
                data.artID === this.infotagType
                    ? this.facade.dbTranslateService.translate(data, 'zeitVonBis') || ''
                    : this.facade.formUtilsService.formatDateNgx(data.beginnTS, 'HH:mm') || '',
            status: this.facade.dbTranslateService.translate(data.statusObject, 'text'),
            artID: data.artID,
            gfId: data.gfId,
            zuweisungStesFachberatungId: data.zuweisungStesFachberatungId,
            stesTerminID: data.stesTerminID,
            artCode: data.artObject.code,
            kontrollPeriode: data.zuweisungDatumVom ? new Date(data.zuweisungDatumVom) : this.facade.formUtilsService.parseDate(data.beginnTS)
        };
    }
}

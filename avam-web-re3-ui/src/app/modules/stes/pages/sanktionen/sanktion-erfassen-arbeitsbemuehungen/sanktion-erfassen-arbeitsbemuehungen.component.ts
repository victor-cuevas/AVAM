import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SanktionErfassenAbstractComponent } from '@stes/pages/sanktionen/sanktion-erfassen-abstract/sanktion-erfassen-abstract.component';
import { StesSanktionen } from '@shared/enums/stes-navigation-paths.enum';
import { FormBuilder, Validators } from '@angular/forms';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SanktionenSachverhaltCodeEnum } from '@shared/enums/domain-code/sanktionen-sachverhalts-code.enum';
import { FormUtilsService } from '@app/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { SanktionSachverhaltAbmDTO } from '@shared/models/dtos-generated/sanktionSachverhaltAbmDTO';
import { DomainEnum } from '@shared/enums/domain.enum';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { CoreInfoBarService } from '@app/library/core/core-info-bar/core-info-bar/core-info-bar.service';
import { takeUntil } from 'rxjs/operators';
import { PreviousRouteService } from '@shared/services/previous-route.service';
import * as moment from 'moment';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-sanktion-erfassen-arbeitsbemuehungen',
    templateUrl: './sanktion-erfassen-arbeitsbemuehungen.component.html',
    styleUrls: ['./sanktion-erfassen-arbeitsbemuehungen.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SanktionErfassenArbeitsbemuehungenComponent extends SanktionErfassenAbstractComponent implements OnInit {
    @Input('sachverhaltDTO')
    set sachverhaltDTO(value: SanktionSachverhaltAbmDTO) {
        this._sachverhaltDTO = value;
        this.mapToForm(value);
    }

    get sachverhaltDTO(): SanktionSachverhaltAbmDTO {
        return this._sachverhaltDTO;
    }

    stesSanktionChannel = 'stesSanktionArbeitsBemuehungenChannel';
    loadGrundSanktionsOptions = DomainEnum.GRUND_ARBEITBEMUEHUNGENGESPRAECH;
    sachverhaltTypeId = SanktionenSachverhaltCodeEnum.SACHVERHALT_ABM;
    stesId: string;
    baseTableConfig = {
        columns: [
            {
                columnDef: 'kontrollperiode',
                header: 'stes.label.kontrollperiode',
                cell: (element: any) => this.facade.formUtilsService.formatDateNgx(element.kontrollperiode, FormUtilsService.GUI_MONTH_DATE_FORMAT)
            },
            { columnDef: 'beurteilung', header: 'stes.label.beurteilung', cell: (element: any) => `${element.beurteilung}` },
            { columnDef: 'zeit', header: 'stes.label.inderZeit', cell: (element: any) => `${element.zeit}` },
            {
                columnDef: 'eingangsdatum',
                header: 'stes.label.eingangsdatum',
                cell: (element: any) => this.facade.formUtilsService.formatDateNgx(element.eingangsdatum, FormUtilsService.GUI_DATE_FORMAT) || ''
            },
            { columnDef: 'actions', header: 'common.button.uebernehmen', cell: () => '', fixWidth: true }
        ],
        data: [],
        config: {
            sortField: 'kontrollperiode',
            sortOrder: -1,
            displayedColumns: []
        }
    };
    tableConfig;
    formNr = StesFormNumberEnum.ARBEITSBEMUEHUNGEN_KONTROLL_MODAL;
    selectedArbeitsbemuehungenId;

    constructor(
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected dataRestService: StesDataRestService,
        protected activatedRoute: ActivatedRoute,
        protected previousRouteService: PreviousRouteService,
        private infoBarService: CoreInfoBarService,
        protected changeDetector: ChangeDetectorRef,
        protected facade: FacadeService
    ) {
        super(dataRestService, changeDetector, previousRouteService, facade);
        this.path = StesSanktionen.SANKTION_ERFASSEN_BEMUEHUNGEN;
    }

    public ngOnInit() {
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                this.populateModal();
            });
        this.infoBarService.dispatchInformation({ title: 'stes.subnavmenuitem.sanktionen.erfassen' });
        this.loadGrundSanktionsOptionsFor();
        this.generateForm();
        this.populateModal();
    }

    public setModalResult(selectedRow) {
        if (selectedRow) {
            this.selectedArbeitsbemuehungenId = selectedRow.arbeitsbemuehungenId;
            this.sachverhaltForm.controls.datumKontrollPeriode.setValue(new Date(selectedRow.kontrollperiode));
            this.sachverhaltForm.controls.datumEingang.setValue(selectedRow.eingangsdatum ? new Date(selectedRow.eingangsdatum) : '');
            this.sachverhaltForm.markAsDirty();
        }
    }

    public mapToDto(): SanktionSachverhaltDTO {
        const sachverhaltControl = this.sachverhaltForm.controls;
        const sanktionSachverhaltAbm: SanktionSachverhaltAbmDTO = super.mapToDto();
        sanktionSachverhaltAbm.datumEingang = sachverhaltControl.datumEingang.value;
        sanktionSachverhaltAbm.sanktionSachverhalt.geschaeftsfallID = this.selectedArbeitsbemuehungenId
            ? this.selectedArbeitsbemuehungenId
            : this.sachverhaltDTO
            ? this.sachverhaltDTO.sanktionSachverhalt.geschaeftsfallID
            : null;
        return sanktionSachverhaltAbm;
    }

    protected mapToForm(sanktionAbm: SanktionSachverhaltAbmDTO): void {
        super.mapToForm(sanktionAbm);
        this.sachverhaltForm.patchValue({
            datumEingang: sanktionAbm.datumEingang ? new Date(sanktionAbm.datumEingang) : ''
        });
    }

    private generateForm() {
        this.sachverhaltForm = this.formBuilder.group({
            grundId: ['', Validators.required],
            datumKontrollPeriode: ['', Validators.required],
            datumEingang: '',
            datumErfasstAm: ''
        });
    }

    private populateModal() {
        if (!this.isDisabled) {
            this.tableConfig = Object.assign({}, this.baseTableConfig);
            this.facade.spinnerService.activate(this.sachverhaltChanel);
            this.dataRestService.getKontrollperiode(this.stesId).subscribe(
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
    }

    private createRow(data) {
        moment.locale(this.facade.dbTranslateService.getCurrentLang());
        const beurteilung = this.facade.dbTranslateService.translate(data.beurteilungAbmObject, 'text');
        const zeit = this.facade.translateService.instant(data.istSituationVorAL ? 'stes.label.vorArbeitslosigkeit' : 'stes.label.waehrendArbeitslosigkeit');
        return {
            kontrollperiode: data.datumKontrollPeriode,
            beurteilung,
            zeit,
            eingangsdatum: data.datumEingang,
            arbeitsbemuehungenId: data.arbeitsbemuehungenID
        };
    }
}

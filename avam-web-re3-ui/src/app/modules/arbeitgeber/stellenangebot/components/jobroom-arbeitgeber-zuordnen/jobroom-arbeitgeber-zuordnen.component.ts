import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { MeldungenVerifizierenWizardService } from '@shared/components/new/avam-wizard/meldungen-verifizieren-wizard.service';
import { UnternehmenSearchFormComponent } from '@shared/components/unternehmen/search/unternehmen-search-form/unternehmen-search-form.component';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Unsubscribable } from 'oblique-reactive';
import { FacadeService } from '@shared/services/facade.service';
import { UnternehmenResponseSuchenDTO } from '@dtos/unternehmenResponseSuchenDTO';
import { ToolboxActionEnum, ToolboxService } from '@shared/services/toolbox.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages } from '@dtos/baseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages';
import { UnternehmenSuchenDTO } from '@dtos/unternehmenSuchenDTO';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { BaseResponseWrapperLongWarningMessages } from '@dtos/baseResponseWrapperLongWarningMessages';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { StaatDTO } from '@dtos/staatDTO';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { JobroomArbeitgeberErfassenComponent } from '@modules/arbeitgeber/stellenangebot/components/jobroom-arbeitgeber-erfassen/jobroom-arbeitgeber-erfassen.component';

@Component({
    selector: 'avam-jobroom-arbeitgeber-zuordnen',
    templateUrl: './jobroom-arbeitgeber-zuordnen.component.html',
    styleUrls: ['./jobroom-arbeitgeber-zuordnen.component.scss'],
    providers: [SearchSessionStorageService]
})
export class JobroomArbeitgeberZuordnenComponent extends Unsubscribable implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('unternehmenSearchFormComponent') unternehmenSearchForm: UnternehmenSearchFormComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('ngForm') ngForm: FormGroupDirective;
    @ViewChild('trefferAusBURAnzeigen') trefferAusBURAnzeigen: ElementRef;
    @ViewChild('jobroomArbeitgeberErfassen') jobroomArbeitgeberErfassen: JobroomArbeitgeberErfassenComponent;

    public staatDto: StaatDTO;
    public permissions: typeof Permissions = Permissions;
    public tableConfig;
    public rawTableData: UnternehmenResponseSuchenDTO[] = [];
    public selectedBurData;
    public stateName = 'jobroom-arbeitgeber-form';
    public tableStateName = 'jobroom-arbeitgeber-table';
    public readonly spinnerChannel = 'joobroomZuordnenChannel';
    private baseTableConfig;
    private readonly TOOLBOX_CHANNEL = 'joobroomZuordnenToolboxChannel';
    private printColumns: any;
    private printConfig: any;

    constructor(
        private wizardService: MeldungenVerifizierenWizardService,
        private facadeService: FacadeService,
        private activatedRoute: ActivatedRoute,
        private modalService: NgbModal,
        private unternehmenRestService: UnternehmenRestService,
        private router: Router,
        private route: ActivatedRoute,
        private searchSession: SearchSessionStorageService,
        private stesDataRestService: StesDataRestService
    ) {
        super();
        ToolboxService.CHANNEL = this.TOOLBOX_CHANNEL;
    }

    ngOnInit(): void {
        this.initTableConfig();
        this.generateTable();
        this.configureToolbox();
        this.setSubscriptions();
    }

    ngAfterViewInit(): void {
        if (this.wizardService.osteEgovId) {
            this.getStaatDto();
            this.wizardService.selectCurrentStep(1);
            const state = this.searchSession.restoreStateByKey(this.stateName);
            if (!state) {
                this.reset();
                this.initialSearch();
            }
        } else {
            this.wizardService.selectCurrentStep(0);
        }
    }

    ngOnDestroy(): void {
        this.facadeService.toolboxService.sendConfiguration([]);
        super.ngOnDestroy();
        this.facadeService.fehlermeldungenService.closeMessage();
    }

    initialSearch() {
        this.facadeService.spinnerService.activate(this.spinnerChannel);
        this.unternehmenRestService
            .getArbeitgeberForJobRoom(this.wizardService.osteEgovId)
            .pipe(
                takeUntil(this.unsubscribe),
                finalize(() => this.facadeService.spinnerService.deactivate(this.spinnerChannel))
            )
            .subscribe(response => {
                if (response.data && response.data.length) {
                    this.rawTableData = this.sortByPlzOrt(response.data);
                    this.fillDataTable(this.rawTableData);
                }
            });
    }

    search() {
        this.facadeService.fehlermeldungenService.closeMessage();
        if (this.unternehmenSearchForm.searchForm.valid) {
            this.unternehmenSearchForm.storeState();
            this.facadeService.spinnerService.activate(this.spinnerChannel);
            this.unternehmenRestService
                .searchUnternehmen(this.mapToDTO(this.unternehmenSearchForm.searchForm.controls))
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => this.facadeService.spinnerService.deactivate(this.spinnerChannel))
                )
                .subscribe((response: BaseResponseWrapperListUnternehmenResponseSuchenDTOWarningMessages) => {
                    if (response.data && response.data.length) {
                        this.rawTableData = this.sortByPlzOrt(response.data);
                        this.fillDataTable(this.rawTableData);
                    } else {
                        this.tableConfig.data = [];
                        this.rawTableData = [];
                    }
                });
        } else {
            this.facadeService.fehlermeldungenService.showMessage('stes.error.bearbeiten.pflichtfelder', 'danger');
            this.unternehmenSearchForm.ngForm.onSubmit(undefined);
            OrColumnLayoutUtils.scrollTop();
        }
    }

    selectItem(selectedRow) {
        this.facadeService.spinnerService.activate(this.spinnerChannel);
        if (selectedRow.object.ugInAvam) {
            if (selectedRow.object.burOrtEinheitId) {
                this.unternehmenRestService
                    .getUnternehmenIdByBurOrEnheitNummer(selectedRow.object.burOrtEinheitId)
                    .pipe(
                        takeUntil(this.unsubscribe),
                        finalize(() => this.facadeService.spinnerService.deactivate(this.spinnerChannel))
                    )
                    .subscribe((response: BaseResponseWrapperLongWarningMessages) => {
                        this.wizardService.setOsteEgovAnlegenParamDTO(null);
                        this.wizardService.setUnternehmenId(response.data);
                        this.router.navigate(['../uebernehmen'], {
                            relativeTo: this.route,
                            queryParams: { osteEgovId: this.wizardService.osteEgovId, unternehmenId: response.data }
                        });
                    });
            } else if (selectedRow.object.unternehmenId) {
                this.wizardService.setOsteEgovAnlegenParamDTO(null);
                this.wizardService.setUnternehmenId(selectedRow.object.unternehmenId);
                this.router.navigate(['../uebernehmen'], {
                    relativeTo: this.route,
                    queryParams: { osteEgovId: this.wizardService.osteEgovId, unternehmenId: selectedRow.object.unternehmenId }
                });
            }
        } else {
            this.unternehmenRestService
                .getBurUnternehmenErfassenDTOByBurOrEnheitId(selectedRow.object.burOrtEinheitId)
                .pipe(
                    takeUntil(this.unsubscribe),
                    finalize(() => this.facadeService.spinnerService.deactivate(this.spinnerChannel))
                )
                .subscribe(response => {
                    if (!!response && !!response.data) {
                        const selectedItem = selectedRow.object as UnternehmenResponseSuchenDTO;
                        this.selectedBurData = response.data;
                        this.selectedBurData.uidOrganisationIdCategorie = selectedItem.uidOrganisationIdCategorie;
                        this.selectedBurData.uidOrganisationId = selectedItem.uidOrganisationId;
                        this.selectedBurData.burNr = selectedItem.burNr;
                        this.modalService.open(this.trefferAusBURAnzeigen, {
                            windowClass: 'modal-md',
                            ariaLabelledBy: 'modal-basic-title',
                            centered: true,
                            backdrop: 'static'
                        });
                    }
                });
        }
    }

    reset() {
        const osteEgov = this.wizardService.osteEgovDTO;
        if (osteEgov) {
            this.unternehmenSearchForm.searchForm.reset({
                statusId: this.unternehmenSearchForm.defaultStatusId,
                selector: { label: 'unternehmen.label.sucheavam', value: 'AVAM' }
            });
            const searchFormControls = this.unternehmenSearchForm.searchForm.controls;
            searchFormControls.name.setValue(osteEgov.untName);
            searchFormControls.name.markAsDirty();
            searchFormControls.name.updateValueAndValidity();
            searchFormControls.strasse.setValue(osteEgov.untStrasse);
            searchFormControls.strasse.markAsDirty();
            searchFormControls.strasse.updateValueAndValidity();
            searchFormControls.mitirgendeinemwort.setValue(true);
            const plz = searchFormControls.plz as FormGroup;
            plz.controls.postleitzahl.setValue(osteEgov.untPlz);
            plz.controls.postleitzahl.markAsDirty();
            plz.controls.postleitzahl.updateValueAndValidity();
            plz.controls.ort.setValue(osteEgov.untOrt);
            plz.controls.ort.markAsDirty();
            plz.controls.ort.updateValueAndValidity();
        } else {
            this.wizardService.selectCurrentStep(0);
        }
        this.searchSession.clearStorageByKey(this.stateName);
    }

    arbeitgeberErfassen() {
        this.modalService.open(this.jobroomArbeitgeberErfassen, {
            ariaLabelledBy: 'modal-basic-title',
            windowClass: 'avam-modal-l',
            backdrop: 'static',
            centered: true
        });
    }

    private initTableConfig() {
        this.baseTableConfig = {
            columns: [
                { columnDef: 'name', header: 'stes.label.name', cell: (e: any) => `${e.name}`, initWidth: '22%' },
                { columnDef: 'strasse', header: 'common.label.strassenr', cell: (e: any) => `${e.strasse}` },
                { columnDef: 'plzOrt', header: 'stes.label.plzort', cell: (e: any) => `${e.plzOrt}` },
                { columnDef: 'land', header: 'common.label.land', cell: (e: any) => `${e.land}` },
                { columnDef: 'uidOrganisationFull', header: 'unternehmen.label.uidnummer', cell: (e: any) => `${e.uidOrganisationFull}` },
                { columnDef: 'unternehmenStatus', header: 'unternehmen.label.burstatus', cell: (e: any) => `${e.unternehmenStatus}` },
                { columnDef: 'avamSuche', header: 'unternehmen.label.sucheavam', cell: (e: any) => `${e.avamSuche}`, initWidth: '7%' },
                { columnDef: 'actions', header: 'common.button.uebernehmen', cell: () => '', initWidth: '6%' }
            ],
            data: [],
            config: {
                sortField: 'name',
                sortOrder: 1,
                displayedColumns: []
            }
        };
    }

    private generateTable(): void {
        this.tableConfig = Object.assign({}, this.baseTableConfig);
        this.tableConfig.config.displayedColumns = this.tableConfig.columns.map(c => c.columnDef);
    }

    private fillDataTable(data: UnternehmenResponseSuchenDTO[]): void {
        this.tableConfig.data = data ? data.map(row => this.generateRow(row)) : [];
    }

    private generateRow(responseDTO: UnternehmenResponseSuchenDTO): any {
        const plz = !!responseDTO.plzObject ? responseDTO.plzObject.postleitzahl : '';
        const ort = !!responseDTO.plzObject && !!responseDTO.plzObject.ortDe ? this.facadeService.dbTranslateService.translate(responseDTO.plzObject, 'ort') : '';
        return {
            object: responseDTO,
            dataFromTUnternehmen: responseDTO.ugInAvam,
            name: responseDTO.name,
            strasse: responseDTO.strasse,
            plzOrt: plz ? `${plz} ${ort}` : ort,
            land: this.facadeService.dbTranslateService.translate(responseDTO.land, 'name') || '',
            uidOrganisationFull: responseDTO.uidOrganisationFull,
            unternehmenStatus:
                this.facadeService.dbTranslateService.translate(responseDTO.status, 'text') ||
                this.facadeService.translateService.instant('erweitertesuche.label.burstatus.nichtverfuegbar'),
            avamSuche: this.facadeService.translateService.instant(responseDTO.ugInAvam ? 'common.label.ja' : 'common.label.nein')
        };
    }

    private sortByPlzOrt(response: UnternehmenResponseSuchenDTO[]): UnternehmenResponseSuchenDTO[] {
        return response.sort((row1, row2) => {
            let returnValue = 0;
            if (!!row1.plzObject && !!row2.plzObject) {
                const plzOrt1 = `${row1.plzObject.postleitzahl} ${this.facadeService.dbTranslateService.translate(row1.plzObject, 'ort')}`;
                const plzOrt2 = `${row2.plzObject.postleitzahl} ${this.facadeService.dbTranslateService.translate(row2.plzObject, 'ort')}`;
                returnValue = plzOrt1 < plzOrt2 ? -1 : 1;
            }
            return returnValue;
        });
    }

    private configureToolbox(): void {
        this.printColumns = this.tableConfig.columns.filter(item => item.columnDef !== 'actions');
        this.printConfig = {
            ...this.tableConfig.config,
            displayedColumns: this.printColumns.map(c => c.columnDef)
        };
        this.facadeService.toolboxService.sendConfiguration(ToolboxConfig.getJobroomArbeitgeberZuordnenConfig(), this.TOOLBOX_CHANNEL);

        this.facadeService.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.openPrintModal();
                }
            });
    }

    private setSubscriptions(): void {
        this.facadeService.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                if (!!this.rawTableData) {
                    this.updateTableColumns();
                }
            });
    }

    private openPrintModal(): void {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    private updateTableColumns() {
        this.tableConfig.data = this.tableConfig.data.map(rowData => {
            const plz = !!rowData.object.plzObject ? rowData.object.plzObject.postleitzahl : '';
            const ort = !!rowData.object.plzObject ? this.facadeService.dbTranslateService.translate(rowData.object.plzObject, 'ort') : '';
            return {
                ...rowData,
                plzOrt: plz ? `${plz} ${ort}` : ort,
                land: this.facadeService.dbTranslateService.translate(rowData.object.land, 'name') || '',
                unternehmenStatus:
                    this.facadeService.dbTranslateService.translate(rowData.object.status, 'text') ||
                    this.facadeService.translateService.instant('erweitertesuche.label.burstatus.nichtverfuegbar'),
                avamSuche: this.facadeService.translateService.instant(rowData.dataFromTUnternehmen ? 'common.label.ja' : 'common.label.nein') || ''
            };
        });
    }

    private mapToDTO(formControls: any): UnternehmenSuchenDTO {
        const uidValue = !!formControls.uidnummer.value
            ? formControls.uidnummer.value
                  .split('')
                  .filter(char => !isNaN(char))
                  .join('')
            : null;

        return {
            name: formControls.name.value,
            strasse: formControls.strasse.value,
            strassenNr: formControls.strassenr.value,
            plzDTO: formControls.plz['plzWohnAdresseObject'],
            land: formControls.land.landAutosuggestObject,
            uid: uidValue,
            burNr: formControls.burnummer.value,
            kundenberater: formControls.selector.value.value === 'AVAM' ? formControls.personalberater.benutzerObject : null,
            unternehmenStatusId: formControls.selector.value.value === 'AVAM' ? formControls.statusId.value : null,
            avamSuche: formControls.selector.value.value === 'AVAM',
            sucheWortBeliebig: formControls.mitirgendeinemwort.value,
            sucheUmliegend: formControls.umliegendeorte.value,
            language: this.facadeService.translateService.currentLang
        };
    }

    private getStaatDto() {
        this.stesDataRestService
            .getStaatByISOCode(this.wizardService.osteEgovDTO.untLand, this.spinnerChannel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(response => {
                if (response) {
                    this.staatDto = response;
                } else {
                    this.staatDto = {
                        staatId: -1,
                        iso2Code: '',
                        nameDe: this.wizardService.osteEgovDTO.untLand,
                        nameIt: this.wizardService.osteEgovDTO.untLand,
                        nameFr: this.wizardService.osteEgovDTO.untLand
                    };
                }
            });
    }
}

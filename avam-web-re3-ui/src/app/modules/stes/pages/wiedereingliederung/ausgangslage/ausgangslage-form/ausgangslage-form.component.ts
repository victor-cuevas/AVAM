import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { GenericConfirmComponent } from '@app/shared';
import { VermittelbarkeitCodeEnum } from '@app/shared/enums/domain-code/vermittelbarkeit-code.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { BenutzerDetailDTO } from '@app/shared/models/dtos-generated/benutzerDetailDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StesAusgangslageDetailsDTO } from '@app/shared/models/dtos-generated/stesAusgangslageDetailsDTO';
import { FacadeService } from '@app/shared/services/facade.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permissions } from '@shared/enums/permissions.enum';
import { AusgangslageHandlerService } from './ausgangslage-handler.service';
import { AusgangsLageFormData, SituationsbeurteilungColumns } from './ausgangslage-form.model';
import { AusgangslageReactiveFormsService } from './ausgangslage-reactive-forms.service';
import { AusgangslageTableSortService } from './ausgangslage-table-sort.service';

@Component({
    selector: 'avam-ausgangslage-form',
    templateUrl: './ausgangslage-form.component.html',
    providers: [AusgangslageHandlerService, AusgangslageReactiveFormsService, AusgangslageTableSortService]
})
export class AusgangslageFormComponent implements OnInit, OnChanges {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @Input() formData: AusgangsLageFormData;

    formGroup: FormGroup;
    formArray: FormArray;

    vermittelbarkeitOptions: CodeDTO[];
    qualifikationsbedarfOptions: CodeDTO[];
    handlungsbedarfOptions: CodeDTO[];
    priorityOptions: CodeDTO[];
    resttaggelder: number;

    vermittelbarkeitDefault: string;
    currentUser: BenutzerDetailDTO;

    bearbeitungSuchenTokens: {};
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER;

    rows: any[] = [];
    columnNames = SituationsbeurteilungColumns;
    columns = [
        {
            columnDef: this.columnNames.BEURTEILUNGSKRITERIUM,
            header: 'stes.label.wiedereingliederung.beurteilungskriterium',
            cell: (element: any) => element,
            width: '650px'
        },
        { columnDef: this.columnNames.HANDLUNGSBEDARF, header: 'stes.label.wiedereingliederung.handlungsbedarf', cell: (element: any) => element },
        { columnDef: this.columnNames.PRIORITY, header: 'stes.label.wiedereingliederung.prioritaet', cell: (element: any) => element },
        { columnDef: 'action', header: '', footer: '', width: '60px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);
    tableModified = false;
    reloadTable = true;
    selection = 0;
    sortField = '';
    sortOrder = 0;

    constructor(
        private handler: AusgangslageHandlerService,
        private facade: FacadeService,
        private ammHelper: AmmHelper,
        private modalService: NgbModal,
        private obliqueHelper: ObliqueHelperService,
        private tableSortSevice: AusgangslageTableSortService
    ) {
        this.formGroup = handler.reactiveForms.ausgangslageForm;
        this.formArray = this.formGroup.controls.situationsbeurteilungRows as FormArray;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.initialiseBenuStelleId();
        this.currentUser = this.ammHelper.getCurrentUserForAutosuggestDto();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.formData.currentValue) {
            if (!this.vermittelbarkeitOptions) {
                this.mapData();
            }

            if (this.formData.ausgangslageDetailsDTO) {
                this.mapBearbeiten();
            } else {
                this.mapErfassen();
            }

            if (this.formData.rahmenfristDTO) {
                this.resttaggelder = this.handler.calculateResttaggelder(this.formData.rahmenfristDTO);
            }
        }
    }

    mapErfassen() {
        if (this.rows.length > 0) {
            this.removeAllRows();
        }
        this.formGroup.reset(this.handler.mapDefaultValues(this.vermittelbarkeitDefault, this.currentUser));
        this.addRow();
    }

    mapBearbeiten() {
        if (this.rows.length > 0) {
            this.removeAllRows();
        }

        this.formData.ausgangslageDetailsDTO.beurteilungselementObjects.forEach(element => {
            this.formArray.push(this.handler.reactiveForms.createSystemRow(element));
        });

        this.formGroup.patchValue(this.handler.mapToForm(this.formData));

        this.rows = new Array(this.formData.ausgangslageDetailsDTO.beurteilungselementObjects.length);

        if (this.rows.length === 0) {
            this.addRow();
        }
    }

    mapData() {
        this.vermittelbarkeitOptions = this.facade.formUtilsService.mapDropdownKurztext(this.formData.vermittelbarkeitOptions);
        this.qualifikationsbedarfOptions = this.facade.formUtilsService.mapDropdownKurztext(this.formData.qualifikationsbedarfOptions);
        this.handlungsbedarfOptions = this.facade.formUtilsService.mapDropdownKurztext(this.formData.handlungsbedarfOptions);
        this.priorityOptions = this.facade.formUtilsService.mapDropdownKurztext(this.formData.priorityOptions);
        this.vermittelbarkeitDefault = this.facade.formUtilsService.getCodeIdByCode(this.formData.vermittelbarkeitOptions, VermittelbarkeitCodeEnum.LEICHT);
    }

    mapToDTO(): StesAusgangslageDetailsDTO {
        return this.handler.mapToDTO(this.formData);
    }

    initialiseBenuStelleId() {
        const currentUser = this.facade.authenticationService.getLoggedUser();

        if (currentUser) {
            this.bearbeitungSuchenTokens = {
                berechtigung: Permissions.STES_ANMELDEN_BEARBEITEN,
                myBenutzerstelleId: `${currentUser.benutzerstelleId}`,
                myVollzugsregionTyp: DomainEnum.STES
            };
        }
    }

    reset() {
        if (this.formGroup.dirty || this.tableModified) {
            this.facade.resetDialogService.reset(() => {
                this.facade.fehlermeldungenService.closeMessage();
                if (this.formData.ausgangslageDetailsDTO) {
                    this.mapBearbeiten();
                } else {
                    this.mapErfassen();
                }
                this.tableModified = false;
                this.sortField = '';
                this.sortOrder = 0;
                this.selection = 0;
                this.reload();
            });
        }
    }

    addRow(event?) {
        this.formArray.insert(0, this.handler.reactiveForms.createNewRow());
        this.rows = new Array(this.rows.length + 1);
        this.reload();
        if (event) {
            this.tableModified = true;
        }
    }

    removeRow(index: number) {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.rows = new Array(this.rows.length - 1);
                this.formArray.removeAt(index);
                this.reload();
                this.tableModified = true;
            }
        });
        modalRef.componentInstance.titleLabel = 'i18n.common.delete';
        modalRef.componentInstance.promptLabel = 'common.label.datenWirklichLoeschen';
        modalRef.componentInstance.primaryButton = 'common.button.jaLoeschen';
        modalRef.componentInstance.secondaryButton = 'common.button.loeschenabbrechen';
    }

    sortFunction(event) {
        this.sortField = event.field;
        this.sortOrder = event.order;
        const sorted = this.tableSortSevice.sortData([...this.formArray.value], event.field, event.order, this.formData);
        this.formArray.reset(sorted);
        this.handler.reactiveForms.resetTableValidators(this.formArray);
    }

    private reload() {
        setTimeout(() => {
            this.reloadTable = false;
            this.selection = null;
        });
        setTimeout(() => {
            this.reloadTable = true;
            this.selection = 0;
        });
    }

    private removeAllRows() {
        while (this.formArray.length !== 0) {
            this.formArray.removeAt(0);
        }
        this.rows = [];
    }
}

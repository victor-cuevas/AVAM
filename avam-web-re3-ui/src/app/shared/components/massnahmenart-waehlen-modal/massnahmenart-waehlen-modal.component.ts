import { AlertChannelEnum } from './../alert/alert-channel.enum';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, ChangeDetectorRef, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { ElementKategorieDTO } from '@app/shared/models/dtos-generated/elementKategorieDTO';
import { StrukturElementDTO } from '@app/shared/models/dtos-generated/strukturElementDTO';
import { StrukturElementQueryParams } from '@app/shared/models/dtos-generated/strukturElementQueryParams';
import { DateValidator } from '@app/shared/validators/date-validator';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'oblique-reactive';
import { Subscription, forkJoin } from 'rxjs';
import { ElementKategorieQueryParams, MassnahmenQueryParams, NodeData } from './massnahmenart-tree-models';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { MassnahmeartTreeService } from './massnahmeart-tree.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TreeOptionInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-option.interface';
import { TreeNodeInterface } from '@app/library/wrappers/data/avam-generic-tree-table/tree-node.interface';

@Component({
    selector: 'avam-massnahmenart-waehlen-modal',
    templateUrl: './massnahmenart-waehlen-modal.component.html',
    styleUrls: ['./massnahmenart-waehlen-modal.component.scss'],
    providers: [MassnahmeartTreeService]
})
export class MassnahmenartWaehlenModalComponent implements OnInit, OnDestroy {
    @Input() queryParams: MassnahmenQueryParams;
    @Input() disableKategorie = true;
    @Input() selectOnlyChildren = true;
    @Input() getPaths = false;
    @Output() onSelect: EventEmitter<NodeData> = new EventEmitter();
    @ViewChild('actionColumnTemplate') actionColumnTemplate: TemplateRef<any>;
    formNumber = StesFormNumberEnum.MASSNAHMENART_WAEHLEN;
    spinnerChannel = 'massnahmenart-auswaehlen';
    oldSpinnerChannel: string;
    elKategorien: ElementKategorieDTO[];
    strukturEl: StrukturElementDTO;
    treeArray: TreeNodeInterface[] = [];
    treeOptions: TreeOptionInterface;
    massnahmenForm: FormGroup;
    kategorieOptions = [];
    formSub: Subscription;
    alertChannel = AlertChannelEnum;

    constructor(
        private dataService: StesDataRestService,
        private ammDataService: AmmRestService,
        private readonly modalService: NgbModal,
        @Optional() private activeModal: NgbActiveModal,
        private spinnerService: SpinnerService,
        private formBuilder: FormBuilder,
        private cd: ChangeDetectorRef,
        private formUtils: FormUtilsService,
        private fehlermeldungService: FehlermeldungenService,
        private massnahmeartTreeService: MassnahmeartTreeService
    ) {
        this.oldSpinnerChannel = SpinnerService.CHANNEL;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        this.fehlermeldungService.closeMessage(AlertChannelEnum.NEST_MODAL);
        this.initForm();
        this.setTreeOptions();
        this.loadData();
        this.cd.detectChanges();
    }

    initForm() {
        this.massnahmenForm = this.formBuilder.group({
            kategorie: [null, [Validators.required]],
            date: [null, [DateValidator.dateFormatNgx, DateValidator.dateValidNgx]]
        });
    }

    setTreeOptions() {
        this.treeOptions = {
            columnOrder: ['elementName', 'elementCode', 'gueltigVonStr', 'gueltigBisStr'],
            columnTitle: ['amm.administration.label.elementname', 'amm.administration.label.code', 'amm.akquisition.label.gueltigvon', 'amm.akquisition.label.gueltigbis'],
            actions: {
                template: this.actionColumnTemplate
            },
            firstColumnCustomWidth: 650
        };
    }

    loadData() {
        this.spinnerService.activate(this.spinnerChannel);
        const elKatParams: ElementKategorieQueryParams = {
            type: this.queryParams.type,
            elementKategorieId: this.queryParams.elementKategorieId,
            berechtigungsKey: this.queryParams.berechtigungsKey
        };
        this.dataService.getElementKategorie(elKatParams, AlertChannelEnum.NEST_MODAL).subscribe(
            elKatResp => {
                if (elKatResp.data) {
                    this.elKategorien = elKatResp.data;
                    const aktivKategorie: ElementKategorieDTO =
                        this.elKategorien.find(kategorie => kategorie.aktuell === true) || this.elKategorien.find(kategorie => kategorie.aktiv === true);
                    const stEleParams: StrukturElementQueryParams = {
                        amtsstellenId: this.queryParams.amtsstellenId,
                        anzeigeDatum: this.queryParams.anzeigeDatum ? this.queryParams.anzeigeDatum : new Date(),
                        ausgleichstelleInfo: this.queryParams.ausgleichstelleInfo,
                        elementkategorieId: aktivKategorie.elementkategorieId,
                        rootAbGesetzVonId: this.queryParams.rootAbGesetzVonId,
                        rootId: this.queryParams.rootId
                    };
                    this.kategorieOptions = this.elKategorien.map(element => this.dropdownMapper(element));
                    this.populateForm(aktivKategorie);
                    this.getStrukturElement(stEleParams);
                } else {
                    this.spinnerService.deactivate(this.spinnerChannel);
                }
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
            }
        );
    }

    getStrukturElement(stEleParams) {
        this.dataService.getStrukturElement(stEleParams, AlertChannelEnum.NEST_MODAL).subscribe(
            stElResp => {
                this.strukturEl = stElResp.data;
                this.treeArray = [this.massnahmeartTreeService.buildTree(this.strukturEl, stEleParams.elementkategorieId)];
                this.spinnerService.deactivate(this.spinnerChannel);
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
            }
        );
    }

    dropdownMapper(element: ElementKategorieDTO) {
        return {
            value: element.elementkategorieId,
            labelFr: element.beschreibungFr,
            labelIt: element.beschreibungIt,
            labelDe: element.beschreibungDe,
            fullData: element
        };
    }

    populateForm(aktivKategorie: ElementKategorieDTO) {
        this.queryParams.anzeigeDatum
            ? this.massnahmenForm.controls.date.setValue(this.formUtils.parseDate(this.queryParams.anzeigeDatum))
            : this.massnahmenForm.controls.date.setValue(new Date());
        this.massnahmenForm.controls.kategorie.setValue(aktivKategorie.elementkategorieId);
        this.formSub = this.onFormValueChanges();
    }

    onFormValueChanges(): Subscription {
        return this.massnahmenForm.valueChanges.subscribe(value => {
            this.spinnerService.activate(this.spinnerChannel);
            const stEleParams: StrukturElementQueryParams = {
                amtsstellenId: this.queryParams.amtsstellenId,
                anzeigeDatum: value.date,
                ausgleichstelleInfo: this.queryParams.ausgleichstelleInfo,
                elementkategorieId: value.kategorie,
                rootAbGesetzVonId: this.queryParams.rootAbGesetzVonId,
                rootId: this.queryParams.rootId
            };
            this.getStrukturElement(stEleParams);
        });
    }

    onClick(element) {
        if (this.getPaths) {
            this.getPathsAndEmitDataAndClose(element);
        } else {
            this.emitDataAndClose(element);
        }
    }

    getPathsAndEmitDataAndClose(element) {
        this.spinnerService.activate(this.spinnerChannel);
        forkJoin([
            this.ammDataService.getStrukturElementPath(element.model.data.strukturelementId, AlertChannelEnum.MODAL),
            this.ammDataService.getStrukturElementPath(element.model.data.mappingAusgleichstelleId, AlertChannelEnum.MODAL)
        ]).subscribe(
            ([amtsstelle, ausgleichsstelle]) => {
                element.model.data.amtsstellePath = amtsstelle.data;
                element.model.data.ausgleichstellePath = ausgleichsstelle.data;
                this.spinnerService.deactivate(this.spinnerChannel);
                this.emitDataAndClose(element);
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
            }
        );
    }

    emitDataAndClose(element: any) {
        this.onSelect.emit(element.model.data);
        this.close();
    }

    close() {
        if (this.activeModal) {
            this.activeModal.close();
            return;
        }
        this.modalService.dismissAll();
    }

    ngOnDestroy(): void {
        if (this.formSub) {
            this.formSub.unsubscribe();
        }
        SpinnerService.CHANNEL = this.oldSpinnerChannel;
        this.fehlermeldungService.closeMessage(AlertChannelEnum.NEST_MODAL);
    }
}

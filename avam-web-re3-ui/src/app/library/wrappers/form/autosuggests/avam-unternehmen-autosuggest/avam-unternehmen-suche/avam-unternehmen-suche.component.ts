import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { NumberValidator } from '@app/shared/validators/number-validator';
import { PlzDTO } from 'src/app/shared/models/dtos-generated/plzDTO';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { CoreButtonGroupInterface } from '@app/library/core/core-button-group/core-button-group.interface';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';
import { UnternehmenStatusCodeEnum } from '@app/shared/enums/domain-code/unternehmen-status-code.enum';
import { SpinnerService } from 'oblique-reactive';
import { UnternehmenQueryDTO } from '@dtos/unternehmenQueryDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Subscription, forkJoin } from 'rxjs';

import { CodeDTO } from '@dtos/codeDTO';
import { BaseResponseWrapperListUnternehmenPopupDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListUnternehmenPopupDTOWarningMessages';
import { StaatDTO } from '@dtos/staatDTO';
import { BenutzerAutosuggestType } from '../../avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { PersonenNrValidator } from '@app/shared/validators/personenNr-validator';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AvamGenericTablePrintComponent } from '@shared/components/avam-generic-table-print/avam-generic-table-print.component';
import { BurOertlicheEinheitXDTO } from '@app/shared/models/dtos-generated/burOertlicheEinheitXDTO';
import { UnternehmenPopupDTO } from '@app/shared/models/dtos-generated/unternehmenPopupDTO';
import { TwoFieldsAutosuggestValidator } from '@shared/validators/two-fields-autosuggest-validator';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'avam-unternehmen-suche',
    templateUrl: './avam-unternehmen-suche.component.html',
    styleUrls: ['./avam-unternehmen-suche.component.scss']
})
export class AvamUnternehmenSucheComponent implements OnInit, OnDestroy {
    static TRUE_VALUE = 'true';
    static FALSE_VALUE = 'false';
    static STATUS_BFS = '6';

    /**
     * The label of the modal window.
     *
     * @type {string}
     * @memberof AvamUnternehmenSucheComponent
     */
    @Input() label: string;

    /**
     * Determines whether we search in Avam only or in both Avam and BUR
     *
     * @type {boolean}
     * @memberof AvamUnternehmenSucheComponent
     */
    @Input() isAvamOnly?: boolean;

    /**
     * Determines the modal is submodal or not.
     *
     * @type {boolean}
     * @memberof AvamUnternehmenSucheComponent
     */
    @Input() isSubModal?: boolean;

    /**
     * Event emitter that emits event when the modal is submodal and it is closed.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamUnternehmenSucheComponent
     */
    @Output() closeEmitter: EventEmitter<any> = new EventEmitter();

    /**
     * An event emitter that emits the selected item.
     *
     * @type {EventEmitter<any>}
     * @memberof AvamUnternehmenSucheComponent
     */
    @Output() selectItemEmitter: EventEmitter<any> = new EventEmitter();

    @ViewChild('modalPrint') modalPrint: ElementRef;

    /**
     * The FormGroup of the search panel.
     *
     * @type {FormGroup}
     * @memberof AvamUnternehmenSucheComponent
     */
    searchForm: FormGroup;

    /**
     * Property which indicates whether the search button should be disabled.
     *
     * @type {boolean}
     * @memberof AvamUnternehmenSucheComponent
     */
    searchNotAvailable: boolean;

    /**
     * Indicates if BUR is selected for search
     */
    burSelected = false;

    dataSource: any[] = [];

    unternehmenSucheChannel = 'unternehmen-suche';
    unternehmenResultChannel = 'unternehmen-result-modal';
    stateKey = 'avam-unternehmen-suche';
    originalChannel: string;

    buttonGroup: CoreButtonGroupInterface[];
    statusDropdownLabels: any[] = [];
    defaultStatusId: string;
    unternehmenResult: any[] = [];
    searchDone: boolean;
    isAvamSuche: boolean;
    staatSchweiz: StaatDTO;

    modalToolboxConfiguration: ToolboxConfiguration[];
    observeClickActionSub: Subscription;

    printModalRef: NgbModalRef;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    alertChannel = AlertChannelEnum;

    /**
     * UI Number of the form.
     *
     * @memberof AvamUnternehmenSucheComponent
     */
    formNr = StesFormNumberEnum.UNTERNEHMEN_DETAILSUCHE;

    constructor(
        public activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
        private facade: FacadeService,
        private stesDataRestService: StesDataRestService,
        private spinnerService: SpinnerService,
        private fehlermeldungenService: FehlermeldungenService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private readonly modalService: NgbModal,
        private searchSession: SearchSessionStorageService
    ) {
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.unternehmenResultChannel;
    }

    ngOnInit() {
        this.initModalToolboxConfig();
        this.initForm();

        this.searchForm.valueChanges.subscribe(() => {
            this.enableSearch();
        });

        this.initDropdownLabels();
        this.initButtons();
        this.enableSearch();
        this.searchSession.restoreDefaultValues(this.stateKey);
    }

    ngOnDestroy() {
        ToolboxService.CHANNEL = this.originalChannel;
        this.observeClickActionSub.unsubscribe();
    }

    /**
     * Submits the populated data in the search form.
     *
     * @memberof AvamUnternehmenSucheComponent
     */
    onSubmit() {
        this.isAvamSuche = this.searchForm.controls.sucheAvam.value.value === 'true';
        const unternehmenQueryDTO = this.mapToDTO();

        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.spinnerService.activate(this.unternehmenResultChannel);

        const sources = [this.stesDataRestService.searchAvamUnternehmen(unternehmenQueryDTO, AlertChannelEnum.MODAL)] as any;

        if (!this.isAvamSuche) {
            sources.push(this.stesDataRestService.getStaatSwiss(AlertChannelEnum.MODAL));
        }

        forkJoin<BaseResponseWrapperListUnternehmenPopupDTOWarningMessages, StaatDTO>(sources).subscribe(
            ([unternehmenResults, staatResult]) => {
                this.staatSchweiz = staatResult;
                this.mapSearchResults(unternehmenResults);
            },
            () => {
                this.unternehmenResult = [];
                this.spinnerService.deactivate(this.unternehmenResultChannel);
            }
        );
        OrColumnLayoutUtils.scrollTop();
    }

    /**
     * Resets the search form and the result list
     *
     * @memberof AvamUnternehmenSucheComponent
     */
    reset() {
        this.searchForm.reset({
            statusId: this.defaultStatusId,
            name: '',
            irgendeinemWort: false,
            strasse: '',
            stesId: '',
            umliegendeOrte: false,
            postleitzahl: '',
            ort: '',
            land: null,
            uid: '',
            burNr: '',
            kundenBerater: null,
            sucheAvam: true
        });
        this.initButtons();
        this.burSelected = false;
        this.unternehmenResult = [];
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.searchDone = false;
        this.dataSource = [];
        this.searchSession.restoreDefaultValues(this.stateKey);

        this.enableSearch();
    }

    /**
     * Closes the modal window.
     *
     * @memberof AvamUnternehmenSucheComponent
     */
    close() {
        if (this.isSubModal) {
            this.closeEmitter.emit();
        } else {
            this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
            this.modalService.dismissAll();
        }
    }

    /**
     * Closes the print modal.
     *
     * @param {boolean} value
     * @memberof AvamUnternehmenSucheComponent
     */
    closePrintModal(value: boolean) {
        if (value) {
            this.printModalRef.close();
        }
    }

    /**
     * Emits event when an item is selected from the result table and closes the the modal window.
     *
     * @param {BurOertlicheEinheitXDTO | UnternehmenPopupDTO} item
     * @memberof AvamUnternehmenSucheComponent
     */
    itemSelected(item: BurOertlicheEinheitXDTO | UnternehmenPopupDTO) {
        this.activeModal.close(item);
    }

    /**
     * Switch between BUR and AVAM Search.
     *
     * @param {CoreButtonGroupInterface} button Clicked button from the buttonGroup (BUR or AVAM).
     */
    changeSuche(button: CoreButtonGroupInterface) {
        this.burSelected = button.value !== AvamUnternehmenSucheComponent.TRUE_VALUE;
        this.searchForm.controls.statusId.setValue(this.burSelected ? null : this.defaultStatusId);

        if (this.burSelected) {
            this.searchForm.controls.kundenBerater.setValue(null);
        }
    }

    /**
     * Enables the search button if the search critea is fulfilled.
     *
     * @private
     * @memberof AvamUnternehmenSucheComponent
     */
    private enableSearch() {
        if (this.searchInBur() || this.searchInAvam() || this.searchForm.invalid) {
            this.searchNotAvailable = true;
        } else {
            this.searchNotAvailable = false;
        }
    }

    /**
     * Opens the print modal window.
     *
     * @private
     * @memberof AvamUnternehmenSucheComponent
     */
    private openPrintModal() {
        const modalRef = this.modalService.open(AvamGenericTablePrintComponent, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
        modalRef.componentInstance.dataSource = this.dataSource;
        modalRef.componentInstance.content = this.modalPrint;
    }

    /**
     * Initializes the toolbox configuration.
     *
     * @private
     * @memberof AvamUnternehmenSucheComponent
     */
    private initModalToolboxConfig() {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    /**
     * Initializes the form.
     *
     * @private
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private initForm() {
        this.searchForm = this.formBuilder.group({
            statusId: '',
            name: ['', TwoFieldsAutosuggestValidator.inputMinLength(2)],
            irgendeinemWort: false,
            strasse: ['', TwoFieldsAutosuggestValidator.inputMinLength(2)],
            strassenNr: '',
            stesId: '',
            umliegendeOrte: false,
            postleitzahl: ['', TwoFieldsAutosuggestValidator.inputMinLength(2, 'postleitzahl')],
            ort: ['', TwoFieldsAutosuggestValidator.inputMinLength(2, 'ort')],
            land: [null, [TwoFieldsAutosuggestValidator.inputMinLength(2, 'nameDe')]],
            uid: ['', NumberValidator.containsNineDigits],
            burNr: ['', PersonenNrValidator.val011],
            kundenBerater: null,
            sucheAvam: []
        });

        return this.searchForm;
    }

    /**
     * Initializes the buttons for search in Avam and in BUR.
     *
     * @private
     * @memberof AvamUnternehmenSucheComponent
     */
    private initButtons() {
        this.buttonGroup = [
            {
                label: 'unternehmen.label.sucheavam',
                value: AvamUnternehmenSucheComponent.TRUE_VALUE,
                selected: true
            },
            {
                label: 'unternehmen.label.suchebure',
                value: AvamUnternehmenSucheComponent.FALSE_VALUE,
                disabled: this.isAvamOnly
            }
        ];
    }

    /**
     * Initializes the status dropdown labels.
     *
     * @private
     * @memberof AvamUnternehmenSucheComponent
     */
    private initDropdownLabels(): void {
        this.spinnerService.activate(this.unternehmenSucheChannel);

        this.stesDataRestService.getCode(DomainEnum.UNTERNEHMEN_STATUS, AlertChannelEnum.MODAL).subscribe(
            (status: any) => {
                this.statusDropdownLabels = this.facade.formUtilsService.mapDropdownKurztext(status).filter(obj => obj.code !== AvamUnternehmenSucheComponent.STATUS_BFS);
                this.defaultStatusId = this.facade.formUtilsService.getCodeIdByCode(this.statusDropdownLabels, UnternehmenStatusCodeEnum.STATUS_AKTIV);
                this.searchForm.controls.statusId.setValue(this.defaultStatusId);
                this.spinnerService.deactivate(this.unternehmenSucheChannel);
            },
            () => this.spinnerService.deactivate(this.unternehmenSucheChannel)
        );
    }

    /**
     * Determines whether the search is in Bur and whether it has to be enabled.
     *
     * @private
     * @returns {boolean}
     * @memberof AvamUnternehmenSucheComponent
     */
    private searchInBur(): boolean {
        const controls = this.searchForm.controls;

        return (
            !controls.sucheAvam.value &&
            !controls.name.value &&
            !controls.strasse.value &&
            !controls.postleitzahl.value &&
            !controls.ort.value &&
            !controls.uid.value &&
            !controls.burNr.value
        );
    }

    /**
     * Determines whether the search is in Avam and whehter it has to be enabled.
     *
     * @private
     * @returns {boolean}
     * @memberof AvamUnternehmenSucheComponent
     */
    private searchInAvam(): boolean {
        const controls = this.searchForm.controls;

        return (
            controls.sucheAvam.value &&
            !controls.name.value &&
            !controls.strasse.value &&
            !controls.ort.value &&
            !controls.postleitzahl.value &&
            !controls.uid.value &&
            !controls.burNr.value &&
            !controls.kundenBerater.value
        );
    }

    /**
     * Maps the data from the form to UnternehmenQueryDTO.
     *
     * @private
     * @returns {UnternehmenQueryDTO}
     * @memberof AvamUnternehmenSucheComponent
     */
    private mapToDTO(): UnternehmenQueryDTO {
        const controls = this.searchForm.controls;

        const unternehmenQueryDTO: UnternehmenQueryDTO = {
            name: controls.name.value,
            strasse: controls.strasse.value,
            strassenNr: controls.strassenNr.value,
            plzDTO: this.mapToPlzDTO(this.searchForm['plzWohnAdresseObject']),
            land: controls.land['landAutosuggestObject'],
            uid: controls.uid.value,
            burNr: controls.burNr.value,
            kundenberater: controls.kundenBerater['benutzerObject'],
            unternehmenStatusId: this.searchForm.controls.statusId.value,
            avamSuche: this.isAvamSuche,
            sucheWortBeliebig: controls.irgendeinemWort.value,
            sucheUmliegend: controls.umliegendeOrte.value,
            language: this.translateService.currentLang
        };

        return unternehmenQueryDTO;
    }

    /**
     * Maps the data from the plz-autosuggest to a PlzDTO.
     *
     * @private
     * @param postleitzahl
     * @param ort
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private mapToPlzDTO(value: any): PlzDTO {
        if (!value || (!value.ortWohnadresseAusland && !value.plzWohnadresseAusland)) {
            return null;
        }

        const plzDTO: PlzDTO = { plzId: -1, ortDe: value.ortWohnadresseAusland, postleitzahl: value.plzWohnadresseAusland };

        return !value.plzId || value.plzId === -1 ? plzDTO : { ...plzDTO, plzId: value.plzId, ortFr: value.ortFr, ortIt: value.ortIt };
    }

    /**
     * Prepares the table configuration and maps the received from the BE data.
     *
     * @private
     * @param {*} result
     * @memberof AvamUnternehmenSucheComponent
     */
    private mapSearchResults(result) {
        this.searchDone = true;

        if (result.data) {
            this.unternehmenResult = result.data;
            this.mapTableData(result.data ? [...result.data] : []);
        } else {
            this.unternehmenResult = [];
        }
        this.searchSession.restoreDefaultValues(this.stateKey);
        this.spinnerService.deactivate(this.unternehmenResultChannel);
    }

    /**
     * Creates the configuration for populating the data in the rows in result table.
     *
     * @private
     * @param {*} dataBE
     * @memberof AvamUnternehmenSucheComponent
     */
    private mapTableData(dataBE: any) {
        const data = dataBE.map((unternehmenData: any) => {
            return {
                exclamation: unternehmenData.betriebsTypId === 'L00',
                name: this.getName(unternehmenData),
                strasse: this.getStrasseNr(unternehmenData),
                plzOrt: this.getPlzOrt(unternehmenData),
                land: this.getStaat(unternehmenData),
                uidOrganisationId: this.getUID(unternehmenData),
                status: this.getUnternehmenStatus(unternehmenData),
                sucheAvam: this.getAvamSuche(unternehmenData),
                betriebsTypId: unternehmenData.betriebsTypId,
                object: unternehmenData
            };
        });
        this.dataSource = data;
    }

    /**
     * Format the data in the Name column of the result table.
     *
     * @private
     * @param {*} unternehmen
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private getName(unternehmen) {
        let name = unternehmen.name1;

        if (unternehmen.name2) {
            name = `${name} ${unternehmen.name2}`;
        }

        if (unternehmen.name3) {
            name = `${name} ${unternehmen.name3}`;
        }

        return name;
    }

    /**
     * Formats the data in the Strasse / Nr. column of the result table.
     *
     * @private
     * @param {*} unternehmen
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private getStrasseNr(unternehmen) {
        return unternehmen.strasse ? `${unternehmen.strasse} ${unternehmen.strasseNr || ''}` : '';
    }

    /**
     * Formats the data in the PLZ / Ort column of the result table.
     *
     * @private
     * @param {*} unternehmen
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private getPlzOrt(unternehmen) {
        let formattedPlzOrt = '';

        if (this.isAvamSuche) {
            if (unternehmen.plz && unternehmen.ortDe) {
                formattedPlzOrt = `${unternehmen.plz} ${this.dbTranslateService.translate(unternehmen, 'ort')}`;
            } else if (unternehmen.plzAusland && unternehmen.ortAusland) {
                formattedPlzOrt = `${unternehmen.plzAusland} ${unternehmen.ortAusland}`;
            }
        } else {
            formattedPlzOrt = unternehmen.plz && unternehmen.ort ? `${unternehmen.plz} ${unternehmen.ort}` : '';
        }

        return formattedPlzOrt;
    }

    /**
     *  Formats the data in the Land column of the result table.
     *
     * @private
     * @param {*} unternehmen
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private getStaat(unternehmen) {
        let formattedStaat = '';

        if (this.isAvamSuche) {
            formattedStaat = unternehmen.staatId ? this.dbTranslateService.translate(unternehmen, 'staat') : '';
        } else {
            formattedStaat = this.staatSchweiz ? this.dbTranslateService.translate(this.staatSchweiz, 'name') : '';
        }

        return formattedStaat;
    }

    /**
     * Formats the data in the UID column of the result table.
     *
     * @private
     * @param {*} unternehmen
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private getUID(unternehmen) {
        const uidCategorie = unternehmen.uidOrganisationIdCategorie;
        const uid = unternehmen.uidOrganisationId;

        let formattedUID = '';
        if (uidCategorie && uidCategorie.trim() && uid && uid > 0) {
            const uidString = uid.toString();
            formattedUID = `${uidCategorie}-`;

            if (uidString === '0') {
                formattedUID = `${formattedUID}000.000.000`;
            } else if (uidString.length === 9) {
                formattedUID = `${formattedUID}${uidString.substring(0, 3)}.${uidString.substring(3, 6)}.${uidString.substring(6, 9)}`;
            }
        }

        return formattedUID;
    }

    /**
     * Formats the data in the Status column of the Status column in the result table.
     *
     * @private
     * @param {*} unternehmen
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private getUnternehmenStatus(unternehmen) {
        const sucheAvam = this.isAvamSuche;
        let unternehmenStatus = '';

        if (sucheAvam) {
            unternehmenStatus = unternehmen.statusId ? this.dbTranslateService.translate(unternehmen, 'status') : '';
        } else {
            unternehmenStatus = this.translateService.instant('erweitertesuche.label.burstatus.nichtverfuegbar');
        }

        return unternehmenStatus;
    }

    /**
     * Formats the data in the AVAM column of the result table.
     *
     * @private
     * @returns
     * @memberof AvamUnternehmenSucheComponent
     */
    private getAvamSuche(unternehmenData: any) {
        return this.translateService.instant(this.isAvamSuche || unternehmenData.ugInAvam ? 'amm.abrechnungen.label.ja' : 'amm.abrechnungen.label.nein');
    }
}

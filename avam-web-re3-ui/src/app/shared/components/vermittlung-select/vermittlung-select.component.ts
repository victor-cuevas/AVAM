import { Component, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormGroupDirective, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputControlValueAccessor } from '../../classes/input-control-value-accessor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VermittlungDto } from '@shared/models/dtos/vermittlung-dto.interface';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '../../services/toolbox.service';
import { Subscription } from 'rxjs';
import { ArbeitsvermittlungRestService } from '../../../core/http/arbeitsvermittlung-rest.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { SortEvent } from '../../directives/table.sortable.header.directive';
import { SortOrderEnum } from '../../enums/sort-order.enum';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ArbeitsvermittlungDTO } from '@app/shared/models/dtos-generated/arbeitsvermittlungDTO';
import { TableButtonTypeEnum } from '@app/shared/enums/table-button-type.enum';
import { AvamGenericTablePrintComponent } from '@shared/components/avam-generic-table-print/avam-generic-table-print.component';
import { BaseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages';
import { ArbeitsvermittlungViewDTO } from '@app/shared/models/dtos-generated/arbeitsvermittlungViewDTO';
import { MeldepflichtEnum } from '@app/shared/enums/table-icon-enums';
import * as moment from 'moment';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';

@Component({
    selector: 'app-vermittlung-select',
    templateUrl: './vermittlung-select.component.html',
    styleUrls: ['./vermittlung-select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => VermittlungSelectComponent),
            multi: true
        }
    ]
})
export class VermittlungSelectComponent extends InputControlValueAccessor implements OnInit, OnDestroy {
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    @Input() placeholder: string;
    @Input() model = null;
    @Input() disabled = false;
    @Output() inputChangedEvent: EventEmitter<any> = new EventEmitter();
    @Output() vermittlungSelectedEventEmitter: EventEmitter<VermittlungDto> = new EventEmitter();
    @Output() showInfoEventEmitter: EventEmitter<boolean> = new EventEmitter();
    @Output() modalClosed: EventEmitter<boolean> = new EventEmitter();

    stesId: string;
    arbeitsvermittlungChannel = 'arbeitsvermittlung-modal';
    modalToolboxConfiguration: ToolboxConfiguration[];
    arbeitsvermittlungToolboxId = 'arbeitsvermittlung-modal';
    arbeitsvermittlungData: any[] = [];
    tableButtons = [TableButtonTypeEnum.UEBERNEHMEN];
    iconLaufend: any;
    iconAbgelaufen: any;

    vermittlungDefaultSort: SortEvent = { direction: SortOrderEnum.DESCENDING, column: 'vom', columnsToSort: ['nr', 'vom'] };

    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('modalArbeitsvermittlungSuchen') private modalArbeitsvermittlungSuchen: ArbeitsvermittlungDTO;

    private originalChannel: string;
    private observeClickActionSub: Subscription;

    constructor(
        private render: Renderer2,
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService,
        private arbeitsvermittlungRestService: ArbeitsvermittlungRestService,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private formUtils: FormUtilsService
    ) {
        super(render);
        this.iconLaufend = document.createElement('i');
        this.iconLaufend.className = 'pa-2 full-centered fa fa-flag';
        this.iconAbgelaufen = document.createElement('i');
        this.iconAbgelaufen.className = 'pa-2 full-centered fa fa-flag-o';

        SpinnerService.CHANNEL = this.arbeitsvermittlungChannel;
    }

    ngOnInit() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
    }

    openPrintModal() {
        const modalRef = this.modalService.open(AvamGenericTablePrintComponent, {
            ariaLabelledBy: 'zahlstelle-basic-title',
            windowClass: 'avam-modal-xl',
            centered: true,
            backdrop: 'static'
        });
        modalRef.componentInstance.dataSource = this.arbeitsvermittlungData;
        modalRef.componentInstance.content = this.modalPrint;
    }

    onClear(): void {
        this.model = '';
        this.emmitWriteEvent(null);
    }

    emmitWriteEvent(event: any) {
        this.inputChangedEvent.emit(event);
    }

    openVermittlungen(): void {
        this.loadData();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.arbeitsvermittlungToolboxId;
        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });

        this.modalService.open(this.modalArbeitsvermittlungSuchen, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' }).result.then(
            result => {
                ToolboxService.CHANNEL = this.originalChannel;
                this.modalClosed.emit(true);
            },
            reason => {
                ToolboxService.CHANNEL = this.originalChannel;
                this.modalClosed.emit(true);
            }
        );
    }

    itemSelected(vermittlungEvent): void {
        this.model = vermittlungEvent.nr;
        this.vermittlungSelectedEventEmitter.emit(vermittlungEvent);
        this.close();
    }

    showInfo(): void {
        // this.showInfoEventEmitter.emit(true);
    }

    close() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        this.modalService.dismissAll();
    }

    getFormNr(): string {
        return StesFormNumberEnum.VERMITTLUNG_AUSWAEHLEN;
    }

    /**
     * Build gui entry for table
     *
     * @param dto the ArbeitsvermittlungDTO received from server
     * @param guiEntry the client-side entry for usage in table
     */
    static buildArbeitsVermittlungDtoCore(dto: ArbeitsvermittlungViewDTO, guiEntry) {
        guiEntry.nr = (dto.schnellZuweisungFlag ? 'SZ-' : 'Z-') + dto.zuweisungNr.toString();
        guiEntry.id = dto.zuweisungId;
        guiEntry.schnellFlag = dto.schnellZuweisungFlag;
    }

    buildArbeitsVermittlungDto(element: ArbeitsvermittlungViewDTO): VermittlungDto {
        const vermittlung = {} as VermittlungDto;

        VermittlungSelectComponent.buildArbeitsVermittlungDtoCore(element, vermittlung);

        vermittlung.meldepflicht = this.getMeldepflichtStatus(element);
        vermittlung.vom = this.formUtils.parseDate(element.zuweisungDatumVom);
        vermittlung.stellenbezeichnung = element.stellenbezeichnung;
        vermittlung.unternehmensname = element.unternehmensName;
        vermittlung.stesIdAvam = element.stesIdAvam;
        vermittlung.ort = element.unternehmensOrt;
        vermittlung.status = this.dbTranslateService.translate(element, 'zuweisungStatus');
        vermittlung.ergebnis = this.dbTranslateService.translate(element, 'vermittlungsstand');

        return vermittlung;
    }

    getMeldepflichtStatus(arbeitsvermittlung: ArbeitsvermittlungViewDTO): number {
        if (!arbeitsvermittlung.meldepflicht) {
            return MeldepflichtEnum.KEIN_MELDEPFLICHT;
        } else {
            const today = moment();
            if (moment(arbeitsvermittlung.sperrfristDatum).isSameOrAfter(today, 'day')) {
                return MeldepflichtEnum.UNTERLIEGT_LAUFEND;
            } else {
                return MeldepflichtEnum.UNTERLIEGT_ABGELAUFEN;
            }
        }
    }

    private loadData() {
        this.spinnerService.activate(this.arbeitsvermittlungChannel);
        this.arbeitsvermittlungData = [];
        this.arbeitsvermittlungRestService.getArbeitsvermittlungenView(this.stesId, this.translateService.currentLang).subscribe(
            (wrapper: BaseResponseWrapperListArbeitsvermittlungViewDTOWarningMessages) => {
                this.arbeitsvermittlungData = wrapper.data.map((element: ArbeitsvermittlungViewDTO) => this.buildArbeitsVermittlungDto(element));
                this.spinnerService.deactivate(this.arbeitsvermittlungChannel);
            },
            () => {
                this.spinnerService.deactivate(this.arbeitsvermittlungChannel);
            }
        );
    }
}

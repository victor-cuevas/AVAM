import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '../../services/toolbox.service';
import { TableHeaderObject } from '../table/table.header.object';
import { RegionDTO } from '@dtos/regionDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { Subscription } from 'rxjs';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { takeUntil } from 'rxjs/operators';
import { FacadeService } from '@shared/services/facade.service';
import { RegionSuchenParamDTO } from '@app/shared/models/dtos-generated/regionSuchenParamDTO';
import { BaseResponseWrapperListRegionDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListRegionDTOWarningMessages';
import { RegionAuswaehlenRowInterface } from './region-auswaehlen-row.interface';

@Component({
    selector: 'app-regionen-auswaehlen',
    templateUrl: './regionen-auswaehlen.component.html',
    styleUrls: ['./regionen-auswaehlen.component.scss']
})
export class RegionenAuswaehlenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() id: string;

    /**
     * QueryParam to specify the shown regions.
     * By default only the active regions are returned.
     *
     * @type {RegionSuchenParamDTO}
     * @memberof RegionenAuswaehlenComponent
     */
    @Input() queryParams: RegionSuchenParamDTO = {};

    @Output() emitRegion = new EventEmitter();
    @ViewChild('modalPrint') modalPrint: ElementRef;

    data: RegionDTO[];
    regionentoolboxId = 'regionen-modal';
    modalToolboxConfiguration: ToolboxConfiguration[];
    headers: TableHeaderObject[] = [];
    observeClickActionSub: Subscription;
    regionenAuswaehlenChannel = 'regionenauswaehlen';

    dataSource: RegionAuswaehlenRowInterface[] = [];
    private originalChannel: string;

    constructor(private readonly modalService: NgbModal, private facade: FacadeService, private stesDataRestService: StesDataRestService) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.regionenAuswaehlenChannel;
        SpinnerService.CHANNEL = this.regionenAuswaehlenChannel;
    }

    ngOnInit() {
        this.configureToolbox();
        this.loadData();
    }

    configureToolbox(): void {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];

        this.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((event: any) => {
                if (event.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
                if (event.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    loadData() {
        this.facade.spinnerService.activate(this.regionenAuswaehlenChannel);

        this.stesDataRestService.searchRegionsByParams(this.queryParams).subscribe((resp: BaseResponseWrapperListRegionDTOWarningMessages) => {
            this.data = resp.data;

            this.dataSource = this.data ? this.data.map((row, index) => this.createRow(row, index)) : [];

            this.facade.spinnerService.deactivate(this.regionenAuswaehlenChannel);
        });
    }

    createRow(row: RegionDTO, index: number): RegionAuswaehlenRowInterface {
        return {
            id: index,
            code: row.code,
            bezeichnung: this.facade.dbTranslateService.translate(row, 'region'),
            typ: row.merkmal
        };
    }

    receiveData(entry: RegionAuswaehlenRowInterface) {
        this.emitRegion.emit({ data: this.data.find(e => e.code === entry.code), id: this.id });
        this.close();
    }

    getFormNr(): string {
        return StesFormNumberEnum.REGIONEN_ANZEIGEN;
    }

    close() {
        this.modalService.dismissAll();
    }

    ngOnDestroy() {
        this.facade.openModalFensterService.closeModalFenster();
        ToolboxService.CHANNEL = this.originalChannel;
        super.ngOnDestroy();
    }
}

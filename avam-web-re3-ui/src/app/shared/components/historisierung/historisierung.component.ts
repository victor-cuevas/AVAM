import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { Unsubscribable, SpinnerService } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StesModalNumber } from '@app/shared/enums/stes-modal-number.enum';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { HistorisierungDTO } from '@app/shared/models/dtos-generated/historisierungDTO';
import { FormUtilsService } from '@app/shared/services/forms/form-utils.service';

@Component({
    selector: 'app-historisierung',
    templateUrl: './historisierung.component.html',
    styleUrls: ['./historisierung.component.scss']
})
export class HistorisierungComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() type: string;
    @Input() id: string;
    @Input() ref: string;

    headers: any[];
    tableData: any[] = [];
    toolboxConfig: ToolboxConfiguration[] = [new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    historisierungToolboxId = 'historisierung-modal';
    modalNumber = StesModalNumber.HISTORISIERUNG;
    historyData: HistorisierungDTO;
    historisierungChannel = 'historisierung-channel';
    private originalChannel: string;

    constructor(
        private toolboxService: ToolboxService,
        private stesDataRestService: StesDataRestService,
        private translateService: TranslateService,
        private spinnerService: SpinnerService,
        private activeModal: NgbActiveModal,
        private formUtils: FormUtilsService
    ) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.historisierungToolboxId;
    }

    ngOnInit() {
        this.loadData();

        this.toolboxService
            .observeClickAction(this.historisierungToolboxId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
            });
    }

    close() {
        this.activeModal.close();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        ToolboxService.CHANNEL = this.originalChannel;
    }

    loadData() {
        this.spinnerService.activate(this.historisierungChannel);
        this.stesDataRestService.getHistory({ type: this.type, id: +this.id, ref: this.ref }).subscribe(
            data => {
                if (data) {
                    const headers = [];
                    let mappedData = {};
                    const mappedArray = [];

                    headers.push({
                        columnDef: 'mutiertam',
                        header: this.translateService.instant('history.label.mutiertam'),
                        cell: (element: any) => `${element.mutiertam}`,
                        width: '130px'
                    });
                    headers.push({
                        columnDef: 'mutiertdurch',
                        header: this.translateService.instant('history.label.mutiertdurch'),
                        cell: (element: any) => `${element.mutiertdurch}`,
                        width: '120px'
                    });

                    data.triggerFieldDescriptionKeys.forEach((element, id) => {
                        headers.push({
                            columnDef: data.triggerFieldNames[id],
                            header: this.buildAndTranslateHeader(element),
                            cell: (el: any) => `${el[data.triggerFieldNames[id]]}`,
                            width: '120px'
                        });
                    });

                    data.entriesList.forEach(element => {
                        mappedData = { mutiertam: this.formUtils.parseDate(element.editTimestamp), mutiertdurch: element.editedBy };
                        element.triggerFieldEntries.forEach((el, id) => {
                            if (!el) {
                                mappedData[data.triggerFieldNames[id]] = '';
                            } else {
                                mappedData[data.triggerFieldNames[id]] = el;
                            }
                        });
                        mappedArray.push(mappedData);
                    });

                    this.tableData = mappedArray;
                    this.headers = headers;
                }
                this.spinnerService.deactivate(this.historisierungChannel);
            },
            () => this.spinnerService.deactivate(this.historisierungChannel)
        );
    }

    buildAndTranslateHeader(headerKey) {
        let translatedHeader = '';
        const notTranslatedHeaders = headerKey.split(';');
        if (notTranslatedHeaders) {
            notTranslatedHeaders.forEach((element, index) => {
                if (index === 0) {
                    translatedHeader = this.translateService.instant(element);
                } else {
                    translatedHeader = `${translatedHeader} ${this.translateService.instant(element)}`;
                }
            });
        }
        return translatedHeader;
    }
}

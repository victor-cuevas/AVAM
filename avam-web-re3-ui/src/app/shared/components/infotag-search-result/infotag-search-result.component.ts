import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { InfotagService } from '../../services/infotag.service';
import { takeUntil } from 'rxjs/operators';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
// prettier-ignore
import {
    BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages
} from '@dtos/baseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages';
import { InfotagMassnahmeDurchfuehrungseinheitDTO } from '@dtos/infotagMassnahmeDurchfuehrungseinheitDTO';
import { MessageBus } from '../../services/message-bus';
import { DbTranslateService } from '../../services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { TableButtonTypeEnum } from '@app/shared/enums/table-button-type.enum';

@Component({
    selector: 'app-infotag-search-result',
    templateUrl: './infotag-search-result.component.html'
})
export class InfotagSearchResultComponent extends Unsubscribable implements OnInit, OnDestroy {
    readonly channel: string = 'app-infotag-search';
    durchfuehrungseinheiten: Array<InfotagMassnahmeDurchfuehrungseinheitDTO>;
    @Input() hasInfoleiste?: boolean;
    @Output() eventEmitter = new EventEmitter();
    @Output() resultCount: EventEmitter<number> = new EventEmitter();
    alertList: {
        isShown: boolean;
        messageText: string;
        messageType: string;
    }[] = [];

    dataSource = [];
    sortField = 'datum';
    columns = [
        { columnDef: 'titel', header: 'amm.massnahmen.label.titel', cell: (element: any) => `${element.titel}` },
        { columnDef: 'durchfuehrungsort', header: 'amm.massnahmen.label.durchfuehrungsort', cell: (element: any) => `${element.durchfuehrungsort}` },
        { columnDef: 'datum', header: 'common.label.datum', dataType: 'date', cell: (element: any) => `${element.datum}` },
        { columnDef: 'kurszeiten', header: 'amm.massnahmen.label.kurszeiten', cell: (element: any) => `${element.kurszeiten}` },
        { columnDef: 'teilnehmer', header: 'amm.massnahmen.label.teilnehmer', cell: (element: any) => `${element.teilnehmer}` },
        { columnDef: 'ueberbuchung', header: 'amm.massnahmen.label.ueberbuchung', cell: (element: any) => `${element.ueberbuchung}` },
        { columnDef: 'anbieter', header: 'amm.massnahmen.label.anbieter', cell: (element: any) => `${element.anbieter}` },
        { columnDef: 'action', header: '', cell: (element: any) => `${element.action}`, width: '100px' }
    ];
    displayedColumns = this.columns.map(c => c.columnDef);

    constructor(
        private infotagService: InfotagService,
        private spinnerService: SpinnerService,
        private messageBus: MessageBus,
        private dbTranslateService: DbTranslateService,
        private translationService: TranslateService,
        private fehlerMeldungService: FehlermeldungenService
    ) {
        super();
    }

    ngOnInit(): void {
        this.infotagService.massnahmeDurchfuehrungseinheiten
            .asObservable()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((response: BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages) => this.setData(response));
    }

    ngOnDestroy(): void {
        this.messageBus.buildAndSend('stes-details-infoleiste.closedModal', null);
    }

    emitUebernehmen(data) {
        this.eventEmitter.emit({ data, action: TableButtonTypeEnum.UEBERNEHMEN });
    }
    emitAnschauen(data) {
        this.eventEmitter.emit({ data, action: TableButtonTypeEnum.ANSCHAUEN });
    }

    loadTableData(): void {
        this.fehlerMeldungService.closeMessage();
        this.alertList = [];

        this.dataSource = this.durchfuehrungseinheiten ? this.durchfuehrungseinheiten.map((row, index) => this.mapToRow(row, index)) : [];
    }

    mapToRow(dfe, index) {
        return {
            id: index,
            dfID: String(dfe.id),
            titel: this.dbTranslateService.translateWithOrder(dfe, 'titel') || '',
            durchfuehrungsort: this.dbTranslateService.translateWithOrder(dfe, 'ort') || '',
            datum: new Date(dfe.datum) || '',
            kurszeiten: this.dbTranslateService.translateWithOrder(dfe, 'kursZeiten') || '',
            teilnehmer: dfe.teilnehmer || '',
            ueberbuchung: dfe.ueberbuchung || '',
            anbieter: dfe.anbieter || '',
            isBookable: dfe.isBookable
        };
    }

    close(index: number): void {
        this.alertList[index].isShown = false;
    }

    private setData(response: BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages): void {
        this.durchfuehrungseinheiten = response.data;
        if (this.hasInfoleiste) {
            this.resultCount.emit(response.data ? response.data.length : 0);
        }
        this.loadTableData();
        this.handleWarnings(response);
        this.spinnerService.deactivate(this.channel);
    }

    private handleWarnings(response: BaseResponseWrapperListInfotagMassnahmeDurchfuehrungseinheitDTOWarningMessages) {
        if (response.warning) {
            response.warning.forEach(warning =>
                this.alertList.push({
                    isShown: true,
                    messageText: this.translationService.instant(warning.values.key),
                    messageType: warning.key.toLowerCase()
                })
            );
        } else if (!response.data || response.data.length === 0) {
            this.alertList.push({
                isShown: true,
                messageText: this.translationService.instant('common.message.keinetreffer'),
                messageType: 'warning'
            });
        }
    }
}

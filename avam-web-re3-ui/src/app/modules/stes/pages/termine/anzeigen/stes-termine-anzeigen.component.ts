import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DbTranslatePipe, ToolboxService } from '../../../../../shared';
import { Subscription } from 'rxjs';
import { FehlermeldungModel } from '@shared/models/fehlermeldung.model';
import { SpracheEnum } from '@shared/enums/sprache.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { Unsubscribable } from 'oblique-reactive';
import { SortEvent } from '@shared/directives/table.sortable.header.directive';
import { SortOrderEnum } from '@shared/enums/sort-order.enum';
import { StesInfotagBuchenService } from '@stes/services/stes-infotag-buchen.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { StesTerminDTO } from '@shared/models/dtos-generated/stesTerminDTO';
import { CodeDTO } from '@shared/models/dtos-generated/codeDTO';
import { StesTerminRestService } from '@core/http/stes-termin-rest.service';
import { filter, takeUntil } from 'rxjs/operators';
import { StesTerminePaths } from '@shared/enums/stes-navigation-paths.enum';
import { buildStesPath } from '@shared/services/build-route-path.function';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import * as moment from 'moment';
import { TerminArtCodeEnum } from '@shared/enums/domain-code/termin-art-code.enum';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { FacadeService } from '@shared/services/facade.service';
import { StesSearchConstants } from '@stes/components/stes-search/stes-search.constants';

@Component({
    selector: 'app-stes-termine-anzeigen',
    templateUrl: './stes-termine-anzeigen.component.html'
})
export class StesTermineAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    static stesTerminChannel = 'stesTermineResult';
    @Input('sprache') sprache: SpracheEnum;
    @Output() contentNumber = 0;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    terminResultsData: StesTerminDTO[] = [];
    tableData: TerminTableRow[] = [];
    searchDone = false;
    stesId: string = null;
    sort: SortEvent = { column: 'datum', direction: SortOrderEnum.DESCENDING };
    messages: FehlermeldungModel[] = [];
    permissions: typeof Permissions = Permissions;
    observeClickActionSub: Subscription;
    public alertList: {
        isShown: boolean;
        messageText: string;
        messageType: string;
    }[] = [];
    private fehlermeldungenSubscription: Subscription;
    private langChangeSubscription: Subscription;
    private infotagDetailsModalSubscription: Subscription;
    private readonly termineToolboxId = 'termine';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private terminRestService: StesTerminRestService,
        private dbTranslatePipe: DbTranslatePipe,
        private infotagBuchenService: StesInfotagBuchenService,
        private stesInfobarService: AvamStesInfoBarService,
        private facadeService: FacadeService
    ) {
        super();
        ToolboxService.CHANNEL = 'stesTermineResult';
    }

    ngOnInit(): void {
        this.facadeService.spinnerService.activate(StesTermineAnzeigenComponent.stesTerminChannel);
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesTermine.anzeigen' });
        this.setSubscriptions();
        this.configureToolbox();
        this.loadDataFromService();
        this.infotagDetailsModalSubscription = this.facadeService.messageBus
            .getData()
            .pipe(filter(message => message.type === 'stes-termine-anzeigen.infotagZeigen'))
            .subscribe(message => this.infotagZeigen(this.stesId, message.data.dfeId, message.data.title));
    }

    ngOnDestroy(): void {
        this.facadeService.toolboxService.sendConfiguration([]);
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        this.facadeService.messageBus.buildAndSend('stes-details-infoleiste.contentNumber', null);
        if (this.fehlermeldungenSubscription) {
            this.fehlermeldungenSubscription.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        if (this.infotagDetailsModalSubscription) {
            this.infotagDetailsModalSubscription.unsubscribe();
        }
        super.ngOnDestroy();
    }

    configureToolbox(): void {
        this.facadeService.toolboxService.sendConfiguration(
            [
                new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
                new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
            ],
            this.termineToolboxId,
            ToolboxDataHelper.createForStellensuchende(this.stesId)
        );
    }

    setSubscriptions(): void {
        this.subscribeToLangChange();

        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.fehlermeldungenSubscription = this.facadeService.fehlermeldungenService.getMessage().subscribe(message => {
            if (message) {
                this.alertList.push({ isShown: true, messageText: message.text, messageType: message.type });
            }
        });
        this.observeClickActionSub = this.facadeService.toolboxService.observeClickAction(ToolboxService.CHANNEL, this.observeClickActionSub).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });
    }

    openPrintModal(): void {
        this.facadeService.openModalFensterService.openPrintModal(this.modalPrint, this.tableData);
    }

    termineErfassen(): void {
        this.router.navigate([buildStesPath(this.stesId, StesTerminePaths.TERMINERFASSEN)]);
    }

    infotagBuchen(): void {
        this.infotagBuchenService.infotagBuchen(this.stesId);
        this.facadeService.messageBus
            .getData()
            .pipe(filter(message => message.type === 'stes-details-infoleiste.closedModal'))
            .subscribe(() => {
                this.facadeService.messageBus.buildAndSend('stes-details-infoleiste.contentNumber', this.contentNumber);
            });
    }

    loadDataFromService(): void {
        this.terminRestService
            .getTermine(this.stesId, this.facadeService.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                termine => {
                    this.terminResultsData = termine.data;
                    this.loadTableData();
                    this.facadeService.messageBus.buildAndSend('stes-details-infoleiste.contentNumber', this.contentNumber);
                    this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesTermine.anzeigen', tableCount: this.tableData.length });
                    this.facadeService.spinnerService.deactivate(StesSearchConstants.STES_SEARCH_CHANNEL);
                },
                () => {
                    this.facadeService.spinnerService.deactivate(StesSearchConstants.STES_SEARCH_CHANNEL);
                }
            );
    }

    loadTableData(): void {
        this.tableData = [];
        this.searchDone = true;
        this.alertList = [];
        this.setTableRowsData();
        this.contentNumber = this.tableData.length;
    }

    editTerminData(eventData): void {
        if (eventData.artCode === TerminArtCodeEnum.INFOTAG) {
            this.router.navigate([buildStesPath(this.stesId, StesTerminePaths.INFOTAGGRUNDDATENBUCHUNG)], { queryParams: { gfId: eventData.terminId } });
        } else {
            this.router.navigate([buildStesPath(this.stesId, StesTerminePaths.TERMINBEARBEITEN)], { queryParams: { terminId: eventData.terminId } });
        }
    }

    createStesTableRow(dto: StesTerminDTO): TerminTableRow {
        const builder = new TermineTableRowBuilder(this.dbTranslatePipe);
        builder.setTerminId(dto.stesTerminId);
        builder.setArt(dto.art);
        builder.setZeit(dto);
        builder.setStatus(dto.status);
        builder.setStesId(dto.stesIdAvam);
        builder.setKontaktPerson(dto.kontaktperson);
        return builder.build();
    }

    close(index: number): void {
        this.alertList[index].isShown = false;
    }

    private infotagZeigen(stesId: string, dfeId: string, title?: string): void {
        this.infotagBuchenService.infotagZeigen(stesId, dfeId, title ? title : null);
    }

    private subscribeToLangChange(): void {
        this.langChangeSubscription = this.facadeService.translateService.onLangChange.subscribe(() => {
            this.facadeService.spinnerService.activate(StesSearchConstants.STES_SEARCH_CHANNEL);
            this.tableData = [];
            this.setTableRowsData();
            this.facadeService.spinnerService.deactivate(StesSearchConstants.STES_SEARCH_CHANNEL);
        });
    }

    private setTableRowsData() {
        this.terminResultsData.forEach(row => {
            const rowInfo = this.createStesTableRow(row);
            rowInfo.artCode = row.art.code;
            this.tableData.push(rowInfo);
        });
    }
}

class TermineTableRowBuilder {
    private termineTableRow: TerminTableRow;

    constructor(private dbTranslatePipe: DbTranslatePipe) {
        this.termineTableRow = {
            terminId: null,
            art: null,
            artCode: null,
            datum: null,
            zeit: null,
            status: null,
            stesId: null,
            kontaktperson: null
        };
    }
    setTerminId(id: number) {
        this.termineTableRow.terminId = id;
    }
    setArt(artDTO: CodeDTO): void {
        this.termineTableRow.art = this.dbTranslatePipe.transform(artDTO, 'text');
    }
    setZeit(dto: StesTerminDTO): void {
        const dateBegin = moment(dto.beginn);

        this.termineTableRow.datum = dateBegin.toDate();

        if (dto.art && dto.art.code === TerminArtCodeEnum.INFOTAG) {
            this.termineTableRow.zeit = dto.zeitVonBis;
        } else {
            const timeStart = dateBegin.format('HH:mm');
            const timeEnd = moment(dto.ende).format('HH:mm');

            this.termineTableRow.zeit = timeStart.concat(` - ${timeEnd}`);
        }
    }
    setStatus(statusDTO: CodeDTO): void {
        this.termineTableRow.status = this.dbTranslatePipe.transform(statusDTO, 'text');
    }
    setStesId(stesId: string): void {
        this.termineTableRow.stesId = stesId;
    }
    setKontaktPerson(kontaktperson: string): void {
        this.termineTableRow.kontaktperson = kontaktperson;
    }
    build(): TerminTableRow {
        return this.termineTableRow;
    }
}

interface TerminTableRow {
    terminId: number;
    art: string;
    datum: Date;
    artCode: string;
    zeit: string;
    status: string;
    stesId: string;
    kontaktperson: string;
}

import { FormUtilsService } from '@app/shared';
import { AfterContentChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToolboxService } from 'src/app/shared';
import { ToolboxActionEnum, ToolboxConfiguration } from '@shared/services/toolbox.service';
import { StesDataService } from '../../services/stes-data.service';
import { SpinnerService } from 'oblique-reactive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { StesSucheResultDTO } from '@dtos/stesSucheResultDTO';

@Component({
    selector: 'app-stes-search-result',
    templateUrl: './stes-search-result.component.html',
    styleUrls: ['./stes-search-result.component.scss']
})
export class StesSearchResultComponent implements OnInit, OnDestroy, AfterContentChecked {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    observeClickActionSub: Subscription;
    stesSearchResultChannel = 'stesSearchResult-modal';

    dataSource: any[] = [];
    dataTable: StesSucheResultDTO[];
    searchDone = false;

    private stesDataServiceSub: Subscription;

    constructor(
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private stesDataService: StesDataService,
        private modalService: NgbModal,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService,
        private formUtils: FormUtilsService,
        private searchSessionStorage: SearchSessionStorageService
    ) {
        ToolboxService.CHANNEL = 'stesSearchResult';
    }

    ngOnInit() {
        this.loadDataFromService();

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            } else {
                alert(`${action.action}:${action.id}- stes suchen`);
            }
        });

        this.translateService.onLangChange.subscribe(() => {
            this.loadDataFromService();
        });
    }

    loadDataFromService() {
        this.stesDataServiceSub = this.stesDataService.subject.subscribe(
            (dtos: StesSucheResultDTO[]) => {
                if (dtos) {
                    this.dataTable = [...dtos];
                    this.mapTableData();
                    this.searchDone = true;
                }
                this.spinnerService.deactivate(this.stesSearchResultChannel);
            },
            () => this.spinnerService.deactivate(this.stesSearchResultChannel)
        );
    }

    mapTableData() {
        const data = this.dataTable.map((d: StesSucheResultDTO) => {
            return {
                id: d.id,
                svNr: d.svNr ? d.svNr : '',
                strasseNr: this.getStrasse(d.strasse, d.hausnummer),
                nachname: d.nachname ? d.nachname : '',
                vorname: d.vorname ? d.vorname : '',
                geschlecht: d.geschlecht ? this.dbTranslateService.translate(d.geschlecht, 'text') : '',
                geburtsdatum: this.formUtils.parseDate(d.geburtsdatum),
                plz: d.plzOrt ? d.plzOrt.postleitzahl : '',
                ort: d.plzOrt ? this.dbTranslateService.translate(d.plzOrt, 'ort') : '',
                anmeldung: this.formUtils.parseDate(moment(d.anmeldeDatum).format('DD.MM.YYYY')),
                abmeldeDatum: d.abmeldeDatum ? d.abmeldeDatum : ''
            };
        });
        this.dataSource = data;
    }

    getStrasse(strasse, strasseNr) {
        return strasse && strasseNr ? `${strasse} ${strasseNr}` : strasse ? `${strasse}` : strasseNr ? `${strasseNr}` : '';
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }
        if (this.stesDataServiceSub) {
            this.stesDataServiceSub.unsubscribe();
        }
    }

    ngAfterContentChecked(): void {
        this.toolboxService.sendConfiguration([new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true), new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)]);
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: 'zahlstelle-basic-title', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    onReset() {
        this.stesDataService.clearResponseDTOs();
        this.searchDone = false;
        this.searchSessionStorage.restoreDefaultValues('stes-search-table');
    }
}

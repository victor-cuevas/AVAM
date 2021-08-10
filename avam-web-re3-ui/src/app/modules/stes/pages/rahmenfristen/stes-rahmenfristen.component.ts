import { IRahmenfristenData } from './rahmenfristen.interface';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TableHeaderObject } from 'src/app/shared/components/table/table.header.object';
import { RahmenfristModel } from 'src/app/shared/models/rahmenfrist.model';
import { SortOrderEnum } from 'src/app/shared/enums/sort-order.enum';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { ActivatedRoute, Router } from '@angular/router';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { takeUntil } from 'rxjs/operators';
import { DbTranslateService } from 'src/app/shared/services/db-translate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { StesRahmenfristDTO } from 'src/app/shared/models/dtos-generated/stesRahmenfristDTO';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from 'src/app/shared/services/toolbox.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import * as moment from 'moment';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

export enum RahmenfristDropDownAktionenEnum {
    AUSZAHLUNGEN = 0,
    ZWISCHENVERDIENST = 1
}

@Component({
    selector: 'app-stes-rahmenfristen',
    templateUrl: './stes-rahmenfristen.component.html',
    styleUrls: ['./stes-rahmenfristen.component.scss'],
    providers: [SearchSessionStorageService]
})
export class StesRahmenfristenComponent extends Unsubscribable implements OnInit, OnDestroy {
    @ViewChild('modalAuszahlungen') modalAuszahlungen: ElementRef;
    @ViewChild('modalZwischenverdienst') modalZwischenverdienst: ElementRef;
    @ViewChild('modalPrint') modalPrint: ElementRef;
    headers: TableHeaderObject[] = [];
    rahmenfristenData: RahmenfristModel[];
    defaultSort = { column: 'gueltigAb', direction: SortOrderEnum.DESCENDING };
    aktionenOptions: { label: string; aktionId: number }[] = [
        { label: 'stes.asal.label.auszahlungenProRahmenfrist', aktionId: RahmenfristDropDownAktionenEnum.AUSZAHLUNGEN },
        { label: 'stes.asal.label.uebersichtZwischenverdienst', aktionId: RahmenfristDropDownAktionenEnum.ZWISCHENVERDIENST }
    ];
    stesId: string;
    rahmenfristenChannel = 'rahmenfristen';

    rahmenfristId: number;
    personStesID: number;
    observeClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    rahmenfristenToolboxId = 'rahmenfristen';
    lastUpdate: any;
    cache: IRahmenfristenData;
    private sort: { column: 'gueltigAb'; direction: SortOrderEnum.DESCENDING };

    constructor(
        protected stesDataRestService: StesDataRestService,
        protected spinnerService: SpinnerService,
        protected route: ActivatedRoute,
        protected componentInteraction: StesComponentInteractionService,
        protected dbTranslateService: DbTranslateService,
        protected translateService: TranslateService,
        protected toolboxService: ToolboxService,
        protected router: Router,
        protected readonly modalService: NgbModal,
        protected stateService: SearchSessionStorageService,
        private stesInfobarService: AvamStesInfoBarService
    ) {
        super();
        ToolboxService.CHANNEL = 'rahmenfristen';
    }

    ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesRahmenFristen' });
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.loadData();
        this.configureToolbox();

        this.observeClickActionSub = this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });

        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            this.rahmenfristenData = [];
            this.buildRahmenfristen(this.lastUpdate);
        });

        this.getStateCache();
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    ngOnDestroy() {
        this.componentInteraction.resetDataLengthHeaderSubject();
        this.observeClickActionSub.unsubscribe();
        this.langChangeSubscription.unsubscribe();
        super.ngOnDestroy();
    }

    loadData() {
        this.spinnerService.activate(this.rahmenfristenChannel);

        this.stesDataRestService
            .getRahmenfristen(this.stesId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    this.lastUpdate = response.data;
                    this.buildRahmenfristen(this.lastUpdate);
                    this.componentInteraction.updateDataLengthHeaderSubject(this.rahmenfristenData.length);
                    this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesRahmenFristen', tableCount: this.rahmenfristenData.length });

                    this.stateService.storeFieldsByKey(this.rahmenfristenChannel, {
                        stesId: this.stesId,
                        call: 'getRahmenfristen',
                        data: response.data,
                        sort: this.defaultSort
                    });

                    this.spinnerService.deactivate(this.rahmenfristenChannel);
                },
                () => {
                    this.spinnerService.deactivate(this.rahmenfristenChannel);
                }
            );
    }

    buildRahmenfristen(rahmenfristen: any) {
        this.rahmenfristenData = rahmenfristen.map((dto, index) => {
            if (index === 0) {
                this.personStesID = dto.raPersonStesID;
            }
            return this.buildModel(dto);
        });
    }

    buildModel(stesRahmenfristDto: StesRahmenfristDTO): RahmenfristModel {
        const rahmenfristId = stesRahmenfristDto.raRahmenfristID;
        const gueltigAb = stesRahmenfristDto.kwKontrollperiode;
        const anspruch = this.dbTranslateService.translate(stesRahmenfristDto.anspruch, 'text');
        const alkZahlstelle = `${stesRahmenfristDto.asfAlkNr} / ${stesRahmenfristDto.asfZahlstelleNr}`;
        const raDatumRahmenfristVon = moment(stesRahmenfristDto.raDatumRahmenfristVon).format('DD.MM.YYYY');
        const raDatumrahmenfristBis = moment(stesRahmenfristDto.raDatumRahmenfristBis).format('DD.MM.YYYY');
        const rahmenfristDauer = `${raDatumRahmenfristVon} - ${raDatumrahmenfristBis}`;

        return { rahmenfristId, gueltigAb, anspruch, alkZahlstelle, rahmenfristDauer };
    }

    configureToolbox() {
        const toolboxConfig = [
            new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true)
        ];

        this.toolboxService.sendConfiguration(toolboxConfig, this.rahmenfristenToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId));
    }

    showRahmenfristDetails(id: number) {
        this.router.navigate([`stes/details/${this.stesId}/rahmenfristen/rahmenfristdetails`], { queryParams: { rahmenfristId: id } });
    }

    openAuszahlungenRahmenfrist(id: number) {
        this.rahmenfristId = id;
        this.modalService.open(this.modalAuszahlungen, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' });
    }

    openZwischenVerdienst(id: number) {
        this.rahmenfristId = id;
        this.modalService.open(this.modalZwischenverdienst, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-xl', backdrop: 'static' });
    }

    protected getStateCache(): void {
        this.cache = this.stateService.restoreStateByKey(this.rahmenfristenChannel) || {};

        if (this.cache && this.cache.sort) {
            this.defaultSort = this.cache.sort;
        } else {
            this.defaultSort = this.sort;
            this.cache.sort = this.defaultSort;
        }
    }
}

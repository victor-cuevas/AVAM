import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { AmmFormNumberEnum } from '@app/shared/enums/amm-form-number.enum';
import { FacadeService } from '@app/shared/services/facade.service';
import { ToolboxService, ToolboxConfiguration, ToolboxActionEnum } from '@app/shared/services/toolbox.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AnbieterRestService } from '@app/core/http/anbieter-rest.service';
import { AmmAuszahlungZurAbrechnungXDTO } from '@app/shared/models/dtos-generated/ammAuszahlungZurAbrechnungXDTO';
import { formatNumber } from '@angular/common';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { AuszahlungenType } from '../auszahlungen-zur-abrechnung-table/auszahlungen-zur-abrechnung-table.component';
import { UnternehmenDTO } from '@app/shared/models/dtos-generated/unternehmenDTO';
import { PlzDTO } from '@app/shared/models/dtos-generated/plzDTO';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'avam-auszahlungen-zur-abrechnung-modal',
    templateUrl: './auszahlungen-zur-abrechnung-modal.component.html',
    styleUrls: ['./auszahlungen-zur-abrechnung-modal.component.scss']
})
export class AuszahlungenZurAbrechnungModalComponent extends Unsubscribable implements OnInit, OnDestroy {
    @Input() abrechnungId: number;
    @Input() anbieterId: number;

    @ViewChild('modalPrint') modalPrint: ElementRef;

    channel = 'auszahlungen-zur-abrechnung';
    alertChannel = AlertChannelEnum;
    previousChannel: string;
    formNumber = AmmFormNumberEnum.AMM_ANBIETER_AUSZAHLUNGEN_ZUR_ABRECHNUNG;
    dataSource = [];
    summeTotal = '0.00';
    auszahlungen: AmmAuszahlungZurAbrechnungXDTO[] = [];
    unternehmen: UnternehmenDTO;
    auszahlungenType = AuszahlungenType;

    toolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false), new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

    constructor(private facade: FacadeService, private anbieterRestService: AnbieterRestService, private unternehmenRestService: UnternehmenRestService) {
        super();
        this.previousChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.channel;
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit() {
        this.subscribeToolbox();
        this.getData();
    }

    getData() {
        this.facade.spinnerService.activate(this.channel);
        forkJoin(
            this.anbieterRestService.getAuszahlungenZurAbrechnung(this.abrechnungId, AlertChannelEnum.MODAL),
            this.unternehmenRestService.getUnternehmenById(this.anbieterId.toString(), AlertChannelEnum.MODAL)
        ).subscribe(
            ([auszahlungenResponse, unternehmenResponse]) => {
                this.unternehmen = unternehmenResponse;

                if (auszahlungenResponse.data) {
                    this.auszahlungen = auszahlungenResponse.data;
                    this.dataSource = [...auszahlungenResponse.data]
                        .sort((a, b) => (a.auszahlungsNr > b.auszahlungsNr ? -1 : b.auszahlungsNr > a.auszahlungsNr ? 1 : 0))
                        .map(el => this.createAuszahlungsRow(el));
                    this.summeTotal = formatNumber(this.auszahlungen.reduce((acc, obj) => acc + obj.betrag, 0), LocaleEnum.SWITZERLAND, '.2-2');
                }

                this.facade.spinnerService.deactivate(this.channel);
            },
            () => this.facade.spinnerService.deactivate(this.channel)
        );
    }

    createAuszahlungsRow(auszahlung: AmmAuszahlungZurAbrechnungXDTO) {
        return {
            ...auszahlung,
            betrag: formatNumber(auszahlung.betrag, LocaleEnum.SWITZERLAND, '.2-2'),
            gueltigVon: this.facade.formUtilsService.parseDate(auszahlung.gueltigAb),
            gueltigBis: this.facade.formUtilsService.parseDate(auszahlung.gueltigBis),
            abrechnungsperiode: this.facade.formUtilsService.dateToMonthYearString(auszahlung.abrechnungsperiode),
            valutadatum: this.facade.formUtilsService.parseDate(auszahlung.valutadatum)
        };
    }

    showTooltip(element: HTMLElement, tooltip: NgbTooltip) {
        if (element.clientWidth !== element.scrollWidth) {
            tooltip.open();
        }
    }

    subscribeToolbox() {
        this.facade.toolboxService
            .observeClickAction(this.channel)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: any) => {
                if (action.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                } else if (action.message.action === ToolboxActionEnum.PRINT) {
                    this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.dataSource);
                }
            });
    }

    close() {
        this.facade.openModalFensterService.dismissAll();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        SpinnerService.CHANNEL = this.previousChannel;
        ToolboxService.CHANNEL = this.previousChannel;
    }

    get unternehmenName(): string {
        return [this.unternehmen.name1, this.unternehmen.name2, this.unternehmen.name3].filter((n: string) => n !== null && n !== undefined && n.length > 0).join(' ');
    }

    get burnummerInfo(): string | number {
        if (this.unternehmen.provBurNr && !this.unternehmen.burOrtEinheitId) {
            return `${this.unternehmen.provBurNr} (${this.facade.dbTranslateService.instant('unternehmen.label.provisorisch')})`;
        }
        return this.unternehmen.burNummer;
    }

    get strasseInfo(): string {
        let strasseInfo = '';
        if (this.unternehmen.strasse) {
            strasseInfo = this.unternehmen.strasse;
        }
        if (this.unternehmen.strasseNr) {
            strasseInfo += ` ${this.unternehmen.strasseNr}`;
        }
        return this.addPlzInfo(this.unternehmen.plz, strasseInfo);
    }

    get postfachInfo(): string {
        let postfachInfo = '';
        if (this.unternehmen.postfach) {
            postfachInfo = this.unternehmen.postfach.toString();
        }
        return this.addPlzInfo(this.unternehmen.postfachPlzObject, postfachInfo);
    }

    private addPlzInfo(plzDTO: PlzDTO, info: string): string {
        const plzOrt = plzDTO ? `${plzDTO.postleitzahl} ${this.facade.dbTranslateService.translate(plzDTO, 'ort')}` : undefined;
        if (plzOrt) {
            return info ? `${info}, ${plzOrt}` : plzOrt;
        }
        return info;
    }
}

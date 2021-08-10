import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { StesModalNumber } from '@shared/enums/stes-modal-number.enum';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { takeUntil } from 'rxjs/operators';
import { DmsMetadatenDTO } from '@shared/models/dtos-generated/dmsMetadatenDTO';
import { BaseResponseWrapperDmsMetadatenDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperDmsMetadatenDTOWarningMessages';
import { DmsMetadatenCopyRestService } from '@core/http/dms-metadaten-copy-rest.service';

export enum DmsMetadatenContext {
    DMS_CONTEXT_STES_AMM,
    DMS_CONTEXT_STES_PERSONALIEN,
    DMS_CONTEXT_TERMIN,
    DMS_CONTEXT_INFOTAG_BUCHUNG,
    DMS_CONTEXT_SCHNELLZUWEISUNG,
    DMS_CONTEXT_LSTEXP_BEARBEITEN,
    DMS_CONTEXT_ZUWEISUNG_FACHBERATUNG,
    DMS_CONTEXT_AUSGANGSLAGE,
    DMS_CONTEXT_ZUWEISUNG,
    DMS_CONTEXT_VMF_SACHVERHALT,
    DMS_CONTEXT_VMF_ENTSCHEID,
    DMS_CONTEXT_SKN_SACHVERHALT,
    DMS_CONTEXT_KONTROLLPERIODE,
    DMS_CONTEXT_AMM_ELEMENTKATEGORIE,
    DMS_CONTEXT_KONTAKTPERSON,
    DMS_CONTEXT_AMM_INFOTAG_MASSNAHME_BESCHREIBUNG,
    DMS_CONTEXT_AMM_PRODUKT_GRUNDDATEN,
    DMS_CONTEXT_AMM_ANBIETER,
    DMS_CONTEXT_AMM_BUDGET,
    DMS_CONTEXT_UNTERNEHMENBEARBEITEN,
    DMS_CONTEXT_UNTERNEHMENARBEITGEBER,
    DMS_CONTEXT_AMM_MASSNAHME_GRUNDDATEN,
    DMS_CONTEXT_STES_FACHBERATUNGSANGEBOT,
    DMS_CONTEXT_INFOTAG_BEARBEITEN,
    DMS_CONTEXT_AMM_DFE_KURS_GRUNDDATEN,
    DMS_CONTEXT_KONTAKT,
    DMS_CONTEXT_VORANMELDUNG_KAE,
    DMS_CONTEXT_AMM_DFE_STANDORT_GRUNDDATEN,
    DMS_CONTEXT_AMM_ANBIETER_ABRECHNUNG_BEARBEITEN,
    DMS_CONTEXT_AMM_ANBIETER_TEILZAHLUNG_BEARBEITEN,
    DMS_CONTEXT_AMM_ANBIETER_LEISTUNGSVEREINBARUNG_BEARBEITEN,
    DMS_CONTEXT_OSTE_BEARBEITEN,
    DMS_CONTEXT_SWEMELDUNG_BEARBEITEN,
    DMS_CONTEXT_RAHMENVERTRAG_BEARBEITEN,
    DMS_CONTEXT_ABRECHNUNGSWERT_GRUNDDATEN_BEARBEITEN,
    DMS_CONTEXT_TEILZAHLUNGSWERT_BEARBEITEN,
    DMS_CONTEXT_VERTRAGSWERT_BEARBEITEN,
    DMS_CONTEXT_PLANUNG
}

@Component({
    selector: 'app-dms-metadaten-kopieren-modal',
    templateUrl: './dms-metadaten-kopieren-modal.component.html',
    styleUrls: ['./dms-metadaten-kopieren-modal.component.scss']
})
export class DmsMetadatenKopierenModalComponent extends Unsubscribable implements OnInit, OnDestroy {
    static readonly TOOLBOX_ID: string = 'dmsMetadatenKopierenModal';
    @Input() id: string;
    @Input() language: string;
    @Input() context: DmsMetadatenContext;
    nr: string;
    readonly spinnerChannel: string = 'modalSpinnerChannel';
    modalToolboxConfiguration: ToolboxConfiguration[];
    data: DmsMetadatenDTO;
    tableData: any[] = [];
    dmsMetadatenKopierenChannel = 'dms-metadaten-kopieren-channel';
    organisationsKuerzel: string;
    planungsJahr: number;
    private modalOptions: NgbModalOptions;
    private subscriptions: Array<Subscription>;
    private readonly originalChannel: string;

    constructor(
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService,
        private activeModal: NgbActiveModal,
        private spinnerService: SpinnerService,
        private dmsMetadatenCopyRestService: DmsMetadatenCopyRestService
    ) {
        super();
        this.originalChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = 'dmsMetadatenKopierenModal';
    }

    ngOnInit(): void {
        this.subscriptions = new Array<Subscription>();
        this.modalOptions = { ariaLabelledBy: 'modal-basic-title' } as NgbModalOptions;
        this.initToolboxConfiguration();
        this.loadData();
    }

    ngOnDestroy(): void {
        ToolboxService.CHANNEL = this.originalChannel;
        super.ngOnDestroy();
    }

    close(): void {
        this.activeModal.close();
    }

    getFormNr(): string {
        return StesModalNumber.DMS_METADATA_KOPIE;
    }

    getToolboxId(): string {
        return DmsMetadatenKopierenModalComponent.TOOLBOX_ID;
    }

    private initToolboxConfiguration(): void {
        this.modalToolboxConfiguration = [new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];

        this.subscriptions.push(
            this.toolboxService
                .observeClickAction(ToolboxService.CHANNEL)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((event: any) => {
                    if (event.message.action === ToolboxActionEnum.EXIT) {
                        this.close();
                    }
                })
        );
    }

    private loadData() {
        const contextMap = {
            [DmsMetadatenContext.DMS_CONTEXT_STES_PERSONALIEN]: this.dmsMetadatenCopyRestService.copyStesPersonalienMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_TERMIN]: this.dmsMetadatenCopyRestService.copyTerminMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_INFOTAG_BUCHUNG]: this.dmsMetadatenCopyRestService.copyInfotagBuchungMetadaten(this.id, this.language),
            [DmsMetadatenContext.DMS_CONTEXT_SCHNELLZUWEISUNG]: this.dmsMetadatenCopyRestService.copySchnellzuweisungMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_STES_AMM]: this.dmsMetadatenCopyRestService.copyAmmMetadaten(this.id, this.nr),
            [DmsMetadatenContext.DMS_CONTEXT_LSTEXP_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyLeistungsexportMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_ZUWEISUNG_FACHBERATUNG]: this.dmsMetadatenCopyRestService.copyZuweisungFachberatungMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AUSGANGSLAGE]: this.dmsMetadatenCopyRestService.copyAusgangslageMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_ZUWEISUNG]: this.dmsMetadatenCopyRestService.copyZuweisungMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_VMF_SACHVERHALT]: this.dmsMetadatenCopyRestService.copyVmfSachverhaltMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_VMF_ENTSCHEID]: this.dmsMetadatenCopyRestService.copyVmfEntscheidMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_SKN_SACHVERHALT]: this.dmsMetadatenCopyRestService.copySknSachverhaltMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_KONTROLLPERIODE]: this.dmsMetadatenCopyRestService.copyKontrollperiodeMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_ELEMENTKATEGORIE]: this.dmsMetadatenCopyRestService.copyElementKategorieMetadata(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_KONTAKTPERSON]: this.dmsMetadatenCopyRestService.copyKontaktpersonMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_KONTAKT]: this.dmsMetadatenCopyRestService.copyKontaktMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_INFOTAG_MASSNAHME_BESCHREIBUNG]: this.dmsMetadatenCopyRestService.copyInfotagMassnahmeGrunddatenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_PRODUKT_GRUNDDATEN]: this.dmsMetadatenCopyRestService.copyProduktGrunddatenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER]: this.dmsMetadatenCopyRestService.copyAnbieterMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_UNTERNEHMENBEARBEITEN]: this.dmsMetadatenCopyRestService.copyUnternehmenBearbeitenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_BUDGET]: this.dmsMetadatenCopyRestService.copyBudgetMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_UNTERNEHMENARBEITGEBER]: this.dmsMetadatenCopyRestService.copyUnternehmenArbeitgeberMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_MASSNAHME_GRUNDDATEN]: this.dmsMetadatenCopyRestService.copyMassnahmenMassnahmeMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_STES_FACHBERATUNGSANGEBOT]: this.dmsMetadatenCopyRestService.copyStesFachberatungsangebotMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_INFOTAG_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyInfotagBearbeitenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_DFE_KURS_GRUNDDATEN]: this.dmsMetadatenCopyRestService.copyDfeKursGrunddatenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_VORANMELDUNG_KAE]: this.dmsMetadatenCopyRestService.copyVoranmeldungKaeMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_DFE_STANDORT_GRUNDDATEN]: this.dmsMetadatenCopyRestService.copyDfeStandortGrunddatenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER_ABRECHNUNG_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyAbrechnungBearbeitenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER_TEILZAHLUNG_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyTeilzahlungBearbeitenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_AMM_ANBIETER_LEISTUNGSVEREINBARUNG_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyLeistungsvereinbarungBearbeitenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_SWEMELDUNG_BEARBEITEN]: this.dmsMetadatenCopyRestService.copySweMeldungMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_OSTE_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyOsteDmsMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_RAHMENVERTRAG_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyRahmnevertragDmsMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_ABRECHNUNGSWERT_GRUNDDATEN_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyAbrechnungswertBearbeitenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_TEILZAHLUNGSWERT_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyTeilzahlungswertBearbeitenMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_VERTRAGSWERT_BEARBEITEN]: this.dmsMetadatenCopyRestService.copyVertragswertMetadaten(this.id),
            [DmsMetadatenContext.DMS_CONTEXT_PLANUNG]: this.dmsMetadatenCopyRestService.copyPlanungMetadaten(this.organisationsKuerzel, this.planungsJahr)
        };
        let metadataSub;

        this.spinnerService.activate(this.dmsMetadatenKopierenChannel);

        metadataSub = contextMap[this.context];

        if (metadataSub) {
            metadataSub.pipe(takeUntil(this.unsubscribe)).subscribe(
                (response: BaseResponseWrapperDmsMetadatenDTOWarningMessages) => {
                    this.fillTableData(response.data);
                    this.spinnerService.deactivate(this.dmsMetadatenKopierenChannel);
                },
                () => this.spinnerService.deactivate(this.dmsMetadatenKopierenChannel)
            );
        }
    }

    private fillTableData(data: DmsMetadatenDTO) {
        this.tableData = [];
        Object.keys(data.resultTable).forEach(objKey => this.tableData.push({ key: objKey, value: data.resultTable[objKey] }));
    }
}

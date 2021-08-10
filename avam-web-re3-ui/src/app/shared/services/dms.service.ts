import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DmsTemplatesComponent } from '@shared/components/dms-templates/dms-templates.component';
import { DokumentVorlagenRestService } from '@core/http/dokument-vorlagen-rest.service';
import { DokumentVorlagenRequestDTO } from '@shared/models/dtos-generated/dokumentVorlagenRequestDTO';
import { BaseResponseWrapperListDokumentVorlagenDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListDokumentVorlagenDTOWarningMessages';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DefaultUrl, UrlRestService } from '@core/http/url-rest.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { HttpResponseHelper } from '@shared/helpers/http-response.helper';
import { DmsTemplatesConstants } from '@shared/components/dms-templates/dms-templates.constants';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { DmsContextSensitiveDossierDTO } from '@dtos/dmsContextSensitiveDossierDTO';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DmsService extends Unsubscribable {
    private static readonly WINDOW_NAME: string = 'dms';
    private static readonly WINDOW_FEATURES: string = 'height=580,width=1000,top=150,left=150, toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes';
    private params: DmsContextSensitiveDossierDTO = {
        geschaeftsfallId: null,
        stesId: null,
        elementkategorieId: null,
        uiNumber: null,
        language: null,
        kontaktpersonId: null,
        unternehmenId: null
    };

    private dokGenerated: Subject<DokumentVorlageToolboxData> = new Subject();

    constructor(
        private readonly modalService: NgbModal,
        private dokumentVorlagenRestService: DokumentVorlagenRestService,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateService: DbTranslateService,
        private urlService: UrlRestService,
        private route: ActivatedRoute,
        private spinnerService: SpinnerService
    ) {
        super();
    }

    setParams(toolboxdata: DokumentVorlageToolboxData, uiNumber: string) {
        this.params.geschaeftsfallId = toolboxdata.entityIDsMapping.GF_ID
            ? toolboxdata.entityIDsMapping.GF_ID
            : toolboxdata.entityIDsMapping.DFE_ID
            ? toolboxdata.entityIDsMapping.DFE_ID
            : toolboxdata.entityIDsMapping.STES_TERMIN_ID
            ? toolboxdata.entityIDsMapping.STES_TERMIN_ID
            : toolboxdata.entityIDsMapping.LSTEXP_ID
            ? toolboxdata.entityIDsMapping.LSTEXP_ID
            : toolboxdata.entityIDsMapping.ZUWEISUNG_ID_FB
            ? toolboxdata.entityIDsMapping.ZUWEISUNG_ID_FB
            : toolboxdata.entityIDsMapping.ARBEITSVERMITTLUNG_ZUWEISUNG_ID
            ? toolboxdata.entityIDsMapping.ARBEITSVERMITTLUNG_ZUWEISUNG_ID
            : toolboxdata.entityIDsMapping.SCHNELLZUWEISUNG_ID
            ? toolboxdata.entityIDsMapping.SCHNELLZUWEISUNG_ID
            : null;
        this.params.stesId = toolboxdata.entityIDsMapping.STES_ID ? toolboxdata.entityIDsMapping.STES_ID : this.stesId;
        this.params.language = this.dbTranslateService.getCurrentLang();
        this.params.uiNumber = toolboxdata.uiSuffix ? `${uiNumber}_${toolboxdata.uiSuffix}` : uiNumber;
        this.params.elementkategorieId = toolboxdata.entityIDsMapping.ELEMENTKATEGORIE_ID;
        this.params.documentId = this.getDocumentId(toolboxdata);
        this.params.budgetId = toolboxdata.entityIDsMapping.BUDGET_ID;
        this.params.abrechnungId = toolboxdata.entityIDsMapping.ABRECHNUNG_ID;
        this.params.teilzahlungId = toolboxdata.entityIDsMapping.TEILZAHLUNG_ID;
        this.params.leistungsvereinbarungId = toolboxdata.entityIDsMapping.LEISTUNGSVEREINBARUNG_ID;
        this.params.vertragswertId = toolboxdata.entityIDsMapping.VERTRAGSWERT_ID;
        this.params.rahmenvertragId = toolboxdata.entityIDsMapping.RAHMENVERTRAG_ID;
        this.params.teilzahlungswertId = toolboxdata.entityIDsMapping.TEILZAHLUNGSWERT_ID;
        this.params.planwertId = toolboxdata.entityIDsMapping.PLANWERT_ID;
        this.params.abrechnungswertId = toolboxdata.entityIDsMapping.ABRECHNUNGSWERT_ID;
        this.setKontaktpersonParams(toolboxdata);
        this.setKontaktParams(toolboxdata);
        this.setAdditionalDataMapping(toolboxdata);
    }

    get stesId() {
        let id = null;
        this.route.firstChild.children
            .shift()
            .paramMap.pipe(takeUntil(this.unsubscribe))
            .subscribe(params => (id = params.get('stesId')));
        return id;
    }

    public openDMSWindow(toolboxdata: DokumentVorlageToolboxData, formNumber?: string): void {
        this.setParams(toolboxdata, formNumber);
        this.urlService
            .urlByParams(DefaultUrl.DMS, this.params)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(this.urlResponseCallback);
    }

    public openDMSWindowWithParams(dmsParam: DmsContextSensitiveDossierDTO): void {
        this.urlService.urlByParams(DefaultUrl.DMS, dmsParam).subscribe(this.urlResponseCallback);
    }

    public observeDokGenerated(): Observable<DokumentVorlageToolboxData> {
        return this.dokGenerated.asObservable();
    }

    displayDocumentTemplates(toolboxData: DokumentVorlageToolboxData): void {
        if (toolboxData.vorlagenKategorien && toolboxData.entityIDsMapping) {
            const request: DokumentVorlagenRequestDTO = {
                categories: toolboxData.vorlagenKategorien,
                entityIDsMapping: toolboxData.entityIDsMapping,
                targetEntity: toolboxData.targetEntity
            } as DokumentVorlagenRequestDTO;
            this.dokumentVorlagenRestService
                .getDokumentVorlagen(request)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe((res: BaseResponseWrapperListDokumentVorlagenDTOWarningMessages) => this.openModal(res, toolboxData), error => this.show(error));
        }
    }

    openDmsWorkspace() {
        this.urlService
            .urlById(DefaultUrl.DMS, this.dbTranslateService.getCurrentLang())
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(this.urlResponseCallback);
    }

    urlResponseCallback = response => {
        if (!response.warning) {
            HttpResponseHelper.openUrl(response.data, DmsService.WINDOW_NAME, DmsService.WINDOW_FEATURES);
        }
    };

    private openModal(res: BaseResponseWrapperListDokumentVorlagenDTOWarningMessages, toolboxData: DokumentVorlageToolboxData): void {
        const ngbModalRef = this.modalService.open(DmsTemplatesComponent, {
            windowClass: 'modal-md',
            ariaLabelledBy: 'modal-basic-title',
            centered: true,
            beforeDismiss: () => {
                //handle ESC
                if (ngbModalRef.componentInstance.isDokGenerated) {
                    this.dokGenerated.next(toolboxData);
                }
                return true;
            }
        });

        const dmsTemplatesComponent = ngbModalRef.componentInstance as DmsTemplatesComponent;
        dmsTemplatesComponent.setData(res.data, toolboxData);
        dmsTemplatesComponent.setWarnings(res.warning);

        //handle click on close buttons in modal
        ngbModalRef.result.then((isDokGenerated: boolean) => {
            if (isDokGenerated) {
                this.dokGenerated.next(toolboxData);
            }
        });
    }

    private show(error: any): void {
        this.fehlermeldungenService.showMessage(error, 'danger');
        this.spinnerService.deactivate(DmsTemplatesConstants.CHANNEL);
    }

    private setKontaktpersonParams(toolboxdata: DokumentVorlageToolboxData): void {
        this.params.kontaktpersonId = toolboxdata.entityIDsMapping.KONTAKTPERSON_ID ? toolboxdata.entityIDsMapping.KONTAKTPERSON_ID : null;
        this.params.unternehmenId = toolboxdata.entityIDsMapping.UNTERNEHMEN_ID ? toolboxdata.entityIDsMapping.UNTERNEHMEN_ID : null;
    }

    private setKontaktParams(toolboxdata: DokumentVorlageToolboxData): void {
        this.params.unternehmenTerminId = toolboxdata.entityIDsMapping.UNTERNEHMEN_TERMIN_ID ? toolboxdata.entityIDsMapping.UNTERNEHMEN_TERMIN_ID : null;
    }

    private getDocumentId(toolboxdata: DokumentVorlageToolboxData): number {
        return toolboxdata.entityIDsMapping.PRODUKT_ID
            ? toolboxdata.entityIDsMapping.PRODUKT_ID
            : toolboxdata.entityIDsMapping.MASSNAHME_ID
            ? toolboxdata.entityIDsMapping.MASSNAHME_ID
            : toolboxdata.entityIDsMapping.DFE_ID
            ? toolboxdata.entityIDsMapping.DFE_ID
            : null;
    }

    private setAdditionalDataMapping(toolboxdata: DokumentVorlageToolboxData) {
        if (toolboxdata.entityAdditionalDataMapping) {
            this.params.planungOrganisationsKuerzel = toolboxdata.entityAdditionalDataMapping.ORGANISATIONSKUERZEL;
            this.params.planungsJahr = toolboxdata.entityAdditionalDataMapping.PLANUNGSJAHR;
        }
    }
}

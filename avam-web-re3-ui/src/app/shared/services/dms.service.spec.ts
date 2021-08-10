import { TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { DmsService } from '@app/shared';
import { DokumentVorlagenRestService } from '@core/http/dokument-vorlagen-rest.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { VorlagenKategorie } from '@shared/enums/vorlagen-kategorie.enum';
import { DokumentVorlagenRequestDTO } from '@shared/models/dtos-generated/dokumentVorlagenRequestDTO';
import { NgbModalStub } from '@test_helpers/ngb-modal-stub';
import { BaseResponseWrapperListDokumentVorlagenDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListDokumentVorlagenDTOWarningMessages';
import { DokumentVorlagenDTO } from '@shared/models/dtos-generated/dokumentVorlagenDTO';
import { of } from 'rxjs';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { DefaultUrl, UrlRestService } from '@core/http/url-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteMock } from '@test_helpers/activated-route-stub';
import { DokumentVorlageActionDTO } from '../models/dtos-generated/dokumentVorlageActionDTO';

describe('DmsService', () => {
    let service: DmsService;
    let resService: DokumentVorlagenRestService;
    let translateService: TranslateService;
    let fehlermeldungenService: FehlermeldungenService;
    let ngbModalStub: NgbModalStub;
    let urlRestService: UrlRestService;
    let dbTranslateService: DbTranslateService;
    let notificationService: NotificationService;
    let activatedRoute: ActivatedRoute;
    let spinnerService: SpinnerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DokumentVorlagenRestService,
                HttpClient,
                HttpHandler,
                SpinnerService,
                NgbModal,
                UrlRestService,
                DbTranslateService,
                { provide: ActivatedRoute, useValue: ActivatedRouteMock }
            ],
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                HttpClientTestingModule,
                NgbModule
            ]
        });
        resService = TestBed.get(DokumentVorlagenRestService);
        ngbModalStub = TestBed.get(NgbModal);
        translateService = TestBed.get(TranslateService);
        translateService.currentLang = 'de';
        urlRestService = TestBed.get(UrlRestService);
        activatedRoute = TestBed.get(ActivatedRoute);
        dbTranslateService = TestBed.get(DbTranslateService);
        fehlermeldungenService = TestBed.get(FehlermeldungenService);
        notificationService = TestBed.get(NotificationService);
        spinnerService = TestBed.get(SpinnerService);
        service = new DmsService(ngbModalStub, resService, fehlermeldungenService, dbTranslateService, urlRestService, activatedRoute, spinnerService);
    });

    it('setParams', () => {
        const toolboxdata: DokumentVorlageToolboxData = { targetEntity: null, vorlagenKategorien: null, entityIDsMapping: { STES_ID: 123 } };
        service.setParams(toolboxdata, '0100001');
    });

    it('openUrl', () => {
        const params = {
            budgetId: undefined,
            documentId: null,
            elementkategorieId: undefined,
            geschaeftsfallId: null,
            language: 'de',
            stesId: 123,
            uiNumber: '123',
            unternehmenId: null,
            kontaktpersonId: null,
            unternehmenTerminId: null
        };
        const toolboxdata: DokumentVorlageToolboxData = { targetEntity: null, vorlagenKategorien: null, entityIDsMapping: { STES_ID: 123 } };
        const spy = spyOn(urlRestService, 'urlByParams').and.callThrough();
        service.openDMSWindow(toolboxdata, '123');
        expect(spy).toHaveBeenCalledWith(DefaultUrl.DMS, params);
    });

    it('displayDocumentTemplates', () => {
        const response: BaseResponseWrapperListDokumentVorlagenDTOWarningMessages = {
            data: [
                {
                    id: 1,
                    language: 'de',
                    typeDe: 'Lettre',
                    typeFr: 'fr lettre',
                    typeIt: 'it lettre',
                    name: 'my-document.docx'
                } as DokumentVorlagenDTO
            ],
            warning: null
        } as BaseResponseWrapperListDokumentVorlagenDTOWarningMessages;
        const modalSpy = spyOn(ngbModalStub, 'open').and.callThrough();
        const restSpy = spyOn(resService, 'getDokumentVorlagen').and.returnValue(of(response));
        const toolboxData = {
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.STESPERSONALIEN,
            vorlagenKategorien: [VorlagenKategorie.Stellensuchende],
            entityIDsMapping: {}
        } as DokumentVorlageToolboxData;
        toolboxData.entityIDsMapping['STES_ID'] = 123;
        service.displayDocumentTemplates(toolboxData);
        expect(restSpy).toHaveBeenCalledWith({
            targetEntity: DokumentVorlageActionDTO.TargetEntityEnum.STESPERSONALIEN,
            categories: [VorlagenKategorie.Stellensuchende],
            entityIDsMapping: { STES_ID: 123 }
        } as DokumentVorlagenRequestDTO);
        expect(modalSpy).toHaveBeenCalled();
    });
});

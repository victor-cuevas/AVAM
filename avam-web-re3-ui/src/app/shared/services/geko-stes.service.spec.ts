import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GekoStesRestService } from '@core/http/geko-stes-rest.service';
import { GekoStesService } from '@shared/services/geko-stes.service';
import { AuthenticationService } from '@core/services/authentication.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CallbackDTO } from '@dtos/callbackDTO';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { GekoVerlaufCallbackResolverService } from '@shared/services/geko-verlauf-callback-resolver.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { RedirectService } from '@shared/services/redirect.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CallbackHelperService } from '@shared/services/callback-helper.service';
import { FacadeService } from '@shared/services/facade.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { FormUtilsService, ToolboxService } from '@app/shared';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { OpenModalFensterService } from '@shared/services/open-modal-fenster.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';

describe('GekoStesService', () => {
    let service: GekoStesService;
    let authenticationService: AuthenticationService;
    let restService: GekoStesRestService;
    let router: Router;
    let callbackResolverService: GekoVerlaufCallbackResolverService;
    let spinnerService: SpinnerService;
    let redirectService: RedirectService;
    let fehlermeldungenService: FehlermeldungenService;
    let modalService: NgbModal;
    let facade: FacadeService;
    let callbackHelperService: CallbackHelperService;
    const createCallback: any = (geschaeftsartCode: string, sachstandCode?: string, key?: string, value?: string): CallbackDTO => {
        const ret = {
            geschaeftsartCode,
            parameters: { stesId: '12345' }
        } as CallbackDTO;
        if (sachstandCode) {
            ret.sachstandCode = sachstandCode;
        }
        if (key && value) {
            ret.parameters[key] = value;
        }
        ret.sachverhaltTyp = {
            code: '04'
        };
        return ret;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GekoStesRestService,
                HttpClient,
                HttpHandler,
                AuthenticationService,
                AuthenticationRestService,
                GekoVerlaufCallbackResolverService,
                SpinnerService,
                RedirectService,
                FacadeService,
                CallbackHelperService,
                NotificationService,
                SpinnerService,
                AuthenticationService,
                DbTranslateService,
                FehlermeldungenService,
                FormUtilsService,
                MessageBus,
                NavigationService,
                OpenModalFensterService,
                ResetDialogService,
                ToolboxService,
                { provide: TranslateService, useClass: TranslateServiceStub }
            ],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])]
        });
        authenticationService = TestBed.get(AuthenticationService);
        restService = TestBed.get(GekoStesRestService);
        router = TestBed.get(Router);
        callbackResolverService = TestBed.get(GekoVerlaufCallbackResolverService);
        spinnerService = TestBed.get(SpinnerService);
        redirectService = TestBed.get(RedirectService);
        fehlermeldungenService = TestBed.get(FehlermeldungenService);
        modalService = TestBed.get(NgbModal);
        facade = TestBed.get(FacadeService);
        callbackHelperService = TestBed.get(CallbackHelperService);
        service = new GekoStesService(restService, router, callbackResolverService, redirectService, facade, callbackHelperService);
    });

    it('addAusbildungspraktikumEinarbeitungszuschussIndividuell S3 hasPendentPruefbereitGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S3', '10', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/6/buchung-individuell');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addAusbildungspraktikumEinarbeitungszuschussIndividuell S3 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S3', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/6/bim-bem-entscheid');
    });

    it('addBeratungsterminResolver S5', () => {
        const navigationDto = service.createNavigationPath(createCallback('S5'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/termine');
    });

    it('addAusbildungspraktikumEinarbeitungszuschussIndividuel S6 hasPendentPruefbereitGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S6', '10', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/11/buchung-individuell');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addAusbildungspraktikumEinarbeitungszuschussIndividuel S6 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S6', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/11/bim-bem-entscheid');
    });

    it('addAusbildungszuschussResolver S4 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S4', '14', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/1/gesuch');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addAusbildungszuschussResolver S4 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S4', '11', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/1/speziell-entscheid');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addEinarbeitungszuschlussResolver S9 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S9', '10', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/2/gesuch');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addEinarbeitungszuschlussResolver S9 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S9', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/2/speziell-entscheid');
    });

    it('addKursIndividuellResolver S12 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S12', '10', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/12/buchung-individuell');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addKursIndividuellResolver S12 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S12', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/12/bim-bem-entscheid');
    });

    it('addFoerderungSelbstaendigkeitResolver S11 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S11', '10', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/4/gesuch');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addFoerderungSelbstaendigkeitResolver S11 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S11', '11', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/4/speziell-entscheid');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addKursKollektivResolver S13 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S13', '10', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/5/buchung-kollektiv');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addKursKollektivResolver S13 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S13', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/5/bim-bem-entscheid');
    });

    it('addPendlerkostenWochenaufenthalterResolver S15 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S15', '14', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/3/gesuch');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addPendlerkostenWochenaufenthalterResolver S15 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S15', '11', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/3/speziell-entscheid');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addSanktionResolver S17', () => {
        const navigationDto = service.createNavigationPath(createCallback('S17', null, 'sachverhaltId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/sanktionen/kontrollvorschriften-weisungen-bearbeiten');
        expect(navigationDto.extras.queryParams.sachverhaltId).toBe('6789');
    });

    it('addStellenvermittlungResolver S19', () => {
        const navigationDto = service.createNavigationPath(createCallback('S19', null, 'zuweisungId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/arbeitsvermittlungen/vermittlung-bearbeiten');
        expect(navigationDto.extras.queryParams.zuweisungId).toBe('6789');
    });

    it('addVermittlungsfaehigkeitResolver S21', () => {
        const navigationDto = service.createNavigationPath(createCallback('S21', null, 'sachverhaltId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/vermittlungsfaehigkeit/sachverhalt-bearbeiten');
        expect(navigationDto.extras.queryParams.sachverhaltId).toBe('6789');
    });

    it('addKursIndividuellAbMassnahmeResolver S24 hasPendentPruefbereitGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S24', '10', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/13/buchung-angebot');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addKursIndividuellAbMassnahmeResolver S24 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S24', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/13/bim-bem-entscheid');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S7 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S7', '14', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/7/buchung-psak');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S7 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S7', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/7/bim-bem-entscheid');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S14 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S14', '14', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/10/buchung-psak');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S14 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S14', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/10/bim-bem-entscheid');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S16 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S16', '14', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/8/buchung-psak');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S16 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S16', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/8/bim-bem-entscheid');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S18 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S18', '14', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/9/buchung-psak');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S18 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S18', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/9/bim-bem-entscheid');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S23 hasPendentGeprueftSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S23', '14', 'gfId', '6789'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/15/buchung-psak');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
    });

    it('addS7_S14_S16_S18_S23UrlResolver S23 hasFreigabebereitUeberarabeitungErledigtSachstand', () => {
        const navigationDto = service.createNavigationPath(createCallback('S23', '11'));
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/15/bim-bem-entscheid');
    });
});

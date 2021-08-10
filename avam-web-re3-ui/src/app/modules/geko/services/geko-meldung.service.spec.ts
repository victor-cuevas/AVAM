import { TestBed } from '@angular/core/testing';

import { GekoMeldungService } from './geko-meldung.service';
import { GekoMeldungRestService } from '@core/http/geko-meldung-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CallbackDTO } from '@dtos/callbackDTO';
import { RedirectService } from '@shared/services/redirect.service';
import { GekoMeldungCallbackResolverService } from '@shared/services/geko-meldung-callback-resolver.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { CallbackHelperService } from '@shared/services/callback-helper.service';
import { FacadeService } from '@shared/services/facade.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { AuthenticationService } from '@core/services/authentication.service';
import { ToolboxService } from '@app/shared';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { AuthenticationRestService } from '@core/http/authentication-rest.service';

describe('GekoMeldungService', () => {
    let service: GekoMeldungService;
    let gekoMeldungRestService: GekoMeldungRestService;
    let router: Router;
    let redirectService: RedirectService;
    let callbackHelperService: CallbackHelperService;
    let callbackResolverService: GekoMeldungCallbackResolverService;
    let facadeService: FacadeService;
    const createCallback: any = (geschaeftsartCode: string): CallbackDTO => {
        return {
            geschaeftsartCode,
            parameters: { stesId: '12345' }
        } as CallbackDTO;
    };
    function testBimBemEntscheid(geschaeftsartCode: string, expectedType: string): void {
        testEntscheid(geschaeftsartCode, expectedType, '/bim-bem-entscheid');
    }
    function testSpeziellEntscheid(geschaeftsartCode: string, expectedType: string): void {
        testEntscheid(geschaeftsartCode, expectedType, '/speziell-entscheid');
    }
    function testEntscheid(geschaeftsartCode: string, expectedType: string, entscheidUrlSuffix: string): void {
        const callback: CallbackDTO = createCallback(geschaeftsartCode);
        callback.parameters['gfId'] = '6789';
        callback.parameters['entscheidId'] = '8989';
        const navigationDto = service.createNavigationPath(callback);
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe(`stes/details/12345/amm/uebersicht/${expectedType}${entscheidUrlSuffix}`);
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
        expect(navigationDto.extras.queryParams.entscheidId).toBe('8989');
    }
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
            providers: [
                GekoMeldungService,
                GekoMeldungRestService,
                RedirectService,
                GekoMeldungCallbackResolverService,
                TranslateService,
                NotificationService,
                SpinnerService,
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                NavigationService,
                ToolboxService,
                FacadeService,
                CallbackHelperService,
                { provide: TranslateService, useClass: TranslateServiceStub }
            ]
        });
        gekoMeldungRestService = TestBed.get(GekoMeldungRestService);
        facadeService = TestBed.get(FacadeService);
        redirectService = TestBed.get(RedirectService);
        callbackResolverService = TestBed.get(GekoMeldungCallbackResolverService);
        callbackHelperService = TestBed.get(CallbackHelperService);
        service = new GekoMeldungService(gekoMeldungRestService, redirectService, callbackResolverService, facadeService, callbackHelperService);
    });

    it('S21 VermittlungfaehigkeitEntscheidBearbeiten', () => {
        const callback: CallbackDTO = createCallback('S21');
        callback.parameters['sachverhaltId'] = '6789';
        callback.parameters['entscheidId'] = '8989';
        const navigationDto = service.createNavigationPath(callback);
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/vermittlungsfaehigkeit/entscheid-bearbeiten');
        expect(navigationDto.extras.queryParams.sachverhaltId).toBe('6789');
        expect(navigationDto.extras.queryParams.entscheidId).toBe('8989');
    });

    it('S20 FachberatungBearbeiten', () => {
        const callback: CallbackDTO = createCallback('S20');
        callback.parameters['fachberatungId'] = '6789';
        const navigationDto = service.createNavigationPath(callback);
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/fachberatungen/bearbeiten');
        expect(navigationDto.extras.queryParams.fachberatungId).toBe('6789');
    });

    it('S19 ArbeitsvermittlungBearbeiten', () => {
        const callback: CallbackDTO = createCallback('S19');
        callback.parameters['zuweisungId'] = '6789';
        const navigationDto = service.createNavigationPath(callback);
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/arbeitsvermittlungen/vermittlung-bearbeiten');
        expect(navigationDto.extras.queryParams.zuweisungId).toBe('6789');
    });

    it('S1, S25 Personalien', () => {
        ['S1', 'S25'].forEach(n => {
            const navigationDto = service.createNavigationPath(createCallback(n));
            expect(navigationDto).not.toBe(null);
            expect(navigationDto.commands[0]).toBe('stes/details/12345/personalien');
        });
    });

    it('S3 INDIVIDUELL_AP BimBemEntscheid', () => {
        testBimBemEntscheid('S3', '6');
    });

    it('S6 INDIVIDUELL_BP BimBemEntscheid', () => {
        testBimBemEntscheid('S6', '11');
    });

    it('S7 BP BimBemEntscheid', () => {
        testBimBemEntscheid('S7', '7');
    });

    it('S12 INDIVIDUELL_KURS BimBemEntscheid', () => {
        testBimBemEntscheid('S12', '12');
    });

    it('S13 KURS BimBemEntscheid', () => {
        testBimBemEntscheid('S13', '5');
    });

    it('S13 KURS BimBemEntscheid without eintscheidId', () => {
        const callback: CallbackDTO = createCallback('S13');
        callback.parameters['gfId'] = '6789';
        const navigationDto = service.createNavigationPath(callback);
        expect(navigationDto).not.toBe(null);
        expect(navigationDto.commands[0]).toBe('stes/details/12345/amm/uebersicht/5/bim-bem-entscheid');
        expect(navigationDto.extras.queryParams.gfId).toBe('6789');
        expect(navigationDto.extras.queryParams.entscheidId).toBeUndefined();
    });

    it('S14 SEMO BimBemEntscheid', () => {
        testBimBemEntscheid('S14', '10');
    });

    it('S16 PVB BimBemEntscheid', () => {
        testBimBemEntscheid('S16', '8');
    });

    it('S18 UEF BimBemEntscheid', () => {
        testBimBemEntscheid('S18', '9');
    });

    it('S23 AP BimBemEntscheid', () => {
        testBimBemEntscheid('S23', '15');
    });

    it('S24 INDIVIDUELL_KURS_IM_ANGEBOT BimBemEntscheid', () => {
        testBimBemEntscheid('S24', '13');
    });

    it('S4 AZ SpeziellEntscheid', () => {
        testSpeziellEntscheid('S4', '1');
    });

    it('S9 EAZ SpeziellEntscheid', () => {
        testSpeziellEntscheid('S9', '2');
    });

    it('S11 FSE SpeziellEntscheid', () => {
        testSpeziellEntscheid('S11', '4');
    });

    it('S15 PEWO SpeziellEntscheid', () => {
        testSpeziellEntscheid('S15', '3');
    });
});

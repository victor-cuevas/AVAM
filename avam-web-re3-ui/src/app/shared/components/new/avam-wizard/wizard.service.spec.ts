import { async, TestBed } from '@angular/core/testing';

import { WizardService } from './wizard.service';
import { ActivatedRoute, convertToParamMap, Router, RouterModule } from '@angular/router';
import { of, Subscriber } from 'rxjs';
import { APP_BASE_HREF, Location } from '@angular/common';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';

let locationStub: Partial<Location> = { subscribe: () => new Subscriber() };

describe('WizardService', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forRoot([])],
            providers: [
                {
                    provide: Router,
                    useValue: {
                        events: of({})
                    }
                },
                FehlermeldungenService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ isAnmeldung: true })
                        },
                        paramMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                { provide: Location, useValue: locationStub },
                { provide: APP_BASE_HREF, useValue: '/' }
            ]
        }).compileComponents();
    }));

    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: WizardService = TestBed.get(WizardService);
        expect(service).toBeTruthy();
    });
});

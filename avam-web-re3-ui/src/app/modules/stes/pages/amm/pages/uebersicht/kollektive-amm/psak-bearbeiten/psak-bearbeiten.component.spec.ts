import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsakBearbeitenComponent } from './psak-bearbeiten.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, RouterEvent, Router, RouterModule } from '@angular/router';
import { of, ReplaySubject } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { MessageBus } from '@app/shared/services/message-bus';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CloseTabDirective, TextareaComponent, ToolboxService, ButtonDisplayPipe } from '@app/shared';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UrlRestService } from '@app/core/http/url-rest.service';
import { DokumentVorlagenRestService } from '@app/core/http/dokument-vorlagen-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmHelper } from '@app/shared/helpers/amm.helper';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchSessionStorageService } from '@app/shared/services/search-session-storage.service';

const eventSubject = new ReplaySubject<RouterEvent>(1);
const routerMock = {
    navigate: jasmine.createSpy('navigate'),
    events: eventSubject.asObservable(),
    url: 'test'
};

describe('PsakBearbeitenComponent', () => {
    let component: PsakBearbeitenComponent;
    let fixture: ComponentFixture<PsakBearbeitenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PsakBearbeitenComponent, CloseTabDirective, TextareaComponent, ButtonDisplayPipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                NgbTooltipModule,
                ReactiveFormsModule,
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                HttpClientTestingModule,
                RouterModule
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        },
                        queryParamMap: of(convertToParamMap({ id: 1 })),
                        params: of({ stesId: 222 })
                    }
                },
                MessageBus,
                {
                    provide: Router,
                    useValue: routerMock
                },
                AuthenticationRestService,
                AuthenticationService,
                ToolboxService,
                UrlRestService,
                DokumentVorlagenRestService,
                AmmRestService,
                AmmHelper,
                StesDataRestService,
                ObliqueHelperService,
                SearchSessionStorageService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PsakBearbeitenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

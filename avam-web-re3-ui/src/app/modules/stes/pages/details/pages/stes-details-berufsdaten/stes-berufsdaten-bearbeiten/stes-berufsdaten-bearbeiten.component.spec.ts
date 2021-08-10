import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesBerufsdatenBearbeitenComponent } from './stes-berufsdaten-bearbeiten.component';
import { MockTranslatePipe } from '../../../../../../../../../tests/helpers';
import { TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CloseTabDirective, DbTranslatePipe, TextareaComponent, ToolboxService, GeschlechtPipe, PermissionDirective } from 'src/app/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
}
class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

describe('StesBerufsdatenBearbeitenComponent', () => {
    let component: StesBerufsdatenBearbeitenComponent;
    let fixture: ComponentFixture<StesBerufsdatenBearbeitenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesBerufsdatenBearbeitenComponent, MockTranslatePipe, TextareaComponent, DbTranslatePipe, CloseTabDirective, PermissionDirective],
            providers: [
                { provide: TranslateService, useClass: TranslateServiceStub },
                FehlermeldungenService,
                ToolboxService,
                StesDataRestService,
                SpinnerService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ isAnmeldung: true })
                        },
                        paramMap: of(convertToParamMap({ id: 1 })),
                        queryParams: of(convertToParamMap({ id: 1 })),
                        queryParamMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                { provide: NotificationService, useClass: MockNotificationService },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                GeschlechtPipe,
                AuthenticationService,
                AuthenticationRestService,
                MessageBus,
                ObliqueHelperService
            ],
            imports: [NgbTooltipModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule, RouterTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesBerufsdatenBearbeitenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

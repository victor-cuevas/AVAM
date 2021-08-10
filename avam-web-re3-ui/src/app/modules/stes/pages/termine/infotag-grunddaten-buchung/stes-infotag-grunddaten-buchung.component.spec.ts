import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesInfotagGrunddatenBuchungComponent } from '@stes/pages/termine';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DbTranslatePipe, TextareaComponent, ToolboxService, PermissionDirective } from '@app/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SpinnerService } from 'oblique-reactive';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { MessageBus } from '@shared/services/message-bus';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { RouterTestingModule } from '@angular/router/testing';
import { InfotagRestService } from '@core/http/infotag-rest.service';
import { DmsRestService } from '@core/http/dms-rest.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';

describe('StesInfotagGrunddatenBuchungComponent', () => {
    let component: StesInfotagGrunddatenBuchungComponent;
    let fixture: ComponentFixture<StesInfotagGrunddatenBuchungComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MockTranslatePipe, TextareaComponent, DbTranslatePipe, StesInfotagGrunddatenBuchungComponent, PermissionDirective],
            imports: [HttpClientTestingModule, RouterTestingModule, FormsModule, ReactiveFormsModule, NgbTooltipModule.forRoot(), NgbPopoverModule.forRoot()],
            providers: [
                FormBuilder,
                AuthenticationService,
                AuthenticationRestService,
                [ToolboxService],
                [FehlermeldungenService],
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ stesId: 123 }),
                            data: of({ isAnmeldung: false })
                        },
                        paramMap: of(convertToParamMap({ dfeId: 456 }))
                    }
                },
                StesDataRestService,
                UnternehmenRestService,
                InfotagRestService,
                MessageBus,
                SpinnerService,
                DmsRestService,
                { provide: DbTranslateService, useClass: DbTranslateService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesInfotagGrunddatenBuchungComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MockTranslatePipe } from './../../../../../../../../../tests/helpers/mock-translate.pipe';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDatenfreigabeComponent } from './stes-datenfreigabe.component';
import { CloseTabDirective, DbTranslatePipe, ToolboxService, PermissionDirective } from 'src/app/shared';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { FehlermeldungenService } from 'src/app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DatenfreigabeBefragungResetComponent } from '../datenfreigabe-befragung-reset/datenfreigabe-befragung-reset.component';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { DatePipe } from '@angular/common';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { CoreCalendarComponent } from '@app/library/core/core-calendar/core-calendar.component';
import { DisableControlDirective } from '@app/library/core/directives/disable-control.directive';
import { MessageBus } from '@shared/services/message-bus';

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

xdescribe('StesDatenfreigabeComponent', () => {
    let component: StesDatenfreigabeComponent;
    let fixture: ComponentFixture<StesDatenfreigabeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesDatenfreigabeComponent,
                MockTranslatePipe,
                DbTranslatePipe,
                CloseTabDirective,
                DatenfreigabeBefragungResetComponent,
                CoreCalendarComponent,
                MockTextControlClearDirective,
                DisableControlDirective,
                PermissionDirective
            ],
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
                        queryParams: of(convertToParamMap({ id: 1 }))
                    }
                },
                { provide: NotificationService, useClass: MockNotificationService },
                DatePipe,
                MessageBus
            ],
            imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, NgbTooltipModule.forRoot(), BsDatepickerModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDatenfreigabeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesAbmeldungComponent } from './stes-abmeldung.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FehlermeldungenService } from '../../../../shared/services/fehlermeldungen.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
    DbTranslatePipe,
    ToolboxService,
    VermittlungSelectComponent,
    GeschlechtPipe,
    TextOverflowTooltipDirective,
    TextOverflowTooltipInputFieldDirective,
    PermissionDirective
} from '../../../../shared/index';
import { DatePipe } from '@angular/common';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { of } from 'rxjs';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../../tests/helpers/index';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { ArbeitsvermittlungRestService } from '@core/http/arbeitsvermittlung-rest.service';
import { VermittlungDto } from '@shared/models/dtos/vermittlung-dto.interface';
import { UnternehmenDataService } from '@shared/services/unternehmen-data.service';
import { MessageBus } from '@shared/services/message-bus';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';

export class NgbModalStub {
    public open(key: any, options?: any): any {
        return { result: of(key).toPromise() };
    }
}

class MockNotificationService {
    send() {}

    error() {}

    warning() {}

    success() {}
}

describe('StesAbmeldungComponent', () => {
    let component: StesAbmeldungComponent;
    let fixture: ComponentFixture<StesAbmeldungComponent>;
    let ngbModalStub: NgbModalStub;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesAbmeldungComponent,
                MockTranslatePipe,
                MockTextControlClearDirective,
                DbTranslatePipe,
                VermittlungSelectComponent,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective,
                PermissionDirective
            ],
            imports: [HttpClientTestingModule, ReactiveFormsModule, NgbTooltipModule.forRoot(), NgbPopoverModule.forRoot()],
            providers: [
                FormBuilder,
                AuthenticationService,
                AuthenticationRestService,
                [ToolboxService],
                [FehlermeldungenService],
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: NgbModal, useClass: NgbModal },
                DatePipe,
                {
                    provide: Router
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        }
                    }
                },
                StesDataRestService,
                ArbeitsvermittlungRestService,
                { provide: NotificationService, useClass: MockNotificationService },
                UnternehmenDataService,
                UnternehmenRestService,
                MessageBus,
                SpinnerService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                GeschlechtPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        ngbModalStub = TestBed.get(NgbModal);
        fixture = TestBed.createComponent(StesAbmeldungComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fill arbeitsvermittlungsNr in form', () => {
        const data: VermittlungDto = {
            icon: null,
            vom: null,
            nr: '0101',
            stellenbezeichnung: null,
            unternehmensId: null,
            osteId: null,
            unternehmensname: null,
            ort: null,
            stesId: null,
            status: null,
            ergebnis: null,
            id: null,
            schnellFlag: null,
            stesIdAvam: 'stesIdAvam',
            attTooltips: [],
            attHtmls: []
        };
        component.setVermittlung(data);
        const arbeitsvermittlungFormControl = component.abmeldeAngabenForm.get('vermittlungsnummer');
        expect(arbeitsvermittlungFormControl.value).toEqual(data.nr);
    });
});

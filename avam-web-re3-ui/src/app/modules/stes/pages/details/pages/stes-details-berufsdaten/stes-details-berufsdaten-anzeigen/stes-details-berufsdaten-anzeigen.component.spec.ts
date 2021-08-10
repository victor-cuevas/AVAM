import { ToolboxService } from '@shared/services/toolbox.service';
import { MockTranslatePipe } from './../../../../../../../../../tests/helpers/mock-translate.pipe';
import { SortableHeader } from 'src/app/shared/directives/table.sortable.header.directive';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectIteratorPipe, GeschlechtPipe, DbTranslatePipe, PermissionDirective } from 'src/app/shared';
import { DbTranslateService } from 'src/app/shared/services/db-translate.service';
import { SpinnerService } from 'oblique-reactive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { StesDetailsBerufsdatenAnzeigenComponent } from './stes-details-berufsdaten-anzeigen.component';
import { TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { MessageBus } from '@app/shared/services/message-bus';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

let serviceDataRestService: StesDataRestService;

describe('StesDetailsBerufsdatenAnzeigenComponent', () => {
    let component: StesDetailsBerufsdatenAnzeigenComponent;
    let fixture: ComponentFixture<StesDetailsBerufsdatenAnzeigenComponent>;
    let dbTranslateServiceStub: DbTranslateServiceStub;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsBerufsdatenAnzeigenComponent, SortableHeader, ObjectIteratorPipe, MockTranslatePipe, NgbTooltip, PermissionDirective],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                ToolboxService,
                DbTranslatePipe,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub },
                SpinnerService,
                StesDataRestService,
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
                GeschlechtPipe,
                AuthenticationService,
                AuthenticationRestService,
                MessageBus
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceDataRestService = TestBed.get(StesDataRestService);
        dbTranslateServiceStub = TestBed.get(DbTranslateService);
        fixture = TestBed.createComponent(StesDetailsBerufsdatenAnzeigenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { UrlRestService } from '@app/core/http/url-rest.service';
import { ToolboxService } from '@app/shared';
import { DokumentVorlagenRestService } from '@core/http/dokument-vorlagen-rest.service';
import { NgbActiveModal, NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { DokumentVorlagenDTO } from '@shared/models/dtos-generated/dokumentVorlagenDTO';
import { MessageBus } from '@shared/services/message-bus';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { DmsTemplatesComponent } from './dms-templates.component';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BewirtschaftungRestService } from '@app/core/http/bewirtschaftung-rest.service';

/**
 * private activeModal: NgbActiveModal,
 */

describe('DmsTemplatesComponent', () => {
    let component: DmsTemplatesComponent;
    let activeModal: NgbActiveModal;
    let fixture: ComponentFixture<DmsTemplatesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DmsTemplatesComponent, MockTranslatePipe],
            providers: [
                MessageBus,
                ToolboxService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                NgbActiveModal,
                NgbModal,
                DokumentVorlagenRestService,
                UrlRestService,
                AuthenticationRestService,
                AuthenticationService,
                BewirtschaftungRestService
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                }),
                NgbTooltipModule,
                HttpClientTestingModule,
                RouterTestingModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DmsTemplatesComponent);
        activeModal = TestBed.get(NgbActiveModal);
        component = fixture.componentInstance;
        component.toolboxData = { targetEntity: null, vorlagenKategorien: null, entityIDsMapping: null };
        fixture.detectChanges();
    });

    it('open normally', () => {
        component.vorlagen = [
            {
                id: 1,
                language: 'de',
                typeDe: 'document',
                typeFr: 'fr document',
                typeIt: 'it document',
                name: 'oh-my.docx'
            } as DokumentVorlagenDTO
        ];
        component.warnings = [];
        fixture.detectChanges();
        const spy = spyOn(activeModal, 'close').and.callThrough();
        expect(component).toBeTruthy();
        expect(component.getFormNr()).toBe(StesFormNumberEnum.DMS_DISPLAY_DOC_TEMPLATES);
        const de = 1;
        expect(component.defaultSearchOption).toBe(de);
        component.close();
        expect(spy).toHaveBeenCalled();
    });
});

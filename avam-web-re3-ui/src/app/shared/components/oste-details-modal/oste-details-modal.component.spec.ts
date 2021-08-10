import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsteDetailsModalComponent } from './oste-details-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe } from '@test_helpers/';
import { TranslateServiceStub } from '@test_helpers/';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';

describe('OsteDetailsModalComponent', () => {
    let component: OsteDetailsModalComponent;
    let fixture: ComponentFixture<OsteDetailsModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OsteDetailsModalComponent, MockTranslatePipe, DbTranslatePipe],
            imports: [HttpClientTestingModule],
            providers: [
                NgbModal,
                ToolboxService,
                SpinnerService,
                FehlermeldungenService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                OsteDataRestService,
                StesDataRestService,
                DbTranslateService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OsteDetailsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

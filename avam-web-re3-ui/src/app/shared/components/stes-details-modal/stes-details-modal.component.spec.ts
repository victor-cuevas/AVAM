import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDetailsModalComponent } from './stes-details-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MockTranslatePipe, TranslateServiceStub, DbTranslateServiceStub } from '@test_helpers/';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { SpinnerService } from 'oblique-reactive';
import { TranslateService } from '@ngx-translate/core';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';
import { DbTranslateService } from '@app/shared/services/db-translate.service';

describe('StesDetailsModalComponent', () => {
    let component: StesDetailsModalComponent;
    let fixture: ComponentFixture<StesDetailsModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsModalComponent, MockTranslatePipe],
            providers: [
                StesDataRestService,
                NgbModal,
                ToolboxService,
                SpinnerService,
                FehlermeldungenService,
                GeschlechtPipe,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [HttpClientTestingModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        component.stesHeader = {};
        expect(component).toBeTruthy();
    });
});

import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslatePipe } from '@app/shared/pipes/db-translate.pipe';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MassnahmenartWaehlenModalComponent } from './massnahmenart-waehlen-modal.component';
import { NavigationServiceStub } from '@test_helpers/navigation-service-stub';
import { NavigationService } from '@shared/services/navigation-service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { MassnahmeartTreeService } from './massnahmeart-tree.service';

describe('MassnahmenartWaehlenModalComponent', () => {
    let component: MassnahmenartWaehlenModalComponent;
    let fixture: ComponentFixture<MassnahmenartWaehlenModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MassnahmenartWaehlenModalComponent],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [
                HttpClientTestingModule,
                NgbTooltipModule,
                ReactiveFormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ],
            providers: [StesDataRestService, AmmRestService, DatePipe, DbTranslatePipe, { provide: NavigationService, useClass: NavigationServiceStub }, MassnahmeartTreeService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MassnahmenartWaehlenModalComponent);
        component = fixture.componentInstance;
        component.queryParams = { type: null, elementKategorieId: null, berechtigungsKey: null };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

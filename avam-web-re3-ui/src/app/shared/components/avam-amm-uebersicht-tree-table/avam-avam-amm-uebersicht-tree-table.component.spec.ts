import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DbTranslateServiceStub, MockTranslatePipe } from '@test_helpers/';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { DbTranslatePipe } from '@app/shared';
import { Router, ActivatedRoute } from '@angular/router';
import { AvamAmmUebersichtTreeTableComponent } from './avam-amm-uebersicht-tree-table.component';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

describe('AvamAmmUebersichtTreeTableComponent', () => {
    let component: AvamAmmUebersichtTreeTableComponent;
    let fixture: ComponentFixture<AvamAmmUebersichtTreeTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AvamAmmUebersichtTreeTableComponent, DbTranslatePipe, MockTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [NgbTooltipModule],
            providers: [
                HttpClient,
                HttpHandler,
                {
                    provide: StesDataRestService,
                    useClass: StesDataRestService
                },
                {
                    provide: AmmRestService,
                    useClass: AmmRestService
                },
                { provide: DatePipe },
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                {
                    provide: Router
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ id: 1 })
                        }
                        // paramMap: of({ id: 1 })
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AvamAmmUebersichtTreeTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

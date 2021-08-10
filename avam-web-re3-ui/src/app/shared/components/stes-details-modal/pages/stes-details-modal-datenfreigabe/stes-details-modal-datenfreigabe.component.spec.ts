import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDetailsModalDatenfreigabeComponent } from './stes-details-modal-datenfreigabe.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslatePipe } from '@app/shared';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';

describe('StesDetailsModalDatenfreigabeComponent', () => {
    let component: StesDetailsModalDatenfreigabeComponent;
    let fixture: ComponentFixture<StesDetailsModalDatenfreigabeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsModalDatenfreigabeComponent],
            imports: [
                ReactiveFormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                HttpClientTestingModule
            ],
            providers: [StesDataRestService, DbTranslatePipe, ObliqueHelperService],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsModalDatenfreigabeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

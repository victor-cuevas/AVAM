import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { SortableColumnDirective } from '@app/library/wrappers/data/avam-generic-table/sortable-column.directive';
import { TableTooltipDirective } from '@app/library/wrappers/data/avam-generic-table/table-tooltip.directive';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { DbTranslateServiceStub } from '@test_helpers/';
import { SpinnerService } from 'oblique-reactive';
import { StesDetailsModalBerufsdatenComponent } from './stes-details-modal-berufsdaten.component';

describe('StesDetailsModalBerufsdatenComponent', () => {
    let component: StesDetailsModalBerufsdatenComponent;
    let fixture: ComponentFixture<StesDetailsModalBerufsdatenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsModalBerufsdatenComponent, SortableColumnDirective, TranslatePipe, TableTooltipDirective],
            providers: [SpinnerService, StesDataRestService, GeschlechtPipe, { provide: DbTranslateService, useClass: DbTranslateServiceStub }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [HttpClientTestingModule, CdkTableModule, NgbTooltipModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsModalBerufsdatenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

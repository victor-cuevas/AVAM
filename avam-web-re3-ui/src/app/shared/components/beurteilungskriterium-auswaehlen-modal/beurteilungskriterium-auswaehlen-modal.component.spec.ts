import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { DbTranslatePipe, ObjectIteratorPipe, ResizableColumnDirective, SortableHeader } from '@app/shared';
import { ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { TranslateServiceStub } from '../arbeitsorte-autosuggest/arbeitsorte-autosuggest.component.spec';
import { SortableColumnDirective } from '../../../library/wrappers/data/avam-generic-table/sortable-column.directive';
import { TableTooltipDirective } from '../../../library/wrappers/data/avam-generic-table/table-tooltip.directive';
import { BeurteilungskriteriumAuswaehlenModalComponent } from './beurteilungskriterium-auswaehlen-modal.component';
import { CommonModule } from '@angular/common';

describe('BeurteilungskriteriumAuswaehlenModalComponent', () => {
    let component: BeurteilungskriteriumAuswaehlenModalComponent;
    let fixture: ComponentFixture<BeurteilungskriteriumAuswaehlenModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                BeurteilungskriteriumAuswaehlenModalComponent,
                MockTranslatePipe,
                ResizableColumnDirective,
                SortableHeader,
                ObjectIteratorPipe,
                SortableColumnDirective,
                TableTooltipDirective
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [ToolboxService, StesDataRestService, { provide: TranslateService, useClass: TranslateServiceStub }, DbTranslatePipe],
            imports: [HttpClientTestingModule, NgbModule, CdkTableModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BeurteilungskriteriumAuswaehlenModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

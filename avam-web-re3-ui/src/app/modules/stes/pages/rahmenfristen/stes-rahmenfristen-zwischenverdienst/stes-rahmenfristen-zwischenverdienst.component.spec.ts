import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesRahmenfristenZwischenverdienstComponent } from './stes-rahmenfristen-zwischenverdienst.component';
import { ResultCountComponent, ParagraphComponent, ObjectIteratorPipe, SortableHeader, ResizableColumnDirective, ToolboxService } from '@app/shared';
import { MockTranslatePipe } from '../../../../../../../test_helpers';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { TranslateModule } from '@ngx-translate/core';

describe('StesRahmenfristenZwischenverdienstComponent', () => {
    let component: StesRahmenfristenZwischenverdienstComponent;
    let fixture: ComponentFixture<StesRahmenfristenZwischenverdienstComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesRahmenfristenZwischenverdienstComponent,
                ResultCountComponent,
                ParagraphComponent,
                MockTranslatePipe,
                ObjectIteratorPipe,
                SortableHeader,
                ResizableColumnDirective
            ],
            imports: [NgbModule, NgbTooltipModule.forRoot(), HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [ToolboxService, StesDataRestService, { provide: DbTranslateService, useClass: DbTranslateServiceStub }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesRahmenfristenZwischenverdienstComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

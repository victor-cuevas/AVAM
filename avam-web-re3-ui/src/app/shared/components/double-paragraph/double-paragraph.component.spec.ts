import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { DoubleParagraphComponent } from './double-paragraph.component';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { ParagraphComponent, DbTranslatePipe, ToolboxService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
}

describe('DoubleParagraphComponent', () => {
    let component: DoubleParagraphComponent;
    let fixture: ComponentFixture<DoubleParagraphComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DoubleParagraphComponent, MockTranslatePipe, ParagraphComponent, DbTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: Router
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ test: true })
                        },
                        paramMap: of(convertToParamMap({ id: 1 }))
                    }
                },
                SpinnerService,
                ToolboxService
            ],
            imports: [HttpClientTestingModule, FormsModule, NgbTooltipModule.forRoot(), NgbPopoverModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DoubleParagraphComponent);
        component = fixture.componentInstance;
        component.id = 'testId';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

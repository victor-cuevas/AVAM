import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { ZwischenverdiensteComponent } from './zwischenverdienste.component';
import { SortableHeader } from 'src/app/shared/directives/table.sortable.header.directive';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ToolboxService, ResizableColumnDirective, ObjectIteratorPipe, PermissionDirective } from 'src/app/shared';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StesTerminRestService } from '@app/core/http/stes-termin-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { GeschlechtPipe } from '@app/shared';
import { MessageBus } from '@app/shared/services/message-bus';
import { MockTranslatePipe } from '../../../../../../test_helpers';

export class TranslateServiceStub {
    public instant(key: any): any {
        of(key);
    }

    onLangChange = new EventEmitter();
}

describe('ZwischenverdiensteComponent', () => {
    let component: ZwischenverdiensteComponent;
    let fixture: ComponentFixture<ZwischenverdiensteComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ZwischenverdiensteComponent, SortableHeader, MockTranslatePipe, ResizableColumnDirective, ObjectIteratorPipe, PermissionDirective],
            imports: [NgbModule, NgbTooltipModule.forRoot(), HttpClientTestingModule],
            providers: [
                StesTerminRestService,
                StesDataRestService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ stesId: 222 }), snapshot: of({ stesId: 222 }) }
                    }
                },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                { provide: TranslateService, useClass: TranslateServiceStub },
                ToolboxService,
                GeschlechtPipe,
                MessageBus
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ZwischenverdiensteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

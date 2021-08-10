import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FachberatungenAnzeigenComponent } from './fachberatungen-anzeigen.component';
import { MessageBus } from '@app/shared/services/message-bus';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ToolboxService, PermissionDirective } from 'src/app/shared';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { MockTranslatePipe } from '@test_helpers/';
import { CdkTableModule } from '@angular/cdk/table';
import { SortableColumnDirective } from '@app/library/wrappers/data/avam-generic-table/sortable-column.directive';
import { TableTooltipDirective } from '@app/library/wrappers/data/avam-generic-table/table-tooltip.directive';

export class TranslateServiceStub {
    public instant(key: any): any {
        of(key);
    }

    onLangChange = new EventEmitter();
}

describe('FachberatungenAnzeigenComponent', () => {
    let component: FachberatungenAnzeigenComponent;
    let fixture: ComponentFixture<FachberatungenAnzeigenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [FachberatungenAnzeigenComponent, MockTranslatePipe, PermissionDirective, SortableColumnDirective, TableTooltipDirective],
            imports: [NgbTooltipModule.forRoot(), HttpClientTestingModule, CdkTableModule],
            providers: [
                MessageBus,
                ToolboxService,
                FehlermeldungenService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ stesId: 222 }), snapshot: of({ stesId: 222 }) }
                    }
                },
                StesDataRestService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FachberatungenAnzeigenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FachberatungsangebotPruefenComponent } from './fachberatungsangebot-pruefen.component';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockTranslatePipe } from '@test_helpers/';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import { TranslateService } from '@ngx-translate/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToolboxService } from '@app/shared';
import { UrlRestService } from '@app/core/http/url-rest.service';

export class TranslateServiceStub {
    public instant(key: any): any {
        of(key);
    }

    public stream(): any {
        return new EventEmitter();
    }

    public currentLang = 'de';
    onLangChange = new EventEmitter();
}

describe('FachberatungsangebotPruefenComponent', () => {
    let component: FachberatungsangebotPruefenComponent;
    let fixture: ComponentFixture<FachberatungsangebotPruefenComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
            declarations: [FachberatungsangebotPruefenComponent, MockTranslatePipe],
            providers: [
                FormBuilder,
                ObliqueHelperService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: { params: of({ stesId: 222 }) },
                        params: of({ fachberatungsangebotId: 2 })
                    }
                },
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    }
                },
                { provide: TranslateService, useClass: TranslateServiceStub },
                StesDataRestService,
                ToolboxService,
                UrlRestService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FachberatungsangebotPruefenComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SanktionTreeTableComponent } from './sanktion-tree-table.component';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FakeMissingTranslationHandler, MissingTranslationHandler, TranslateModule, TranslateService, USE_DEFAULT_LANG, USE_STORE } from '@ngx-translate/core';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';

describe('SanktionTreeTableComponent', () => {
    class TranslateServiceStub {
        public currentLang = 'de';
        onLangChange = new EventEmitter();
        public static instant(key: any): any {
            return key;
        }
    }

    let component: SanktionTreeTableComponent;
    let fixture: ComponentFixture<SanktionTreeTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DbTranslateService,
                { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
                { provide: USE_DEFAULT_LANG },
                { provide: USE_STORE },
                { provide: TranslateService, useClass: TranslateServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [NgbModule, TranslateModule],
            declarations: [SanktionTreeTableComponent, MockTranslatePipe]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SanktionTreeTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

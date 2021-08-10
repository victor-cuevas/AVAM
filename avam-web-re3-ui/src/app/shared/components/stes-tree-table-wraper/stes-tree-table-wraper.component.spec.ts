import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesTreeTableWraperComponent } from './stes-tree-table-wraper.component';
import { StesVermittlungsfaehigkeitService } from '@stes/services/stes-vermittlungsfaehigkeit.service';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
    onLangChange = new EventEmitter();
}

const objectOptions = {
    columnOrder: ['asd', 'wer']
};

describe('StesTreeTableWraperComponent', () => {
    let component: StesTreeTableWraperComponent;
    let fixture: ComponentFixture<StesTreeTableWraperComponent>;
    let stesVermittlungsfaehigkeitServiceStub = { createVmfTreeTableList: jasmine.createSpy('createVmfTreeTableList') };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesTreeTableWraperComponent],
            providers: [
                {
                    provide: StesVermittlungsfaehigkeitService,
                    useValue: stesVermittlungsfaehigkeitServiceStub
                },
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesTreeTableWraperComponent);
        component = fixture.componentInstance;
        component.objectOptions = objectOptions;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

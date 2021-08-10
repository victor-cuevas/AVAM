import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InfotagSearchResultComponent } from './infotag-search-result.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DbTranslatePipe } from '../..';
import { InfotagService } from '../../services/infotag.service';
import { MessageBus } from '../../services/message-bus';
import { InfotagRestService } from '../../../core/http/infotag-rest.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';

describe('InfotagSearchResultComponent', () => {
    let component: InfotagSearchResultComponent;
    let fixture: ComponentFixture<InfotagSearchResultComponent>;
    let translateService: TranslateService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [HttpClientTestingModule],
            declarations: [InfotagSearchResultComponent],
            providers: [
                SpinnerService,
                MessageBus,
                InfotagService,
                InfotagRestService,
                { provide: TranslateService, useClass: TranslateServiceMock },
                DbTranslatePipe,
                DatePipe,
                AmmRestService,
                StesDataRestService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InfotagSearchResultComponent);
        component = fixture.componentInstance;
        translateService = TestBed.get(TranslateService);
        translateService.currentLang = 'de';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
class TranslateServiceMock {
    public instant(key: any): any {
        of(key);
    }
}

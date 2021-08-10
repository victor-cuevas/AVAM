import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDetailsInfoleistePanelComponent } from './stes-details-infoleiste-panel.component';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DbTranslatePipe } from 'src/app/shared';
import { InfoleistePanelService } from '@app/shared/services/infoleiste-panel.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StesDetailsInfoleistePanelComponent', () => {
    let component: StesDetailsInfoleistePanelComponent;
    let fixture: ComponentFixture<StesDetailsInfoleistePanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsInfoleistePanelComponent, DbTranslatePipe],
            imports: [
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ],
            providers: [InfoleistePanelService, StesDataRestService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsInfoleistePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

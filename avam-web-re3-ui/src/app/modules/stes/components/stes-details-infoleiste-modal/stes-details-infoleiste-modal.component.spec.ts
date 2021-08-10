import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesDetailsInfoleisteModalComponent } from './stes-details-infoleiste-modal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { ToolboxService } from 'src/app/shared';

describe('StesDetailsInfoleisteModalComponent', () => {
    let component: StesDetailsInfoleisteModalComponent;
    let fixture: ComponentFixture<StesDetailsInfoleisteModalComponent>;
    let serviceComponentInteraction: StesComponentInteractionService;
    let serviceDataRestService: StesDataRestService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsInfoleisteModalComponent],
            imports: [
                RouterTestingModule,
                HttpClientModule,
                ReactiveFormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ stesId: '123' })
                    }
                },
                {
                    provide: StesComponentInteractionService,
                    useClass: StesComponentInteractionService
                },
                {
                    provide: StesDataRestService,
                    useClass: StesDataRestService
                },
                {
                    provide: ToolboxService,
                    useClass: ToolboxService
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 })
                        },
                        paramMap: of(convertToParamMap({ id: 1 }))
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceDataRestService = TestBed.get(StesDataRestService);
        serviceComponentInteraction = TestBed.get(StesComponentInteractionService);
        fixture = TestBed.createComponent(StesDetailsInfoleisteModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should loadDetailsHeaderContent', () => {
        let header = {
            name: 'David',
            vorname: 'Ryan',
            strasse: 'Holzweg',
            hausnummer: '33',
            plz: '3007',
            ort: 'Bern',
            stesId: 'AD001314',
            alk: '02000',
            personalberaterVorname: 'Johannes',
            personalberaterName: 'Mayer',
            aktiv: true
        };

        component.stesHeader = {
            name: '',
            vorname: '',
            strasse: '',
            hausnummer: '',
            plz: '',
            ort: '',
            stesId: '',
            alk: '',
            personalberaterVorname: '',
            personalberaterName: '',
            stesBenutzerEmail: 'test@test.com',
            aktiv: false
        };

        spyOn(serviceDataRestService, 'getStesHeader').and.returnValue(of(header));

        component.loadDetailsHeaderContent('testId');

        expect(component.stesHeader).toEqual(header);
    });
});

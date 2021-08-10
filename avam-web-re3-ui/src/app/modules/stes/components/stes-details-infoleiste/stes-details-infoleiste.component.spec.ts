import { StesDetailsInfoleisteComponent } from './stes-details-infoleiste.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ToolboxService } from '@shared/services/toolbox.service';
import { MessageBus } from '../../../../shared/services/message-bus';
import { StesHeaderDTO } from '@shared/models/dtos-generated/stesHeaderDTO';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

describe('StesDetailsInfoleisteComponent', () => {
    let component: StesDetailsInfoleisteComponent;
    let fixture: ComponentFixture<StesDetailsInfoleisteComponent>;
    let serviceComponentInteraction: StesComponentInteractionService;
    let serviceDataRestService: StesDataRestService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsInfoleisteComponent],
            imports: [
                RouterTestingModule,
                HttpClientModule,
                ReactiveFormsModule,
                NgbTooltipModule,
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
                MessageBus
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceDataRestService = TestBed.get(StesDataRestService);
        serviceComponentInteraction = TestBed.get(StesComponentInteractionService);
        fixture = TestBed.createComponent(StesDetailsInfoleisteComponent);
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
            plz: null,
            stesId: '',
            alk: '',
            personalberaterVorname: '',
            personalberaterName: '',
            stesBenutzerEmail: 'test@test.com',
            aktiv: false
        } as StesHeaderDTO;

        spyOn(serviceDataRestService, 'getStesHeader').and.returnValue(of(header));

        component.loadDetailsHeaderContent('testId');

        expect(component.stesHeader).toEqual(header);
    });

    it('should componentInteraction call loadDetailsHeaderContent', () => {
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
            plz: null,
            stesId: '',
            alk: '',
            personalberaterVorname: '',
            personalberaterName: '',
            stesBenutzerEmail: 'test@test.com',
            aktiv: false
        } as StesHeaderDTO;

        spyOn(serviceDataRestService, 'getStesHeader').and.returnValue(of(header));

        serviceComponentInteraction.updateDetailsHeader('testStesId');

        expect(component.stesHeader).toEqual(header);
    });
});

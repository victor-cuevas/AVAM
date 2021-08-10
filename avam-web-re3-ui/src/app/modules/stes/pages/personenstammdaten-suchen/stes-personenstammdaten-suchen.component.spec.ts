import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesPersonenstammdatenSuchenComponent } from './stes-personenstammdaten-suchen.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToolboxService, TextOverflowTooltipDirective, TextOverflowTooltipInputFieldDirective } from 'src/app/shared';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MockTextControlClearDirective } from '../../../../../../tests/helpers';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DbTranslateService } from 'src/app/shared/services/db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';

describe('StesPersonenstammdatenSuchenComponent', () => {
    let component: StesPersonenstammdatenSuchenComponent;
    let fixture: ComponentFixture<StesPersonenstammdatenSuchenComponent>;
    let serviceDataRestService: StesDataRestService;
    let dbTranslateServiceStub: DbTranslateServiceStub;
    let wizardService: WizardService;
    const personenStammdatenDTOMock = {
        personenNr: '12312312321',
        namePersReg: 'Name',
        vornamePersReg: 'Vorname',
        geburtsDatum: new Date(),
        svNrFromZas: '1213123',
        geschlechtObject: {
            codeId: 1,
            textDe: 'TextDe',
            textFr: 'TextFr',
            textIt: 'Textit'
        },
        zivilstandObject: { codeId: 1, textDe: 'TextDe', textFr: 'TextFr', textIt: 'Textit' }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesPersonenstammdatenSuchenComponent, MockTextControlClearDirective, TextOverflowTooltipDirective, TextOverflowTooltipInputFieldDirective],
            imports: [
                HttpClientTestingModule,
                ReactiveFormsModule,
                FormsModule,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                }),
                NgbTooltipModule.forRoot(),
                RouterTestingModule.withRoutes([])
            ],
            providers: [
                SpinnerService,
                StesDataRestService,
                WizardService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ stesId: '123' })
                    }
                },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                ToolboxService
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        serviceDataRestService = TestBed.get(StesDataRestService);
        wizardService = TestBed.get(WizardService);
        dbTranslateServiceStub = TestBed.get(DbTranslateService);
        fixture = TestBed.createComponent(StesPersonenstammdatenSuchenComponent);
        const list = [];
        list.push({
            isActive: false,
            isDefault: false,
            isDirty: false,
            isDisabled: true,
            isInvalid: false,
            isLoading: false,
            isValid: false
        });
        list['first'] = { isActive: true, isDirty: true, isDisabled: false };

        wizardService.list = list;
        component = fixture.componentInstance;

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create model from DTO', () => {
        const personenstammdaten = component.buildModel(personenStammdatenDTOMock);

        expect(personenstammdaten.svnr).toEqual(personenStammdatenDTOMock.svNrFromZas);
        expect(personenstammdaten.zasNameVorname).toEqual(`${personenStammdatenDTOMock.namePersReg}, ${personenStammdatenDTOMock.vornamePersReg}`);
        expect(personenstammdaten.geburtsdatum).toEqual(personenStammdatenDTOMock.geburtsDatum);
        expect(personenstammdaten.geschlecht).toEqual(personenStammdatenDTOMock.geschlechtObject.textDe);
        expect(personenstammdaten.zivilstand).toEqual(personenStammdatenDTOMock.zivilstandObject.textDe);
    });
});

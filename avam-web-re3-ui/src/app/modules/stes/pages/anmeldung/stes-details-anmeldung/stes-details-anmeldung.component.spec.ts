import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesDetailsAnmeldungComponent } from './stes-details-anmeldung.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StepService } from 'src/app/shared/components/wizard/step-service';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';

describe('StesDetailsAnmeldungComponent', () => {
    let component: StesDetailsAnmeldungComponent;
    let fixture: ComponentFixture<StesDetailsAnmeldungComponent>;
    let stepService: StepService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsAnmeldungComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [StepService, MessageBus],
            imports: [
                RouterTestingModule.withRoutes([]),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
                })
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsAnmeldungComponent);
        component = fixture.componentInstance;
        stepService = TestBed.get(StepService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

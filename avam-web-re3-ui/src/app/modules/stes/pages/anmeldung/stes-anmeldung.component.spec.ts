import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesAnmeldungComponent } from './stes-anmeldung.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTranslatePipe } from '../../../../../../test_helpers';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
describe('StesAnmeldungComponent', () => {
    let component: StesAnmeldungComponent;
    let fixture: ComponentFixture<StesAnmeldungComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [FehlermeldungenService, { provide: TranslateService, useClass: TranslateServiceStub }],
            declarations: [StesAnmeldungComponent, MockTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesAnmeldungComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

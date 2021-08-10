import { async, TestBed } from '@angular/core/testing';
import { StesSearchHomeComponent } from './stes-search-home.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe, TranslateServiceStub } from '../../../../../../tests/helpers';
import { ActivatedRoute } from '@angular/router';
import { ActivatedRouteMock } from '@test_helpers/activated-route-stub';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('StesSearchHomeComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([])],
            declarations: [StesSearchHomeComponent, MockTranslatePipe],
            providers: [{ provide: ActivatedRoute, useValue: ActivatedRouteMock }, FehlermeldungenService, { provide: TranslateService, useClass: TranslateServiceStub }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        TestBed.compileComponents();
    }));

    it('should create', () => {
        const fixture = TestBed.createComponent(StesSearchHomeComponent);
        const component = fixture.debugElement.componentInstance;
        expect(component).toBeTruthy();
    });
});

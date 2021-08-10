import { DbTranslatePipe } from 'src/app/shared';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BenutzerInfoTemplateComponent } from './benutzer-info-template.component';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';

describe('BenutzerInfoTemplateComponent', () => {
    let component: BenutzerInfoTemplateComponent;
    let fixture: ComponentFixture<BenutzerInfoTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BenutzerInfoTemplateComponent, MockTranslatePipe, DbTranslatePipe],
            providers: [{ provide: TranslateService, useClass: TranslateServiceStub }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BenutzerInfoTemplateComponent);
        component = fixture.componentInstance;
        component.userInfoData = {
            id: '1',
            benutzerDetailId: '13',
            benutzerLogin: 'log12',
            nachname: 'pepi',
            vorname: 'gepi',
            value: 'concat'
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

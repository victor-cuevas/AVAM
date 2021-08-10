import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BenutzerstelleAuswaehlenTabelleComponent } from './benutzerstelle-auswaehlen-tabelle.component';
import { MockTranslatePipe } from '../../../../../tests/helpers';
import { DbTranslatePipe } from '../../pipes/db-translate.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ToolboxService } from '@app/shared/services/toolbox.service';

class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        of(key);
    }
}

describe('BenutzerstelleAuswaehlenTabelleComponent', () => {
    let component: BenutzerstelleAuswaehlenTabelleComponent;
    let fixture: ComponentFixture<BenutzerstelleAuswaehlenTabelleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BenutzerstelleAuswaehlenTabelleComponent, MockTranslatePipe, DbTranslatePipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: TranslateService, useClass: TranslateServiceStub }, ToolboxService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BenutzerstelleAuswaehlenTabelleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VollzugsregionAutosuggestComponent } from './vollzugsregion-autosuggest.component';
import { AutosuggestInputComponent, ObjectIteratorPipe } from '../..';
import { NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DbTranslateService } from '../../services/db-translate.service';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../tests/helpers';
import { BenutzerstellenRestService } from 'src/app/core/http/benutzerstellen-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { CustomPopoverDirective } from '@shared/directives/custom-popover.directive';
import { AvamInfoIconBtnComponent } from '../avam-info-icon-btn/avam-info-icon-btn.component';

export class TranslateServiceStub {
    public currentLang = 'de';
    public instant(key: any): any {
        return key;
    }
}

describe('VollzugsregionAutosuggestComponent', () => {
    let component: VollzugsregionAutosuggestComponent;
    let fixture: ComponentFixture<VollzugsregionAutosuggestComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                VollzugsregionAutosuggestComponent,
                AutosuggestInputComponent,
                AvamInfoIconBtnComponent,
                MockTranslatePipe,
                MockTextControlClearDirective,
                ObjectIteratorPipe,
                CustomPopoverDirective
            ],
            imports: [NgbModule, NgbPopoverModule],
            providers: [
                HttpClient,
                HttpHandler,
                BenutzerstellenRestService,
                { provide: TranslateService, useClass: TranslateServiceStub },
                { provide: DbTranslateService, useClass: DbTranslateServiceStub }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VollzugsregionAutosuggestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

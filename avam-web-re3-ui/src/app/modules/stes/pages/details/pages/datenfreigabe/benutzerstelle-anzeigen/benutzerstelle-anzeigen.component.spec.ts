import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BenutzerstelleAnzeigenComponent } from './benutzerstelle-anzeigen.component';
import { DbTranslatePipe, ToolboxService, TextOverflowTooltipDirective, TextOverflowTooltipInputFieldDirective } from '@app/shared';
import { of } from 'rxjs';
import { EventEmitter } from 'events';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/src/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { MockTranslatePipe, MockTextControlClearDirective } from '../../../../../../../../../tests/helpers';

export class TranslateServiceStub {
    public currentLang = 'de';
    onLangChange = new EventEmitter();
    public instant(key: any): any {
        return key;
    }
}

export class NgbModalStub {
    public open(key: any, options?: any): any {
        return { result: of(key).toPromise() };
    }
}

describe('BenutzerstelleAnzeigenComponent', () => {
    let component: BenutzerstelleAnzeigenComponent;
    let fixture: ComponentFixture<BenutzerstelleAnzeigenComponent>;
    let serviceToolboxService: ToolboxService;
    let ngbModalStub: NgbModalStub;
    let formBuilder: FormBuilder;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                MockTextControlClearDirective,
                BenutzerstelleAnzeigenComponent,
                MockTranslatePipe,
                DbTranslatePipe,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, NgbTooltipModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [ToolboxService, { provide: NgbModal, useClass: NgbModal }, { provide: TranslateService, useClass: TranslateServiceStub }, SpinnerService]
        }).compileComponents();

        fixture = TestBed.createComponent(BenutzerstelleAnzeigenComponent);
        serviceToolboxService = TestBed.get(ToolboxService);
        ngbModalStub = TestBed.get(NgbModal);
        formBuilder = TestBed.get(FormBuilder);
        component = fixture.componentInstance;
        component.uebergebeneDaten = { benutzerstellentyp: '9410', vollzugsregiontyp: '9409', status: '1431', kanton: null };
        component.ngOnInit();
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SchlagworteAutosuggestInputComponent } from './schlagworte-autosuggest.component';
import { AutosuggestInputComponent } from '@shared/components/autosuggest-input/autosuggest-input.component';
import { NgbTooltip, NgbTypeaheadModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MockTextControlClearDirective, MockTranslatePipe } from '../../../../../tests/helpers';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DbTranslatePipe } from '../../';
import { TranslateService } from '@ngx-translate/core';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { ObjectIteratorPipe } from '@app/shared/pipes/keys-value.pipe';
import { AvamInfoIconBtnComponent } from '../avam-info-icon-btn/avam-info-icon-btn.component';

describe('SchlagworteAutosuggestInputComponent', () => {
    let component: SchlagworteAutosuggestInputComponent;
    let fixture: ComponentFixture<SchlagworteAutosuggestInputComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                SchlagworteAutosuggestInputComponent,
                AutosuggestInputComponent,
                AvamInfoIconBtnComponent,
                MockTranslatePipe,
                ObjectIteratorPipe,
                MockTextControlClearDirective,
                NgbTooltip,
                DbTranslatePipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [NgbTypeaheadModule.forRoot(), NgbPopoverModule],
            providers: [
                HttpClient,
                HttpHandler,
                StesDataRestService,
                {
                    provide: TranslateService,
                    useClass: TranslateServiceStub
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SchlagworteAutosuggestInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should disable component', () => {
        component.disableComponent();
        expect(component.inputElement.disabled).toBeTruthy();
    });

    it('should enable component', () => {
        component.enableComponent();
        expect(component.inputElement.disabled).toBeFalsy();
    });

    it('should select item', () => {
        let spy = spyOn(component, 'onChange');
        component.itemSelected('brav');

        expect(spy).toHaveBeenCalledWith('brav');
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfotagSearchFormComponent } from './infotag-search-form.component';
import { MessageBus } from '../../services/message-bus';
import { InfotagService } from '../../services/infotag.service';
import { InfotagRestService } from '../../../core/http/infotag-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { AutosuggestInputComponent, DbTranslatePipe, FormUtilsService, TextOverflowTooltipDirective, TextOverflowTooltipInputFieldDirective } from '@app/shared';
import { NgbButtonsModule, NgbDate, NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DateValidator } from '@shared/validators/date-validator';
import { MockTextControlClearDirective } from '@test_helpers/mock-text-control-clear.derective';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { UnternehmenDataService } from '@shared/services/unternehmen-data.service';
import { DbTranslateServiceStub } from '@test_helpers/db-translate-service-stub';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { ObjectIteratorPipe } from '@app/shared/pipes/keys-value.pipe';
import { AvamInfoIconBtnComponent } from '../avam-info-icon-btn/avam-info-icon-btn.component';

describe('InfotagSearchFormComponent', () => {
    let component: InfotagSearchFormComponent;
    let fixture: ComponentFixture<InfotagSearchFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ReactiveFormsModule, FormsModule, NgbButtonsModule, NgbModule, NgbPopoverModule],
            declarations: [
                InfotagSearchFormComponent,
                MockTranslatePipe,
                MockTextControlClearDirective,
                AutosuggestInputComponent,
                AvamInfoIconBtnComponent,
                DbTranslatePipe,
                ObjectIteratorPipe,
                TextOverflowTooltipDirective,
                TextOverflowTooltipInputFieldDirective
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                StesDataRestService,
                FormBuilder,
                UnternehmenRestService,
                FormUtilsService,
                SpinnerService,
                MessageBus,
                InfotagService,
                InfotagRestService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: TranslateServiceMock },
                AmmRestService,
                UnternehmenDataService
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InfotagSearchFormComponent);
        component = fixture.componentInstance;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfotagSearchFormComponent);
        component = fixture.componentInstance;
        const formBuilder: FormBuilder = new FormBuilder();
        component.searchFormGroup = formBuilder.group({
            titel: null,
            durchfuehrungseinheitId: null,
            anbieter: null,
            plz: null,
            zeitraumVon: [null, DateValidator.dateFormat],
            zeitraumBis: [null, DateValidator.dateFormat],
            massnahmeartstruktur: null
        });
        component.searchFormGroup.setValue({
            titel: 'infotag-fuer-jugendliche',
            durchfuehrungseinheitId: 123,
            anbieter: { id: 1, name: 'Bla AG' },
            plz: null,
            zeitraumVon: new NgbDate(2000, 1, 1),
            zeitraumBis: new NgbDate(2000, 1, 31),
            massnahmeartstruktur: null
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
class TranslateServiceMock {
    public instant(key: any): any {
        of(key);
    }
}

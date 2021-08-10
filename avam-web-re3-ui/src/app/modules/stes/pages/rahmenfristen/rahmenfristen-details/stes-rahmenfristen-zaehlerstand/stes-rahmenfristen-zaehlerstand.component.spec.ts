import { AuthenticationRestService } from './../../../../../../core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';

import { StesRahmenfristenZaehlerstandComponent } from './stes-rahmenfristen-zaehlerstand.component';
import { DbTranslateServiceStub, MockTranslatePipe, NavigationServiceStub } from '../../../../../../../../tests/helpers';
import { ParagraphComponent, DbTranslatePipe, CloseTabDirective, ToolboxService, FormatNumberPipe, FormatSwissFrancPipe } from '@app/shared';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { navigationModel } from '@app/shared/models/navigation-model';
import { SpinnerService } from 'oblique-reactive';
import { NavigationService } from '@app/shared/services/navigation-service';
import { MessageBus } from '@app/shared/services/message-bus';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbTooltipModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DbTranslateService } from '@shared/services/db-translate.service';

import localeCh from '@angular/common/locales/de-CH';
import { LocaleEnum } from '@app/shared/enums/locale.enum';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeCh, LocaleEnum.SWITZERLAND);

export class TranslateServiceStub {
    public instant(key: any): any {
        of(key);
    }

    public stream(): any {
        return new EventEmitter();
    }
}

describe('StesRahmenfristenZaehlerstandComponent', () => {
    let component: StesRahmenfristenZaehlerstandComponent;
    let fixture: ComponentFixture<StesRahmenfristenZaehlerstandComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesRahmenfristenZaehlerstandComponent,
                MockTranslatePipe,
                ParagraphComponent,
                DbTranslatePipe,
                CloseTabDirective,
                FormatNumberPipe,
                FormatSwissFrancPipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                StesDataRestService,
                FormBuilder,
                { provide: TranslateService, useClass: TranslateServiceStub },
                {
                    provide: Router,
                    useValue: {
                        config: [
                            {
                                path: of({ navItems: navigationModel.stes })
                            }
                        ]
                    }
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            params: of({ id: 222 }),
                            data: of({ test: true })
                        },
                        paramMap: of(convertToParamMap({ id: 1 })),
                        queryParamMap: of({ id: 1 })
                    }
                },
                SpinnerService,
                { provide: NavigationService, useClass: NavigationServiceStub },
                MessageBus,
                ToolboxService,
                AuthenticationService,
                AuthenticationRestService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub }
            ],
            imports: [HttpClientTestingModule, FormsModule, NgbTooltipModule.forRoot(), NgbPopoverModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesRahmenfristenZaehlerstandComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

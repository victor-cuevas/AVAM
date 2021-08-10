import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StesRahmenfristenDetailsComponent } from './stes-rahmenfristen-details.component';
import { ParagraphComponent, DbTranslatePipe, CloseTabDirective, FormatNumberPipe, FormatSwissFrancPipe } from 'src/app/shared';
import { DbTranslateServiceStub, MockTranslatePipe, NavigationServiceStub } from '../../../../../../../tests/helpers';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { SpinnerService } from 'oblique-reactive';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxService } from 'src/app/shared/services/toolbox.service';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { NavigationService } from 'src/app/shared/services/navigation-service';
import { MessageBus } from 'src/app/shared/services/message-bus';
import { navigationModel } from 'src/app/shared/models/navigation-model';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
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

describe('StesRahmenfristenDetailsComponent', () => {
    let component: StesRahmenfristenDetailsComponent;
    let fixture: ComponentFixture<StesRahmenfristenDetailsComponent>;
    let serviceDataRestService: StesDataRestService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesRahmenfristenDetailsComponent, MockTranslatePipe, ParagraphComponent, DbTranslatePipe, CloseTabDirective, FormatNumberPipe, FormatSwissFrancPipe],
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
                AuthenticationRestService,
                AuthenticationService,
                MessageBus,
                ToolboxService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub }
            ],
            imports: [HttpClientTestingModule, RouterTestingModule, FormsModule, NgbTooltipModule.forRoot(), NgbPopoverModule.forRoot()]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesRahmenfristenDetailsComponent);
        serviceDataRestService = TestBed.get(StesDataRestService);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { MessageBus } from '@shared/services/message-bus';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesDetailsHomeComponent } from './stes-details-home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockTranslatePipe, DbTranslateServiceStub } from '../../../../../../tests/helpers';
import { ThrottleClickDirective } from 'src/app/shared/directives/throttle.click.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { ToolboxService } from '@app/shared';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';

describe('StesDetailsHomeComponent', () => {
    let component: StesDetailsHomeComponent;
    let fixture: ComponentFixture<StesDetailsHomeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StesDetailsHomeComponent, MockTranslatePipe, ThrottleClickDirective],
            imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
            providers: [
                ThrottleClickDirective,
                AuthenticationService,
                AuthenticationRestService,
                ToolboxService,
                StesDataRestService,
                MessageBus,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: DbTranslateServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesDetailsHomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

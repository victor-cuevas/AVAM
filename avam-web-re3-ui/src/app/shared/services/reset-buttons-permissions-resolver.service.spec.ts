import { TestBed } from '@angular/core/testing';
import { ResetButtonsPermissionsResolver } from './reset-buttons-permissions-resolver.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { DbTranslateService } from './db-translate.service';
import { DbTranslateServiceStub } from '@test_helpers/';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from 'selenium-webdriver/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResetButtonsPermissionsResolver', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthenticationService,
                AuthenticationRestService,
                { provide: DbTranslateService, useClass: DbTranslateServiceStub },
                { provide: TranslateService, useClass: DbTranslateServiceStub }
            ],
            imports: [HttpClientTestingModule, RouterTestingModule]
        }).compileComponents();
    });

    it('should be created', () => {
        const service: ResetButtonsPermissionsResolver = TestBed.get(ResetButtonsPermissionsResolver);
        expect(service).toBeTruthy();
    });
});

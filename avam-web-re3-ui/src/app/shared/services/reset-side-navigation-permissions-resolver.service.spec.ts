import { TestBed } from '@angular/core/testing';
import { ResetSideNavigationPermissionsResolver } from './reset-side-navigation-permissions-resolver.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AuthenticationRestService } from '@app/core/http/authentication-rest.service';
import { DbTranslateServiceStub } from '@test_helpers/';
import { DbTranslateService } from './db-translate.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('ResetSideNavigationPermissionsResolver', () => {
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
        const service: ResetSideNavigationPermissionsResolver = TestBed.get(ResetSideNavigationPermissionsResolver);
        expect(service).toBeTruthy();
    });
});

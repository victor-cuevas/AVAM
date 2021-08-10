import { TestBed } from '@angular/core/testing';

import { EnvironmentRestService } from './environment-rest.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EnvironmentRestService', () => {
    let stesService: EnvironmentRestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        const httpClient: HttpClient = TestBed.get(HttpClient);
        stesService = new EnvironmentRestService(httpClient);
    });

    it('should getEnvironmentInfo', () => {
        const spy = spyOn(stesService, 'getEnvironmentInfo').and.callThrough();
        stesService.getEnvironmentInfo();
        expect(spy).toHaveBeenCalled();
    });
});

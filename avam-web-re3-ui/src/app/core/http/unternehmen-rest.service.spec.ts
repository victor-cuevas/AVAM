import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { UnternehmenRestService } from './unternehmen-rest.service';

describe('UnternehmenRestService', () => {
    let service: UnternehmenRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        service = new UnternehmenRestService(httpClient);
    });

    it('should searchStes', () => {
        const spy = spyOn(service, 'getUnternehmenById').and.callThrough();

        service.getUnternehmenById('101');

        expect(spy).toHaveBeenCalled();
    });
});

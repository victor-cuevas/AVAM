import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import {ArbeitsvermittlungRestService} from './arbeitsvermittlung-rest.service';

describe('ArbeitsvermittlungRestService', () => {
    let service: ArbeitsvermittlungRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        httpClient = TestBed.get(HttpClient);
        service = new ArbeitsvermittlungRestService(httpClient);
    });

    it('should searchStes', () => {
        const spy = spyOn(service, 'searchByStes').and.callThrough();

        service.searchByStes('123');

        expect(spy).toHaveBeenCalled();
    });
});

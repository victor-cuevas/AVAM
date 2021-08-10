import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { DmsRestService } from '@core/http/dms-rest.service';

describe('DmsRestService', () => {
    let service: DmsRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        service = new DmsRestService(httpClient);
    });

    it('should getDmsURL', () => {
        const spy = spyOn(service, 'getDmsURL').and.callThrough();

        service.getDmsURL(null);

        expect(spy).toHaveBeenCalled();
    });
});

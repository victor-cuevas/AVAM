import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { InfotagRestService } from './infotag-rest.service';

describe('InfotagRestService', () => {
    let service: InfotagRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        service = new InfotagRestService(httpClient);
    });

    it('should getDurchfuehrungseinheiten', () => {
        const spy = spyOn(service, 'getDurchfuehrungseinheiten').and.callThrough();

        service.getDurchfuehrungseinheiten(null);

        expect(spy).toHaveBeenCalled();
    });
});

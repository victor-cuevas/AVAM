import { TestBed } from '@angular/core/testing';
import { AmmRestService } from './amm-rest.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Service: AmmRest', () => {
    let service: AmmRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        service = new AmmRestService(httpClient);
    });

    it('should be truthy', () => {
        const spy = spyOn(service, 'getStesAmmMassnahmen').and.callThrough();

        service.getStesAmmMassnahmen('123');

        expect(spy).toHaveBeenCalled();
    });
});

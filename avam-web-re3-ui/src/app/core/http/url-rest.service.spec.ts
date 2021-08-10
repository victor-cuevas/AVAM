import { TestBed } from '@angular/core/testing';
import { DefaultUrl, UrlRestService } from './url-rest.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UrlRestService', () => {
    let service: UrlRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        service = new UrlRestService(httpClient);
    });

    it('should helpUrl', () => {
        let spy = spyOn(service, 'urlById').and.callThrough();

        service.urlById(DefaultUrl.HELP, 123);

        expect(spy).toHaveBeenCalled();
    });

    it('should defaultUrl', () => {
        let spy = spyOn(service, 'defaultUrl').and.callThrough();

        service.defaultUrl(DefaultUrl.HELP);

        expect(spy).toHaveBeenCalled();
    });
});

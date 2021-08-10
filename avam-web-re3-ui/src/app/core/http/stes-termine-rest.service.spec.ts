import { StesTerminRestService } from "./stes-termin-rest.service";
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClient } from "@angular/common/http";

describe('StesSearchRestService', () => {
    let stesService: StesTerminRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        httpClient = TestBed.get(HttpClient);
        stesService = new StesTerminRestService(httpClient);
    });

    it('should searchStes', () => {
        let idTest: '1';
        let spracheTest: 'DE';
        let spy = spyOn(stesService, 'getTermine').and.callThrough();

        stesService.getTermine(idTest, spracheTest);

        expect(spy).toHaveBeenCalled();
    });
});

import { SchnellsucheRestService } from './schnellsuche-rest.service';
import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClient } from "@angular/common/http";

describe('StesSearchRestService', () => {
    let schnellsucheService: SchnellsucheRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        })
        httpClient = TestBed.get(HttpClient);
        schnellsucheService = new SchnellsucheRestService(httpClient);
    });

    it('should searchStes', () => {
        let language = 'de';
        let searchText = '';
        let spy = spyOn(schnellsucheService, 'searchForStes').and.callThrough();

        schnellsucheService.searchForStes(language, searchText);

        expect(spy).toHaveBeenCalled();
    });
});

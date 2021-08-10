import {StesTerminDataService} from './stes-termin-data.service';
import {StesTerminRestService} from '@core/http/stes-termin-rest.service';
import {TestBed} from '@angular/core/testing';
import {HttpClient, HttpHandler} from '@angular/common/http';

describe('StesDataService', () => {

    let stesDataService: StesTerminDataService;
    let stesSearchRestService: StesTerminRestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [StesTerminRestService, HttpClient, HttpHandler],
        });
        stesSearchRestService = TestBed.get(StesTerminRestService);
        stesDataService = new StesTerminDataService(stesSearchRestService);
    });

    it('should callRestService', () => {
        let idTest: '1';
        let spracheTest: 'DE';
        let spy = spyOn(stesDataService, 'getStesTermine').and.callThrough();

        stesDataService.getStesTermine(idTest, spracheTest);

        expect(spy).toHaveBeenCalled();
    })

});

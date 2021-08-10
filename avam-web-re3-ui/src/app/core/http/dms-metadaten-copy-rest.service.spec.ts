import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { DmsMetadatenCopyRestService } from '@core/http/dms-metadaten-copy-rest.service';

describe('DmsMetadatenCopyRestService', () => {
    let service: DmsMetadatenCopyRestService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        service = new DmsMetadatenCopyRestService(httpClient);
    });

    it('should copyStesPersonalienMetadaten', () => {
        const spy = spyOn(service, 'copyStesPersonalienMetadaten').and.callThrough();

        service.copyStesPersonalienMetadaten(null);

        expect(spy).toHaveBeenCalled();
    });

    it('should copyTerminMetadaten', () => {
        const spy = spyOn(service, 'copyTerminMetadaten').and.callThrough();

        service.copyTerminMetadaten(null);

        expect(spy).toHaveBeenCalled();
    });

    it('should copyInfotagBuchungMetadaten', () => {
        const spy = spyOn(service, 'copyInfotagBuchungMetadaten').and.callThrough();

        service.copyInfotagBuchungMetadaten(null, null);

        expect(spy).toHaveBeenCalled();
    });
});

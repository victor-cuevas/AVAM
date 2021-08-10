import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BenutzerstellenQueryDTO } from 'src/app/shared/models/dtos-generated/benutzerstellenQueryDTO';
import { environment } from 'src/environments/environment';
import { BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages } from 'src/app/shared/models/dtos-generated/baseResponseWrapperListBenutzerstelleResultDTOWarningMessages';
import { BenutzerstellenRestService } from './benutzerstellen-rest.service';
import { VollzugsregionDTO } from 'src/app/shared/models/dtos-generated/vollzugsregionDTO';

describe('BenutzerstellenRestService', () => {
    const baseUrl: string = environment.baseUrl;

    let service: BenutzerstellenRestService;
    let httpTestingController: HttpTestingController;

    const getBenutzerstellenURL = baseUrl + '/rest/common/benutzerstellen-suchen/de';
    const getVollzugsregionenURL = baseUrl + '/rest/common/vollzugsregion-suchen/de/text';

    const benutzerstellenQueryMockDTO: BenutzerstellenQueryDTO = {
        gueltigkeit: 'text',
        name: 'text',
        strasse: 'text',
        nummer: 'text',
        plzDTO: {
            plzId: 1,
            postleitzahl: 1,
            ortDe: 'text',
            ortFr: 'text',
            ortIt: 'text'
        },
        kanton: 'text',
        benutzerstelleCodeVon: 'text',
        benutzerstelleCodeBis: 'text',
        benutzerstelleTypeId: 1,
        vollzugsregionId: 'text',
        vollzugsregionTypeId: 1
    };

    const vollzugsregionenMockDTO: VollzugsregionDTO[] = [
        {
            code: 'text',
            nameDe: 'name'
        }
    ];

    const baseResponseWrapperListBenutzerstelleResultDTOWarningMessagesMock: BaseResponseWrapperListBenutzerstelleResultDTOWarningMessages = {
        data: null,
        warning: null
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [BenutzerstellenRestService]
        });
        httpTestingController = TestBed.get(HttpTestingController);
        service = TestBed.get(BenutzerstellenRestService);
    });

    it('should be created', () => {
        const service: BenutzerstellenRestService = TestBed.get(BenutzerstellenRestService);
        expect(service).toBeTruthy();
    });

    it('can test get benutzerstellen', () => {
        service.getBenutzerstellen(benutzerstellenQueryMockDTO, 'de').subscribe(data => {
            expect(data).toEqual(baseResponseWrapperListBenutzerstelleResultDTOWarningMessagesMock);
        });

        const req = httpTestingController.expectOne(getBenutzerstellenURL);
        expect(req.request.method).toEqual('POST');

        req.flush(baseResponseWrapperListBenutzerstelleResultDTOWarningMessagesMock);

        httpTestingController.verify();
    });

    it('can test get vollzugsregionen', () => {
        service.getVollzugsregionen('de', 'text').subscribe(data => {
            expect(data).toEqual(vollzugsregionenMockDTO);
        });

        const req = httpTestingController.expectOne(getVollzugsregionenURL);
        expect(req.request.method).toEqual('GET');

        req.flush(vollzugsregionenMockDTO);

        httpTestingController.verify();
    });
});

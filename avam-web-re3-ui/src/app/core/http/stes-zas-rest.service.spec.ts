import { TestBed } from '@angular/core/testing';

import { StesZasRestService } from './stes-zas-rest.service';
import { environment } from '@environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { StaatDTO } from '@shared/models/dtos-generated/staatDTO';

describe('StesZasRestService', () => {
    const baseUrl: string = environment.baseUrl;
    const zasAbgleichUrl = baseUrl + '/rest/stes/zas';
    const zasAbgleichMock: BaseResponseWrapperListStesZasDTOWarningMessages = {
        data: [
            {
                personenNr: '123345',
                nationalitaetObject: {
                    staatId: 1,
                    code: null,
                    iso2Code: '',
                    iso3Code: '',
                    nameDe: 'Schweiz',
                    nameFr: null,
                    nameIt: null
                } as StaatDTO,
                nationalitaetId: 1,
                geschlechtId: 1,
                geburtsDatum: new Date(2354546246),
                letzterZASAbgleich: new Date(1330124400000),
                personStesId: 1234,
                versichertenNrList: [
                    {
                        personVersichertenNrId: 0,
                        personStesId: 1234,
                        versichertenNr: '1223435',
                        istAktuelleVersichertenNr: true
                    } as PersonVersichertenNrDTO
                ]
            } as StesZasDTO
        ],
        warning: null
    } as BaseResponseWrapperListStesZasDTOWarningMessages;

    let httpTestingController: HttpTestingController;
    let service: StesZasRestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [StesZasRestService]
        });
        httpTestingController = TestBed.get(HttpTestingController);
        service = TestBed.get(StesZasRestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(httpTestingController).toBeTruthy();
    });

    it('can test HttpClient.post for stes createZasAbgleich', () => {
        const stesZasDTO: StesZasDTO = <StesZasDTO>{};

        service.createZasAbgleich(stesZasDTO).subscribe(data => {
            expect(data).toEqual(zasAbgleichMock);
        });

        const req = httpTestingController.expectOne(zasAbgleichUrl);

        expect(req.request.method).toEqual('POST');

        req.flush(zasAbgleichMock);

        httpTestingController.verify();
    });

    afterEach(() => {
        httpTestingController.verify();
    });
});

import { TestBed } from '@angular/core/testing';

import { StesZasAbgleichService } from './stes-zas-abgleich.service';
import { StesZasRestService } from '../../../core/http/stes-zas-rest.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { NgbButtonsModule, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService } from '../../../shared';
import { SpinnerService } from 'oblique-reactive';
import { Observable, of } from 'rxjs';
import { ZasAbgleichRequest } from '../../../shared/models/dtos/stes-zas-abgleich-request';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaatDTO } from '@dtos/staatDTO';
import { PersonVersichertenNrDTO } from '@dtos/personVersichertenNrDTO';
import { StesZasAbgleichenComponent, StesZasKeinAbgleichenComponent, StesZasListAbgleichenComponent, StesZasPersonAbgleichenComponent } from '../pages/details';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MockTranslatePipe } from '../../../../../tests/helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StesZasDTO } from '@shared/models/dtos-generated/stesZasDTO';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { BaseResponseWrapperListStesZasDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperListStesZasDTOWarningMessages';

describe('StesZasAbgleichService', () => {
    let service: StesZasAbgleichService;
    let restService: StesZasRestService;
    let fehlerMeldung: FehlermeldungenService;
    let ngbModalStub: NgbModalMock;
    let formUtils: FormUtilsService;
    const nat = { staatId: 1, code: '100', iso2Code: 'CH', iso3Code: 'CHE', nameDe: 'Schweiz', nameFr: 'Suisse', nameIt: 'Svizzera' } as StaatDTO;
    const geschlechtDropdownLablesMock = [
        { codeId: 1057, labelDe: 'weiblich', labelFr: 'féminin', labelIt: 'femminile' },
        { codeId: 1056, labelDe: 'männlich', labelFr: 'masculin', labelIt: 'maschile' }
    ];
    const req = {
        stesId: 1,
        personenNr: '1',
        nationalitaetId: 1,
        nationalitaet: nat,
        personenstammdaten: new FormBuilder().group({
            svNr: null,
            zasName: null,
            zasVorname: null,
            geschlecht: null,
            zivilstand: null,
            nationalitaet: null,
            geburtsdatum: null,
            versichertenNrList: null
        }),
        geschlechtDropdownLables: geschlechtDropdownLablesMock,
        letzterZASAbgleich: null
    } as ZasAbgleichRequest;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StesZasAbgleichenComponent, StesZasKeinAbgleichenComponent, StesZasListAbgleichenComponent, StesZasPersonAbgleichenComponent, MockTranslatePipe],
            imports: [
                NgbModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                NgbButtonsModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateFakeLoader
                    }
                })
            ],
            providers: [StesZasRestService, HttpClient, HttpHandler, FormUtilsService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        restService = new StesZasRestServiceStub(null);
        ngbModalStub = TestBed.get(NgbModal);
        formUtils = TestBed.get(FormUtilsService);
        fehlerMeldung = new FehlermeldungenServiceStub(null);
        service = new StesZasAbgleichService(
            ngbModalStub,
            formUtils,
            {
                activate(channel?: string): void {
                    /**/
                },
                deactivate(channel?: string): void {
                    /**/
                }
            } as SpinnerService,
            restService,
            fehlerMeldung
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

export class NgbModalMock extends NgbModal {
    public open(key: any, options?: any): any {
        return { result: of(key).toPromise() };
    }
}

class StesZasRestServiceStub extends StesZasRestService {
    createZasAbgleich(stesZasDTO: StesZasDTO): Observable<BaseResponseWrapperListStesZasDTOWarningMessages> {
        return of({
            data: [
                {
                    personenNr: '1',
                    namePersReg: 'name',
                    vornamePersReg: 'vorname',
                    nationalitaetObject: {
                        staatId: 1,
                        code: '100',
                        iso2Code: 'CH',
                        iso3Code: 'CHE',
                        nameDe: 'Schweiz',
                        nameFr: 'Suisse',
                        nameIt: 'Svizzera'
                    } as StaatDTO,
                    nationalitaetId: 1,
                    geschlechtId: 1057,
                    geburtsDatum: new Date(71193600000),
                    letzterZASAbgleich: new Date(81193600000),
                    personStesId: 1,
                    versichertenNrList: [
                        {
                            personVersichertenNrId: 1,
                            personStesId: 1,
                            versichertenNr: '7566142172751',
                            istAktuelleVersichertenNr: true
                        } as PersonVersichertenNrDTO
                    ]
                } as StesZasDTO
            ],
            warning: null
        } as BaseResponseWrapperListStesZasDTOWarningMessages);
    }
}

class FehlermeldungenServiceStub extends FehlermeldungenService {
    showMessage(message: string, type: string) {
        return;
    }
}

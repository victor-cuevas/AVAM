import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { StesRahmenfristenAuszahlungenComponent } from './stes-rahmenfristen-auszahlungen.component';
import { ObjectIteratorPipe, ParagraphComponent, ResizableColumnDirective, ResultCountComponent, SortableHeader, ToolboxService } from 'src/app/shared';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
// prettier-ignore
import {
    BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages
} from '@shared/models/dtos-generated/baseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages';
import { Observable, of } from 'rxjs';

class StesDataRestServiceMock extends StesDataRestService {
    private readonly mockData: BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages = {
        data: [
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0026340',
                valutadatum: '25.07.2017',
                kontrollperiode: '07.2017',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '10.0',
                betrag: '640.50',
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0026258',
                valutadatum: '29.06.2017',
                kontrollperiode: '06.2017',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '22.0',
                betrag: "1'409.10",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0026148',
                valutadatum: '30.05.2017',
                kontrollperiode: '05.2017',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '23.0',
                betrag: "1'473.15",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0026050',
                valutadatum: '02.05.2017',
                kontrollperiode: '04.2017',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '20.0',
                betrag: "1'281.00",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025946',
                valutadatum: '04.04.2017',
                kontrollperiode: '03.2017',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '23.0',
                betrag: "1'473.15",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025810',
                valutadatum: '28.02.2017',
                kontrollperiode: '02.2017',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '20.0',
                betrag: "1'281.00",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025696',
                valutadatum: '31.01.2017',
                kontrollperiode: '01.2017',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '22.0',
                betrag: "1'409.10",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025538',
                valutadatum: '20.12.2016',
                kontrollperiode: '12.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '22.0',
                betrag: "1'409.10",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025468',
                valutadatum: '01.12.2016',
                kontrollperiode: '11.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '22.0',
                betrag: "1'409.10",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025359',
                valutadatum: '03.11.2016',
                kontrollperiode: '10.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '21.0',
                betrag: "1'345.05",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025239',
                valutadatum: '29.09.2016',
                kontrollperiode: '09.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '22.0',
                betrag: "1'409.10",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025136',
                valutadatum: '01.09.2016',
                kontrollperiode: '08.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '23.0',
                betrag: "1'473.15",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0025020',
                valutadatum: '02.08.2016',
                kontrollperiode: '07.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '21.0',
                betrag: "1'345.05",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0024906',
                valutadatum: '30.06.2016',
                kontrollperiode: '06.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '22.0',
                betrag: "1'409.10",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0024773',
                valutadatum: '30.05.2016',
                kontrollperiode: '05.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '22.0',
                betrag: "1'409.10",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0024694',
                valutadatum: '10.05.2016',
                kontrollperiode: '04.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '21.0',
                betrag: "1'345.05",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0024556',
                valutadatum: '31.03.2016',
                kontrollperiode: '03.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '23.0',
                betrag: "1'473.15",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            },
            {
                namePersReg: 'LIEVRE',
                vornamePersReg: 'ANDRE GERMAIN ROGER',
                personenNr: '22214617',
                versichertenNr: '7561007765086',
                rahmenfristZahlstelle: '49 000 CSI Porrentruy',
                rahmenfrist: '01.02.2016 - 30.09.2019',
                aleZahlstelle: '49 000',
                journalNr: '0024465',
                valutadatum: '03.03.2016',
                kontrollperiode: '02.2016',
                entschaedigungskategorie: 'stes.asal.label.entschaedigung',
                bezogeneTaggelder: '21.0',
                betrag: "1'345.05",
                ammNr: '0',
                ammArt: '   ',
                leistungsvorschussExport: ' ',
                bezVerrechnungsland: null
            }
        ],
        warning: null
    } as BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages;

    constructor() {
        super(null);
    }

    getAuszahlungProRahmenfristen(personStesId: number, stesRahmenfristId: number): Observable<BaseResponseWrapperListStesAuszahlungProRahmenfristDTOWarningMessages> {
        const start = new Date().getTime();
        // wait for 1 second
        for (let i = 0; i < 1e7; i++) {
            if (new Date().getTime() - start > 1000) {
                break;
            }
        }
        return of(this.mockData);
    }
}

describe('StesRahmenfristenAuszahlungenComponent', () => {
    let component: StesRahmenfristenAuszahlungenComponent;
    let fixture: ComponentFixture<StesRahmenfristenAuszahlungenComponent>;
    let stesDataRestService: StesDataRestService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                StesRahmenfristenAuszahlungenComponent,
                ResultCountComponent,
                ParagraphComponent,
                MockTranslatePipe,
                ObjectIteratorPipe,
                SortableHeader,
                ResizableColumnDirective
            ],
            imports: [NgbModule, NgbTooltipModule.forRoot(), HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [ToolboxService, { provide: StesDataRestService, useClass: StesDataRestServiceMock }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesRahmenfristenAuszahlungenComponent);
        component = fixture.componentInstance;
        stesDataRestService = TestBed.get(StesDataRestService);
    });

    it('should create', () => {
        spyOn(stesDataRestService, 'getAuszahlungProRahmenfristen').and.callThrough();
        component.ngOnInit();
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('check footers: totalBezugstage, totalAuszahlung', (): void => {
        spyOn(stesDataRestService, 'getAuszahlungProRahmenfristen').and.callThrough();
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.bezugstageFooter).toBe('380.0');
        expect(component.auszahlungFooter).toBe("24'339.00");
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StesInfotagDetailsModalComponent } from './stes-infotag-details-modal.component';
import { MockTranslatePipe } from '@test_helpers/mock-translate.pipe';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { TranslateServiceStub } from '@test_helpers/translate-service-stub';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageBus } from '@shared/services/message-bus';

describe('StesInfotagDetailsModalComponent', () => {
    let component: StesInfotagDetailsModalComponent;
    let fixture: ComponentFixture<StesInfotagDetailsModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule, HttpClientTestingModule],
            declarations: [StesInfotagDetailsModalComponent, MockTranslatePipe],
            providers: [{ provide: TranslateService, useClass: TranslateServiceStub }, NgbActiveModal, MessageBus, StesDataRestService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StesInfotagDetailsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('test', () => {
        expect(component).toBeTruthy();
        expect(component.getFormNr()).toBe(StesFormNumberEnum.INFOTAG_GRUNDDATEN_BUCHUNG);
        expect(component.isGrunddatenBuchungActive()).toBeTruthy();
        expect(component.isBeschreibungDurchfuehrungsortActive()).toBeFalsy();
        expect(component.isTeilnehmerlisteActive()).toBeFalsy();

        component.showView('beschreibungOrt');
        expect(component.getFormNr()).toBe(StesFormNumberEnum.INFOTAG_BESCHREIBUNG_DURCHFUEHRUNGSORT);
        expect(component.isGrunddatenBuchungActive()).toBeFalsy();
        expect(component.isBeschreibungDurchfuehrungsortActive()).toBeTruthy();
        expect(component.isTeilnehmerlisteActive()).toBeFalsy();

        component.showView('teilnehmerListe');
        expect(component.getFormNr()).toBe(StesFormNumberEnum.INFOTAG_TEILNEHMER_LISTE);
        expect(component.isGrunddatenBuchungActive()).toBeFalsy();
        expect(component.isBeschreibungDurchfuehrungsortActive()).toBeFalsy();
        expect(component.isTeilnehmerlisteActive()).toBeTruthy();
    });
});

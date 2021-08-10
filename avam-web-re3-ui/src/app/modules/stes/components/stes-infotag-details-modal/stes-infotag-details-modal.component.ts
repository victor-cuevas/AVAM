import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewRef } from '@angular/core';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { UnternehmenQueryDTO } from '@dtos/unternehmenQueryDTO';
import { MessageBus } from '@shared/services/message-bus';

@Component({
    selector: 'app-stes-infotag-details-modal',
    templateUrl: './stes-infotag-details-modal.component.html'
})
export class StesInfotagDetailsModalComponent implements OnInit, AfterViewInit {
    static readonly grunddatenTitle = 'stes.subnavmenuitem.stesTermine.grunddaten';
    static readonly beschreibungOrtTitle = 'stes.subnavmenuitem.stesTermine.beschreibungdurchfuehrungsort';
    static readonly teilnehmerListeTitle = 'stes.subnavmenuitem.stesTermine.teilnehmerliste';

    @ViewChild('vc', { read: ViewContainerRef }) viewContainer: ViewContainerRef;
    @ViewChild('grunddatenBuchungComponent', { read: TemplateRef }) grunddatenBuchungComponent: TemplateRef<null>;
    @ViewChild('beschreibungOrtComponent', { read: TemplateRef }) beschreibungOrtComponent: TemplateRef<null>;
    @ViewChild('teilnehmerListeComponent', { read: TemplateRef }) teilnehmerListeComponent: TemplateRef<null>;
    viewGrunddaten: ViewRef;
    viewBeschreibung: ViewRef;
    viewTeilnehmer: ViewRef;

    stesId: string;
    dfeId: string;
    gfId: number;
    ueberschrift: string;
    anbieter: string;
    durchfuehrungsNr: number;
    status: string;
    burNr: number;
    massnahmekuerzel: string;

    spinnerChannel: any;

    private formNr: string;
    private _title: string = this.grunddatenName;
    private unternehmenQueryDTO: UnternehmenQueryDTO = {
        name: null,
        strasse: null,
        plzDTO: null,
        land: null,
        uid: null,
        burNr: null,
        kundenberater: null,
        unternehmenStatusId: null,
        avamSuche: true,
        sucheWortBeliebig: null,
        sucheUmliegend: null,
        language: null
    };

    constructor(
        private activeModal: NgbActiveModal,
        private dbTranslateService: DbTranslateService,
        private stesDataRestService: StesDataRestService,
        private messageBus: MessageBus
    ) {}

    ngOnInit(): void {
        this.viewContainer.clear();
        this.formNr = StesFormNumberEnum.INFOTAG_GRUNDDATEN_BUCHUNG;
        this.viewGrunddaten = this.grunddatenBuchungComponent.createEmbeddedView(null);
        this.viewContainer.insert(this.viewGrunddaten);
    }

    ngAfterViewInit() {
        this.viewBeschreibung = this.beschreibungOrtComponent.createEmbeddedView(null);
        this.viewTeilnehmer = this.teilnehmerListeComponent.createEmbeddedView(null);
    }

    close(): void {
        this.viewContainer.clear();
        this.activeModal.dismiss();
        this.messageBus.buildAndSend('reload-infotag-buchung-toolbox', null);
        this.messageBus.buildAndSend('stes-details-recover-ueberschrift', true);
    }

    getFormNr(): string {
        return this.formNr;
    }

    isGrunddatenBuchungActive(): boolean {
        return this.isActive(StesFormNumberEnum.INFOTAG_GRUNDDATEN_BUCHUNG);
    }

    isBeschreibungDurchfuehrungsortActive(): boolean {
        return this.isActive(StesFormNumberEnum.INFOTAG_BESCHREIBUNG_DURCHFUEHRUNGSORT);
    }

    isTeilnehmerlisteActive(): boolean {
        return this.isActive(StesFormNumberEnum.INFOTAG_TEILNEHMER_LISTE);
    }

    isActive(formNr: string): boolean {
        return formNr === this.formNr;
    }

    updateData(data: any): void {
        this.gfId = data.geschaeftsfallId;
        this.anbieter = data.anbieter ? data.anbieter.name1 : null;
        this.burNr = data.anbieter ? data.anbieter.burNummer : null;
        this.durchfuehrungsNr = data.durchfuehrungsNr;
        if (data.buchungStatus) {
            this.status = this.dbTranslateService.translate(data.buchungStatus, 'text');
        }
        if (data.anbieter && data.anbieter.plz) {
            this.setMassnahmnekuerzel(this.dbTranslateService.translate(data.anbieter.plz, 'ort'));
        }

        if (this.burNr) {
            this.setUnternehmenStatus();
        }
    }

    setMassnahmnekuerzel(ort: string): void {
        this.stesDataRestService.getGemeindeByName(this.dbTranslateService.getCurrentLang(), ort).subscribe(gemeinde => {
            this.massnahmekuerzel = gemeinde.shift().kanton;
        });
    }

    setUnternehmenStatus(): void {
        this.unternehmenQueryDTO.burNr = String(this.burNr);
        this.stesDataRestService.searchAvamUnternehmen(this.unternehmenQueryDTO).subscribe(response => {
            this.status = response.data && response.data.length > 0 ? this.dbTranslateService.translate(response.data[0], 'status') : null;
        });
    }

    showView(view: string): void {
        this.viewContainer.detach();
        let activateView;
        switch (view) {
            case 'grundatenBuchung': {
                activateView = this.viewGrunddaten;
                this.formNr = StesFormNumberEnum.INFOTAG_GRUNDDATEN_BUCHUNG;
                this.title = this.grunddatenName;
                break;
            }
            case 'beschreibungOrt': {
                activateView = this.viewBeschreibung;
                this.formNr = StesFormNumberEnum.INFOTAG_BESCHREIBUNG_DURCHFUEHRUNGSORT;
                this.title = this.beschreibungOrtName;
                break;
            }
            case 'teilnehmerListe': {
                activateView = this.viewTeilnehmer;
                this.formNr = StesFormNumberEnum.INFOTAG_TEILNEHMER_LISTE;
                this.title = this.teilnehmerListeName;
                break;
            }
        }

        this.viewContainer.insert(activateView);
    }

    get grunddatenName(): string {
        return StesInfotagDetailsModalComponent.grunddatenTitle;
    }

    get beschreibungOrtName(): string {
        return StesInfotagDetailsModalComponent.beschreibungOrtTitle;
    }

    get teilnehmerListeName(): string {
        return StesInfotagDetailsModalComponent.teilnehmerListeTitle;
    }

    get title(): string {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
    }
}

import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SpinnerService } from 'oblique-reactive';
import { ToolboxConfiguration, ToolboxActionEnum, ToolboxService } from '@app/shared/services/toolbox.service';
import { StesHeaderDTO } from '@app/shared/models/dtos-generated/stesHeaderDTO';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { StesBerufsdatenDTO } from '@app/shared/models/dtos-generated/stesBerufsdatenDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { GeschlechtPipe } from '@app/shared/pipes/geschlecht.pipe';

export const STES_DETAILS_MODAL_SPINNER_CHANNEL = 'stes-details-modal-spinner';

@Component({
    selector: 'avam-stes-details-modal',
    templateUrl: './stes-details-modal.component.html',
    styleUrls: ['./stes-details-modal.component.scss']
})
export class StesDetailsModalComponent implements OnInit, OnDestroy {
    @Input() stesId: string;

    formNumbers: typeof StesFormNumberEnum = StesFormNumberEnum;

    stesHeader: StesHeaderDTO;
    headerLabelKey: string;
    berufHeader: string;
    formNumber: string;
    beruf: StesBerufsdatenDTO;

    infoleisteServiceSubscription: Subscription;
    originalShowInfoIcon: boolean;
    toolboxClickActionSub: Subscription;
    toolboxChannel = 'stes-details-modal-toolbox';
    oldToolboxChannel: string;

    spinnerChannel = STES_DETAILS_MODAL_SPINNER_CHANNEL;
    oldSpinnerChannel: string;

    alertChannel = AlertChannelEnum;

    constructor(
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private spinnerService: SpinnerService,
        private dataService: StesDataRestService,
        private translateService: TranslateService,
        private dbTranslateService: DbTranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private geschlechtPipe: GeschlechtPipe
    ) {
        this.oldToolboxChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.toolboxChannel;
        this.oldSpinnerChannel = SpinnerService.CHANNEL;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        this.configureToolbox();
        this.changePage(StesFormNumberEnum.STES_DETAILS_PERSONALIEN);
        this.loadData();
    }

    get toolboxConfiguration(): ToolboxConfiguration[] {
        return [new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    }

    get stesHeaderAddress(): string {
        let adresse = '';

        if (this.stesHeader.plz.postleitzahl) {
            const strasse = this.stesHeader.strasse ? this.stesHeader.strasse : '';
            const strasseNr = this.stesHeader.hausnummer ? this.stesHeader.hausnummer : '';

            if (this.stesHeader.strasse || this.stesHeader.hausnummer) {
                adresse = this.stesHeader.strasse && this.stesHeader.hausnummer ? `${strasse} ${strasseNr}, ` : `${strasse}${strasseNr}, `;
            }

            adresse += `${this.stesHeader.plz.postleitzahl} ${this.dbTranslateService.translate(this.stesHeader.plz, 'ort')}`;
        }

        return adresse;
    }

    configureToolbox() {
        this.toolboxClickActionSub = this.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    changePage(formNumber: string) {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.formNumber = formNumber;

        switch (formNumber) {
            case StesFormNumberEnum.STES_DETAILS_PERSONALIEN:
                this.configureStesPage('stes.subnavmenuitem.stesPersonalien');
                break;
            case StesFormNumberEnum.STES_DETAILS_GRUNDDATEN:
                this.configureStesPage('stes.subnavmenuitem.stesGrunddaten');
                break;
            case StesFormNumberEnum.STES_DETAILS_BERUFSDATEN:
                this.configureStesPage('stes.subnavmenuitem.stesBerufsdaten');
                break;
            case StesFormNumberEnum.STES_DETAILS_BERUFSDATEN_DETAIL:
                this.configureBerufPage();
                break;
            case StesFormNumberEnum.STES_DETAILS_STELLENSUCHE:
                this.configureStesPage('stes.subnavmenuitem.stesStellensuche');
                break;
            case StesFormNumberEnum.STES_DETAILS_SPRACHEN:
                this.configureStesPage('stes.subnavmenuitem.stesSprachkenntnisse');
                break;
            case StesFormNumberEnum.STES_DETAILS_DATENFREIGABE:
                this.configureStesPage('stes.subnavmenuitem.stesPublikation');
                break;
            default:
                this.configureStesPage('');
        }
    }

    configureStesPage(headerLabelKey: string) {
        this.headerLabelKey = headerLabelKey;
        this.berufHeader = '';
        this.beruf = null;
    }

    configureBerufPage() {
        this.headerLabelKey = 'stes.subnavmenuitem.stesBeruf';
        this.berufHeader = `${this.dbTranslateService.translate(this.beruf.berufsTaetigkeitObject, this.geschlechtPipe.transform('bezeichnung', this.beruf.geschlecht))}`;
    }

    openBeruf(selectedBeruf: StesBerufsdatenDTO) {
        this.beruf = selectedBeruf;
        this.changePage(StesFormNumberEnum.STES_DETAILS_BERUFSDATEN_DETAIL);
    }

    close() {
        this.modalService.dismissAll();
    }

    ngOnDestroy() {
        ToolboxService.CHANNEL = this.oldToolboxChannel;
        SpinnerService.CHANNEL = this.oldSpinnerChannel;

        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }

        if (this.infoleisteServiceSubscription) {
            this.infoleisteServiceSubscription.unsubscribe();
        }

        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
    }

    loadData() {
        this.spinnerService.activate(this.spinnerChannel);
        this.dataService.getStesHeader(this.stesId, this.translateService.currentLang, AlertChannelEnum.MODAL).subscribe(
            (data: StesHeaderDTO) => {
                this.stesHeader = data;
                this.spinnerService.deactivate(this.spinnerChannel);
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
            }
        );
    }
}

import { AlertChannelEnum } from '@app/shared/components/alert/alert-channel.enum';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AmmRestService } from '@app/core/http/amm-rest.service';
import { AmmMassnahmenCode } from '@app/shared/enums/domain-code/amm-massnahmen-code.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { AmmBuchungParamDTO } from '@app/shared/models/dtos-generated/ammBuchungParamDTO';
import { BaseResponseWrapperAmmBuchungParamDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperAmmBuchungParamDTOWarningMessages';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'oblique-reactive';
import { AmmHelper } from '@shared/helpers/amm.helper';
import { TranslateService } from '@ngx-translate/core';

enum Pages {
    GRUNDDATEN = 1,
    BESCHREIBUNG = 2,
    DURCHFUEHRUNGSORT = 3
}

export interface AngebotsdatenPageData {
    type?: string;
    title?: string;
    organisationAndType?: string;
    dfeNumberLabel?: string;
    dfeNumber?: number;
    zulassungsType?: string;
}

interface Dfe {
    type?: string;
    label?: string;
    number?: number;
}

@Component({
    selector: 'avam-angebotsdaten-sichten',
    templateUrl: './angebotsdaten-sichten.component.html',
    styleUrls: ['./angebotsdaten-sichten.component.scss']
})
export class AngebotsdatenSichtenComponent implements OnInit, OnDestroy {
    @Input() stesId: number;
    @Input() massnahmenCode: string;
    @Input() massnahmenId: number;

    ammBuchung: AmmBuchungParamDTO;

    pageNumber: number;
    pageNumbers: typeof Pages = Pages;

    formNumber = StesFormNumberEnum.AMM_SICHTEN;
    spinnerChannel = 'angebotsdaten-sichten';
    oldSpinnerChannel: string;

    pageData: AngebotsdatenPageData;

    constructor(
        private ammRestService: AmmRestService,
        private modalService: NgbModal,
        private spinnerService: SpinnerService,
        private fehlermeldungenService: FehlermeldungenService,
        private dbTranslateService: DbTranslateService,
        private translateService: TranslateService
    ) {
        this.oldSpinnerChannel = SpinnerService.CHANNEL;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.spinnerService.activate(this.spinnerChannel);
        this.ammRestService.getAmmBuchungParam(null, this.massnahmenCode, this.stesId, this.massnahmenId).subscribe(
            (resp: BaseResponseWrapperAmmBuchungParamDTOWarningMessages) => {
                this.ammBuchung = resp.data;

                this.pageData = this.setupPageData();
                this.changePage(this.pageNumbers.GRUNDDATEN);
                this.spinnerService.deactivate(this.spinnerChannel);
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
            }
        );
    }

    changePage(pageNumber: number) {
        this.pageNumber = pageNumber;
    }

    close() {
        this.modalService.dismissAll();
    }

    setupPageData() {
        const dfe: Dfe = this.getDfe();
        const title = this.dbTranslateService.translateWithOrder(this.ammBuchung.titel, 'name') || '';
        const organization = this.ammBuchung.organization ? this.ammBuchung.organization + '-' : '';
        const gesElement = this.translateService.instant(AmmHelper.AmmStrukturElToLabel.find(e => e.code === this.ammBuchung.strukturelementGesetzObject.elementCode).label);
        const zulassungtyp = this.dbTranslateService.translateWithOrder(this.ammBuchung.zulassungstypObject, 'kurzText') || '';

        return {
            type: dfe.type,
            title,
            organisationAndType: `${organization}${gesElement}`,
            dfeNumberLabel: dfe.label,
            dfeNumber: dfe.number,
            zulassungsType: zulassungtyp
        };
    }

    getDfe(): Dfe {
        if (this.massnahmenCode === AmmMassnahmenCode.INDIVIDUELL_KURS_IM_ANGEBOT) {
            return { type: 'amm.nutzung.label.massnahme', label: 'amm.massnahmen.label.massnahmennr', number: this.ammBuchung.massnahmeId };
        }
        if (this.ammBuchung.apkPraktikumsstelleVerwalten) {
            return this.ammBuchung.ammBuchungArbeitsplatzkategorie
                ? {
                      type: 'amm.massnahmen.label.arbeitsplatzkategorie',
                      label: 'amm.massnahmen.label.arbeitsplatzkategorie.nummer',
                      number: this.ammBuchung.beschaeftigungseinheitId
                  }
                : { type: 'amm.massnahmen.label.praktikumsstelle', label: 'amm.massnahmen.label.praktikumsstelle.nummer', number: this.ammBuchung.beschaeftigungseinheitId };
        }

        return {
            type: this.massnahmenCode === AmmMassnahmenCode.KURS ? 'amm.massnahmen.label.kurs' : 'amm.massnahmen.label.standort',
            label: 'amm.massnahmen.label.durchfuehrungsnr',
            number: this.ammBuchung.durchfuehrungsId
        };
    }

    ngOnDestroy() {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        SpinnerService.CHANNEL = this.oldSpinnerChannel;
    }
}

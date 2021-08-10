import { AlertChannelEnum } from './../alert/alert-channel.enum';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { OsteDataRestService } from '@app/core/http/oste-data-rest.service';
import { ToolboxService } from '@app/shared';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { OsteHeaderParamDTO } from '@app/shared/models/dtos-generated/osteHeaderParamDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { ToolboxActionEnum, ToolboxConfiguration } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { PlzDTO } from '@app/shared/models/dtos-generated/plzDTO';

export const OSTE_DETAILS_MODAL_SPINNER_CHANNEL = 'oste-details-modal-spinner';

@Component({
    selector: 'avam-oste-details-modal',
    templateUrl: './oste-details-modal.component.html',
    styleUrls: ['./oste-details-modal.component.scss']
})
export class OsteDetailsModalComponent implements OnInit, OnDestroy {
    @Input() osteId: string;

    formNumbers: typeof StesFormNumberEnum = StesFormNumberEnum;

    headerLabelKey: string;
    formNumber: string;
    osteHeaderParams: OsteHeaderParamDTO;

    toolboxClickActionSub: Subscription;
    toolboxChannel = 'oste-details-modal-toolbox';
    oldToolboxChannel: string;

    spinnerChannel = OSTE_DETAILS_MODAL_SPINNER_CHANNEL;
    oldSpinnerChannel: string;
    unternehmenAdresse: string;
    unternehmenPostfach: string;

    alertChannel = AlertChannelEnum;

    constructor(
        private modalService: NgbModal,
        private toolboxService: ToolboxService,
        private fehlermeldungenService: FehlermeldungenService,
        private osteDataService: OsteDataRestService,
        private translateService: TranslateService,
        private dbTranslate: DbTranslateService
    ) {
        this.oldToolboxChannel = ToolboxService.CHANNEL;
        ToolboxService.CHANNEL = this.toolboxChannel;
        this.oldSpinnerChannel = SpinnerService.CHANNEL;
        SpinnerService.CHANNEL = this.spinnerChannel;
    }

    ngOnInit() {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.configureToolbox();
        this.changePage(StesFormNumberEnum.OSTE_DETAILS_BEWIRTSCHAFTUNG);
        this.getData();
    }

    get toolboxConfiguration(): ToolboxConfiguration[] {
        return [new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)];
    }

    configureToolbox() {
        this.toolboxClickActionSub = this.toolboxService.observeClickAction(this.toolboxChannel).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.EXIT) {
                this.close();
            }
        });
    }

    getData() {
        this.osteDataService.getOsteHeader(this.osteId, this.translateService.currentLang, AlertChannelEnum.MODAL).subscribe(resp => {
            if (resp.data) {
                this.osteHeaderParams = resp.data;
                this.unternehmenAdresse = this.setAdresse();
                this.unternehmenPostfach = this.setPostfach();
            }
        });
    }

    setAdresse(): string {
        const ug = this.osteHeaderParams.unternehmenObject;
        if (!ug) {
            return '';
        }

        const street = [ug.strasse, ug.strasseNr].filter(Boolean).join(' ');
        const plzOrt = this.getLocalOrForeignPlz(ug.plz, ug.plzAusland, ug.ortAusland);

        return [street, plzOrt].filter(Boolean).join(', ');
    }

    setPostfach(): string {
        const ug = this.osteHeaderParams.unternehmenObject;
        if (!ug) {
            return '';
        }

        const pfPlzOrt = this.getLocalOrForeignPlz(ug.postfachPlzObject, ug.postfachPlzAusland, ug.postfachPlzOrtAusland);

        return [ug.postfach, pfPlzOrt].filter(Boolean).join(', ');
    }

    getLocalOrForeignPlz(localObj: PlzDTO, foreignPlz: string, foreignOrt: string): string {
        let plz = '';

        if (localObj) {
            plz = [localObj.postleitzahl, this.dbTranslate.translate(localObj, 'ort')].filter(Boolean).join(' ');
        } else if (foreignPlz || foreignOrt) {
            plz = [foreignPlz, foreignOrt].filter(Boolean).join(' ');
        }

        return plz;
    }

    changePage(formNumber: string) {
        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
        this.formNumber = formNumber;

        switch (formNumber) {
            case this.formNumbers.OSTE_DETAILS_BEWIRTSCHAFTUNG:
                this.headerLabelKey = 'arbeitgeber.oste.subnavmenuitem.bewirtschaftung';
                break;
            case this.formNumbers.OSTE_DETAILS_BASISANGABEN:
                this.headerLabelKey = 'arbeitgeber.oste.subnavmenuitem.basisangaben';
                break;
            case this.formNumbers.OSTE_DETAILS_ANFORDERUNGEN:
                this.headerLabelKey = 'arbeitgeber.oste.subnavmenuitem.anforderungen';
                break;
            case this.formNumbers.OSTE_DETAILS_BEWERBUNG:
                this.headerLabelKey = 'arbeitgeber.oste.subnavmenuitem.bewerbung';
                break;
            default:
                this.headerLabelKey = '';
        }
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

        this.fehlermeldungenService.closeMessage(AlertChannelEnum.MODAL);
    }
}

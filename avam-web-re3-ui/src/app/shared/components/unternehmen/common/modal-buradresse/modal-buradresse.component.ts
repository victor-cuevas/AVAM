import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UnternehmenResponseDTO } from '@dtos/unternehmenResponseDTO';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';
import { NotificationService, SpinnerService, Unsubscribable } from 'oblique-reactive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BurOertlicheEinheitDetailViewDTO } from '@dtos/burOertlicheEinheitDetailViewDTO';
import { TranslateService } from '@ngx-translate/core';
import { BaseResponseWrapperUnternehmenResponseDTOWarningMessages } from '@dtos/baseResponseWrapperUnternehmenResponseDTOWarningMessages';
import { takeUntil } from 'rxjs/operators';
import { Permissions } from '@shared/enums/permissions.enum';
import { WarningMessages } from '@dtos/warningMessages';
import { BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages } from '@dtos/baseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages';
import { StringHelper } from '@shared/helpers/string.helper';

@Component({
    selector: 'avam-modal-buradresse',
    templateUrl: './modal-buradresse.component.html',
    styleUrls: ['./modal-buradresse.component.scss']
})
export class ModalBuradresseComponent extends Unsubscribable implements OnInit, OnDestroy {
    static SCHWEIZ = 'CH';

    @Input() unternehmenData: UnternehmenResponseDTO;
    @Input() wrapperBuradresse: BaseResponseWrapperBurOertlicheEinheitDetailViewDTOWarningMessages;
    buradresse: BurOertlicheEinheitDetailViewDTO;
    public channel = 'buradresse';
    public permissions: typeof Permissions = Permissions;
    avamPlz: any;
    avamPlzPost: any;

    alertList: {
        isShown: boolean;
        messageText: string;
        messageType: string;
    }[] = [];

    constructor(
        private translateService: TranslateService,
        private readonly notificationService: NotificationService,
        private unternehmenRestService: UnternehmenRestService,
        private spinnerService: SpinnerService,
        private readonly modalService: NgbModal
    ) {
        super();
    }

    ngOnInit() {
        this.buradresse = this.wrapperBuradresse.data;
        if (this.wrapperBuradresse.warning && this.wrapperBuradresse.warning.length) {
            this.wrapperBuradresse.warning.forEach(item => {
                let errorMessage = item.values.key;
                if (item.values.values) {
                    const errorMessageHeader = item.values.key ? `${this.translateService.instant(item.values.key)}` : '';
                    errorMessage = StringHelper.stringFormatter(
                        errorMessageHeader,
                        [...item.values.values].map(v => {
                            try {
                                return this.translateService.instant(v);
                            } catch (error) {
                                return v;
                            }
                        })
                    );
                }
                this.alertList.push({
                    isShown: true,
                    messageText: errorMessage,
                    messageType: item.key.toLowerCase()
                });
            });
        }
        this.setPlzandPostfach();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    close(response?) {
        this.modalService.dismissAll(response);
    }

    closeMessage(i: number) {
        this.alertList[i].isShown = false;
    }

    getFormNr() {
        return StesFormNumberEnum.UNTERNEHMEN_BURADRESSE;
    }

    processSave() {
        this.spinnerService.activate(this.channel);
        this.unternehmenData = this.mapToDto();
        this.unternehmenRestService
            .updateBurAdresseUnternehmen(this.unternehmenData, this.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                (response: BaseResponseWrapperUnternehmenResponseDTOWarningMessages) => {
                    this.spinnerService.deactivate(this.channel);
                    if (this.isNotSomeErrorIntoResponse(response.warning)) {
                        this.notificationService.success('unternehmen.feedback.buradresseuebernommen');
                        this.notificationService.success('common.message.datengespeichert');
                        this.close(response.data);
                    }
                },
                () => this.spinnerService.deactivate(this.channel)
            );
    }

    public validateBSP5() {
        const isSchweiz = this.buradresse.staat && this.buradresse.staat.iso2Code === ModalBuradresseComponent.SCHWEIZ;
        const isPlzNovalid = this.buradresse.plz && this.buradresse.plz.plzId === -1;
        const isPostfachNovalid = this.buradresse.postfachplzObject && this.buradresse.postfachplzObject.plzId === -1;
        return isSchweiz && (isPlzNovalid || isPostfachNovalid);
    }

    private isNotSomeErrorIntoResponse(warning: Array<WarningMessages>): boolean {
        return warning === null || (!!warning && !warning.filter((warningItem: WarningMessages) => warningItem.key === WarningMessages.KeyEnum.DANGER).length);
    }

    private mapToDto(): UnternehmenResponseDTO {
        if (!!this.buradresse.staat && this.buradresse.staat.iso2Code !== ModalBuradresseComponent.SCHWEIZ) {
            this.unternehmenData.plzAusland = this.buradresse.zip.toString();
            this.unternehmenData.ortAusland = this.buradresse.town;
            this.unternehmenData.postfachPlzAusland = this.buradresse.poboxZip.toString();
            this.unternehmenData.postfachOrtAusland = this.buradresse.poboxTownLong;
        }

        const streetNrAddOn = !!this.buradresse.streetNrAddOn ? this.buradresse.streetNrAddOn : '';

        return {
            ...this.unternehmenData,
            name1: this.buradresse.name1,
            name2: this.buradresse.name2,
            name3: this.buradresse.name3,
            postfach: this.buradresse.postfachNr,
            strasse: this.buradresse.street,
            strasseNr: this.buradresse.streetNr.toString() + streetNrAddOn,
            land: this.buradresse.staat,
            plzOrt: this.buradresse.plz,
            plzOrtPostfach: this.buradresse.postfachplzObject
        };
    }

    private setPlzandPostfach() {
        this.avamPlz = this.unternehmenData.plzOrt && +this.unternehmenData.plzOrt.postleitzahl > 0 ? this.unternehmenData.plzOrt.postleitzahl : '';
        this.avamPlzPost = this.unternehmenData.plzOrtPostfach && +this.unternehmenData.plzOrtPostfach.postleitzahl > 0 ? this.unternehmenData.plzOrtPostfach.postleitzahl : '';
    }
}

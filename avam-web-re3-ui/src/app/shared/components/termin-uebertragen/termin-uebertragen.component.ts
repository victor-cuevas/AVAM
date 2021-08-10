import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin } from 'rxjs';
import { StesTerminRestService } from '@core/http/stes-termin-rest.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { takeUntil } from 'rxjs/operators';
import { StesPersonalienDTO } from '@dtos/stesPersonalienDTO';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { TranslateService } from '@ngx-translate/core';
import { EmailValidator } from '@shared/validators/email-validator';
import PrintHelper from '@shared/helpers/print.helper';
import { TerminEmailDTO } from '@dtos/terminEmailDTO';
import { UnternehmenTerminRestService } from '@core/http/unternehmen-termin-rest.service';
import { BaseResponseWrapperTerminEmailDTOWarningMessages } from '@dtos/baseResponseWrapperTerminEmailDTOWarningMessages';

@Component({
    selector: 'avam-termin-uebertragen',
    templateUrl: './termin-uebertragen.component.html',
    styleUrls: ['./termin-uebertragen.component.scss']
})
export class TerminUebertragenComponent extends Unsubscribable implements OnInit, OnDestroy {
    terminUebertragenToolboxId = 'terminUebertragen-modal';
    modalToolboxConfiguration: ToolboxConfiguration[];
    terminUebertragenChannel = 'terminUebertragenChannel';
    terminEmailData: TerminEmailDTO = null;
    stesPersonalienData: StesPersonalienDTO = null;
    emailForm: FormGroup;
    editButtonsVisible = true;
    alertList: {
        isShown: boolean;
        messageText: string;
        messageType: string;
    }[] = [];
    initialEmailTo: string;

    @Input() id: string;
    @Input() terminId: string;
    @Input() isUnternehmenTermin = false;

    /**
     * key the for warning if any of emails is invalid
     */
    emailWarning: string = null;

    private static readonly SPLIT_CHAR = ';';
    private static readonly EMAIL_VERSENDET = 'common.message.sendSuccess';
    private static readonly EMAIL_NICHT_VERSENDET = 'common.message.sendError';
    private static readonly EMAIL_FORMAT_WARNING = 'i18n.validation.emailformat';
    private static readonly EMAIL_NICHT_ERFASST = 'stes.message.termin.emailstesnichterfasst';
    private static readonly KEINE_TELNR = 'stes.feedback.keinetelnummer';
    private readonly channel = 'terminUebertragen';

    constructor(
        private readonly modalService: NgbModal,
        private toolboxService: ToolboxService,
        private stesTerminRestService: StesTerminRestService,
        private spinnerService: SpinnerService,
        private formBuilder: FormBuilder,
        private fehlermeldungenService: FehlermeldungenService,
        private stesDataService: StesDataRestService,
        private translationService: TranslateService,
        private unternehmenTerminRestService: UnternehmenTerminRestService
    ) {
        super();
        SpinnerService.CHANNEL = this.terminUebertragenChannel;
        ToolboxService.CHANNEL = this.terminUebertragenChannel;
    }

    /**
     * validates the emails (does not change field value)
     */
    static areEmailsValid(emailAddresses: string): boolean {
        emailAddresses = emailAddresses.trim();
        if (!emailAddresses) {
            return false;
        }

        const originalLength = emailAddresses.length;
        for (let i = 0; i < originalLength; i++) {
            if (emailAddresses.charAt(emailAddresses.length - 1) === ';') {
                emailAddresses = emailAddresses.substring(0, emailAddresses.length - 1);
            }
        }

        const emails = emailAddresses.split(';');
        for (let i = 0; i < emails.length; i++) {
            emails[i] = emails[i].trim();

            const emailFC = new FormControl();
            emailFC.setValue(emails[i]);
            if (!!EmailValidator.isValidFormat(emailFC)) {
                return false;
            }
        }

        return true;
    }

    static removeInvalidChars(str: string): string {
        while (str.endsWith(TerminUebertragenComponent.SPLIT_CHAR) || str.endsWith(' ')) {
            str = str.substr(0, str.length - 1);
        }
        return str;
    }

    ngOnDestroy(): void {
        this.fehlermeldungenService.closeMessage();
    }

    ngOnInit(): void {
        this.fehlermeldungenService.closeMessage();
        this.setSubscriptions();
        this.initializeFromGroup();
        this.loadData();
        this.configureToolbox();
    }

    loadData() {
        this.spinnerService.activate(this.channel);
        if (this.isUnternehmenTermin) {
            this.unternehmenTerminRestService
                .getEmailData(this.id, this.terminId)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    (emailResponse: BaseResponseWrapperTerminEmailDTOWarningMessages) => {
                        this.setEmailData(emailResponse);
                        this.spinnerService.deactivate(this.terminUebertragenChannel);
                    },
                    () => {
                        this.spinnerService.deactivate(this.terminUebertragenChannel);
                    }
                );
        } else {
            forkJoin([this.stesTerminRestService.getStesTerminEmail(this.id, this.terminId), this.stesDataService.getPersonalienBearbeiten(this.id)])
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                    ([emailResponse, personalienResponse]) => {
                        this.setEmailData(emailResponse);
                        this.checkTelNr(personalienResponse);
                        this.spinnerService.deactivate(this.terminUebertragenChannel);
                    },
                    () => {
                        this.spinnerService.deactivate(this.terminUebertragenChannel);
                    }
                );
        }
    }

    initializeFromGroup() {
        this.emailForm = this.formBuilder.group({
            absender: null,
            empfaenger: null,
            betreff: null,
            anhang: null,
            nachricht: null
        });
    }

    addStesEmail() {
        if (this.terminEmailData.stesEmail) {
            this.empfaenger = this.empfaenger + this.terminEmailData.stesEmail + TerminUebertragenComponent.SPLIT_CHAR;
        } else {
            if (!this.alertList.find(a => a.messageText === this.translationService.instant(TerminUebertragenComponent.EMAIL_NICHT_ERFASST) && a.isShown)) {
                this.pushToAlertList(TerminUebertragenComponent.EMAIL_NICHT_ERFASST, 'warning');
            }
        }
    }

    reset() {
        this.empfaenger = this.initialEmailTo;
    }

    conditionallyShowWarning() {
        if (TerminUebertragenComponent.areEmailsValid(this.empfaenger)) {
            this.emailWarning = null;
        } else {
            this.emailWarning = TerminUebertragenComponent.EMAIL_FORMAT_WARNING;
        }
    }

    sendMail() {
        this.alertList = [];
        this.fehlermeldungenService.closeMessage();

        this.spinnerService.activate(this.channel);
        if (this.isUnternehmenTermin) {
            this.unternehmenTerminRestService.sendEmail(this.mapFormToDTO()).subscribe(
                response => {
                    this.sendEmail(response);
                },
                () => {
                    this.sendingError();
                }
            );
        } else {
            this.stesTerminRestService.sendTerminEmail(this.id, this.terminId, this.mapFormToDTO()).subscribe(
                response => {
                    this.sendEmail(response);
                },
                () => {
                    this.sendingError();
                }
            );
        }
    }

    closeMessage(index: number): void {
        this.alertList[index].isShown = false;
    }

    close() {
        this.modalService.dismissAll();
    }

    getFormNr(): string {
        return StesFormNumberEnum.TERMIN_UEBERTRAGEN;
    }

    private checkTelNr(personalienResponse) {
        //BSP9
        if (personalienResponse.data) {
            this.stesPersonalienData = personalienResponse.data.stesPersonalienDTO;
            if (!this.stesPersonalienData.mobileNr && !this.stesPersonalienData.telNrPrivat) {
                this.pushToAlertList(TerminUebertragenComponent.KEINE_TELNR, 'warning');
            }
        }
    }

    private setEmailData(emailResponse: BaseResponseWrapperTerminEmailDTOWarningMessages) {
        if (emailResponse.data) {
            this.terminEmailData = emailResponse.data;
            this.initialEmailTo = emailResponse.data.emailTo;
            this.fillForm();
        }
    }

    private pushToAlertList(messageText: string, messageType: string) {
        this.alertList.push({
            isShown: true,
            messageText: this.translationService.instant(messageText),
            messageType
        });
    }

    private sendingError() {
        this.spinnerService.deactivate(this.channel);
        this.pushToAlertList(this.translationService.instant(TerminUebertragenComponent.EMAIL_NICHT_VERSENDET), 'danger');
        this.editButtonsVisible = false;
    }

    private sendEmail(response) {
        this.spinnerService.deactivate(this.channel);
        if (!response.warning) {
            this.fehlermeldungenService.showMessage(TerminUebertragenComponent.EMAIL_VERSENDET, 'success');
            this.close();
        }
    }

    private configureToolbox(): void {
        this.modalToolboxConfiguration = [
            new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.HELP, true, false),
            new ToolboxConfiguration(ToolboxActionEnum.EXIT, true, false)
        ];
        this.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((event: any) => {
                if (event.message.action === ToolboxActionEnum.EXIT) {
                    this.close();
                }
                if (event.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }

    private setSubscriptions() {
        this.fehlermeldungenService
            .getMessage()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message) {
                    this.pushToAlertList(message.text, message.type);
                }
            });
    }

    private fillForm() {
        this.absender = this.terminEmailData.emailFrom;
        this.anhang = this.terminEmailData.terminCalendar.fileName;
        this.empfaenger = this.terminEmailData.emailTo;
        this.betreff = this.terminEmailData.terminCalendar.subject;
        this.nachricht = this.terminEmailData.emailText + '\n\n';
    }

    private mapFormToDTO(): TerminEmailDTO {
        this.terminEmailData.emailTo = TerminUebertragenComponent.removeInvalidChars(this.empfaenger);
        return this.terminEmailData;
    }

    get controls() {
        return this.emailForm.controls;
    }

    get empfaenger() {
        return this.controls.empfaenger.value;
    }

    set empfaenger(text: string) {
        this.controls.empfaenger.setValue(text);
    }

    get betreff() {
        return this.controls.betreff.value;
    }

    set betreff(text: string) {
        this.controls.betreff.setValue(text);
    }

    get nachricht() {
        return this.controls.nachricht.value;
    }

    set nachricht(text: string) {
        this.controls.nachricht.setValue(text);
    }

    get anhang() {
        return this.controls.anhang.value;
    }

    set anhang(text: string) {
        this.controls.anhang.setValue(text);
    }

    get absender() {
        return this.controls.absender.value;
    }

    set absender(text: string) {
        this.controls.absender.setValue(text);
    }
}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxEvent, ToolboxService, ToolboxTypeData } from '../../services/toolbox.service';
import { Subscription } from 'rxjs';
import { MessageBus } from '@shared/services/message-bus';
import { filter } from 'rxjs/operators';
import { RoboHelpService } from '@shared/services/robo-help.service';
import { DmsService } from '@shared/services/dms.service';
import { DokumentVorlageToolboxData } from '@shared/models/dokument-vorlage-toolbox-data.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-toolbox',
    templateUrl: './toolbox.component.html',
    styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit, OnDestroy {
    @Input() configuration: ToolboxConfiguration[] = [];
    @Input() id: string;
    @Input() formNumber: string;
    @Input() data: any;
    @Input() additionalStyleClass = {};
    emailAddress: string;
    emailDisabled = false;

    toolboxStyleClass: any;
    private observeClickActionSub: Subscription;
    private observeEmailAddressSub: Subscription;
    private observeHistorySub: Subscription;
    private messageBusIdSub: Subscription;
    private toolboxServiceDataStub: Subscription;
    private messageBusFormNumberSub: Subscription;
    private baseStyleClass = { 'mr-1 mb-2 mt-2': this.areAllWithBorder() };

    constructor(
        private toolboxService: ToolboxService,
        private roboHelpService: RoboHelpService,
        private messageBus: MessageBus,
        private dmsService: DmsService,
        private router: Router
    ) {
        this.observeClickActionSub = this.toolboxService.observeConfiguration().subscribe(cfg => {
            if (cfg.config) {
                this.configuration = cfg.config;
            }
            if (cfg.data) {
                this.data = cfg.data;
            }
        });
        this.observeEmailAddressSub = this.toolboxService.observeEmailAddress().subscribe((email: any) => {
            if (email) {
                this.emailDisabled = false;
                this.emailAddress = `mailto:${email}`;
            } else {
                this.emailDisabled = true;
                this.emailAddress = null;
            }
        });

        this.messageBusIdSub = this.messageBus
            .getData()
            .pipe(filter(message => message.type === 'toolbox.id'))
            .subscribe(message => (this.id = message.data));
        this.toolboxServiceDataStub = this.toolboxService
            .observeData()
            .pipe(filter((message: ToolboxTypeData) => message.type === 'toolbox.help.formNumber'))
            .subscribe((message: ToolboxTypeData) => {
                this.formNumber = message.data;
            });
    }

    ngOnInit() {
        this.toolboxStyleClass = { ...this.baseStyleClass, ...this.additionalStyleClass };
    }

    ngOnDestroy() {
        if (this.observeClickActionSub) {
            this.observeClickActionSub.unsubscribe();
        }

        if (this.observeEmailAddressSub) {
            this.observeEmailAddressSub.unsubscribe();
        }

        if (this.observeHistorySub) {
            this.observeHistorySub.unsubscribe();
        }

        if (this.messageBusIdSub) {
            this.messageBusIdSub.unsubscribe();
        }

        if (this.messageBusFormNumberSub) {
            this.messageBusFormNumberSub.unsubscribe();
        }

        if (this.toolboxServiceDataStub) {
            this.toolboxServiceDataStub.unsubscribe();
        }

        this.toolboxStyleClass = this.baseStyleClass;
    }

    onClickButton(action: ToolboxEvent) {
        if (action.action === ToolboxActionEnum.HELP && this.formNumber) {
            this.roboHelpService.help(this.formNumber);
        } else if (action.action === ToolboxActionEnum.WORD && this.data && this.data) {
            this.dmsService.displayDocumentTemplates(this.data as DokumentVorlageToolboxData);
        } else if (action.action === ToolboxActionEnum.DMS && this.formNumber) {
            this.dmsService.openDMSWindow(this.data, this.formNumber);
        } else if (action.action === ToolboxActionEnum.ZURUECK) {
            if (ToolboxService.GESPEICHERTEN_LISTE_URL) {
                this.router.navigateByUrl(ToolboxService.GESPEICHERTEN_LISTE_URL);
            }
        } else {
            this.toolboxService.sendClickAction({ channel: ToolboxService.CHANNEL, message: action });
        }
    }

    /**
     * checks whether one of the provided enums is allowed
     *
     * @param actions
     */
    isVisible(...actions: ToolboxActionEnum[]) {
        let isVisible = false;
        for (const conf of this.configuration) {
            if (actions.indexOf(conf.action) > -1) {
                isVisible = isVisible || conf.enabled;
            }
        }
        return isVisible;
    }

    withBorder(...actions: ToolboxActionEnum[]) {
        let withBorder = true;
        for (const conf of this.configuration) {
            if (actions.indexOf(conf.action) > -1) {
                withBorder = withBorder && conf.withBorder;
            }
        }
        return withBorder;
    }

    areAllWithBorder() {
        let withBorder = true;
        for (const conf of this.configuration) {
            withBorder = withBorder && conf.withBorder;
        }
        return withBorder;
    }

    isMoreButtonVisible() {
        if (this.emailDisabled) {
            // the email enum is no longer relevant
            return this.isVisible(ToolboxActionEnum.HISTORY);
        }

        return this.isVisible(ToolboxActionEnum.EMAIL, ToolboxActionEnum.HISTORY, ToolboxActionEnum.ASALDATEN);
    }

    moreButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.EMAIL, ToolboxActionEnum.HISTORY);
    }

    onClickDMSButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.DMS, this.id));
    }

    isDMSButtonVisible() {
        return this.isVisible(ToolboxActionEnum.DMS);
    }

    dmsButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.DMS);
    }

    isZurueckZurGespeichertenListeVisible() {
        return this.isVisible(ToolboxActionEnum.ZURUECK) && !!ToolboxService.GESPEICHERTEN_LISTE_URL;
    }

    onClickZurueckButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.ZURUECK, this.id));
    }

    onClickCopyButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.COPY, this.id));
    }

    isCopyButtonVisible() {
        return this.isVisible(ToolboxActionEnum.COPY);
    }

    copyButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.COPY);
    }

    onClickWordButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.WORD, this.id));
    }

    isWordButtonVisible() {
        return this.isVisible(ToolboxActionEnum.WORD);
    }

    wordButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.WORD);
    }

    onClickExcelButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.EXCEL, this.id));
    }

    isExcelButtonVisible() {
        return this.isVisible(ToolboxActionEnum.EXCEL);
    }

    excelButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.EXCEL);
    }

    onClickPrintButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.PRINT, this.id));
    }

    isPrintButtonVisible() {
        return this.isVisible(ToolboxActionEnum.PRINT);
    }

    printButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.PRINT);
    }

    onClickHelpButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.HELP, this.id, this.formNumber));
    }

    isHelpButtonVisible() {
        return this.isVisible(ToolboxActionEnum.HELP);
    }

    helpButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.HELP);
    }

    onClickExitButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.EXIT, this.id));
    }

    isExitButtonVisible() {
        return this.isVisible(ToolboxActionEnum.EXIT);
    }

    exitButtonWithoutBorder() {
        return !this.withBorder(ToolboxActionEnum.EXIT);
    }

    isEmailButtonVisible() {
        return this.isVisible(ToolboxActionEnum.EMAIL) && !this.emailDisabled;
    }

    isHistoryButtonVisible() {
        return this.isVisible(ToolboxActionEnum.HISTORY);
    }

    isAsalDatenButtonVisible() {
        return this.isVisible(ToolboxActionEnum.ASALDATEN);
    }

    onClickHistoryButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.HISTORY, this.id));
    }

    onClickAsalDatenButton() {
        this.onClickButton(new ToolboxEvent(ToolboxActionEnum.ASALDATEN, this.id));
    }
}

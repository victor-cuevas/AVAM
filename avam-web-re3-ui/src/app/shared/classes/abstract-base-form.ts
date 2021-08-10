import { OnDestroy, OnInit } from '@angular/core';
import { BaseFormBuilder, ToolboxService } from '@app/shared';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { FormGroup } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageBus } from '@shared/services/message-bus';
import { ToolboxConfiguration } from '@shared/services/toolbox.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { AvamStesInfoBarService } from '@shared/components/avam-stes-info-bar/avam-stes-info-bar.service';

export abstract class AbstractBaseForm extends Unsubscribable implements OnInit, OnDestroy, DeactivationGuarded, BaseFormBuilder {
    /**
     * the main form of concrete screen
     */
    mainForm: FormGroup;

    /**
     * please use for spinner, toolbox etc
     */
    protected constructor(
        /**
         * the screen or CHANNEL name
         */
        readonly screenName: string, //
        protected readonly modalService: NgbModal, //
        protected readonly spinnerService: SpinnerService,
        protected readonly messageBus: MessageBus,
        protected readonly toolboxService: ToolboxService,
        protected readonly fehlermeldungenService: FehlermeldungenService
    ) {
        super();
    }

    /**
     * checks for DANGER in warning
     *
     * usage: call before updating the screen with values from server
     */
    static hasDangerWarning(warning: any[]): boolean {
        if (!!warning) {
            return !!warning.find(w => w.key === 'DANGER');
        }
        return false;
    }

    /**
     * @deprecated please use FormUtilsService getCodeIdByCode()
     *
     * finds the related database id for given code
     * (since code field is string, the method converts to int with + sign)
     *
     * Caution / Usage: if ( + myFormcontrol.value == returnedCodeId) {..}
     *
     * @param codeOptions the array of options to be searched
     * @param lookupCode the code as number
     */
    static getCodeIdByCode(codeOptions: any[], lookupCode: number) {
        for (const entry of codeOptions) {
            if (+entry.code === lookupCode) {
                return entry.codeId;
            }
        }
        return null;
    }

    abstract ngOnInit(): void;

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    /**
     * the method canDeactivate is not handy - optionally use isDirty
     */
    canDeactivate(): boolean {
        return this.isDirty();
    }

    /**
     * is mainForm dirty
     *
     * overriding hint: default values such as personalberater could lead to isDirty. Use method overriding like its done in abmeldung screen
     */
    isDirty(): boolean {
        return this.mainForm.dirty;
    }

    /**
     * is business object present
     *
     * overriding hint: !!this.letzteAktualisierung.abmeldungId
     */
    isBoPresent(): boolean {
        return false;
    }

    /**
     * mandatory methods from BaseFormBuilder - feel free to remove IF from class and define methods HERE for bigger flexibility
     */
    abstract reset(): void;

    abstract save(shouldFinish?: boolean): void;

    abstract getData(): void;

    defineToolboxActions(): void {}

    configureToolbox(channel: string, configuration: ToolboxConfiguration[], toolboxData?: any): void {
        this.messageBus.buildAndSend('toolbox.id', channel);
        if (toolboxData) {
            this.toolboxService.sendConfiguration(configuration, channel, toolboxData);
        } else {
            this.toolboxService.sendConfiguration(configuration, channel);
        }
        this.defineToolboxActions();
    }

    /**
     * this method can show AND hide the info-icon since it relays on isBoPresent()
     *
     * @param lang
     * @param type
     * @param id
     * @param infoleistePanelService
     * @param histService
     */
    updateInfoleistePanel(stesInfobarService: AvamStesInfoBarService, data: any) {
        if (!this.isBoPresent()) {
            // simple hiding
            stesInfobarService.sendLastUpdate({}, true);
            return;
        }
        if (data) {
            stesInfobarService.sendLastUpdate({
                geaendertDurch: data.geaendertDurch,
                geaendertAm: data.geaendertAm,
                erfasstDurch: data.erfasstDurch,
                erfasstAm: data.erfasstAm
            });
        }
    }

    openModalCloseFehler(content, windowClass?: string) {
        this.fehlermeldungenService.closeMessage();
        this.openModal(content, windowClass);
    }

    /**
     * opens a modal dialog - what about using openModalCloseFehler
     *
     * @param content the content to be shown
     * @param windowClass the optional classes
     */
    openModal(content, windowClass?: string) {
        const options: any = { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' };

        if (!!windowClass) {
            options.windowClass = windowClass;
        }

        return this.modalService.open(content, options);
    }
}

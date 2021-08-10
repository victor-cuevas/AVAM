import { Injectable, TemplateRef } from '@angular/core';
import { CoreInfoBarPanelService } from '@app/library/core/core-info-bar/core-info-bar-panel/core-info-bar-panel.service';
import { BehaviorSubject } from 'rxjs';

export interface InfobarData {
    title?: string;
    secondTitle?: string;
    subtitle?: string;
    tableCount?: number;
    hideInfobar?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AmmInfopanelService {
    private maskInformation$ = new BehaviorSubject<InfobarData>({});
    private storeKey = 'amm-infopanel-service-mask-information';
    private temporaryContainer;

    constructor(private coreInfobarPanel: CoreInfoBarPanelService) {
        const storedData = sessionStorage.getItem(this.storeKey);
        if (storedData) {
            this.maskInformation$.next(JSON.parse(storedData));
        }
    }

    /**
     * Send initial data to the infopanel.
     * Use when you initialize a new infopanel.
     * If you want to update some fields use updateInformation().
     *
     * @param data InfobarData
     */
    dispatchInformation(data: InfobarData) {
        this.maskInformation$.next(data);
        sessionStorage.setItem(this.storeKey, JSON.stringify(data));
    }

    pullInformation(): BehaviorSubject<InfobarData> {
        return this.maskInformation$;
    }

    /**
     * Update data in the infopanel fully or partially.
     * Use if you want to update only some fields in the infopanel.
     *
     * @param data InfobarData
     */
    updateInformation(data: InfobarData) {
        this.dispatchInformation({ ...this.maskInformation$.getValue(), ...data });
    }

    /**
     * Send new template to the infobar and clear the current template.
     * If you want to add items to the current template use appendToInfobar() instead.
     * You can revert to the previous template using revertTemplateInInfobar().
     *
     * @param data TemplateRef
     */
    sendTemplateToInfobar(data: TemplateRef<any>) {
        this.resetTemplateInInfobar();
        this.coreInfobarPanel.sendTemplate(data);
    }

    /**
     * Append a template to current infobar template.
     * You can remove it and return to the previous state using removeFromInfobar().
     *
     * @param data TemplateRef
     */
    appendToInforbar(data: TemplateRef<any>) {
        this.coreInfobarPanel.sendTemplate(data);
    }

    /**
     * Remove a template that was appended to the infobar template.
     * You need to pass the same referce that was sent via appendToInfobar().
     *
     * @param data TemplateRef
     */
    removeFromInfobar(data) {
        if (data) {
            this.coreInfobarPanel.templateContainer = this.coreInfobarPanel.templateContainer.filter(template => template._def.nodeIndex !== data._def.nodeIndex);
            this.coreInfobarPanel.pullTemplate().next(this.coreInfobarPanel.templateContainer);
        }
    }

    resetTemplateInInfobar() {
        this.temporaryContainer = this.coreInfobarPanel.templateContainer;
        this.coreInfobarPanel.templateContainer = [];
    }

    /**
     * Reverts the template to the state before the last call of sendTemplateToInfobar().
     */
    revertTemplateInInfobar() {
        if (this.temporaryContainer) {
            this.coreInfobarPanel.pullTemplate().next(this.temporaryContainer);
        }
    }

    /**
     * Send data for the infoicon in the infobar.
     *
     * @param valueObject Any DTO that contains erfasstAm/Durch and geaendertAm/Durch.
     * @param reset Optional. Send true when you reset the infoicon in onDestroy.
     */
    sendLastUpdate(valueObject: { erfasstAm?: Date; erfasstDurch?: string; geaendertAm?: Date; geaendertDurch?: string }, reset = false) {
        if (reset) {
            this.coreInfobarPanel.sendLastUpdate(null);
            return;
        }

        this.coreInfobarPanel.sendLastUpdate(valueObject);
    }
}

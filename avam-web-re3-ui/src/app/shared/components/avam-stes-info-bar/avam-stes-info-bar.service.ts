import { Injectable } from '@angular/core';
import { CoreInfoBarPanelService } from '@app/library/core/core-info-bar/core-info-bar-panel/core-info-bar-panel.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { InfoleistePanelConfig } from '@app/shared/services/infoleiste-panel.service';
import { CoreInfoBarService } from '@app/library/core/core-info-bar/core-info-bar/core-info-bar.service';

@Injectable({ providedIn: 'root' })
export class AvamStesInfoBarService {
    constructor(private coreInfobar: CoreInfoBarService, private coreInfobarPanel: CoreInfoBarPanelService, private stesDataRestService: StesDataRestService) {}

    sendDataToInfobar(data) {
        this.coreInfobar.dispatchInformation(data);
    }

    addItemToInfoPanel(data) {
        this.coreInfobarPanel.sendTemplate(data);
    }

    removeItemFromInfoPanel(data) {
        this.coreInfobarPanel.remove(data);
    }

    toggle(toggle) {
        this.coreInfobar.toggle(toggle);
    }

    sendLastUpdate(valueObject: { erfasstAm?: Date; erfasstDurch?: string; geaendertAm?: Date; geaendertDurch?: string }, reset = false) {
        if (reset) {
            this.coreInfobarPanel.sendLastUpdate(null);
            return;
        }

        this.coreInfobarPanel.sendLastUpdate(valueObject);
    }
}

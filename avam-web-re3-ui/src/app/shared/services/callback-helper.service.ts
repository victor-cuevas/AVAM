import { Injectable } from '@angular/core';
import { CallbackDTO } from '@dtos/callbackDTO';
import { WarningMessages } from '@dtos/warningMessages';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';

@Injectable()
export class CallbackHelperService {
    constructor(private fehlermeldungenService: FehlermeldungenService) {}

    isCallable(callback: CallbackDTO): boolean {
        if (Array.isArray(callback.warningMessages) && callback.warningMessages.length) {
            this.fehlermeldungenService.closeMessage();
            callback.warningMessages.forEach((w: WarningMessages) => this.fehlermeldungenService.showMessage(w.values, w.key.toLowerCase()));
            OrColumnLayoutUtils.scrollTop();
            return false;
        }
        return true;
    }
}

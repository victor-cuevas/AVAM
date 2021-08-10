import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { AuthenticationService } from '@core/services/authentication.service';
import { DbTranslateService } from '@shared/services/db-translate.service';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { FormUtilsService } from '@shared/services/forms/form-utils.service';
import { MessageBus } from '@shared/services/message-bus';
import { NavigationService } from '@shared/services/navigation-service';
import { OpenModalFensterService } from '@shared/services/open-modal-fenster.service';
import { ResetDialogService } from '@shared/services/reset-dialog.service';
import { ToolboxService } from '@shared/services/toolbox.service';

@Injectable({
    providedIn: 'root'
})
export class FacadeService {
    constructor(
        public translateService: TranslateService,
        public notificationService: NotificationService,
        public spinnerService: SpinnerService,
        public authenticationService: AuthenticationService,
        public dbTranslateService: DbTranslateService,
        public fehlermeldungenService: FehlermeldungenService,
        public formUtilsService: FormUtilsService,
        public messageBus: MessageBus,
        public navigationService: NavigationService,
        public openModalFensterService: OpenModalFensterService,
        public resetDialogService: ResetDialogService,
        public toolboxService: ToolboxService
    ) {}
}

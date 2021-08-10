import { SanktionErfassenBearbeitenComponent } from './sanktion-erfassen-bearbeiten.component';
import { NavigationService } from '@shared/services/navigation-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import { SanktionSachverhaltDTO } from '@shared/models/dtos-generated/sanktionSachverhaltDTO';
import { ToolboxService } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { MessageBus } from '@shared/services/message-bus';
import { ResetDialogService } from '@shared/services/reset-dialog.service';

class Dummy extends SanktionErfassenBearbeitenComponent {
    sachverhaltForm: FormGroup;
    retrievedSachverhalt: SanktionSachverhaltDTO;
    sachverhaltTypeCode: any;

    constructor(
        protected navigationService: NavigationService,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected spinnerService: SpinnerService,
        protected dataRestService: StesDataRestService,
        protected activatedRoute: ActivatedRoute,
        protected toolboxService: ToolboxService,
        protected translateService: TranslateService,
        protected messageBus: MessageBus,
        protected readonly notificationService: NotificationService,
        protected resetDialogService: ResetDialogService
    ) {
        super(
            navigationService,
            router,
            formBuilder,
            spinnerService,
            dataRestService,
            activatedRoute,
            toolboxService,
            translateService,
            messageBus,
            resetDialogService,
            notificationService
        );
    }

    mapCurrentData(): any {}

    generateForm() {}

    loadGrundSanktionsOptionsFor() {}

    setInitialGrund() {}
}

describe('SanktionErfassenBearbeitenComponent', () => {
    let myDummy: Dummy;

    beforeEach(() => {
        myDummy = new Dummy(null, null, null, null, null, null, null, null, null, null, null);
    });

    it('should return true', () => {
        spyOn(myDummy, 'mapCurrentData');
        myDummy.mapCurrentData();
        expect(myDummy.mapCurrentData).toHaveBeenCalled();
    });
});

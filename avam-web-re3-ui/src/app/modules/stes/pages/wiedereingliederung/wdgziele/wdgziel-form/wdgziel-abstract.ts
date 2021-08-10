import { OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ToolboxService } from '@app/shared';
import {
    AvamPersonalberaterAutosuggestComponent,
    BenutzerAutosuggestType
} from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { DomainEnum } from '@app/shared/enums/domain.enum';

import { BaseResponseWrapperListBeurteilungselListeDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperListBeurteilungselListeDTOWarningMessages';
import { BaseResponseWrapperStesWdgZielDTOWarningMessages } from '@app/shared/models/dtos-generated/baseResponseWrapperStesWdgZielDTOWarningMessages';
import { BeurteilungselListeDTO } from '@app/shared/models/dtos-generated/beurteilungselListeDTO';
import { CodeDTO } from '@app/shared/models/dtos-generated/codeDTO';
import { StesWdgZielDTO } from '@app/shared/models/dtos-generated/stesWdgZielDTO';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ResetDialogService } from '@app/shared/services/reset-dialog.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Permissions } from '@shared/enums/permissions.enum';
import { MessageBus } from '@shared/services/message-bus';
import { NotificationService, SpinnerService } from 'oblique-reactive';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { WdgZielFormHandler } from './wdgziel-form-handler';

const wdgZielToolboxIdValue = 'wiedereingliederungsZiel';
const wdgZielChannelValue = 'wiedereingliederungsZiel';

export abstract class WdgZielAbstract implements OnInit, OnDestroy {
    toolboxActionSub: Subscription;
    wdgZielToolboxId = wdgZielToolboxIdValue;
    wdgZielChannel = wdgZielChannelValue;
    wdgZielForm: FormGroup;
    stesId: string;
    beurteilungsKriteriumOptions: CodeDTO[] = [];

    zielDetails: StesWdgZielDTO;
    benutzerAutosuggestType = BenutzerAutosuggestType.BENUTZER;
    benutzerSuchenTokens: {} = {};

    @ViewChild('benutzerAusVollzugsregion') benutzerAusVollzugsregion: AvamPersonalberaterAutosuggestComponent;
    @ViewChild('ngForm') ngForm: FormGroupDirective;

    protected constructor(
        protected wdgZielFormHandler: WdgZielFormHandler,
        protected route: ActivatedRoute,
        protected router: Router,
        protected dataService: StesDataRestService,
        protected modalService: NgbModal,
        protected toolboxService: ToolboxService,
        protected spinnerService: SpinnerService,
        protected translateService: TranslateService,
        protected fehlermeldungenService: FehlermeldungenService,
        protected resetDialogService: ResetDialogService,
        protected navigationService: NavigationService,
        protected notificationService: NotificationService,
        protected authService: AuthenticationService,
        protected obliqueHelper: ObliqueHelperService,
        protected messageBus: MessageBus
    ) {
        ToolboxService.CHANNEL = this.wdgZielToolboxId;
        SpinnerService.CHANNEL = this.wdgZielChannel;
    }

    ngOnInit() {
        this.obliqueHelper.ngForm = this.ngForm;
        this.getRouteParams();
        this.configureToolbox();
        this.messageBus.getData().subscribe(message => {
            if (message.type === 'close-nav-item' && message.data) {
                this.closeComponent(message);
            }
        });

        this.benutzerSuchenTokens = this.getBenutzerSuchenTokens();
    }

    abstract getAdditionalRouteParams(): void;

    abstract configureToolbox(): void;

    abstract populateForm(): void;

    abstract closeComponent(message);

    getRouteParams() {
        this.route.parent.params.subscribe(params => {
            this.stesId = params['stesId'];
        });

        this.getAdditionalRouteParams();
    }

    loadData() {
        this.spinnerService.activate(this.wdgZielChannel);
        forkJoin<BaseResponseWrapperListBeurteilungselListeDTOWarningMessages, BaseResponseWrapperStesWdgZielDTOWarningMessages>([
            this.dataService.getBeurteilungsElementListe(this.stesId),
            this.getZielDetails()
        ]).subscribe(
            ([beurteilungsKriteriumOptions, zielDetails]) => {
                if (beurteilungsKriteriumOptions && beurteilungsKriteriumOptions.data) {
                    this.setBeurteilungsKriteriumOptions(beurteilungsKriteriumOptions.data);
                }
                this.zielDetails = zielDetails ? zielDetails.data : null;

                if (this.zielDetails) {
                    this.authService.setOwnerPermissionContext(this.zielDetails.stesId, this.zielDetails.ownerId);
                }

                this.populateForm();
                this.deactivateSpinnerAndScrollTop();
            },
            () => {
                this.deactivateSpinnerAndScrollTop();
            }
        );
    }

    getZielDetails(): Observable<any> {
        return of(null);
    }

    setBeurteilungsKriteriumOptions(beurteilungsKriteriumOptions) {
        this.beurteilungsKriteriumOptions = beurteilungsKriteriumOptions.map(element => this.mapToDropdown(element));
    }

    mapToDropdown(object: BeurteilungselListeDTO) {
        return {
            value: object.stesBeurteilungselementId,
            labelDe: object.ausgangslageVonDatumDe,
            labelFr: object.ausgangslageVonDatumFr,
            labelIt: object.ausgangslageVonDatumIt
        };
    }

    openModal(content, windowClass) {
        return this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass, backdrop: 'static' });
    }

    deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.wdgZielChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    canDeactivate(): boolean {
        return this.wdgZielForm.dirty;
    }

    ngOnDestroy(): void {
        this.authService.removeOwnerPermissionContext();
        this.toolboxService.sendConfiguration([]);
        this.toolboxActionSub.unsubscribe();
        this.fehlermeldungenService.closeMessage();
    }

    private getBenutzerSuchenTokens() {
        const currentUser = this.authService.getLoggedUser();

        if (currentUser) {
            return {
                berechtigung: Permissions.STES_ANMELDEN_BEARBEITEN,
                myBenutzerstelleId: currentUser.benutzerstelleId,
                myVollzugsregionTyp: DomainEnum.STES,
                stati: DomainEnum.BENUTZER_STATUS_AKTIV
            };
        }

        return null;
    }
}

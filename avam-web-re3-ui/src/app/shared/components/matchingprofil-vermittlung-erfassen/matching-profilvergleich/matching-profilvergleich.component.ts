import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { AlertComponent, DmsService, GenericConfirmComponent, RoboHelpService } from '@app/shared';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { MatchingWizardService } from '@app/shared/components/new/avam-wizard/matching-wizard.service';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@app/shared/enums/stes-form-number.enum';
import { DmsContextSensitiveDossierDTO } from '@app/shared/models/dtos-generated/dmsContextSensitiveDossierDTO';
import { ProfilvergleichDTO } from '@app/shared/models/dtos-generated/profilvergleichDTO';
import { ProfilvergleichQueryParamsDTO } from '@app/shared/models/dtos-generated/profilvergleichQueryParamsDTO';
import { VermittlungNichtGeeignetParam } from '@app/shared/models/dtos-generated/vermittlungNichtGeeignetParam';
import { FehlermeldungModel } from '@app/shared/models/fehlermeldung.model';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { ProfileCompareAdapter } from '@app/shared/services/profile-compare-adapter/profile-compare-adapter';
import { ProfileCompareRow } from '@app/shared/services/profile-compare-adapter/profile-compare-models';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { Observable, Subscription } from 'rxjs';
import { BaseResponseWrapperProfilvergleichDTOWarningMessages } from '@dtos/baseResponseWrapperProfilvergleichDTOWarningMessages';

@Component({
    selector: 'avam-matching-profilvergleich',
    templateUrl: './matching-profilvergleich.component.html',
    styleUrls: ['./matching-profilvergleich.component.scss'],
    providers: [ProfileCompareAdapter]
})
export class MatchingProfilvergleichComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('anforderungenSkillsModal') anforderungenSkillsModal: ElementRef;
    @ViewChild('stesDetailsModal') stesDetailsModal: ElementRef;
    @ViewChild('osteDetailsModal') osteDetailsModal: ElementRef;
    @ViewChild('avamAlertMatchingProfilvergleich') avamAlertMatchingProfilvergleich: AlertComponent;

    isStes: boolean;
    proflvergleichToolboxId = 'matching-profilvergleich';
    spinnerChannel = 'matching-profilvergleich-spinner';

    stesOsteOptions: any[] = [];
    permissions: typeof Permissions = Permissions;

    toolboxClickActionSub: Subscription;
    langChangeSubscription: Subscription;

    profilvergleichData: ProfilvergleichDTO;

    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;

    dataSource: ProfileCompareRow[];

    alertMessages: FehlermeldungModel[];

    get stesId() {
        return this.wizardService.getStesId();
    }

    get osteId() {
        return this.wizardService.getOsteId();
    }

    get stesMatchingProfilId() {
        return this.wizardService.getStesMatchingProfilId();
    }

    get osteMatchingProfilId() {
        return this.wizardService.getOsteMatchingProfilId();
    }

    constructor(
        private dataService: StesDataRestService,
        private dmsService: DmsService,
        private fehlermeldungenService: FehlermeldungenService,
        private modalService: NgbModal,
        private profileCompareAdapter: ProfileCompareAdapter,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private wizardService: MatchingWizardService,
        private roboHelpService: RoboHelpService
    ) {
        SpinnerService.CHANNEL = this.spinnerChannel;
        ToolboxService.CHANNEL = this.proflvergleichToolboxId;
    }

    ngOnInit() {
        this.wizardService.selectCurrentStep(0);
        this.configureToolbox();
        this.getProfilvergleichData();
        this.toolboxClickActionSub = this.subscribeToToolbox();
        this.setDropdownoptions();
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.proflvergleichToolboxId);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.proflvergleichToolboxId).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                if (this.isStes) {
                    this.roboHelpService.help(StesFormNumberEnum.STES_MATCHING_PROFILVERGLEICH);
                } else {
                    this.roboHelpService.help(StesFormNumberEnum.OSTE_MATCHING_PROFILVERGLEICH);
                }
            }
        });
    }

    moveNext() {
        this.wizardService.navigateStep2();
    }

    cancel() {
        this.wizardService.navigateToMatching();
    }

    getProfilvergleichData() {
        this.spinnerService.activate(this.spinnerChannel);

        let getProfilvergleichObservable: Observable<BaseResponseWrapperProfilvergleichDTOWarningMessages>;
        if (this.isStes) {
            const pvParamsStes: ProfilvergleichQueryParamsDTO = {
                osteId: this.osteId,
                stesMatchingProfilId: this.stesMatchingProfilId
            };
            getProfilvergleichObservable = this.dataService.getProfilvergleichWithStesMatchingprofil(pvParamsStes);
        } else {
            const pvParamsOste: ProfilvergleichQueryParamsDTO = {
                stesId: this.stesId,
                osteMatchingProfilId: this.osteMatchingProfilId
            };
            getProfilvergleichObservable = this.dataService.getProfilvergleichWithOsteMatchingprofil(pvParamsOste);
        }

        getProfilvergleichObservable.subscribe(
            pvData => {
                if (pvData) {
                    this.profilvergleichData = pvData.data;
                    this.wizardService.setProfilvergleich(this.profilvergleichData);
                    this.dataSource = this.profileCompareAdapter.adapt(this.profilvergleichData);
                }
                if (this.langChangeSubscription === undefined) {
                    this.langChangeSubscription = this.subscribeToLangChange();
                }
                this.spinnerService.deactivate(this.spinnerChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    setDropdownoptions() {
        this.stesOsteOptions.push(
            {
                id: 1,
                text: 'common.button.stellenBeschreibung'
            },
            {
                id: 2,
                text: 'common.button.stesDetails'
            },
            {
                id: 3,
                text: 'common.button.stesDms'
            },
            {
                id: 4,
                text: 'common.button.osteDetails'
            },
            {
                id: 5,
                text: 'common.button.osteDms'
            }
        );
    }

    onDropdownOptionClick(option) {
        switch (option.id) {
            case 1:
                this.openAnforderungenSkillsModal();
                break;
            case 2:
                this.openStesDetails();
                break;
            case 3:
                this.getStesDMS();
                break;
            case 4:
                this.openOsteDetails();
                break;
            case 5:
                this.getOsteDMS();
                break;
        }
    }

    subscribeToLangChange(): Subscription {
        return this.translateService.onLangChange.subscribe(() => {
            this.fehlermeldungenService.closeMessage();
            this.getProfilvergleichData();
        });
    }

    showNextBtn(): boolean {
        if (
            this.profilvergleichData &&
            !this.profilvergleichData.osteAbgemeldet &&
            !this.profilvergleichData.osteInaktiv &&
            !this.profilvergleichData.osteZuweisungsstoppAktiv &&
            !this.profilvergleichData.maxZuweisungenReached
        ) {
            return true;
        }
        return false;
    }

    getOsteDMS() {
        const param: DmsContextSensitiveDossierDTO = {
            geschaeftsfallId: this.osteId,
            uiNumber: this.isStes ? StesFormNumberEnum.STES_MATCHING_PROFILVERGLEICH : StesFormNumberEnum.OSTE_MATCHING_PROFILVERGLEICH,
            language: this.translateService.currentLang
        };
        this.dmsService.openDMSWindowWithParams(param);
    }

    getStesDMS() {
        const param: DmsContextSensitiveDossierDTO = {
            stesId: this.stesId,
            uiNumber: this.isStes ? StesFormNumberEnum.STES_MATCHING_PROFILVERGLEICH : StesFormNumberEnum.OSTE_MATCHING_PROFILVERGLEICH,
            language: this.translateService.currentLang
        };
        this.dmsService.openDMSWindowWithParams(param);
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    openOsteDetails() {
        this.handleAlertMessages();
        this.modalService
            .open(this.osteDetailsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' })
            .result.then(this.handleModalCloseReason.bind(this), this.handleModalCloseReason.bind(this));
    }

    openStesDetails() {
        this.handleAlertMessages();
        this.modalService
            .open(this.stesDetailsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' })
            .result.then(this.handleModalCloseReason.bind(this), this.handleModalCloseReason.bind(this));
    }

    handleAlertMessages() {
        this.alertMessages = [...this.avamAlertMatchingProfilvergleich.getMessages()];
        this.fehlermeldungenService.closeMessage();
    }

    handleModalCloseReason() {
        this.alertMessages.forEach((msg: FehlermeldungModel) => {
            this.fehlermeldungenService.showMessage(msg.text, msg.type);
        });
    }

    openAnforderungenSkillsModal() {
        this.modalService.open(this.anforderungenSkillsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-md', backdrop: 'static' });
    }

    openVermittlungNichtGeeignetModal() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.vermittlungNichtGeeignetErfassen();
            }
        });
        modalRef.componentInstance.promptLabel = 'stes.matching.message.vermittlungNichtGeeignetSetzen';
        modalRef.componentInstance.primaryButton = 'stes.matching.button.jaSetzen';
    }

    vermittlungNichtGeeignetErfassen() {
        const params: VermittlungNichtGeeignetParam = {
            stesId: this.stesId,
            osteIds: [this.osteId]
        };

        this.spinnerService.activate(this.spinnerChannel);
        this.dataService.addVermittlungNichtGeeignet(params).subscribe(
            resp => {
                if (resp && resp.data && !resp.warning) {
                    this.wizardService.navigateToMatching();
                }
                this.spinnerService.deactivate(this.spinnerChannel);
                OrColumnLayoutUtils.scrollTop();
            },
            () => {
                this.spinnerService.deactivate(this.spinnerChannel);
                OrColumnLayoutUtils.scrollTop();
            }
        );
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        if (this.toolboxClickActionSub) {
            this.toolboxClickActionSub.unsubscribe();
        }
        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        this.fehlermeldungenService.closeMessage();
    }
}

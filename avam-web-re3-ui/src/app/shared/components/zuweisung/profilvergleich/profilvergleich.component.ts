import { AlertChannelEnum } from './../../alert/alert-channel.enum';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StesDataRestService } from '@core/http/stes-data-rest.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { DmsService, GenericConfirmComponent, RoboHelpService } from '@app/shared';
import { BenutzerAutosuggestType } from '@app/library/wrappers/form/autosuggests/avam-personalberater-autosuggest/avam-personalberater-autosuggest.component';
import { ZuweisungWizardService } from '@shared/components/new/avam-wizard/zuweisung-wizard.service';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesFormNumberEnum } from '@shared/enums/stes-form-number.enum';
import { DmsContextSensitiveDossierDTO } from '@dtos/dmsContextSensitiveDossierDTO';
import { ProfilvergleichDTO } from '@dtos/profilvergleichDTO';
import { ProfilvergleichQueryParamsDTO } from '@dtos/profilvergleichQueryParamsDTO';
import { FehlermeldungModel } from '@shared/models/fehlermeldung.model';
import { FehlermeldungenService } from '@shared/services/fehlermeldungen.service';
import { ProfileCompareAdapter } from '@shared/services/profile-compare-adapter/profile-compare-adapter';
import { ProfileCompareRow } from '@shared/services/profile-compare-adapter/profile-compare-models';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'oblique-reactive';
import { Subscription } from 'rxjs';
import { BaseResponseWrapperProfilvergleichDTOWarningMessages } from '@dtos/baseResponseWrapperProfilvergleichDTOWarningMessages';

@Component({
    selector: 'avam-profilvergleich',
    templateUrl: './profilvergleich.component.html',
    styleUrls: ['./profilvergleich.component.scss'],
    providers: [ProfileCompareAdapter]
})
export class ProfilvergleichComponent implements OnInit, OnDestroy {
    @ViewChild('modalPrint') modalPrint: ElementRef;
    @ViewChild('anforderungenSkillsModal') anforderungenSkillsModal: ElementRef;
    @ViewChild('stesDetailsModal') stesDetailsModal: ElementRef;
    @ViewChild('osteDetailsModal') osteDetailsModal: ElementRef;

    proflvergleichToolboxId = 'profilvergleich';
    spinnerChannel = 'profilvergleich-spinner';
    stesId: number;
    osteId: number;

    dataSource: ProfileCompareRow[];
    stesOsteOptions: any[] = [];
    toolboxClickActionSub: Subscription;
    langChangeSubscription: Subscription;
    profilvergleichData: ProfilvergleichDTO;
    permissions: typeof Permissions = Permissions;
    personalberaterAutosuggestType = BenutzerAutosuggestType.BENUTZER_ALLE;
    alertMessages: FehlermeldungModel[] = [];

    constructor(
        private wizardService: ZuweisungWizardService,
        private dataService: StesDataRestService,
        private profileCompareAdapter: ProfileCompareAdapter,
        private route: ActivatedRoute,
        private router: Router,
        private spinnerService: SpinnerService,
        private toolboxService: ToolboxService,
        private translateService: TranslateService,
        private fehlermeldungenService: FehlermeldungenService,
        private dmsService: DmsService,
        private modalService: NgbModal,
        private roboHelpService: RoboHelpService
    ) {
        SpinnerService.CHANNEL = this.spinnerChannel;
        ToolboxService.CHANNEL = this.proflvergleichToolboxId;
    }

    ngOnInit() {
        this.wizardService.selectCurrentStep(1);
        this.configureToolbox();
        this.toolboxClickActionSub = this.subscribeToToolbox();
        this.getProfilvergleichData();
        this.langChangeSubscription = this.subscribeToLangChange();
        this.setDropdownoptions();
    }

    moveNext() {
        this.wizardService.navigateTo(3);
    }

    movePrevious() {
        this.wizardService.navigateTo(1);
    }

    cancel() {
        const modalRef = this.modalService.open(GenericConfirmComponent, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        modalRef.result.then(result => {
            if (result) {
                this.wizardService.navigateToArbeitsvermittlung();
            }
        });
        modalRef.componentInstance.titleLabel = 'common.button.vermittlungAbbrechen';
        modalRef.componentInstance.promptLabel = 'common.message.vermittlungAbbrechen';
        modalRef.componentInstance.primaryButton = 'common.button.jaAbbrechen';
        modalRef.componentInstance.secondaryButton = 'i18n.common.no';
    }

    configureToolbox() {
        const toolboxConfig: ToolboxConfiguration[] = [];

        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
        toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));

        this.toolboxService.sendConfiguration(toolboxConfig, this.proflvergleichToolboxId, null, false);
    }

    subscribeToToolbox(): Subscription {
        return this.toolboxService.observeClickAction(this.proflvergleichToolboxId).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
            if (action.message.action === ToolboxActionEnum.HELP) {
                this.roboHelpService.help(StesFormNumberEnum.PROFILVERGLEICH_ANZEIGEN);
            }
        });
    }

    getProfilvergleichData() {
        this.osteId = this.wizardService.getOsteId();

        const pvParams: ProfilvergleichQueryParamsDTO = {
            loadOsteHeader: false,
            loadStesHeader: true,
            osteId: this.osteId,
            osteMatchingProfilId: 0,
            stesId: this.stesId,
            stesMatchingProfilId: 0
        };
        this.spinnerService.activate(this.spinnerChannel);

        this.dataService.getProfilvergleichWithoutMatchingprofil(pvParams, this.translateService.currentLang).subscribe(
            (pvData: BaseResponseWrapperProfilvergleichDTOWarningMessages) => {
                if (pvData.data) {
                    this.profilvergleichData = pvData.data;
                    this.wizardService.setProfilvergleich(this.profilvergleichData);
                    this.dataSource = this.profileCompareAdapter.adapt(this.profilvergleichData);
                }
                if (pvData.warning && pvData.warning.length) {
                    this.alertMessages = pvData.warning.map(warning => {
                        return { text: warning.values.key, type: warning.key.toString().toLocaleLowerCase(), channel: AlertChannelEnum.MAIN_UI };
                    });
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

    subscribeToLangChange(): Subscription {
        return this.translateService.onLangChange.subscribe(() => {
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

    getOsteDMS() {
        const param: DmsContextSensitiveDossierDTO = {
            geschaeftsfallId: this.wizardService.getOsteId(),
            uiNumber: StesFormNumberEnum.PROFILVERGLEICH_ANZEIGEN,
            language: this.translateService.currentLang
        };
        this.dmsService.openDMSWindowWithParams(param);
    }

    getStesDMS() {
        const param: DmsContextSensitiveDossierDTO = {
            stesId: this.wizardService.getStesId(),
            uiNumber: StesFormNumberEnum.PROFILVERGLEICH_ANZEIGEN,
            language: this.translateService.currentLang
        };
        this.dmsService.openDMSWindowWithParams(param);
    }

    openPrintModal() {
        this.modalService.open(this.modalPrint, { ariaLabelledBy: '', windowClass: 'avam-modal-xl', centered: true, backdrop: 'static' });
    }

    openOsteDetails() {
        this.fehlermeldungenService.closeMessage();
        this.modalService
            .open(this.osteDetailsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' })
            .result.then(this.handleModalCloseReason.bind(this), this.handleModalCloseReason.bind(this));
    }

    openStesDetails() {
        this.fehlermeldungenService.closeMessage();
        this.modalService
            .open(this.stesDetailsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'avam-modal-full-height', backdrop: 'static' })
            .result.then(this.handleModalCloseReason.bind(this), this.handleModalCloseReason.bind(this));
    }

    handleModalCloseReason() {
        this.alertMessages.forEach((msg: FehlermeldungModel) => {
            this.fehlermeldungenService.showMessage(msg.text, msg.type);
        });
    }

    openAnforderungenSkillsModal() {
        this.modalService.open(this.anforderungenSkillsModal, { ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-md', backdrop: 'static' });
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

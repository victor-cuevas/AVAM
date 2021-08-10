import { OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObliqueHelperService } from '@app/library/core/services/oblique.helper.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { ArbeitsvermittlungRestService } from '@app/core/http/arbeitsvermittlung-rest.service';
import { StesDataRestService } from '@app/core/http/stes-data-rest.service';
import { UnternehmenRestService } from '@app/core/http/unternehmen-rest.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { HistorisierungComponent } from '@app/shared/components/historisierung/historisierung.component';
import { AvamCommonValueObjectsEnum } from '@app/shared/enums/avam-common-value-objects.enum';
import { DomainEnum } from '@app/shared/enums/domain.enum';
import { StesZwischenverdienstPaths } from '@app/shared/enums/stes-navigation-paths.enum';

import { StaatDTO } from '@app/shared/models/dtos-generated/staatDTO';
import { StesZwischenverdienstDetailsDTO } from '@app/shared/models/dtos-generated/stesZwischenverdienstDetailsDTO';
import { DbTranslateService } from '@app/shared/services/db-translate.service';
import { FehlermeldungenService } from '@app/shared/services/fehlermeldungen.service';
import { NavigationService } from '@app/shared/services/navigation-service';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@app/shared/services/toolbox.service';
import { UnternehmenDataService } from '@app/shared/services/unternehmen-data.service';
import { CodeDTO } from '@dtos/codeDTO';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import PrintHelper from '@shared/helpers/print.helper';
import { BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages } from '@shared/models/dtos-generated/baseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages';
import { VermittlungDto } from '@shared/models/dtos/vermittlung-dto.interface';
import { MessageBus } from '@shared/services/message-bus';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ZwischenverdienstFormHandler } from './zwischenverdienst-form-handler';
import { FormUtilsService } from '@app/shared';
import { FacadeService } from '@shared/services/facade.service';

const zwischenverdienstToolboxIdValue = 'zwischenverdienst';
const zwischenverdienstChannelValue = 'zwischenverdienst';

export abstract class ZwischenverdiensteAbstract extends Unsubscribable implements OnInit, OnDestroy {
    zwischenverdienstToolboxId = zwischenverdienstToolboxIdValue;
    zwischenverdienstChannel = zwischenverdienstChannelValue;

    stesId: string;

    initOptions = [];
    quelleOptions = [];

    zwischenverdienstForm: FormGroup;

    toolboxClickActionSub: Subscription;
    langChangeSubscription: Subscription;

    letzteAktualisierung: StesZwischenverdienstDetailsDTO;

    @ViewChild('ngForm') ngForm: FormGroupDirective;
    lastSelectedArbeitgeber: any;

    formInitalValue: any;

    protected constructor(
        protected toolboxService: ToolboxService,
        protected modalService: NgbModal,
        protected spinnerService: SpinnerService,
        protected dataService: StesDataRestService,
        protected fehlermeldungenService: FehlermeldungenService,
        protected unternehmenRestService: UnternehmenRestService,
        protected unternehmenDataService: UnternehmenDataService,
        protected formBuilder: FormBuilder,
        protected dbTranslateService: DbTranslateService,
        protected arbeitsvermittlungRestService: ArbeitsvermittlungRestService,
        protected translateService: TranslateService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected navigationService: NavigationService,
        protected zvFormHandler: ZwischenverdienstFormHandler,
        protected authService: AuthenticationService,
        protected obliqueHelperService: ObliqueHelperService,
        protected messageBus: MessageBus,
        protected stesInfobarService: AvamStesInfoBarService,
        protected facade: FacadeService
    ) {
        super();
    }

    ngOnInit() {
        this.obliqueHelperService.ngForm = this.ngForm;
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.label.zwischenverdienstErfassen' });
        this.setRouteParams();
        this.setSideNav();
        this.configureToolbox();
        this.zwischenverdienstForm = this.zvFormHandler.createForm();
        this.subscribeToLangChange();
        this.loadData();
        this.messageBus
            .getData()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(message => {
                if (message.type === 'close-nav-item' && message.data) {
                    this.closeComponent(message);
                }
            });
        this.formInitalValue = this.zwischenverdienstForm.value;
    }

    abstract closeComponent(message): void;

    abstract setSideNav(): void;

    abstract getZwischenverdienstPath(): StesZwischenverdienstPaths;

    abstract getToollboxConfig(): ToolboxConfiguration[];

    subscribeToLangChange(): void {
        this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
            if (this.letzteAktualisierung) {
                this.setUeberschrift();
            }
            if (this.lastSelectedArbeitgeber) {
                this.selectedArbeitgeber(this.lastSelectedArbeitgeber);
            } else if (this.zvFormHandler.vermittGuiEntry) {
                this.zvFormHandler.handleVermittlungResponse(this.zvFormHandler.vermittGuiEntry, this.zwischenverdienstForm);
            } else {
                this.zwischenverdienstForm.patchValue(this.zvFormHandler.mapToForm(this.letzteAktualisierung));
            }
        });
    }

    setFieldsState(isAufgrundZuweisung, isSelbststaendigerZV) {
        if (isSelbststaendigerZV && isAufgrundZuweisung) {
            return;
        }
        if (isAufgrundZuweisung) {
            this.zwischenverdienstForm.controls.vermittlungsnummer.enable();
            this.zwischenverdienstForm.controls.berufTaetigkeit.disable();
        } else {
            this.zwischenverdienstForm.controls.vermittlungsnummer.disable();
            this.zwischenverdienstForm.controls.berufTaetigkeit.enable();
        }
    }

    setUeberschrift(): void {
        return;
    }

    setRouteParams() {
        this.route.parent.data.subscribe(() => {
            this.route.parent.params.subscribe(params => {
                this.stesId = params['stesId'];
            });
        });
        this.setAdditionalRouteParams();
    }

    setAdditionalRouteParams(): void {
        return;
    }

    configureToolbox() {
        this.toolboxService.sendConfiguration(this.getToollboxConfig(), this.zwischenverdienstToolboxId);
        this.toolboxClickActionSub = this.subscribeToToolbox();
    }

    subscribeToToolbox() {
        return this.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                PrintHelper.print();
            }
            if (action.message.action === ToolboxActionEnum.HISTORY) {
                this.openHistoryModal(this.letzteAktualisierung.zwischenverdienstId, AvamCommonValueObjectsEnum.T_ZWISCHENVERDIENST);
            }
        });
    }

    openHistoryModal(objId, objType: string) {
        const modalRef = this.modalService.open(HistorisierungComponent, { windowClass: 'avam-modal-xl', ariaLabelledBy: 'modal-basic-title', centered: true, backdrop: 'static' });
        const comp = modalRef.componentInstance as HistorisierungComponent;
        comp.id = objId;
        comp.type = objType;
    }

    openModal(content, windowClass) {
        return this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass, backdrop: 'static' });
    }

    modalClosed(event) {
        ToolboxService.CHANNEL = this.zwischenverdienstToolboxId;
    }

    loadData() {
        this.spinnerService.activate(this.zwischenverdienstChannel);
        forkJoin<CodeDTO[], CodeDTO[], StaatDTO, BaseResponseWrapperStesZwischenverdienstDetailsDTOWarningMessages>([
            this.dataService.getCode(DomainEnum.ZWISCHENVERDIENSTINIT),
            this.dataService.getCode(DomainEnum.ZWISCHENVERDIENSTQUELLE),
            this.dataService.getStaatSwiss(),
            this.loadZwischenverdienst()
        ])
            .pipe(
                map(([dataInit, dataQuelle, staat, zwischenverdienst]) => {
                    this.initOptions = this.facade.formUtilsService.mapDropdownKurztext(dataInit);
                    this.quelleOptions = this.facade.formUtilsService.mapDropdownKurztext(dataQuelle);
                    this.zvFormHandler.staatSwitzerland = staat;
                    this.letzteAktualisierung = zwischenverdienst ? zwischenverdienst.data : null;
                })
            )
            .subscribe(
                () => {
                    if (this.letzteAktualisierung) {
                        this.authService.setOwnerPermissionContext(this.letzteAktualisierung.stesId, this.letzteAktualisierung.ownerId);
                        this.zwischenverdienstForm.reset(this.zvFormHandler.mapCheckboxes(this.letzteAktualisierung));
                        this.zwischenverdienstForm.patchValue(this.zvFormHandler.mapToForm(this.letzteAktualisierung));
                        this.setFieldsState(this.isAufgrundZuweisung(), this.isSelbststaendigerZV());
                        this.setUnternehmenRequired();
                        this.setUeberschrift();
                        this.setupInfoIconOnInit();
                    }
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
    }

    setUnternehmenRequired() {
        if (this.isAufgrundZuweisung() || this.isSelbststaendigerZV()) {
            this.zwischenverdienstForm.controls.name1.setErrors(null);
        }
    }

    isAufgrundZuweisung() {
        return this.zwischenverdienstForm.controls.isAufgrundZuweisung.value;
    }

    isSelbststaendigerZV() {
        return this.zwischenverdienstForm.controls.isSelbststaendigerZV.value;
    }

    onVermittlungChecked() {
        this.fehlermeldungenService.closeMessage();

        if (this.isSelbststaendigerZV()) {
            if (this.isAufgrundZuweisung()) {
                this.zwischenverdienstForm.controls.isAufgrundZuweisung.setValue(false);
                this.fehlermeldungenService.showMessage('stes.error.zwischenverdienst.zwischenverdienstkombination', 'danger');
            }

            return;
        }

        this.setFieldsState(this.isAufgrundZuweisung(), this.isSelbststaendigerZV());
        this.zvFormHandler.handleAufgrundZuweisung(this.zwischenverdienstForm, this.isAufgrundZuweisung());
    }

    onSelbstZvChecked() {
        this.fehlermeldungenService.closeMessage();

        if (this.isAufgrundZuweisung()) {
            if (this.isSelbststaendigerZV()) {
                this.zwischenverdienstForm.controls.isSelbststaendigerZV.setValue(false);
                this.fehlermeldungenService.showMessage('stes.error.zwischenverdienst.zwischenverdienstkombination', 'danger');
            }

            return;
        }

        this.setFieldsState(this.isAufgrundZuweisung(), this.isSelbststaendigerZV());
        this.zvFormHandler.handleSelbststaendigerZV(this.zwischenverdienstForm, this.isSelbststaendigerZV());
    }

    setVermittlung(vermittGuiEntry: VermittlungDto) {
        this.zvFormHandler.setVermittlung(vermittGuiEntry, this.zwischenverdienstForm);
    }

    ngOnDestroy() {
        this.toolboxService.sendConfiguration([]);
        this.stesInfobarService.sendLastUpdate({}, true);
        this.authService.removeOwnerPermissionContext();
        this.toolboxClickActionSub.unsubscribe();
        this.fehlermeldungenService.closeMessage();
        this.setupInfoIconOnDestroy();

        if (this.langChangeSubscription) {
            this.langChangeSubscription.unsubscribe();
        }
        super.ngOnDestroy();
    }

    abstract cancel(): void;

    canDeactivate(): boolean {
        if (this.letzteAktualisierung) {
            return this.zwischenverdienstForm.dirty;
        }
        return this.hasChanged();
    }

    setupInfoIconOnInit(): void {
        return;
    }

    setupInfoIconOnDestroy(): void {
        return;
    }

    loadZwischenverdienst(): Observable<any> {
        return of(null);
    }

    clearUnternehmenForm() {
        this.zvFormHandler.clearUnternehmenFromAS(this.zwischenverdienstForm);
    }

    selectedArbeitgeber(selected) {
        this.lastSelectedArbeitgeber = selected;
        this.spinnerService.activate(this.zwischenverdienstChannel);
        if (selected.hasOwnProperty('unternehmenId')) {
            this.unternehmenRestService.getUnternehmenById(selected.unternehmenId).subscribe(
                unternehmen => {
                    this.zvFormHandler.mapUnternehmenFromAS(unternehmen, this.zwischenverdienstForm);
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
        } else {
            this.dataService.getBurOrtEinheitById(selected.burOrtEinheitId).subscribe(
                response => {
                    this.zvFormHandler.mapBurFromAS(response.data, this.zwischenverdienstForm);
                    this.deactivateSpinnerAndScrollTop();
                },
                () => {
                    this.deactivateSpinnerAndScrollTop();
                }
            );
        }
    }

    deactivateSpinnerAndScrollTop() {
        this.spinnerService.deactivate(this.zwischenverdienstChannel);
        OrColumnLayoutUtils.scrollTop();
    }

    hasChanged() {
        const currentValue = this.zwischenverdienstForm.value;

        return Object.keys(currentValue).some(key => {
            if (this.formInitalValue.hasOwnProperty(key)) {
                return this.formInitalValue[key] !== currentValue[key];
            }
        });
    }
}

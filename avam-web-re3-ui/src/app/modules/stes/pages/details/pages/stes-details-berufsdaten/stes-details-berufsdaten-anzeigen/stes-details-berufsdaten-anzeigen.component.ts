import { HttpFormStateEnum } from 'src/app/shared';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { StesDataRestService } from 'src/app/core/http/stes-data-rest.service';
import { takeUntil } from 'rxjs/operators';
import { ToolboxActionEnum, ToolboxConfiguration, ToolboxService } from '@shared/services/toolbox.service';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StesComponentInteractionService } from 'src/app/shared/services/stes-component-interaction.service';
import { WizardService } from '@app/shared/components/new/avam-wizard/wizard.service';
import { Subject, Subscription } from 'rxjs';
import { Permissions } from '@app/shared/enums/permissions.enum';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { AvamStesInfoBarService } from '@app/shared/components/avam-stes-info-bar/avam-stes-info-bar.service';
import { StesBerufsdatenDTO } from '@dtos/stesBerufsdatenDTO';
import { BerufeTableComponent } from './berufe-table/berufe-table.component';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { FacadeService } from '@shared/services/facade.service';

@Component({
    selector: 'app-stes-details-berufsdaten-anzeigen',
    templateUrl: './stes-details-berufsdaten-anzeigen.component.html'
})
export class StesDetailsBerufsdatenAnzeigenComponent extends Unsubscribable implements OnInit, OnDestroy {
    stesId: string;
    isAnmeldung: boolean;
    berufsdatenChannel = 'berufsdaten';
    data: StesBerufsdatenDTO[] = [];
    geschlecht: string;

    @ViewChild('berufsdatenAnzeigenTable') berufsdatenAnzeigenTable: BerufeTableComponent;
    @ViewChild('modalPrint') modalPrint: ElementRef;

    permissions: typeof Permissions = Permissions;

    private observeClickActionSub: Subscription;
    private berufsdatenToolboxId = 'berufsdatenAnzeigen';
    private unsubscribe$ = new Subject();

    constructor(
        private dataRestService: StesDataRestService,
        private route: ActivatedRoute,
        private router: Router,
        private translateService: TranslateService,
        private componentInteraction: StesComponentInteractionService,
        private wizardService: WizardService,
        private stesInfobarService: AvamStesInfoBarService,
        private dataService: StesDataRestService,
        private facade: FacadeService
    ) {
        super();

        SpinnerService.CHANNEL = this.berufsdatenChannel;
        ToolboxService.CHANNEL = this.berufsdatenChannel;
    }

    ngOnInit() {
        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesBerufsdaten' });
        this.route.parent.data.subscribe(data => {
            this.isAnmeldung = data.isAnmeldung;
            if (this.isAnmeldung) {
                this.route.paramMap.subscribe(params => {
                    this.stesId = params.get('stesId');
                });
            } else {
                this.route.parent.params.subscribe(params => {
                    this.stesId = params['stesId'];
                });
            }
        });

        this.createSubscriptions();
        this.loadDataBerufsdaten();
        this.configureToolbox();
        this.observeClickActionSub = this.facade.toolboxService.observeClickAction(ToolboxService.CHANNEL).subscribe((action: any) => {
            if (action.message.action === ToolboxActionEnum.PRINT) {
                this.openPrintModal();
            }
        });

        if (this.isAnmeldung) {
            this.subscribeToWizard();
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.componentInteraction.resetDataLengthHeaderSubject();
        this.stesInfobarService.sendLastUpdate({}, true);
        this.observeClickActionSub.unsubscribe();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    configureToolbox() {
        let toolboxConfig: ToolboxConfiguration[] = [];
        if (this.isAnmeldung) {
            toolboxConfig = ToolboxConfig.getStesAnmeldungConfig();
        } else {
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.EMAIL, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.DMS, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.PRINT, true, true));
            toolboxConfig.push(new ToolboxConfiguration(ToolboxActionEnum.HELP, true, true));
        }
        this.facade.toolboxService.sendConfiguration(toolboxConfig, this.berufsdatenToolboxId, ToolboxDataHelper.createForStellensuchende(this.stesId), !this.isAnmeldung);
    }

    loadDataBerufsdaten() {
        this.facade.spinnerService.activate(this.berufsdatenChannel);

        this.dataRestService
            .getBerufsdaten(this.stesId)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    if (response.data.berufsdatenDTOList && response.data.berufsdatenDTOList.length < 1 && this.isAnmeldung && !this.wizardService.isBerufErfassenStep()) {
                        this.router.navigate([`stes/anmeldung/berufsdaten/erfassen/${this.stesId}`]);
                        this.wizardService.formHttpState.next(HttpFormStateEnum.GET_FAIL);
                    } else {
                        this.data = response.data.berufsdatenDTOList;
                        this.geschlecht = response.data.geschlecht;
                        this.berufsdatenAnzeigenTable.setData(this.data, this.geschlecht);
                        this.componentInteraction.updateDataLengthHeaderSubject(response.data.berufsdatenDTOList.length);
                        this.stesInfobarService.sendDataToInfobar({ title: 'stes.subnavmenuitem.stesBerufsdaten', tableCount: response.data.berufsdatenDTOList.length });

                        this.facade.spinnerService.deactivate(this.berufsdatenChannel);
                        this.wizardService.formHttpState.next(HttpFormStateEnum.GET_SUCCESS);
                    }
                },
                () => {
                    this.facade.spinnerService.deactivate(this.berufsdatenChannel);
                    this.wizardService.formHttpState.next(HttpFormStateEnum.GET_NO_RESPONCE);
                }
            );
    }

    cancel() {
        this.facade.fehlermeldungenService.closeMessage();
        this.router.navigate(['/home/start-page']);
    }

    showSaveMessage() {
        this.facade.fehlermeldungenService.closeMessage();
        this.facade.notificationService.success(this.translateService.instant('common.message.datengespeichert'));
        OrColumnLayoutUtils.scrollTop();
    }

    public onClick(row: any) {
        if (this.isAnmeldung) {
            this.wizardService.showBerufsdaten(true);
            this.router.navigate([`stes/anmeldung/berufsdaten/bearbeiten/${this.stesId}/${row.stesBerufsqualifikationID}`]);
        } else {
            this.router.navigate([`stes/details/${this.stesId}/berufsdaten/bearbeiten/`], { queryParams: { berufId: row.stesBerufsqualifikationID } });
        }
    }

    beruferfassen() {
        this.facade.fehlermeldungenService.closeMessage();

        if (this.isAnmeldung) {
            this.router.navigate([`stes/anmeldung/berufsdaten/erfassen/${this.stesId}/`]);
        } else {
            this.router.navigate([`stes/details/${this.stesId}/berufsdaten/erfassen`]);
        }
    }

    validate(onSuccess?, onFailure?) {
        this.facade.spinnerService.activate(this.berufsdatenChannel);
        this.dataRestService
            .validateBerufsdaten(this.stesId, this.translateService.currentLang)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(
                response => {
                    if (response.data) {
                        this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_SUCCESS);
                        if (onSuccess) {
                            onSuccess();
                        }
                    } else {
                        this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_FAIL);
                        if (onFailure) {
                            onFailure();
                        }
                    }
                    OrColumnLayoutUtils.scrollTop();

                    this.facade.spinnerService.deactivate(this.berufsdatenChannel);
                },
                () => {
                    OrColumnLayoutUtils.scrollTop();
                    this.facade.spinnerService.deactivate(this.berufsdatenChannel);
                    this.wizardService.formHttpState.next(HttpFormStateEnum.SAVE_NO_RESPONCE);
                    if (onFailure) {
                        onFailure();
                    }
                }
            );
    }

    next() {
        this.wizardService.deactiveWizard();
        this.validate(
            () => {
                this.wizardService.activeWizard();
                this.wizardService.moveNext();
                this.wizardService.validateStep(true);
            },
            () => {
                this.wizardService.activeWizard();
            }
        );
    }

    prev() {
        this.wizardService.movePrev();
    }

    subscribeToWizard() {
        this.wizardService.setFormIsDirty(false);
    }

    openPrintModal() {
        this.facade.openModalFensterService.openPrintModal(this.modalPrint, this.berufsdatenAnzeigenTable.data);
    }

    private createSubscriptions() {
        this.facade.dbTranslateService
            .getEventEmitter()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => {
                if (!!this.data && !!this.geschlecht) {
                    this.berufsdatenAnzeigenTable.setData(this.data, this.geschlecht);
                }
            });
    }
}

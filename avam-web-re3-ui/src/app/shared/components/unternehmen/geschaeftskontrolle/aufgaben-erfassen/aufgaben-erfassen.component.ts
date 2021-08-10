import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SpinnerService, Unsubscribable } from 'oblique-reactive';
import { DeactivationGuarded } from '@shared/services/can-deactive-guard.service';
import { AufgabenErfassenFormComponent } from '@shared/components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-form.component';
import { FormModeEnum } from '@shared/enums/form-mode.enum';
import { GekoAufgabenService } from '@shared/services/geko-aufgaben.service';
import { ActivatedRoute, Data, ParamMap } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { AufgabenErfassenModeService } from '@shared/components/unternehmen/geschaeftskontrolle/aufgaben-erfassen/aufgaben-erfassen-mode.service';
import { GekobereichCodeEnum } from '@modules/geko/utils/GekobereichCodeEnum';
import { GekoAufgabenLabels, UnternehmenSideNavLabels } from '@shared/enums/stes-routing-labels.enum';
import { AufgabenErfassenData } from './aufgaben-erfassen.data';
import { StesComponentInteractionService } from '@shared/services/stes-component-interaction.service';
import OrColumnLayoutUtils from '@app/library/core/utils/or-column-layout.utils';
import { GeKoAufgabeDetailsDTO } from '@dtos/geKoAufgabeDetailsDTO';
import { GekoAufgabenCodes } from '@shared/models/geko-aufgaben-codes.model';
import { Permissions } from '@shared/enums/permissions.enum';
import { StesAufgabenPaths } from '@shared/enums/stes-navigation-paths.enum';
import { ToolboxConfig } from '@shared/components/toolbox/toolbox-config';
import { ToolboxService } from '@app/shared';
import { ToolboxActionEnum, ToolboxEvent } from '@shared/services/toolbox.service';
import PrintHelper from '@shared/helpers/print.helper';
import { Subscription } from 'rxjs';
import { ToolboxDataHelper } from '@shared/components/toolbox/toolbox-data.helper';
import { CoreInfoBarPanelService } from '@app/library/core/core-info-bar/core-info-bar-panel/core-info-bar-panel.service';

@Component({
    selector: 'avam-geko-aufgaben-erfassen',
    templateUrl: 'aufgaben-erfassen.component.html',
    providers: [AufgabenErfassenModeService]
})
export class AufgabenErfassenComponent extends Unsubscribable implements OnInit, DeactivationGuarded, OnDestroy {
    @ViewChild('form') form: AufgabenErfassenFormComponent;
    @Input('bereich') bereich: GekobereichCodeEnum;
    aufgabeId: number;
    formMode: FormModeEnum;
    unternehmenId: number;
    data: AufgabenErfassenData;
    readonly deletePermissions: Permissions[] = [Permissions.GEKO_AUFGABEN_LOESCHEN];
    readonly savePermissions: Permissions[] = [Permissions.GEKO_AUFGABEN_BEARBEITEN];
    readonly channel = 'aufgaben-erfassen-bearbeiten.channel';
    private static readonly AUFGABE_ID = 'aufgabeId';
    private static readonly UNTERNEHMEN_ID = 'unternehmenId';
    private static readonly PFLICHTFELDER_ERROR_MSG = 'stes.error.bearbeiten.pflichtfelder';
    private closeNavItemSubscription: Subscription;

    constructor(
        private modeService: AufgabenErfassenModeService,
        private interactionService: StesComponentInteractionService,
        private service: GekoAufgabenService,
        private activatedRoute: ActivatedRoute,
        private infoBarPanelService: CoreInfoBarPanelService
    ) {
        super();
        SpinnerService.CHANNEL = this.channel;
    }

    ngOnInit(): void {
        this.unternehmenId = +this.activatedRoute.parent.snapshot.paramMap.get(AufgabenErfassenComponent.UNTERNEHMEN_ID);
        this.activatedRoute.queryParamMap.subscribe((params: ParamMap) => {
            this.aufgabeId = +params.get(AufgabenErfassenComponent.AUFGABE_ID);
        });
        this.subscribeToFormModeChanges();
        this.subscribeOnCloseNavItem();
    }

    ngOnDestroy(): void {
        this.service.facade.fehlermeldungenService.closeMessage();
        this.hideSideNavigationErfassen();
        this.service.facade.toolboxService.resetConfiguration();
        this.infoBarPanelService.sendLastUpdate(null);
        super.ngOnDestroy();
    }

    canDeactivate(): boolean {
        return this.form.formGroup.dirty;
    }

    cancel(): void {
        if (!this.canDeactivate()) {
            this.hideNavigationTreeRoute();
            this.closeNavItemSubscription.unsubscribe();
        } else {
            this.interactionService.navigateAwayAbbrechen.pipe(first()).subscribe((okClicked: boolean) => {
                if (okClicked) {
                    this.hideNavigationTreeRoute();
                    this.closeNavItemSubscription.unsubscribe();
                }
            });
        }
        this.service.navigateToParent(this.activatedRoute);
    }

    openDeleteWindow(): void {
        this.service.facade.openModalFensterService.deleteModal(() => this.delete());
    }

    reset(): void {
        this.form.reset();
    }

    delete(): void {
        this.service.facade.fehlermeldungenService.closeMessage();
        this.service
            .delete([this.aufgabeId])
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(result => {
                if (!result.warning) {
                    this.service.success(result.data);
                    this.form.formGroup.reset();
                    this.hideSideNavigationBearbeiten();
                    this.service.navigateToParent(this.activatedRoute, this.channel);
                } else {
                    OrColumnLayoutUtils.scrollTop();
                }
            });
    }

    save(): void {
        if (this.form.formGroup.valid) {
            this.service.erfassteAufgabeSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dto: GeKoAufgabeDetailsDTO) => {
                if (dto) {
                    this.data = { ...this.data, dto };
                    this.aufgabeId = dto.aufgabeId;
                    if (!this.isBearbeiten()) {
                        this.form.formGroup.reset();
                        this.service.navigateToUnternehmenAufgabeBearbeiten(this.bereich, this.unternehmenId, this.aufgabeId, this.channel);
                    }
                }
                OrColumnLayoutUtils.scrollTop();
            });
            this.service.save(this.form.mapToDto(), this.channel);
        } else {
            this.service.facade.fehlermeldungenService.closeMessage();
            this.form.ngForm.onSubmit(undefined);
            this.service.facade.fehlermeldungenService.showErrorMessage(AufgabenErfassenComponent.PFLICHTFELDER_ERROR_MSG);
        }
    }

    isBearbeiten(): boolean {
        return this.formMode === FormModeEnum.EDIT;
    }

    private isErfassen(): boolean {
        return this.formMode === FormModeEnum.CREATE;
    }

    private subscribeOnCloseNavItem(): void {
        this.closeNavItemSubscription = this.service.facade.messageBus.getData().subscribe((message: any) => {
            if (message.type === 'close-nav-item' && message.data) {
                this.onCancelPageSideNavigation(message);
            }
        });
    }

    private onCancelPageSideNavigation(message: any): void {
        if (
            message.data.label === this.service.facade.translateService.instant(UnternehmenSideNavLabels.AUFGABE_ERFASSEN) ||
            message.data.label === this.service.facade.translateService.instant(UnternehmenSideNavLabels.AUFGABE_BEARBEITEN)
        ) {
            this.cancel();
        }
    }

    private subscribeToFormModeChanges(): void {
        this.activatedRoute.data.subscribe((data: Data) => {
            this.modeService.changeMode(data.mode);
        });
        this.modeService.mode$.pipe(takeUntil(this.unsubscribe)).subscribe((formMode: FormModeEnum) => {
            this.formMode = formMode;

            this.service.codesSubject.pipe(takeUntil(this.unsubscribe)).subscribe((codes: GekoAufgabenCodes) => {
                if (this.isBearbeiten()) {
                    this.handleBearbeiten(codes);
                    this.configureBearbeitenToolboxHeader();
                } else if (this.isErfassen()) {
                    this.handleErfassen(codes);
                    this.configureErfassenToolboxHeader();
                }
            });
            this.service.loadErfassenCodes(this.channel, this.isBearbeiten(), this.bereich);
            this.printSub();
        });
    }

    private handleBearbeiten(codes: GekoAufgabenCodes): void {
        this.service.aufgabeLoadedSubject.pipe(takeUntil(this.unsubscribe)).subscribe((dto: GeKoAufgabeDetailsDTO) => {
            this.data = {
                bereich: this.bereich,
                aufgabeId: dto.aufgabeId,
                unternehmenId: dto.unternehmenId,
                channel: this.channel,
                formMode: this.formMode,
                dto,
                codes
            };
            this.showNavigationTreeRoute();
            this.infoBarPanelService.sendLastUpdate(dto);
        });
        this.service.getAufgabeById(this.aufgabeId, this.channel);
    }

    private handleErfassen(codes: GekoAufgabenCodes): void {
        this.data = {
            bereich: this.bereich,
            aufgabeId: this.aufgabeId,
            unternehmenId: this.unternehmenId,
            channel: this.channel,
            formMode: this.formMode,
            codes
        };
        this.showNavigationTreeRoute();
    }

    private hideNavigationTreeRoute(): void {
        if (this.isBearbeiten()) {
            this.hideSideNavigationBearbeiten();
        } else if (this.isErfassen()) {
            this.hideSideNavigationErfassen();
        }
    }

    private hideSideNavigationErfassen(): void {
        this.service.facade.navigationService.hideNavigationTreeRoute(`./${StesAufgabenPaths.AUFGABEN_ERFASSEN}`);
    }

    private hideSideNavigationBearbeiten(): void {
        this.service.facade.navigationService.hideNavigationTreeRoute(`./${StesAufgabenPaths.AUFGABEN_BEARBEITEN}`, {
            aufgabeId: String(this.aufgabeId)
        });
    }

    private showNavigationTreeRoute(): void {
        if (this.isBearbeiten()) {
            this.service.facade.navigationService.showNavigationTreeRoute(`./${StesAufgabenPaths.AUFGABEN_BEARBEITEN}`, {
                aufgabeId: String(this.aufgabeId)
            });
        } else if (this.isErfassen()) {
            this.service.facade.navigationService.showNavigationTreeRoute(`./${StesAufgabenPaths.AUFGABEN_ERFASSEN}`);
        }
    }

    private configureBearbeitenToolboxHeader() {
        this.service.facade.toolboxService.sendConfiguration(
            ToolboxConfig.getUnternehmenAufgabenConfig(),
            this.channel,
            ToolboxDataHelper.createByUnternehmenId(this.unternehmenId)
        );
        this.service.updateTitle({ subtitle: `${this.service.facade.translateService.instant(GekoAufgabenLabels.AUFGABE_BEARBEITEN)}` });
    }

    private configureErfassenToolboxHeader() {
        this.service.facade.toolboxService.sendConfiguration(
            ToolboxConfig.getUnternehmenAufgabenConfig(),
            this.channel,
            ToolboxDataHelper.createByUnternehmenId(this.unternehmenId)
        );
        this.service.updateTitle({ subtitle: `${this.service.facade.translateService.instant(GekoAufgabenLabels.NEUE_AUFGABE)} ` });
    }

    private printSub(): void {
        this.service.facade.toolboxService
            .observeClickAction(ToolboxService.CHANNEL)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((action: { channel: any; message: ToolboxEvent }) => {
                if (action.message.action === ToolboxActionEnum.PRINT) {
                    PrintHelper.print();
                }
            });
    }
}
